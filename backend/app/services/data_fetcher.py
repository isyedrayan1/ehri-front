"""Live data fetcher — PM2.5 from OpenAQ, weather from Open-Meteo.

Both functions return plain numeric values; they never touch the ML model.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

_OPENAQ_BASE = "https://api.openaq.org/v3"
_OPEN_METEO_BASE = "https://api.open-meteo.com/v1"
_TIMEOUT = 15  # seconds
_OPENAQ_MAX_RADIUS = 25000  # metres — API hard limit


@dataclass
class AirQualityResult:
    pm25: float
    station_name: str = ""
    source: str = "openaq"


@dataclass
class WeatherResult:
    temperature: float  # °C
    humidity: float  # %
    source: str = "open-meteo"


# ── PM2.5 via OpenAQ v3 ────────────────────────────────────────────


async def fetch_pm25(latitude: float, longitude: float, radius_km: int = 25) -> AirQualityResult:
    """Fetch latest PM2.5 reading from the nearest OpenAQ station.

    Flow:
    1. ``/v3/locations`` — find nearest station with PM2.5 sensor
    2. Identify the PM2.5 sensor ID from the location's sensor list
    3. ``/v3/locations/{id}/latest`` — latest readings by sensor
    4. Match sensor ID → extract PM2.5 value
    """
    headers: dict[str, str] = {}
    if settings.openaq_api_key:
        headers["X-API-Key"] = settings.openaq_api_key

    radius_m = min(radius_km * 1000, _OPENAQ_MAX_RADIUS)

    # Step 1 — find nearest locations with PM2.5 (parameters_id=2)
    locations_url = f"{_OPENAQ_BASE}/locations"
    params: dict = {
        "coordinates": f"{latitude},{longitude}",
        "radius": radius_m,
        "parameters_id": 2,  # PM2.5
        "limit": 5,          # try a few in case nearest has stale data
    }

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(locations_url, params=params, headers=headers)
        resp.raise_for_status()
        data = resp.json()

        results = data.get("results", [])
        if not results:
            raise ValueError(
                f"No OpenAQ PM2.5 stations within {radius_km} km of ({latitude}, {longitude})"
            )

        # Try each location until we get a PM2.5 value
        for location in results:
            location_id = location["id"]
            station_name = location.get("name", "")

            # Find the PM2.5 sensor ID from the location's sensor list
            pm25_sensor_id: int | None = None
            for sensor in location.get("sensors", []):
                p = sensor.get("parameter", {})
                if p.get("id") == 2 or p.get("name", "").lower() in ("pm25", "pm2.5"):
                    pm25_sensor_id = sensor["id"]
                    break

            if pm25_sensor_id is None:
                continue

            # Step 2 — get latest measurements for this location
            latest_url = f"{_OPENAQ_BASE}/locations/{location_id}/latest"
            resp2 = await client.get(latest_url, headers=headers)
            resp2.raise_for_status()
            latest = resp2.json()

            # Match by sensor ID
            for measurement in latest.get("results", []):
                if measurement.get("sensorsId") == pm25_sensor_id:
                    value = float(measurement["value"])
                    if value >= 0:
                        logger.info("PM2.5=%.1f from %s (id=%s)", value, station_name, location_id)
                        return AirQualityResult(pm25=value, station_name=station_name)

        raise ValueError(
            f"PM2.5 value not found at any of {len(results)} OpenAQ stations "
            f"near ({latitude}, {longitude})"
        )


# ── Weather via Open-Meteo (no key needed) ──────────────────────────


async def fetch_weather(latitude: float, longitude: float) -> WeatherResult:
    """Fetch current temperature and relative humidity from Open-Meteo."""
    url = f"{_OPEN_METEO_BASE}/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m",
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    current = data.get("current", {})
    temperature = current.get("temperature_2m")
    humidity = current.get("relative_humidity_2m")

    if temperature is None or humidity is None:
        raise ValueError(f"Open-Meteo returned incomplete data for ({latitude}, {longitude})")

    return WeatherResult(temperature=float(temperature), humidity=float(humidity))
