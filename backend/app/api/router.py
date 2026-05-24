from fastapi import APIRouter

from app.api.routes.ai_chat import router as ai_chat_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.chat import router as chat_router
from app.api.routes.city import router as city_router
from app.api.routes.compare import router as compare_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.forecast import router as forecast_router
from app.api.routes.health import router as health_router
from app.api.routes.risk import router as risk_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(city_router, prefix="/v1/city", tags=["city"])
api_router.include_router(risk_router, prefix="/v1/risk", tags=["risk"])
api_router.include_router(forecast_router, prefix="/v1/risk", tags=["forecast"])
api_router.include_router(chat_router, prefix="/v1/chat", tags=["chat"])
api_router.include_router(compare_router, prefix="/v1", tags=["compare"])
api_router.include_router(alerts_router, prefix="/v1", tags=["alerts"])
api_router.include_router(dashboard_router, prefix="/v1/dashboard", tags=["dashboard"])
api_router.include_router(ai_chat_router, prefix="/v1/ai", tags=["ai-chat"])
