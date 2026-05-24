"""POST /api/v1/ai/chat — Conversation AI engine.

Full multi-turn, multi-city, health-centric conversational AI.
Not stuck to one city. Detects all mentioned cities, fetches live data,
embeds structured cards in the response for frontend rendering.

Audience-aware: public (simple + actionable), researcher (quantitative),
professional (concise + policy).
"""

import asyncio
import logging
import re
from typing import Any

from fastapi import APIRouter, HTTPException, Request

from app.schemas.requests import ChatMessage
from app.schemas.responses import (
    CityCard,
    ComparisonCard,
    ConversationResponse,
    HealthTipCard,
    MetricDetailCard,
    MetricSeverity,
    NewsCard,
)
from app.services.data_fetcher import fetch_pm25, fetch_weather
from app.services.news import fetch_city_news

logger = logging.getLogger(__name__)

router = APIRouter()

# ── City detection ──────────────────────────────────────────────

_CITY_RE: re.Pattern | None = None


def _build_city_regex(city_list: list[str]) -> re.Pattern:
    global _CITY_RE
    if _CITY_RE is None:
        escaped = sorted([re.escape(c) for c in city_list], key=len, reverse=True)
        _CITY_RE = re.compile(r"\b(" + "|".join(escaped) + r")\b", re.IGNORECASE)
    return _CITY_RE


def _detect_cities(text: str, city_list: list[str]) -> list[str]:
    """Return unique city names found in *text* (preserves order, deduped)."""
    pattern = _build_city_regex(city_list)
    seen: set[str] = set()
    result: list[str] = []
    for m in pattern.finditer(text):
        name = m.group(1).title()
        if name.lower() not in seen:
            seen.add(name.lower())
            result.append(name)
    return result


# ── Intent classification ───────────────────────────────────────

_COMPARE_WORDS = re.compile(
    r"\b(compare|versus|vs\.?|better|worse|rank|ranking|difference)\b", re.I
)
_HEALTH_WORDS = re.compile(
    r"\b(health|asthma|respiratory|cardiovascular|precaution|vulnerable|safe|"
    r"pregnant|children|elderly|mask|inhaler|dengue|malaria|heatstroke|"
    r"hospital|doctor|symptom|disease|illness|sick|medicine|treatment)\b", re.I
)
_NEWS_WORDS = re.compile(r"\b(news|headline|article|latest|report|media)\b", re.I)
_FORECAST_WORDS = re.compile(r"\b(forecast|predict|tomorrow|next.*day|trend|future|upcoming)\b", re.I)


def _classify_intent(text: str, city_count: int) -> str:
    if city_count >= 2 and _COMPARE_WORDS.search(text):
        return "comparison"
    if city_count >= 2:
        return "multi_city"
    if city_count == 1:
        return "city_analysis"
    if _HEALTH_WORDS.search(text):
        return "health_qa"
    return "general"


# ── Metric severity helpers (reuse dashboard logic) ─────────────

def _pm25_sev(v: float) -> tuple[str, str]:
    if v <= 30: return "safe", "Air quality is good."
    if v <= 60: return "moderate", "Acceptable for most."
    if v <= 150: return "unhealthy", "Sensitive groups at risk."
    return "hazardous", "Health alert for everyone."


def _temp_sev(v: float) -> tuple[str, str]:
    if v <= 25: return "safe", "Comfortable."
    if v <= 35: return "moderate", "Warm — stay hydrated."
    if v <= 40: return "unhealthy", "Avoid prolonged sun."
    return "hazardous", "Extreme heat risk."


def _hum_sev(v: float) -> tuple[str, str]:
    if v <= 40: return "safe", "Dry and comfortable."
    if v <= 65: return "moderate", "Normal humidity."
    if v <= 85: return "unhealthy", "Muggy — discomfort rising."
    return "hazardous", "Very high — heat exhaustion risk."


# ── Fetch live data for a single city ───────────────────────────

async def _fetch_city_data(info, container) -> dict[str, Any] | None:
    """Return {city, metrics, ehri, alert_level} or None on failure."""
    for attempt in range(2):
        try:
            pm25_result, weather_result = await asyncio.gather(
                fetch_pm25(info.latitude, info.longitude),
                fetch_weather(info.latitude, info.longitude),
            )
            break
        except Exception as exc:
            logger.warning(
                "Live data fetch attempt %d failed for %s: %s: %s",
                attempt + 1, info.city, type(exc).__name__, exc,
            )
            if attempt == 0:
                await asyncio.sleep(1)  # brief back-off before retry
            else:
                return None

    metrics = {
        "PM2.5": pm25_result.pm25,
        "Temperature": weather_result.temperature,
        "Humidity": weather_result.humidity,
        "PopulationDensity": info.population_density,
    }
    ehri = container.predictor.predict_ehri(metrics)
    alert = container.alert_service.generate_alert(ehri)
    container.history.record(info.city, ehri, metrics)

    return {
        "city": info.city,
        "state": info.state,
        "metrics": metrics,
        "ehri": round(ehri, 2),
        "alert_level": alert.level,
    }


# ── Build cards from context ────────────────────────────────────

def _make_city_card(data: dict) -> dict:
    return CityCard(
        city=data["city"],
        ehri=data["ehri"],
        alert_level=data["alert_level"],
        metrics=data["metrics"],
    ).model_dump()


def _make_comparison_card(city_data: list[dict]) -> dict:
    cards = [CityCard(city=d["city"], ehri=d["ehri"], alert_level=d["alert_level"], metrics=d["metrics"]) for d in city_data]
    ranking = [d["city"] for d in sorted(city_data, key=lambda c: c["ehri"], reverse=True)]
    return ComparisonCard(cities=cards, ranking=ranking).model_dump()


def _make_news_cards(articles) -> list[dict]:
    return [
        NewsCard(
            headline=a.title,
            source=a.source,
            url=a.url,
            relevance="Environmental health related",
        ).model_dump()
        for a in articles[:3]
    ]


def _make_health_tips(alert_level: str, audience: str) -> dict:
    tips_by_level = {
        "low": ["No special precautions needed.", "Stay generally aware of air quality."],
        "moderate": ["Sensitive individuals should limit outdoor exertion.", "Stay hydrated throughout the day."],
        "high": ["Avoid strenuous outdoor activity.", "Use N95 masks outdoors.", "Keep windows closed.", "Run air purifiers."],
        "severe": ["Stay indoors as much as possible.", "Use N95 masks if going outside.", "Seek medical help for breathing issues.", "Run air purifiers continuously."],
    }
    return HealthTipCard(
        title=f"Health Advisory ({alert_level.title()} Risk)",
        advice=tips_by_level.get(alert_level, tips_by_level["moderate"]),
        audience=audience,
    ).model_dump()


# ── Suggestion generator ────────────────────────────────────────

def _generate_suggestions(mode: str, cities: list[str], question: str) -> list[str]:
    suggestions = []
    if mode == "city_analysis" and cities:
        c = cities[0]
        suggestions = [
            f"What health precautions should I take in {c}?",
            f"How does {c} compare to other cities?",
            f"What's the air quality forecast for {c}?",
        ]
    elif mode == "comparison":
        suggestions = [
            "Which city is safest to visit right now?",
            "What are the health risks in the worst-ranked city?",
            "Show me the pollution trends for these cities.",
        ]
    elif mode == "multi_city":
        suggestions = [
            "Compare these cities side by side.",
            "Which one has better air quality?",
            "What precautions should I take?",
        ]
    elif mode == "health_qa":
        suggestions = [
            "What should asthma patients do on high-pollution days?",
            "How does PM2.5 affect children?",
            "What are the signs of heat exhaustion?",
        ]
    else:
        suggestions = [
            "Tell me about air quality in Delhi.",
            "Compare Mumbai and Bengaluru.",
            "What health risks does pollution cause?",
        ]
    return suggestions[:3]


# ── Pydantic model for request ──────────────────────────────────

from pydantic import BaseModel, Field
from typing import Optional


class ConversationRequest(BaseModel):
    message: str = Field(min_length=2, description="User's message")
    history: Optional[list[ChatMessage]] = Field(
        default=None,
        max_length=20,
        description="Client-side conversation history (oldest first).",
    )
    audience: str = Field(
        default="public",
        pattern="^(public|researcher|professional)$",
        description="Target audience: public | researcher | professional",
    )


# ── Main endpoint ───────────────────────────────────────────────

@router.post("/chat", response_model=ConversationResponse)
async def ai_chat(payload: ConversationRequest, request: Request) -> ConversationResponse:
    container = request.app.state.container

    # 1 — Detect all mentioned cities
    all_cities = container.city_resolver.list_cities()
    detected = _detect_cities(payload.message, all_cities)
    mode = _classify_intent(payload.message, len(detected))

    # 2 — Fetch live data for each detected city (sequentially to avoid API rate limits)
    city_data: list[dict[str, Any]] = []
    if detected:
        infos = []
        for name in detected:
            info = container.city_resolver.resolve(name)
            if info:
                infos.append(info)

        for info in infos:
            result = await _fetch_city_data(info, container)
            if result is not None:
                city_data.append(result)

    # 3 — Fetch news for first detected city (for context)
    news_articles = []
    if detected:
        try:
            news_articles = await fetch_city_news(detected[0])
        except Exception:
            pass

    # 4 — Build context for LLM
    context_parts: list[str] = []
    if city_data:
        for cd in city_data:
            context_parts.append(
                f"City: {cd['city']} | EHRI: {cd['ehri']} | Alert: {cd['alert_level']} | "
                f"PM2.5: {cd['metrics']['PM2.5']} µg/m³ | "
                f"Temp: {cd['metrics']['Temperature']}°C | "
                f"Humidity: {cd['metrics']['Humidity']}%"
            )
    if news_articles:
        headlines = [a.title for a in news_articles[:3] if a.title]
        if headlines:
            context_parts.append("Recent news: " + " | ".join(headlines))

    # 5 — Build cards
    cards: list[dict] = []

    if mode == "comparison" and len(city_data) >= 2:
        cards.append(_make_comparison_card(city_data))
    elif city_data:
        for cd in city_data:
            cards.append(_make_city_card(cd))

    if city_data and _HEALTH_WORDS.search(payload.message):
        cards.append(_make_health_tips(city_data[0]["alert_level"], payload.audience))

    if news_articles and _NEWS_WORDS.search(payload.message):
        cards.extend(_make_news_cards(news_articles))

    # 6 — Call LLM with full context
    history_dicts = None
    if payload.history:
        history_dicts = [msg.model_dump() for msg in payload.history]

    answer = await container.llm_service.answer_conversation(
        question=payload.message,
        context="\n".join(context_parts) if context_parts else None,
        audience=payload.audience,
        mode=mode,
        history=history_dicts,
    )

    # 7 — Generate suggestions
    suggestions = _generate_suggestions(mode, [cd["city"] for cd in city_data], payload.message)

    return ConversationResponse(
        text=answer,
        cards=cards,
        mode=mode,
        detected_cities=[cd["city"] for cd in city_data],
        suggestions=suggestions,
    )
