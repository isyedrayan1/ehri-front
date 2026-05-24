"""POST /api/v1/dashboard/insights — card-based dashboard AI.

Fetches live data for a city and returns structured insight cards
that the frontend renders as visual components (not just a text wall).
"""

import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request

from app.schemas.responses import (
    DashboardInsightsResponse,
    DynamicAlertResponse,
    ForecastSnapshotCard,
    HealthAdvisoryCard,
    MetricBreakdownCard,
    MetricSeverity,
    NewsArticleResponse,
    NewsDigestCard,
    RiskSummaryCard,
)
from app.services.data_fetcher import fetch_pm25, fetch_weather
from app.services.news import fetch_city_news

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Metric severity classification ──────────────────────────────

def _pm25_severity(val: float) -> tuple[str, str]:
    if val <= 30:
        return "safe", "Air quality is good."
    if val <= 60:
        return "moderate", "Air quality is acceptable for most people."
    if val <= 150:
        return "unhealthy", "Sensitive groups may experience health effects."
    return "hazardous", "Health alert — everyone may experience serious effects."


def _temp_severity(val: float) -> tuple[str, str]:
    if val <= 25:
        return "safe", "Comfortable temperature."
    if val <= 35:
        return "moderate", "Warm — stay hydrated."
    if val <= 40:
        return "unhealthy", "High heat — avoid prolonged sun exposure."
    return "hazardous", "Extreme heat — risk of heatstroke."


def _humidity_severity(val: float) -> tuple[str, str]:
    if val <= 40:
        return "safe", "Dry and comfortable."
    if val <= 65:
        return "moderate", "Comfortable humidity levels."
    if val <= 85:
        return "unhealthy", "Muggy — increased discomfort, risk of mould."
    return "hazardous", "Very high humidity — heat exhaustion risk elevated."


_HEALTH_IMPACTS_BY_LEVEL = {
    "low": [
        "Minimal health risk from environmental factors.",
    ],
    "moderate": [
        "Sensitive individuals may experience mild respiratory irritation.",
        "Slightly elevated risk for people with asthma or COPD.",
    ],
    "high": [
        "Increased risk of respiratory infections and asthma attacks.",
        "Cardiovascular stress — higher risk of heart events.",
        "Outdoor workers face occupational health hazards.",
        "Children and elderly at elevated risk.",
    ],
    "severe": [
        "Serious respiratory distress possible for general population.",
        "Emergency room visits for breathing issues likely to spike.",
        "Cardiovascular events (heart attacks, strokes) risk elevated.",
        "Heat-related illnesses including heatstroke possible.",
        "Vector-borne disease transmission risk (dengue, malaria) elevated.",
        "Mental health impacts from sustained poor conditions.",
    ],
}


@router.post("/insights", response_model=DashboardInsightsResponse)
async def dashboard_insights(payload: dict, request: Request) -> DashboardInsightsResponse:
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

    # 2 — Fetch live data + news concurrently
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

    metrics = {
        "PM2.5": pm25_result.pm25,
        "Temperature": weather_result.temperature,
        "Humidity": weather_result.humidity,
        "PopulationDensity": info.population_density,
    }

    # 3 — Predict & alert
    ehri = container.predictor.predict_ehri(metrics)
    alert = container.alert_service.generate_alert(ehri)
    container.history.record(info.city, ehri, metrics)

    # 4 — Dynamic alerts
    recent_ehri = container.history.get_ehri_values(info.city, n=7)
    dynamic_alerts = container.alert_service.evaluate_dynamic_alerts(
        city=info.city, metrics=metrics, ehri=ehri, recent_ehri=recent_ehri,
    )

    # 5 — Build cards

    # Risk Summary
    risk_summary = RiskSummaryCard(
        city=info.city,
        state=info.state,
        ehri=round(ehri, 2),
        alert_level=alert.level,
        summary=alert.message,
    )

    # Health Advisory
    health_advisory = HealthAdvisoryCard(
        precautions=alert.precautions,
        vulnerable_groups=alert.vulnerable_groups,
        health_impacts=_HEALTH_IMPACTS_BY_LEVEL.get(alert.level, []),
    )

    # Metric Breakdown
    pm25_sev, pm25_desc = _pm25_severity(metrics["PM2.5"])
    temp_sev, temp_desc = _temp_severity(metrics["Temperature"])
    hum_sev, hum_desc = _humidity_severity(metrics["Humidity"])

    metric_breakdown = MetricBreakdownCard(
        metrics=[
            MetricSeverity(name="PM2.5", value=metrics["PM2.5"], unit="µg/m³", severity=pm25_sev, description=pm25_desc),
            MetricSeverity(name="Temperature", value=metrics["Temperature"], unit="°C", severity=temp_sev, description=temp_desc),
            MetricSeverity(name="Humidity", value=metrics["Humidity"], unit="%", severity=hum_sev, description=hum_desc),
            MetricSeverity(name="Population Density", value=metrics["PopulationDensity"], unit="per km²", severity="info", description=f"{info.city} has {metrics['PopulationDensity']:.0f} people/km²."),
        ],
    )

    # News Digest
    news_digest = NewsDigestCard(
        articles=[
            NewsArticleResponse(
                title=a.title,
                description=a.description,
                source=a.source,
                url=a.url,
                published_at=a.published_at,
            )
            for a in news_articles[:5]
        ],
    )

    # Forecast Snapshot
    if len(recent_ehri) >= 3:
        window = list(recent_ehri[-7:])
        while len(window) < 7:
            window.insert(0, window[0])
        try:
            result = container.forecaster.forecast_next_two_days(window)
            forecast_snapshot = ForecastSnapshotCard(
                trend=result.trend,
                forecast_values=[round(v, 2) for v in result.values],
                history_count=len(recent_ehri),
                available=True,
            )
        except Exception:
            forecast_snapshot = ForecastSnapshotCard(
                trend="Unknown", forecast_values=[], history_count=len(recent_ehri), available=False,
            )
    else:
        forecast_snapshot = ForecastSnapshotCard(
            trend="Insufficient data",
            forecast_values=[],
            history_count=len(recent_ehri),
            available=False,
        )

    # 6 — LLM narrative (dashboard-specific prompt)
    ai_summary = await container.llm_service.generate_dashboard_summary(
        city=info.city,
        metrics=metrics,
        ehri=ehri,
        alert_level=alert.level,
        dynamic_alerts=[d.title for d in dynamic_alerts],
        news_headlines=[a.title for a in news_articles[:3]],
        trend=forecast_snapshot.trend if forecast_snapshot.available else None,
    )

    return DashboardInsightsResponse(
        city=info.city,
        risk_summary=risk_summary,
        health_advisory=health_advisory,
        metric_breakdown=metric_breakdown,
        news_digest=news_digest,
        forecast_snapshot=forecast_snapshot,
        dynamic_alerts=[
            DynamicAlertResponse(
                city=d.city, alert_type=d.alert_type, severity=d.severity,
                title=d.title, message=d.message,
                triggered_value=d.triggered_value, threshold=d.threshold,
                timestamp=d.timestamp,
            )
            for d in dynamic_alerts
        ],
        ai_summary=ai_summary,
    )
