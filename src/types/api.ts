// ──────────────────────────────────────────────
// EHRI Backend API — TypeScript Interfaces
// Mirrors FRONTEND_GUIDE §15 exactly.
// ──────────────────────────────────────────────

// ── Shared Enums / Literals ──────────────────

export type AlertLevel = 'low' | 'moderate' | 'high' | 'severe';
export type MetricSeverityLevel = 'safe' | 'moderate' | 'unhealthy' | 'hazardous' | 'info';
export type Audience = 'public' | 'researcher' | 'professional';
export type ConversationMode = 'city_analysis' | 'multi_city' | 'comparison' | 'health_qa' | 'general';
export type DynamicAlertType = 'pollution' | 'heat_stress' | 'humidity' | 'risk_surge';
export type DynamicAlertSeverity = 'critical' | 'warning';
export type ForecastTrend = 'Rising' | 'Falling' | 'Stable';

// ── Chat Message (used in history) ───────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ── Common Response Sub-Types ────────────────

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AlertResponse {
  level: AlertLevel;
  message: string;
  precautions: string[];
  vulnerable_groups: string[];
}

export interface DynamicAlertResponse {
  city: string;
  alert_type: DynamicAlertType;
  severity: DynamicAlertSeverity;
  title: string;
  message: string;
  triggered_value: number;
  threshold: number;
  timestamp: string; // ISO-8601
}

export interface NewsArticleResponse {
  title: string;
  description: string | null;
  source: string;
  url: string;
  published_at: string; // ISO-8601
}

export interface MetricSeverity {
  name: string;      // "PM2.5" | "Temperature" | "Humidity" | "Population Density"
  value: number;
  unit: string;      // "µg/m³" | "°C" | "%" | "per km²"
  severity: MetricSeverityLevel;
  description: string;
}

export interface MetricsInput {
  'PM2.5': number;
  Temperature: number;
  Humidity: number;
  PopulationDensity: number;
}

// ── City Analyze (POST /v1/city/analyze) ─────

export interface CityAnalyzeRequest {
  city: string;
}

export interface CityAnalyzeResponse {
  city: string;
  state: string;
  coordinates: Coordinates;
  metrics: MetricsInput;
  ehri: number;
  alert: AlertResponse;
  dynamic_alerts: DynamicAlertResponse[];
  news: NewsArticleResponse[];
  explanation: string;
  data_sources: { pm25: string; weather: string };
}

// ── City Forecast (POST /v1/city/forecast) ───

export interface CityForecastRequest {
  city: string;
}

export interface CityForecastResponse {
  city: string;
  input_window_days: number;
  forecast_horizon_days: number;
  forecast_next_2_days: number[];
  trend: ForecastTrend;
  history_values: number[];
  explanation: string;
}

// ── Manual Risk (POST /v1/risk/predict) ──────

export interface RiskPredictRequest {
  city: string;
  metrics: MetricsInput;
}

export interface RiskPredictResponse {
  city: string;
  ehri: number;
  alert: AlertResponse;
  explanation: string;
}

// ── Manual Forecast (POST /v1/risk/forecast) ─

export interface ManualForecastRequest {
  city: string;
  last_7_days_ehri: [number, number, number, number, number, number, number];
}

export interface ManualForecastResponse {
  city: string;
  input_window_days: number;
  forecast_horizon_days: number;
  forecast_next_2_days: number[];
  trend: ForecastTrend;
  history_values: number[];
  explanation: string;
}

// ── Multi-City Compare (POST /v1/compare) ────

export interface CompareRequest {
  cities: string[]; // 2-5 cities
}

export interface CitySummary {
  city: string;
  state: string;
  ehri: number;
  alert_level: AlertLevel;
  metrics: MetricsInput;
  dynamic_alerts: DynamicAlertResponse[];
  data_sources: { pm25: string; weather: string };
}

export interface CompareResponse {
  cities: CitySummary[];   // sorted worst → best
  ranking: string[];       // city names worst → best
  generated_at: string;    // ISO-8601
}

export interface CityComparisonResponse {
  city_a: string;
  city_b: string;
  ehri_a: number;
  ehri_b: number;
  comparison_text: string;
  card: {
    type: "comparison";
    data: {
      city_a: string;
      city_b: string;
      ehri_a: number;
      ehri_b: number;
      comparison_text: string;
    };
  };
}

// ── Alert Feed (GET /v1/alerts) ──────────────

export interface AlertFeedResponse {
  total_alerts: number;
  alerts: DynamicAlertResponse[];
  cities_monitored: number;
}

// ── Dashboard Insights (POST /v1/dashboard/insights) ──

export interface DashboardInsightsRequest {
  city: string;
  latitude?: number;
  longitude?: number;
}

export interface RiskSummaryCard {
  card_type: 'risk_summary';
  city: string;
  state: string;
  ehri: number;
  alert_level: AlertLevel;
  summary: string;
}

export interface ClimaticWeightCard {
  card_type: 'climatic_weight';
  status: string; // "Light & Dry", "Comfortable", "Sticky", "Heavy Air"
  description: string;
  humidity_index: number;
  apparent_temp: number;
}

export interface MetricBreakdownCard {
  card_type: 'metric_breakdown';
  metrics: MetricSeverity[];
  station_name?: string; // NEW: The specific sensor station or 'Regional Estimate'
}

export interface NewsDigestCard {
  card_type: 'news_digest';
  articles: NewsArticleResponse[];
}

export interface ForecastSnapshotCard {
  card_type: 'forecast_snapshot';
  trend: ForecastTrend | 'Unknown';
  forecast_values: number[]; // Deprecated
  daily_forecasts?: { 
    date: string; 
    ehri: number;
    temp?: number;
    condition?: string;
  }[];
  history_count: number;
  available: boolean;
}

export type BiologicalSystemStatus = 'Stable' | 'Elevated' | 'High Load' | 'Extreme';

export interface BiomedicalSystem {
  name: string;
  stress_score: number; // 0-100
  status: BiologicalSystemStatus;
  ai_verdict: string;
  action_hint: string;
}

export interface BiomedicalStatus {
  summary: string;
  systems: BiomedicalSystem[];
}

export interface PrecautionaryProtocol {
  title: string;
  precautions: string[];
  vulnerable_groups: string[];
}

export interface DashboardInsightsResponse {
  city: string;
  risk_summary: RiskSummaryCard;
  climatic_weight: ClimaticWeightCard;
  metric_breakdown: MetricBreakdownCard;
  news_digest: NewsDigestCard;
  forecast_snapshot: ForecastSnapshotCard;
  biomedical_status: BiomedicalStatus;
  precautionary_protocol: PrecautionaryProtocol;
  dynamic_alerts: DynamicAlertResponse[];
  ai_summary: string;  // Markdown
}

// ── Conversation AI (POST /v1/ai/chat) ───────

export interface ConversationRequest {
  message: string;               // min 2 chars
  audience?: Audience;           // default: "public"
  history?: ChatMessage[];       // max 20, oldest first
}

// Cards that can appear in conversation response
export interface CityCard {
  type: 'city_summary';
  data: {
    city: string;
    ehri: number;
    status: string;
    top_factor: string;
  };
}

export interface ComparisonCard {
  type: 'comparison';
  data: {
    city_a: string;
    city_b: string;
    ehri_a: number;
    ehri_b: number;
    comparison_text: string;
  };
}

export interface HealthTipCard {
  type: 'health_tip';
  data: {
    category: string;
    tip: string;
    actions: string[];
  };
}

export type ConversationCard = CityCard | ComparisonCard | HealthTipCard;

export interface ConversationResponse {
  text: string;                     // Markdown
  cards: ConversationCard[];        // heterogeneous — check card_type
  mode: ConversationMode;
  detected_cities: string[];
  suggestions: string[];            // follow-up questions
}

// ── Legacy Chat (POST /v1/chat/query) ────────

export interface LegacyChatRequest {
  question: string;       // min 3 chars
  city?: string;
  metrics?: MetricsInput;
  ehri?: number;          // 0-100
  history?: ChatMessage[];
}

export interface LegacyChatResponse {
  answer: string;
  mode: 'city_grounded' | 'general';
}

// ── Error Envelope (all error responses) ─────

export interface APIErrorResponse {
  error: string;    // Error type name
  detail: string;   // Human-readable message
  code: number;     // HTTP status code
}

// ── Health Check ─────────────────────────────

export interface HealthCheckResponse {
  status: string;
}
