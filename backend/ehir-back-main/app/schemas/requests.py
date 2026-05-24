from typing import Optional

from pydantic import BaseModel, Field


class MetricInput(BaseModel):
    pm25: float = Field(alias="PM2.5", ge=0)
    temperature: float = Field(alias="Temperature")
    humidity: float = Field(alias="Humidity", ge=0, le=100)
    population_density: float = Field(alias="PopulationDensity", ge=0)

    def model_dump(self, *args, **kwargs):
        kwargs.setdefault("by_alias", True)
        return super().model_dump(*args, **kwargs)


class RiskPredictionRequest(BaseModel):
    city: str = Field(min_length=2)
    latitude: Optional[float] = Field(default=None, description="Precise GPS latitude")
    longitude: Optional[float] = Field(default=None, description="Precise GPS longitude")
    metrics: MetricInput


class ForecastRequest(BaseModel):
    city: str = Field(min_length=2)
    last_7_days_ehri: list[float] = Field(min_length=7, max_length=7)


class ChatMessage(BaseModel):
    """A single turn in client-side conversation history."""
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    question: str = Field(min_length=3)
    city: Optional[str] = None
    latitude: Optional[float] = Field(default=None, description="Precise GPS latitude")
    longitude: Optional[float] = Field(default=None, description="Precise GPS longitude")
    metrics: Optional[MetricInput] = None
    ehri: Optional[float] = Field(default=None, ge=0, le=100)
    history: Optional[list[ChatMessage]] = Field(
        default=None,
        max_length=20,
        description="Client-side conversation history (oldest first). Max 20 messages.",
    )
