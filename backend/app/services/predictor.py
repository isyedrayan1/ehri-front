import numpy as np
import pandas as pd

from app.services.model_loader import ModelArtifacts


class EHRIPredictor:
    def __init__(self, artifacts: ModelArtifacts):
        self.artifacts = artifacts

    def predict_ehri(self, metrics: dict[str, float]) -> float:
        ordered_row = [metrics[column] for column in self.artifacts.feature_columns]
        features = pd.DataFrame([ordered_row], columns=self.artifacts.feature_columns)
        scaled = self.artifacts.scaler.transform(features)
        prediction = float(self.artifacts.model.predict(scaled)[0])
        return float(np.clip(prediction, 0, 100))
