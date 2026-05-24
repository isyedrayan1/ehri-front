"""Dependency-injection container initialised once at application startup."""

from app.core.config import settings
from app.services.alert import AlertService
from app.services.city_resolver import CityResolver
from app.services.forecasting import EHRIForecaster
from app.services.history import EHRIHistoryStore
from app.services.llm import LLMService
from app.services.model_loader import ModelLoader
from app.services.predictor import EHRIPredictor


class ServiceContainer:
    """Holds all singleton service instances."""

    def __init__(self):
        self.predictor: EHRIPredictor | None = None
        self.forecaster: EHRIForecaster | None = None
        self.alert_service: AlertService | None = None
        self.llm_service: LLMService | None = None
        self.city_resolver: CityResolver | None = None
        self.history: EHRIHistoryStore | None = None

    def initialize(self) -> None:
        loader = ModelLoader(
            model_path=settings.model_path,
            scaler_path=settings.scaler_path,
            feature_columns_path=settings.feature_columns_path,
        )
        artifacts = loader.load()

        self.predictor = EHRIPredictor(artifacts)
        self.forecaster = EHRIForecaster()
        self.alert_service = AlertService()
        self.llm_service = LLMService()
        self.city_resolver = CityResolver()
        self.history = EHRIHistoryStore()
