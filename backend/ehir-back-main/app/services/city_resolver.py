"""City resolver — maps a city name to (lat, lng, population_density).

Uses static CSV + JSON lookup files shipped with the backend.
"""

from __future__ import annotations

import csv
import json
from dataclasses import dataclass
from pathlib import Path

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"


@dataclass
class CityInfo:
    city: str
    state: str
    latitude: float
    longitude: float
    population_density: float  # persons / km²


class CityResolver:
    """Load once at startup; O(1) lookup by normalised city name."""

    def __init__(self) -> None:
        self._cities: dict[str, CityInfo] = {}
        self._load()

    # ── private ─────────────────────────────────────────────────────

    def _load(self) -> None:
        coords: dict[str, dict] = {}
        csv_path = _DATA_DIR / "city_coordinates.csv"
        with csv_path.open(newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                coords[row["city"].strip().lower()] = row

        json_path = _DATA_DIR / "population_data.json"
        with json_path.open(encoding="utf-8") as fh:
            pop_data: dict[str, float] = json.load(fh)

        pop_lookup = {k.strip().lower(): v for k, v in pop_data.items()}

        for key, row in coords.items():
            density = pop_lookup.get(key, 3000)  # sensible Indian-city default
            self._cities[key] = CityInfo(
                city=row["city"].strip(),
                state=row["state"].strip(),
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                population_density=float(density),
            )

    # ── public API ──────────────────────────────────────────────────

    def resolve(self, city_name: str) -> CityInfo | None:
        return self._cities.get(city_name.strip().lower())

    def list_cities(self) -> list[str]:
        return sorted(info.city for info in self._cities.values())
