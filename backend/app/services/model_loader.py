import pickle
from pathlib import Path

import joblib

EXPECTED_FEATURE_ORDER = ["PM2.5", "Temperature", "Humidity", "PopulationDensity"]


class ModelArtifacts:
    def __init__(self, model, scaler, feature_columns: list[str]):
        self.model = model
        self.scaler = scaler
        self.feature_columns = feature_columns


class ModelLoader:
    def __init__(self, model_path: Path, scaler_path: Path, feature_columns_path: Path):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.feature_columns_path = feature_columns_path

    @staticmethod
    def _load_artifact(path: Path):
        """Load a serialized artifact using joblib first, then fall back to pickle."""
        try:
            return joblib.load(path)
        except Exception:
            with path.open("rb") as file:
                return pickle.load(file)

    def load(self) -> ModelArtifacts:
        model = self._load_artifact(self.model_path)
        scaler = self._load_artifact(self.scaler_path)
        feature_columns = self._load_artifact(self.feature_columns_path)

        if feature_columns != EXPECTED_FEATURE_ORDER:
            raise ValueError(
                "feature_columns.pkl mismatch. "
                f"Expected {EXPECTED_FEATURE_ORDER}, got {feature_columns}."
            )

        return ModelArtifacts(model=model, scaler=scaler, feature_columns=feature_columns)
