import numpy as np
from sklearn.linear_model import LinearRegression


class ForecastResult:
    """Holds forecast values and trend metadata."""

    def __init__(self, values: list[float], slope: float):
        self.values = values
        self.slope = slope

    @property
    def trend(self) -> str:
        """Rising / Falling / Stable based on regression slope."""
        if self.slope > 1.0:
            return "Rising"
        elif self.slope < -1.0:
            return "Falling"
        return "Stable"


class EHRIForecaster:
    def forecast_next_two_days(self, last_7_days_ehri: list[float]) -> ForecastResult:
        if len(last_7_days_ehri) != 7:
            raise ValueError("Exactly 7 EHRI values are required for forecasting.")

        y = np.array(last_7_days_ehri, dtype=float)
        x = np.arange(7, dtype=float).reshape(-1, 1)

        model = LinearRegression()
        model.fit(x, y)

        future_x = np.array([[7.0], [8.0]])
        forecast = model.predict(future_x)
        values = [float(np.clip(v, 0, 100)) for v in forecast]
        slope = float(model.coef_[0])

        return ForecastResult(values=values, slope=slope)
