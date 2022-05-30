# Take articles as input
# Extract body contents

# 1. Clustering (Get relevant articles)
# Exclude corrupt articles
# Focus on the first part of the article (lead)
# Perform synonym substitution
# Parts-of-speech restriction (remove less informative parts of text)
# Lemmatization (Replace words with their root)
# N-grams (if two terms occur adjacently in two articles those articles are more likely to be related )
# Stop-word suppression

# 2. Rank the relevant articles based on sentiment analysis
# Get the original version of the article (before lemmatization)
# Convert article into list of sentances
# Restrict access to the first N sentances
# Compute the sentiment of each article
# Translate results to be either +1/-1 based on meaning scale of library
# Take into account the library can return values of the full range
# The scaled standardized sentiment values are taken as input to compute a neutrality score for the aggregate coverage of the story
from urllib.parse import urlparse

import dateparser
from pandas.core import base
import numpy as np
import pandas as pd
import spacy
from newspaper import Article, article
from sklearn.feature_extraction.text import TfidfVectorizer
from spacy.lang.en.stop_words import STOP_WORDS
from urllib.parse import urlparse
import json
from pprint import pprint


# Load and initialise required NLP libraries
nlp = spacy.load("en_core_web_sm")


## MISC FUNCTIONS
def removeNonASCIICharacters(textString: str):
    return "".join(i for i in textString if ord(i) < 128)


def removeSpacesAndPunctuation(textString: str):
    return "".join(e for e in textString if e.isalnum())


# Data extraction and cleaning functions
def transform_to_article(url: str):
    article = Article(url)
    article.download()
    article.parse()
    article.nlp()
    return article


def extract_article_data(base_article, related_articles):
    data = []

    # Append the original article first to use a baseline to compare to other articles
    data.append(
        {
            "title": base_article.title,
            "publication": urlparse(base_article.url).netloc,
            "url": base_article.url,
            "author": base_article.authors,
            "date": base_article.publish_date,
            "content": base_article.text,
        }
    )

    for article in related_articles:
        # Extract properties from article
        title = article["title"]
        publication = urlparse(article["url"]).netloc
        url = article["url"]
        author = article["author"]
        date = dateparser.parse(article["publishedAt"]).strftime("%Y-%m-%d")
        content = article["content"]

        # Append dict of properties to data list
        data.append(
            {
                "title": title,
                "publication": publication,
                "url": url,
                "author": author,
                "date": date,
                "content": content,
            }
        )

    pprint(data[0])

    # Return dataframe of data for analysis
    return pd.DataFrame(data)


def clean_data(df):
    df = df.drop_duplicates("content")  # Drop duplicate articles
    df = df[~df["content"].isnull()]  # Remove articles with null content
    df = df[df["content"].str.len() >= 200]  # Remove junk articles
    df["date"] = pd.to_datetime(
        df["date"], utc=True
    )  # convert date column to datetime object

    # TODO: Need to integrate date somehow without excluding too many articles
    # df = df[df["date"] == processDate]
    print(df.head)
    df.reset_index(inplace=True, drop=True)

    df["content no nonascii"] = df["content"].map(lambda x: removeNonASCIICharacters(x))
    print(df["content no nonascii"])

    return df


# NLP Functions
# Extract tokens, remove stop words and puncuation
def stringProcess(stringToConvert):
    doc = nlp(stringToConvert)
    spacyTokens = [w for w in doc]

    str = []
    for spt in spacyTokens:
        wrd = spt.text
        wrdlower = removeSpacesAndPunctuation(wrd.lower())
        # The middle term below is correctly wrd.lower() not wrdlower since the function call
        # above strips out the --, and I don't want to compare with 'pron' in case that
        # finds false matches
        if (
            wrdlower not in STOP_WORDS
            and wrd.lower() != "-pron-"
            and not wrdlower == ""
        ):
            str.append(wrdlower)

    return " ".join(str)


def preprocessAndVectorize(articleDataFrame):
    articleDataFrame["input to vectorizer"] = articleDataFrame[
        "content no nonascii"
    ].map(lambda x: stringProcess(x))

    # Create and run the vectorizer
    vectorizer = TfidfVectorizer(
        analyzer="word",
        lowercase=True,
    )
    print(articleDataFrame["input to vectorizer"])
    tfidfVectors = vectorizer.fit_transform(articleDataFrame["input to vectorizer"])
    # terms = vectorizer.get_feature_names() # NOTE: This might be useless
    return tfidfVectors


def generate_related_and_unrelated_articles(tfidfVectors, threshold):
    nonZeroCoords = initialiseAllNonZeroCoords(tfidfVectors)
    leadArticleIndex = 0  # Get the base article

    # Compute score of all articles in corpus relative to first article in story (.product)
    # Then count through list relative to threshold (add one for a good result, subtract one for a bad result)
    scores = productRelatednessScores(tfidfVectors, nonZeroCoords, leadArticleIndex)

    # Sort the scores (no neccesary)
    rankedIndices = np.argsort(scores)
    related = []
    for article in reversed(rankedIndices):
        if scores[article] >= threshold:
            related.append(article)

    # Exclude the base article (original)
    return related[1:]


def initialiseAllNonZeroCoords(tfidfVectors):
    # This function just exists since it seems to be expensive and I'd rather not call it multiple times
    # Hence it is intended to be called outside of loops in order to simplify the row specific processing
    values = []
    nzc = zip(*tfidfVectors.nonzero())

    # In Python 3 the zip can only be iterated through one time before it is automatically released
    # So need to copy the results otherwise the main loop below will no longer work
    pointList = []
    for i, j in nzc:
        pointList.append([i, j])

    for row in range(tfidfVectors.shape[0]):
        rowList = []
        for i, j in pointList:
            if row == i:
                rowList.append(j)
        values.append(rowList)

    return values


def productRelatednessScores(tfidfVectors, nonZeroCoords, refRow):
    scores = [0] * tfidfVectors.shape[0]
    for toRow in range(tfidfVectors.shape[0]):
        scores[toRow] = sum(
            [
                (tfidfVectors[toRow, w] * tfidfVectors[refRow, w])
                for w in nonZeroCoords[refRow]
                if w in nonZeroCoords[toRow]
            ]
        )
    return scores


# Main Function
def analyse_articles(base_article, related_articles):

    # As base_article is the first within the dataframe, it should be considered the group truth for the story map

    # Load corpus of articles from file
    # 0 index is required because the parameters are forced to be lists by ParameterGrid
    articleDataFrame = extract_article_data(base_article, related_articles)
    analysisDataFrame = clean_data(articleDataFrame)

    # Determine tf-idf vectors
    # terms is just used later on if analysis of final results is requested
    tfidfVectors = preprocessAndVectorize(
        analysisDataFrame,
    )

    related_articles = generate_related_and_unrelated_articles(
        tfidfVectors,
        0.1,  # Temp threshold, not sure what the value should be
    )

    # articleDataFrame["related"] = articleDataFrame[
    #     articleDataFrame.index.isin(related_articles)
    # ]
    articleDataFrame["related"] = articleDataFrame.index.isin(related_articles)
    return json.loads(articleDataFrame.to_json(orient="records"))
