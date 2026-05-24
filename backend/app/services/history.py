"""In-memory EHRI history store — tracks last N days of EHRI per city.

Thread-safe via a simple dict+deque. Trivially replaceable with SQLite/Redis
later without changing the public API.
"""

from __future__ import annotations

import logging
from collections import defaultdict, deque
from dataclasses import dataclass, field
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

_MAX_HISTORY = 30  # keep up to 30 entries per city


@dataclass
class EHRIRecord:
    ehri: float
    metrics: dict[str, float]
    timestamp: str  # ISO-8601 UTC


class EHRIHistoryStore:
    """Per-city ring buffer of recent EHRI predictions."""

    def __init__(self, max_entries: int = _MAX_HISTORY) -> None:
        self._max = max_entries
        self._store: dict[str, deque[EHRIRecord]] = defaultdict(
            lambda: deque(maxlen=self._max)
        )

    # ── writes ──────────────────────────────────────────────────────

    def record(self, city: str, ehri: float, metrics: dict[str, float]) -> None:
        """Append a new EHRI observation for *city*."""
        entry = EHRIRecord(
            ehri=round(ehri, 2),
            metrics=metrics,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self._store[city.strip().lower()].append(entry)
        logger.debug("Recorded EHRI %.2f for %s (buffer len=%d)",
                      ehri, city, len(self._store[city.strip().lower()]))

    # ── reads ───────────────────────────────────────────────────────

    def get_last_n(self, city: str, n: int = 7) -> list[EHRIRecord]:
        """Return the last *n* records for *city* (oldest first)."""
        key = city.strip().lower()
        buf = self._store.get(key)
        if not buf:
            return []
        entries = list(buf)
        return entries[-n:]

    def get_ehri_values(self, city: str, n: int = 7) -> list[float]:
        """Convenience — return just the EHRI floats."""
        return [r.ehri for r in self.get_last_n(city, n)]

    def count(self, city: str) -> int:
        key = city.strip().lower()
        return len(self._store.get(key, []))

    def list_tracked_cities(self) -> list[str]:
        return sorted(self._store.keys())
