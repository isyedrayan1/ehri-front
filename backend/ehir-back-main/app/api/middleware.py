"""Global exception handlers + request-ID middleware + HTTP logging.

Provides:
  • Uniform JSON error envelope: ``{ "error": str, "detail": str, "code": int }``
  • X-Request-ID header injected into every request & response.
  • HTTP request/response logging (method, path, status, duration).
"""

from __future__ import annotations

import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


# ── Error envelope ──────────────────────────────────────────────────

def _error_response(code: int, error: str, detail: str) -> JSONResponse:
    return JSONResponse(
        status_code=code,
        content={"error": error, "detail": detail, "code": code},
    )


async def http_exception_handler(_request: Request, exc: StarletteHTTPException):
    return _error_response(
        code=exc.status_code,
        error=type(exc).__name__,
        detail=str(exc.detail),
    )


async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = "; ".join(
        f"{'.'.join(str(l) for l in e.get('loc', []))}: {e.get('msg', '')}"
        for e in errors
    )
    return _error_response(
        code=422,
        error="ValidationError",
        detail=messages,
    )


async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return _error_response(
        code=500,
        error="InternalServerError",
        detail="An unexpected error occurred. Please try again later.",
    )


# ── Request-ID middleware ───────────────────────────────────────────

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Inject a unique X-Request-ID into every request/response."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class HTTPLoggingMiddleware(BaseHTTPMiddleware):
    """Log all HTTP requests and responses with method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Get query params for logging
        query_string = f"?{request.url.query}" if request.url.query else ""
        
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            
            # Log with emoji based on status code
            status_emoji = self._get_status_emoji(response.status_code)
            status_color = self._get_status_color(response.status_code)
            
            log_message = (
                f"{status_emoji} {request.method:6s} {response.status_code:3d} | "
                f"{request.url.path}{query_string} | "
                f"{duration*1000:.1f}ms | {client_ip}"
            )
            
            if response.status_code >= 500:
                logger.error(log_message)
            elif response.status_code >= 400:
                logger.warning(log_message)
            else:
                logger.info(log_message)
            
            return response
        except Exception as exc:
            duration = time.time() - start_time
            logger.error(
                f"💥 {request.method:6s} ERR  | "
                f"{request.url.path}{query_string} | "
                f"{duration*1000:.1f}ms | {client_ip} | {type(exc).__name__}: {str(exc)}"
            )
            raise
    
    @staticmethod
    def _get_status_emoji(status_code: int) -> str:
        """Return emoji based on HTTP status code."""
        if status_code < 300:
            return "✅"
        elif status_code < 400:
            return "➡️ "
        elif status_code < 500:
            return "⚠️ "
        else:
            return "❌"
    
    @staticmethod
    def _get_status_color(status_code: int) -> str:
        """Return ANSI color code based on HTTP status code."""
        if status_code < 300:
            return "\033[92m"  # Green
        elif status_code < 400:
            return "\033[94m"  # Blue
        elif status_code < 500:
            return "\033[93m"  # Yellow
        else:
            return "\033[91m"  # Red


# ── Registration helper ─────────────────────────────────────────────

def register_error_handlers(app: FastAPI) -> None:
    """Attach all exception handlers to the FastAPI app."""
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
