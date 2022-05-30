from clarity.analysis import transform_to_article, analyse_articles

# from analysis import transform_to_article, analyse_articles  # For local testing
from sanic import Sanic
from sanic.response import json
from newspaper import Article
from newspaper.article import ArticleException
from newsapi import NewsApiClient
from pprint import pprint


app = Sanic()

newsapi = NewsApiClient(api_key="e7a1e5e7737f455a9817a41c8318f52b")


@app.route("/api", methods=["POST"])
async def articles(request):
    url = request.json["url"]
    # Try and extract information from the article (test if its valid)
    try:
        base_article = transform_to_article(url)
    except ArticleException as e:
        return json(
            {
                "error": True,
                "message": "Could not extract information out of provided article",
            },
            status=404,
        )

    keywords = " OR ".join(
        base_article.keywords
    )  # TODO: Need to implement better keyword extraction

    # Try to get a list of relevant articles from the keywords generated
    try:
        news_response = newsapi.get_everything(
            q=keywords, language="en", sort_by="relevancy", page_size=100
        )

        if news_response["totalResults"] == 0:
            raise Exception

    except Exception as e:  # Assuming it is a newsapi Exception
        return json(
            {"error": True, "message": "No relevant articles found"},
            status=404,
        )

    related_articles = news_response["articles"]
    # pprint(related_articles)
    analysis = analyse_articles(
        base_article, related_articles
    )  # Need to check if analysis is not empty

    # TODO: Test analysis result (if empty return error)
    if analysis:
        return json(
            {"analysis": analysis}, status=200
        )  # Need to change to analysis response
    else:
        return json(
            {
                "error": True,
                "message": "Analysis could not determine any similar articles",
            },
            status=404,
        )  # Need to change to analysis response


if __name__ == "__main__":
    app.run(port=8000)