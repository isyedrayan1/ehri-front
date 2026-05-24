from fastapi import APIRouter, HTTPException, Request

from app.schemas.requests import RiskPredictionRequest
from app.schemas.responses import AlertResponse, RiskPredictionResponse

router = APIRouter()


@router.post("/predict", response_model=RiskPredictionResponse)
async def predict_risk(payload: RiskPredictionRequest, request: Request) -> RiskPredictionResponse:
    container = request.app.state.container
    try:
        ehri_value = container.predictor.predict_ehri(payload.metrics.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc

    alert = container.alert_service.generate_alert(ehri_value)
    explanation = await container.llm_service.explain_city_risk(
        city=payload.city,
        metrics=payload.metrics.model_dump(),
        ehri=ehri_value,
        alert_level=alert.level,
    )

    return RiskPredictionResponse(
        city=payload.city,
        ehri=round(ehri_value, 2),
        alert=AlertResponse.model_validate(alert.model_dump()),
        explanation=explanation,
    )
