"""Alert engine — tiered EHRI classification + dynamic contextual alerts.

Tier alerts are based on EHRI score alone.
Dynamic alerts layer on metric-specific and trend-based warnings:
  • PM2.5 > 150  → Severe Pollution Alert
  • Temperature > 40 → Heat Stress Alert
  • Humidity > 85 → High Humidity / Tropical Disease Alert
  • EHRI rise > 10 pts over recent history → Risk Surge Alert
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.services.types import Alert


# ── static EHRI tier thresholds ─────────────────────────────────

_THRESHOLDS: list[dict] = [
    {
        "max": 25,
        "level": "low",
        "message": "Air quality and thermal conditions are within safe limits.",
        "precautions": [
            "No special precautions required.",
        ],
        "vulnerable_groups": [],
    },
    {
        "max": 50,
        "level": "moderate",
        "message": "Moderate environmental health stress detected.",
        "precautions": [
            "Sensitive individuals should limit prolonged outdoor exertion.",
            "Stay hydrated.",
        ],
        "vulnerable_groups": ["Children", "Elderly", "People with respiratory conditions"],
    },
    {
        "max": 75,
        "level": "high",
        "message": "High environmental health risk. Take precautions.",
        "precautions": [
            "Avoid strenuous outdoor activity.",
            "Use N95 masks if going outside.",
            "Keep windows closed and use air purifiers.",
            "Stay hydrated and avoid midday sun exposure.",
        ],
        "vulnerable_groups": [
            "Children",
            "Elderly",
            "Pregnant women",
            "People with asthma / COPD",
            "Outdoor workers",
        ],
    },
    {
        "max": 100,
        "level": "severe",
        "message": "Severe environmental health risk. Minimise outdoor exposure.",
        "precautions": [
            "Remain indoors as much as possible.",
            "Use N95 masks if outdoor travel is unavoidable.",
            "Run air purifiers continuously.",
            "Seek medical help for any respiratory or heat-related symptoms.",
            "Avoid all forms of outdoor exercise.",
        ],
        "vulnerable_groups": [
            "Children",
            "Elderly",
            "Pregnant women",
            "People with cardiovascular disease",
            "People with asthma / COPD",
            "Outdoor workers",
            "Immunocompromised individuals",
        ],
    },
]


# ── dynamic alert dataclass ─────────────────────────────────────

@dataclass
class DynamicAlert:
    """A contextual alert triggered by specific metric or trend conditions."""
    city: str
    alert_type: str          # "pollution" | "heat_stress" | "humidity" | "risk_surge"
    severity: str            # "warning" | "critical"
    title: str
    message: str
    triggered_value: float
    threshold: float
    timestamp: str           # ISO-8601 UTC


# ── alert service ───────────────────────────────────────────────

class AlertService:
    def generate_alert(self, ehri: float) -> Alert:
        for tier in _THRESHOLDS:
            if ehri <= tier["max"]:
                return Alert(
                    level=tier["level"],
                    message=tier["message"],
                    precautions=tier["precautions"],
                    vulnerable_groups=tier["vulnerable_groups"],
                )

        # Fallback for values slightly above 100 due to floating-point precision.
        fallback = _THRESHOLDS[-1]
        return Alert(
            level=fallback["level"],
            message=fallback["message"],
            precautions=fallback["precautions"],
            vulnerable_groups=fallback["vulnerable_groups"],
        )

    def evaluate_dynamic_alerts(
        self,
        city: str,
        metrics: dict[str, float],
        ehri: float,
        recent_ehri: list[float] | None = None,
    ) -> list[DynamicAlert]:
        """Evaluate metric-specific and trend-based dynamic alert rules.

        Args:
            city: Canonical city name.
            metrics: Current metric values (PM2.5, Temperature, Humidity, PopulationDensity).
            ehri: Current EHRI score.
            recent_ehri: Last N EHRI values (oldest first) for trend detection.

        Returns:
            List of triggered DynamicAlert objects (may be empty).
        """
        alerts: list[DynamicAlert] = []
        now = datetime.now(timezone.utc).isoformat()

        pm25 = metrics.get("PM2.5", 0)
        temp = metrics.get("Temperature", 0)
        humidity = metrics.get("Humidity", 0)

        # Rule 1: Severe Pollution — PM2.5 > 150
        if pm25 > 150:
            severity = "critical" if pm25 > 300 else "warning"
            alerts.append(DynamicAlert(
                city=city,
                alert_type="pollution",
                severity=severity,
                title="Severe Air Pollution",
                message=(
                    f"PM2.5 concentration is {pm25:.1f} µg/m³, well above the "
                    f"safe limit of 60 µg/m³. {'Hazardous levels — avoid all outdoor activity.' if pm25 > 300 else 'Use masks and air purifiers.'}"
                ),
                triggered_value=pm25,
                threshold=150.0,
                timestamp=now,
            ))

        # Rule 2: Heat Stress — Temperature > 40°C
        if temp > 40:
            severity = "critical" if temp > 45 else "warning"
            alerts.append(DynamicAlert(
                city=city,
                alert_type="heat_stress",
                severity=severity,
                title="Heat Stress Warning",
                message=(
                    f"Temperature is {temp:.1f}°C. "
                    f"{'Extreme heat — life-threatening conditions possible.' if temp > 45 else 'Stay hydrated, avoid midday sun, and check on elderly neighbours.'}"
                ),
                triggered_value=temp,
                threshold=40.0,
                timestamp=now,
            ))

        # Rule 3: High Humidity — Humidity > 85%
        if humidity > 85:
            alerts.append(DynamicAlert(
                city=city,
                alert_type="humidity",
                severity="warning",
                title="High Humidity Alert",
                message=(
                    f"Relative humidity is {humidity:.0f}%. "
                    "High humidity combined with heat increases risk of heat exhaustion "
                    "and promotes vector-borne diseases (dengue, malaria)."
                ),
                triggered_value=humidity,
                threshold=85.0,
                timestamp=now,
            ))

        # Rule 4: Risk Surge — EHRI rose > 10 pts over recent window
        if recent_ehri and len(recent_ehri) >= 2:
            oldest = recent_ehri[0]
            delta = ehri - oldest
            if delta > 10:
                severity = "critical" if delta > 20 else "warning"
                alerts.append(DynamicAlert(
                    city=city,
                    alert_type="risk_surge",
                    severity=severity,
                    title="EHRI Risk Surge",
                    message=(
                        f"EHRI has risen by {delta:.1f} points (from {oldest:.1f} "
                        f"to {ehri:.1f}) over the recent monitoring window. "
                        "Rapidly worsening conditions — take immediate precautions."
                    ),
                    triggered_value=delta,
                    threshold=10.0,
                    timestamp=now,
                ))

        return alerts
