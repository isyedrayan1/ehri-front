from pydantic import BaseModel, Field


class AlertResponse(BaseModel):
    level: str
    message: str
    precautions: list[str]
    vulnerable_groups: list[str]


class DynamicAlertResponse(BaseModel):
    city: str
    alert_type: str
    severity: str
    title: str
    message: str
    triggered_value: float
    threshold: float
    timestamp: str


class NewsArticleResponse(BaseModel):
    title: str
    description: str | None = None
    source: str
    url: str
    published_at: str


class RiskPredictionResponse(BaseModel):
    city: str
    ehri: float = Field(ge=0, le=100)
    alert: AlertResponse
    explanation: str


class ForecastResponse(BaseModel):
    city: str
    input_window_days: int
    forecast_horizon_days: int
    forecast_next_2_days: list[float]
    trend: str
    history_values: list[float] = []
    explanation: str


class CityAnalysisResponse(BaseModel):
    city: str
    state: str
    coordinates: dict[str, float]
    metrics: dict[str, float]
    ehri: float = Field(ge=0, le=100)
    alert: AlertResponse
    dynamic_alerts: list[DynamicAlertResponse] = []
    news: list[NewsArticleResponse] = []
    explanation: str
    data_sources: dict[str, str]


class ChatResponse(BaseModel):
    answer: str
    mode: str


# ── Comparison endpoint ──────────────────────────────────────────

class CitySummary(BaseModel):
    city: str
    state: str
    ehri: float = Field(ge=0, le=100)
    alert_level: str
    metrics: dict[str, float]
    dynamic_alerts: list[DynamicAlertResponse] = []
    data_sources: dict[str, str]


class CompareResponse(BaseModel):
    cities: list[CitySummary]
    ranking: list[str]   # cities sorted worst (highest EHRI) → best
    generated_at: str


# ── Alert feed endpoint ─────────────────────────────────────────

class AlertFeedResponse(BaseModel):
    total_alerts: int
    alerts: list[DynamicAlertResponse]
    cities_monitored: int


# ═══════════════════════════════════════════════════════════════════
# Phase 5 — Dashboard AI + Conversation AI card-based responses
# ═══════════════════════════════════════════════════════════════════


# ── Dashboard Insight Cards ──────────────────────────────────────

class MetricSeverity(BaseModel):
    """Individual metric with its value and contextual severity."""
    name: str
    value: float
    unit: str
    severity: str          # "safe" | "moderate" | "unhealthy" | "hazardous"
    description: str       # one-line human explanation


class RiskSummaryCard(BaseModel):
    card_type: str = "risk_summary"
    city: str
    state: str
    ehri: float
    alert_level: str
    summary: str           # one-line AI-generated summary


class HealthAdvisoryCard(BaseModel):
    card_type: str = "health_advisory"
    precautions: list[str]
    vulnerable_groups: list[str]
    health_impacts: list[str]


class MetricBreakdownCard(BaseModel):
    card_type: str = "metric_breakdown"
    metrics: list[MetricSeverity]


class NewsDigestCard(BaseModel):
    card_type: str = "news_digest"
    articles: list[NewsArticleResponse]


class ForecastSnapshotCard(BaseModel):
    card_type: str = "forecast_snapshot"
    trend: str             # Rising / Falling / Stable
    forecast_values: list[float]
    history_count: int
    available: bool = True


class DashboardInsightsResponse(BaseModel):
    city: str
    risk_summary: RiskSummaryCard
    health_advisory: HealthAdvisoryCard
    metric_breakdown: MetricBreakdownCard
    news_digest: NewsDigestCard
    forecast_snapshot: ForecastSnapshotCard
    dynamic_alerts: list[DynamicAlertResponse] = []
    ai_summary: str        # LLM narrative tying everything together


# ── Conversation AI Cards (embeddable in chat responses) ─────────

class CityCard(BaseModel):
    card_type: str = "city_card"
    city: str
    ehri: float
    alert_level: str
    metrics: dict[str, float]


class ComparisonCard(BaseModel):
    card_type: str = "comparison_card"
    cities: list[CityCard]
    ranking: list[str]


class HealthTipCard(BaseModel):
    card_type: str = "health_tip_card"
    title: str
    advice: list[str]
    audience: str          # "public" | "researcher" | "professional"


class MetricDetailCard(BaseModel):
    card_type: str = "metric_card"
    city: str
    metric: MetricSeverity


class NewsCard(BaseModel):
    card_type: str = "news_card"
    headline: str
    source: str
    url: str
    relevance: str         # one-line why this matters


# ── Conversation AI Response ─────────────────────────────────────

class ConversationResponse(BaseModel):
    text: str              # main LLM answer (markdown)
    cards: list[dict] = [] # heterogeneous cards (frontend reads card_type)
    mode: str              # city_analysis | multi_city | health_qa | comparison | general
    detected_cities: list[str] = []
    suggestions: list[str] = []  # follow-up question suggestions


