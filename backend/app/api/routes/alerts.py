"""GET /api/v1/alerts — feed of all dynamic alerts across monitored cities.

Scans the EHRI history store, re-evaluates dynamic alert rules against the
most recent observation for each tracked city, and returns a unified feed
sorted by severity (critical first) then by city name.
"""

import logging

from fastapi import APIRouter, Request

from app.schemas.responses import AlertFeedResponse, DynamicAlertResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/alerts", response_model=AlertFeedResponse)
async def alert_feed(request: Request) -> AlertFeedResponse:
    """Return all currently triggered dynamic alerts across every city
    that has been analysed at least once in this session."""
    container = request.app.state.container

    tracked = container.history.list_tracked_cities()
    all_alerts: list[DynamicAlertResponse] = []

    for city_key in tracked:
        records = container.history.get_last_n(city_key, n=7)
        if not records:
            continue

        latest = records[-1]
        recent_ehri = [r.ehri for r in records]

        # Re-evaluate dynamic rules against latest observation
        dynamic = container.alert_service.evaluate_dynamic_alerts(
            city=city_key.title(),  # Restore canonical casing
            metrics=latest.metrics,
            ehri=latest.ehri,
            recent_ehri=recent_ehri,
        )

        for d in dynamic:
            all_alerts.append(DynamicAlertResponse(
                city=d.city,
                alert_type=d.alert_type,
                severity=d.severity,
                title=d.title,
                message=d.message,
                triggered_value=d.triggered_value,
                threshold=d.threshold,
                timestamp=d.timestamp,
            ))

    # Sort: critical first, then warning; within same severity, alphabetical
    severity_order = {"critical": 0, "warning": 1}
    all_alerts.sort(key=lambda a: (severity_order.get(a.severity, 2), a.city))

    return AlertFeedResponse(
        total_alerts=len(all_alerts),
        alerts=all_alerts,
        cities_monitored=len(tracked),
    )
