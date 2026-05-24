"""POST /api/v1/compare — side-by-side EHRI comparison for 2-5 Indian cities.

Flow: resolve each city → fetch live data concurrently → predict EHRI
      → generate alerts → return ranked comparison.
"""

import asyncio
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request

from app.schemas.responses import (
    CitySummary,
    CompareResponse,
    DynamicAlertResponse,
)
from app.services.data_fetcher import fetch_pm25, fetch_weather

logger = logging.getLogger(__name__)

router = APIRouter()


async def _analyze_one(city_name: str, container) -> CitySummary:
    """Run the full pipeline for a single city (no LLM call — keep it fast)."""
    info = container.city_resolver.resolve(city_name)
    if info is None:
        raise ValueError(f"City '{city_name}' not found")

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
    alert = container.alert_service.generate_alert(ehri)

    # Record to history
    container.history.record(info.city, ehri, metrics)

    # Dynamic alerts
    recent = container.history.get_ehri_values(info.city, n=7)
    dynamic = container.alert_service.evaluate_dynamic_alerts(
        city=info.city, metrics=metrics, ehri=ehri, recent_ehri=recent,
    )

    return CitySummary(
        city=info.city,
        state=info.state,
        ehri=round(ehri, 2),
        alert_level=alert.level,
        metrics=metrics,
        dynamic_alerts=[
            DynamicAlertResponse(
                city=d.city,
                alert_type=d.alert_type,
                severity=d.severity,
                title=d.title,
                message=d.message,
                triggered_value=d.triggered_value,
                threshold=d.threshold,
                timestamp=d.timestamp,
            )
            for d in dynamic
        ],
        data_sources={"pm25": pm25_result.source, "weather": weather_result.source},
    )


@router.post("/compare", response_model=CompareResponse)
async def compare_cities(payload: dict, request: Request) -> CompareResponse:
    """Compare EHRI for 2–5 cities side-by-side.

    Request body: `{ "cities": ["Delhi", "Mumbai", "Bengaluru"] }`
    """
    cities: list[str] = payload.get("cities", [])
    if not isinstance(cities, list) or len(cities) < 2:
        raise HTTPException(status_code=422, detail="Provide 2–5 city names in 'cities' array.")
    if len(cities) > 5:
        raise HTTPException(status_code=422, detail="Maximum 5 cities allowed per comparison.")

    container = request.app.state.container

    # Validate all city names first
    resolved = []
    for c in cities:
        name = c.strip()
        if len(name) < 2:
            raise HTTPException(status_code=422, detail=f"Invalid city name: '{c}'")
        info = container.city_resolver.resolve(name)
        if info is None:
            available = container.city_resolver.list_cities()
            raise HTTPException(
                status_code=404,
                detail=f"City '{name}' not found. Available: {available}",
            )
        resolved.append(name)

    # Fetch all cities concurrently
    tasks = [_analyze_one(c, container) for c in resolved]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    summaries: list[CitySummary] = []
    errors: list[str] = []
    for city_name, result in zip(resolved, results):
        if isinstance(result, Exception):
            logger.warning("Comparison failed for %s: %s", city_name, result)
            errors.append(f"{city_name}: {result}")
        else:
            summaries.append(result)

    if not summaries:
        raise HTTPException(
            status_code=502,
            detail=f"All city analyses failed: {errors}",
        )

    # Sort worst → best (highest EHRI first)
    summaries.sort(key=lambda s: s.ehri, reverse=True)
    ranking = [s.city for s in summaries]

    return CompareResponse(
        cities=summaries,
        ranking=ranking,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
