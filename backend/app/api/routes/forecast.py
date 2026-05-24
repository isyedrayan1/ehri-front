from fastapi import APIRouter, HTTPException, Request

from app.schemas.requests import ForecastRequest
from app.schemas.responses import ForecastResponse

router = APIRouter()


@router.post("/forecast", response_model=ForecastResponse)
async def forecast_risk(payload: ForecastRequest, request: Request) -> ForecastResponse:
    container = request.app.state.container
    try:
        result = container.forecaster.forecast_next_two_days(payload.last_7_days_ehri)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Forecast failed: {exc}") from exc

    explanation = await container.llm_service.explain_forecast(
        city=payload.city,
        historical_ehri=payload.last_7_days_ehri,
        forecast_ehri=result.values,
        trend=result.trend,
    )

    return ForecastResponse(
        city=payload.city,
        input_window_days=7,
        forecast_horizon_days=2,
        forecast_next_2_days=[round(v, 2) for v in result.values],
        trend=result.trend,
        history_values=payload.last_7_days_ehri,
        explanation=explanation,
    )
