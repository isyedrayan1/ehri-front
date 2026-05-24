"""Shared pytest fixtures for the EHRI test suite.

Provides:
  • ``client`` — async httpx test client with mocked external services.
  • ``container`` — ServiceContainer with real model + mocked external APIs.
"""

import asyncio
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.data_fetcher import AirQualityResult, WeatherResult
from app.services.news import NewsArticle


# ── Fake external API responses ─────────────────────────────────────

FAKE_PM25 = AirQualityResult(pm25=120.0, station_name="Test Station", source="mock")
FAKE_WEATHER = WeatherResult(temperature=35.0, humidity=60.0, source="mock")
FAKE_LLM_RESPONSE = "This is a mocked LLM explanation for testing purposes."
FAKE_NEWS = [
    NewsArticle(
        title="Delhi pollution hits dangerous levels",
        description="Air quality worsens in the capital.",
        source="Test News",
        url="https://example.com/1",
        published_at="2024-01-15T10:00:00Z",
    ),
    NewsArticle(
        title="Government launches clean air initiative",
        description="New measures announced.",
        source="Test Tribune",
        url="https://example.com/2",
        published_at="2024-01-14T08:00:00Z",
    ),
]


async def _mock_fetch_pm25(lat, lng, **kw):
    return FAKE_PM25


async def _mock_fetch_weather(lat, lng, **kw):
    return FAKE_WEATHER


async def _mock_fetch_news(city, **kw):
    return FAKE_NEWS


async def _mock_fetch_news_empty(city, **kw):
    return []


# ── Fixtures ────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="module")
def client():
    """Synchronous TestClient with mocked external data fetchers + LLM."""
    with (
        patch("app.api.routes.city.fetch_pm25", side_effect=_mock_fetch_pm25),
        patch("app.api.routes.city.fetch_weather", side_effect=_mock_fetch_weather),
        patch("app.api.routes.city.fetch_city_news", side_effect=_mock_fetch_news_empty),
        patch("app.api.routes.compare.fetch_pm25", side_effect=_mock_fetch_pm25),
        patch("app.api.routes.compare.fetch_weather", side_effect=_mock_fetch_weather),
        patch("app.api.routes.chat.fetch_pm25", side_effect=_mock_fetch_pm25),
        patch("app.api.routes.chat.fetch_weather", side_effect=_mock_fetch_weather),
        patch("app.api.routes.dashboard.fetch_pm25", side_effect=_mock_fetch_pm25),
        patch("app.api.routes.dashboard.fetch_weather", side_effect=_mock_fetch_weather),
        patch("app.api.routes.dashboard.fetch_city_news", side_effect=_mock_fetch_news),
        patch("app.api.routes.ai_chat.fetch_pm25", side_effect=_mock_fetch_pm25),
        patch("app.api.routes.ai_chat.fetch_weather", side_effect=_mock_fetch_weather),
        patch("app.api.routes.ai_chat.fetch_city_news", side_effect=_mock_fetch_news),
        patch("app.services.llm.LLMService._chat", new_callable=AsyncMock, return_value=FAKE_LLM_RESPONSE),
    ):
        with TestClient(app) as c:
            yield c
