from newsapi import NewsApiClient
from analysis import transform_to_article

newsapi = NewsApiClient(api_key="e7a1e5e7737f455a9817a41c8318f52b")

original_article = transform_to_article(
    "https://edition.cnn.com/2020/10/22/media/60-minutes-trump-interview/index.html"
)
title = original_article.title
print(title)

news_response = newsapi.get_everything(
    q=title,
    # TODO: Potentially change the date range, currently providing bad articles
    # from_param=origina>l_article.publish_date.strftime("%Y-%m-%d"),
    # to=original_article.publish_date.strftime("%Y-%m-%d"),
    language="en",
    sort_by="relevancy",
)

print(news_response)