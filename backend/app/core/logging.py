"""Structured JSON logging configuration.

Call ``setup_logging()`` once at startup to:
  • Format all log output as JSON (machine-parseable).
  • Set level based on APP_ENV (development → DEBUG, production → INFO).
"""

from __future__ import annotations

import json
import logging
import sys
from datetime import datetime, timezone

from app.core.config import settings


class _JSONFormatter(logging.Formatter):
    """Emit each log record as a single JSON line."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info and record.exc_info[1]:
            log_obj["exception"] = self.formatException(record.exc_info)
        # Optional request-ID injection (set by middleware)
        request_id = getattr(record, "request_id", None)
        if request_id:
            log_obj["request_id"] = request_id
        return json.dumps(log_obj, default=str)


def setup_logging() -> None:
    level = logging.DEBUG if settings.app_env == "development" else logging.INFO

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_JSONFormatter())

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)

    # Quiet noisy libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
