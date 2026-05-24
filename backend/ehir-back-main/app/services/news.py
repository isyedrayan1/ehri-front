"""News integration — fetch environment/health headlines for an Indian city.

Uses NewsAPI (https://newsapi.org) to search recent articles.
Falls back gracefully if key is missing or API fails.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_NEWS_API_BASE = "https://newsapi.org/v2/everything"

# Query templates — combined with city name for relevance
_QUERY_TEMPLATE = '("{city}" AND (pollution OR "air quality" OR health OR environment OR heatwave OR dengue OR flood))'


@dataclass
class NewsArticle:
    title: str
    description: str | None
    source: str
    url: str
    published_at: str


async def fetch_city_news(city: str, max_articles: int = 5) -> list[NewsArticle]:
    """Fetch recent environmental-health news articles for *city*.

    Returns an empty list (never raises) when the API key is missing or
    the request fails — upstream callers should treat news as optional.
    """
    api_key = settings.news_api_key
    if not api_key:
        logger.warning("NEWS_API_KEY not configured — skipping news fetch")
        return []

    query = _QUERY_TEMPLATE.format(city=city)
    params = {
        "q": query,
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": max_articles,
        "apiKey": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(_NEWS_API_BASE, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception as exc:
        logger.warning("News fetch failed for %s: %s", city, exc)
        return []

    articles: list[NewsArticle] = []
    for item in data.get("articles", []):
        articles.append(NewsArticle(
            title=item.get("title", ""),
            description=item.get("description"),
            source=item.get("source", {}).get("name", "Unknown"),
            url=item.get("url", ""),
            published_at=item.get("publishedAt", ""),
        ))

    logger.info("Fetched %d news articles for %s", len(articles), city)
    return articles
