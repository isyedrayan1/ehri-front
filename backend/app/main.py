import logging
import time
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.middleware import RequestIDMiddleware, HTTPLoggingMiddleware, register_error_handlers
from app.api.router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.services.container import ServiceContainer

logger = logging.getLogger(__name__)


# ── Simple in-memory rate limiter ───────────────────────────────────

class _RateLimiter:
    """Token-bucket style per-IP rate limiter (resets every 60 s)."""

    def __init__(self, rpm: int):
        self.rpm = rpm
        self._buckets: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, ip: str) -> bool:
        now = time.time()
        window = self._buckets[ip]
        # Purge entries older than 60 s
        self._buckets[ip] = [t for t in window if now - t < 60]
        if len(self._buckets[ip]) >= self.rpm:
            return False
        self._buckets[ip].append(now)
        return True


_limiter = _RateLimiter(rpm=settings.rate_limit_rpm)


# ── Lifespan ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info("Starting %s (env=%s)", settings.app_name, settings.app_env)
    container = ServiceContainer()
    container.initialize()
    app.state.container = container
    logger.info("All services initialised")
    yield
    logger.info("Shutting down %s", settings.app_name)


# ── App ─────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    description="AI-Powered Environmental Health Intelligence Platform for India",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow configured origins (comma-separated in env)
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# Request-ID middleware
app.add_middleware(RequestIDMiddleware)

# HTTP Logging middleware (logs all requests/responses with status & duration)
app.add_middleware(HTTPLoggingMiddleware)

# Uniform error envelope
register_error_handlers(app)


# Rate-limit middleware (applied via @app.middleware)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    if not _limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=429,
            content={
                "error": "RateLimitExceeded",
                "detail": f"Rate limit of {settings.rate_limit_rpm} requests/min exceeded. Try again shortly.",
                "code": 429,
            },
        )
    return await call_next(request)


app.include_router(api_router, prefix="/api")
