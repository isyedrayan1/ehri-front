"""POST /api/v1/city/analyze — full EHRI pipeline from just a city name.

Flow: city name → resolve coords → fetch PM2.5 + weather → predict EHRI
      → generate alert → dynamic alerts → news → LLM explanation → return JSON.
"""

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request

from app.schemas.responses import (
    AlertResponse,
    CityAnalysisResponse,
    DynamicAlertResponse,
    ForecastResponse,
    NewsArticleResponse,
)
from app.services.data_fetcher import fetch_pm25, fetch_weather
from app.services.news import fetch_city_news

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=CityAnalysisResponse)
async def analyze_city(payload: dict, request: Request) -> CityAnalysisResponse:
    city_name: str = payload.get("city", "").strip()
    if len(city_name) < 2:
        raise HTTPException(status_code=422, detail="'city' is required (min 2 chars).")

    container = request.app.state.container

    # 1 — Resolve city
    info = container.city_resolver.resolve(city_name)
    if info is None:
        available = container.city_resolver.list_cities()
        raise HTTPException(
            status_code=404,
            detail=f"City '{city_name}' not found. Available: {available}",
        )

    # 2 — Fetch live data (PM2.5 + weather + news) concurrently
    try:
        pm25_result, weather_result, news_articles = await asyncio.gather(
            fetch_pm25(info.latitude, info.longitude),
            fetch_weather(info.latitude, info.longitude),
            fetch_city_news(info.city),
        )
    except Exception as exc:
        logger.exception("Data fetch failed for %s", info.city)
        raise HTTPException(
            status_code=502,
            detail=f"Data fetch failed: {type(exc).__name__}: {exc}",
        ) from exc

    # 3 — Build metrics dict in strict feature order
    metrics = {
        "PM2.5": pm25_result.pm25,
        "Temperature": weather_result.temperature,
        "Humidity": weather_result.humidity,
        "PopulationDensity": info.population_density,
    }

    # 4 — Predict EHRI
    try:
        ehri = container.predictor.predict_ehri(metrics)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    # 5 — Tier alert
    alert = container.alert_service.generate_alert(ehri)

    # 5b — Record to history (auto-populate for forecasting)
    container.history.record(info.city, ehri, metrics)

    # 5c — Dynamic contextual alerts (metric + trend based)
    recent_ehri = container.history.get_ehri_values(info.city, n=7)
    dynamic_alerts = container.alert_service.evaluate_dynamic_alerts(
        city=info.city, metrics=metrics, ehri=ehri, recent_ehri=recent_ehri,
    )

    # 6 — LLM explanation
    explanation = await container.llm_service.explain_city_risk(
        city=info.city,
        metrics=metrics,
        ehri=ehri,
        alert_level=alert.level,
    )

    return CityAnalysisResponse(
        city=info.city,
        state=info.state,
        coordinates={"latitude": info.latitude, "longitude": info.longitude},
        metrics=metrics,
        ehri=round(ehri, 2),
        alert=AlertResponse.model_validate(alert.model_dump()),
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
            for d in dynamic_alerts
        ],
        news=[
            NewsArticleResponse(
                title=a.title,
                description=a.description,
                source=a.source,
                url=a.url,
                published_at=a.published_at,
            )
            for a in news_articles
        ],
        explanation=explanation,
        data_sources={"pm25": pm25_result.source, "weather": weather_result.source},
    )


@router.post("/forecast", response_model=ForecastResponse)
async def city_forecast(payload: dict, request: Request) -> ForecastResponse:
    """Forecast EHRI for the next 2 days using stored history.

    Requires at least 7 prior /analyze calls for the city, or falls back
    to whatever history is available (minimum 3 data points).
    """
    city_name: str = payload.get("city", "").strip()
    if len(city_name) < 2:
        raise HTTPException(status_code=422, detail="'city' is required (min 2 chars).")

    container = request.app.state.container

    # Resolve city to canonical name
    info = container.city_resolver.resolve(city_name)
    if info is None:
        available = container.city_resolver.list_cities()
        raise HTTPException(
            status_code=404,
            detail=f"City '{city_name}' not found. Available: {available}",
        )

    # Pull EHRI history
    ehri_values = container.history.get_ehri_values(info.city)
    if len(ehri_values) < 3:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Not enough history for '{info.city}'. "
                f"Have {len(ehri_values)} data points, need at least 3. "
                "Call POST /api/v1/city/analyze a few more times first."
            ),
        )

    # Use up to last 7 values (pad with earliest value if < 7)
    window = list(ehri_values[-7:])
    while len(window) < 7:
        window.insert(0, window[0])

    # Forecast
    try:
        result = container.forecaster.forecast_next_two_days(window)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {exc}") from exc

    # LLM explanation
    explanation = await container.llm_service.explain_forecast(
        city=info.city,
        historical_ehri=window,
        forecast_ehri=result.values,
        trend=result.trend,
    )

    return ForecastResponse(
        city=info.city,
        input_window_days=len(ehri_values),
        forecast_horizon_days=2,
        forecast_next_2_days=[round(v, 2) for v in result.values],
        trend=result.trend,
        history_values=[round(v, 2) for v in ehri_values],
        explanation=explanation,
    )
