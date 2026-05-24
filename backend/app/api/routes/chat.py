"""POST /api/v1/chat/query — hybrid conversational AI endpoint.

Supports:
  • Client-side conversation history (messages[]).
  • Auto-detect city mentions → fetch live data → switch to Mode 1.
  • Manual city + metrics + ehri override (Mode 1 explicit).
  • General environmental-health Q&A (Mode 2).
"""

import asyncio
import logging
import re

from fastapi import APIRouter, Request

from app.schemas.requests import ChatRequest
from app.schemas.responses import ChatResponse
from app.services.data_fetcher import fetch_pm25, fetch_weather

logger = logging.getLogger(__name__)

router = APIRouter()

# Regex for common Indian city names — matches whole words, case-insensitive
_CITY_PATTERN: re.Pattern | None = None


def _get_city_pattern(city_list: list[str]) -> re.Pattern:
    """Build and cache a regex from the city resolver's city list."""
    global _CITY_PATTERN
    if _CITY_PATTERN is None:
        escaped = [re.escape(c) for c in city_list]
        _CITY_PATTERN = re.compile(
            r"\b(" + "|".join(escaped) + r")\b", re.IGNORECASE
        )
    return _CITY_PATTERN


@router.post("/query", response_model=ChatResponse)
async def chat_query(payload: ChatRequest, request: Request) -> ChatResponse:
    container = request.app.state.container

    city = payload.city
    metrics = payload.metrics.model_dump() if payload.metrics else None
    ehri = payload.ehri

    # ── Auto-detect city from question if not explicitly provided ────
    if not city:
        pattern = _get_city_pattern(container.city_resolver.list_cities())
        match = pattern.search(payload.question)
        if match:
            detected_city = match.group(1)
            info = container.city_resolver.resolve(detected_city)
            if info:
                logger.info("Auto-detected city '%s' in question", info.city)
                try:
                    pm25_result, weather_result = await asyncio.gather(
                        fetch_pm25(info.latitude, info.longitude),
                        fetch_weather(info.latitude, info.longitude),
                    )
                    metrics = {
                        "PM2.5": pm25_result.pm25,
                        "Temperature": weather_result.temperature,
                        "Humidity": weather_result.humidity,
                        "PopulationDensity": info.population_density,
                    }
                    ehri = container.predictor.predict_ehri(metrics)
                    city = info.city

                    # Also record to history
                    container.history.record(info.city, ehri, metrics)
                except Exception as exc:
                    logger.warning(
                        "Auto-detect fetch failed for %s, falling back to Mode 2: %s",
                        detected_city, exc,
                    )

    # ── Prepare conversation history ────────────────────────────────
    history_dicts = None
    if payload.history:
        history_dicts = [msg.model_dump() for msg in payload.history]

    answer, mode = await container.llm_service.answer_question(
        question=payload.question,
        city=city,
        metrics=metrics,
        ehri=ehri,
        history=history_dicts,
    )

    return ChatResponse(answer=answer, mode=mode)
