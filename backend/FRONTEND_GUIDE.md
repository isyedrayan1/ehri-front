# EHRI Frontend Developer Guide

> **Last updated:** 2026-02-25  
> **Backend version:** 1.0.0  
> **Base URL:** `http://localhost:8000/api` (dev) — all endpoints are prefixed with `/api`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Key Concepts](#2-key-concepts)
3. [Two-Page Frontend Architecture](#3-two-page-frontend-architecture)
4. [API Reference — Every Endpoint](#4-api-reference)
   - 4.1 [Health Check](#41-health-check)
   - 4.2 [City Analyze](#42-city-analyze) ⭐
   - 4.3 [City Forecast (history-based)](#43-city-forecast-history-based)
   - 4.4 [Manual Risk Prediction](#44-manual-risk-prediction)
   - 4.5 [Manual Forecast](#45-manual-forecast)
   - 4.6 [Multi-City Compare](#46-multi-city-compare) ⭐
   - 4.7 [Alert Feed](#47-alert-feed)
   - 4.8 [Dashboard Insights](#48-dashboard-insights) ⭐⭐ (Primary Dashboard Endpoint)
   - 4.9 [Conversation AI](#49-conversation-ai) ⭐⭐ (Primary Chat Endpoint)
   - 4.10 [Legacy Chat](#410-legacy-chat)
5. [Card System — How to Render](#5-card-system)
6. [Supported Cities](#6-supported-cities)
7. [EHRI Scale & Alert Levels](#7-ehri-scale--alert-levels)
8. [Metric Severity System](#8-metric-severity-system)
9. [Audience System](#9-audience-system)
10. [Error Handling](#10-error-handling)
11. [CORS & Rate Limiting](#11-cors--rate-limiting)
12. [Conversation History (Client-Side)](#12-conversation-history)
13. [Suggested Component Tree](#13-suggested-component-tree)
14. [Data Flow Diagrams](#14-data-flow-diagrams)
15. [TypeScript Interfaces](#15-typescript-interfaces)
16. [Example Fetch Calls](#16-example-fetch-calls)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌───────────────────┐         ┌──────────────────────┐     │
│  │   Dashboard Page  │         │  Conversation Page   │     │
│  │   (Card-based)    │         │  (Chat Interface)    │     │
│  └────────┬──────────┘         └──────────┬───────────┘     │
│           │                               │                 │
│     POST /dashboard/insights        POST /ai/chat           │
│     POST /city/analyze              (freeform, multi-city)  │
│     POST /compare                                           │
│     GET  /alerts                                            │
└───────────┼───────────────────────────────┼─────────────────┘
            │                               │
            ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI :8000)                   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ ML Model │  │ Live APIs│  │ LLM Chain│  │  History   │  │
│  │(sklearn) │  │(OpenAQ + │  │(Gemini→  │  │  Store     │  │
│  │          │  │Open-Meteo│  │OpenRouter │  │ (per-city) │  │
│  │          │  │+NewsAPI) │  │→Groq)    │  │            │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**This is NOT an AQI viewer. This is NOT a weather app.**  
It is a **predictive + reasoning system** that:
- Predicts EHRI (0–100) environmental health risk
- Explains WHY it's dangerous (LLM-powered)
- Tells you WHAT to do about it
- Tracks trends and forecasts future risk
- Compares cities side by side
- Answers health questions with live data context

---

## 2. Key Concepts

| Concept | Description |
|---------|-------------|
| **EHRI** | Environmental Health Risk Index (0–100). Computed by ML model from PM2.5, Temperature, Humidity, PopulationDensity. Higher = worse. |
| **Alert Level** | `"low"` (0–25), `"moderate"` (25–50), `"high"` (50–75), `"severe"` (75–100) |
| **Dynamic Alerts** | Contextual alerts triggered by specific conditions (e.g., PM2.5 > 150, Temp > 40°C, Humidity > 85%, EHRI surge > 10 points) |
| **Cards** | Structured JSON objects with a `card_type` discriminator field. Frontend renders different components based on `card_type`. |
| **Audience** | `"public"` (simple), `"researcher"` (quantitative), `"professional"` (policy-focused). Affects LLM tone. |
| **Mode** | Intent classification in conversation: `"city_analysis"`, `"multi_city"`, `"comparison"`, `"health_qa"`, `"general"` |

---

## 3. Two-Page Frontend Architecture

### Page 1: Dashboard

**Purpose:** Proactive, card-based intelligence for a single city. User picks a city → gets a full health intelligence briefing.

**Primary Endpoint:** `POST /api/v1/dashboard/insights`

**What it returns (all at once, one request):**
- Risk Summary Card (EHRI score + alert level + summary sentence)
- Health Advisory Card (precautions + vulnerable groups + health impacts)
- Metric Breakdown Card (PM2.5/Temp/Humidity with per-metric severity)
- News Digest Card (up to 5 recent environmental/health articles)
- Forecast Snapshot Card (Rising/Falling/Stable trend + 2-day forecast)
- Dynamic Alerts (metric/trend-triggered contextual warnings)
- AI Summary (LLM-generated narrative paragraph tying it all together)

**Supporting Endpoints for Dashboard:**
- `POST /api/v1/compare` — for a "Compare with another city" widget
- `GET /api/v1/alerts` — for a global alert ticker/banner
- `POST /api/v1/city/analyze` — raw data version (if you need more control)

### Page 2: Conversation

**Purpose:** Freeform chat. User types anything — single city, multi-city comparison, health questions, general queries. AI responds with text + embedded cards.

**Primary Endpoint:** `POST /api/v1/ai/chat`

**What it does:**
- Auto-detects city names in the message (any of 40 Indian cities)
- Classifies intent (comparison, analysis, health Q&A, general)
- Fetches live data for detected cities
- Returns LLM answer (markdown) + structured cards + follow-up suggestions
- Supports conversation history (client sends previous messages)
- Audience-aware (public/researcher/professional changes LLM tone)

---

## 4. API Reference

> **All endpoints are prefixed with `/api`.** So when you see `/v1/city/analyze`, the actual URL is `http://localhost:8000/api/v1/city/analyze`.

> **Every response includes an `X-Request-ID` header** for debugging/logging.

---

### 4.1 Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok"
}
```

Use this for connectivity/readiness checks. No auth needed.

---

### 4.2 City Analyze ⭐

The core endpoint. Give it a city name → get the full EHRI intelligence package.

```
POST /api/v1/city/analyze
Content-Type: application/json
```

**Request:**
```json
{
  "city": "Delhi"
}
```

**Response (200):**
```json
{
  "city": "Delhi",
  "state": "Delhi",
  "coordinates": {
    "latitude": 28.6139,
    "longitude": 77.209
  },
  "metrics": {
    "PM2.5": 451.0,
    "Temperature": 28.4,
    "Humidity": 22.0,
    "PopulationDensity": 11312.0
  },
  "ehri": 79.52,
  "alert": {
    "level": "severe",
    "message": "Severe environmental health risk. Minimise outdoor exposure.",
    "precautions": [
      "Remain indoors as much as possible.",
      "Use N95 masks if outdoor travel is unavoidable.",
      "Run air purifiers continuously.",
      "Seek medical help for any respiratory or heat-related symptoms.",
      "Avoid all forms of outdoor exercise."
    ],
    "vulnerable_groups": [
      "Children",
      "Elderly",
      "Pregnant women",
      "People with cardiovascular disease",
      "People with asthma / COPD",
      "Outdoor workers",
      "Immunocompromised individuals"
    ]
  },
  "dynamic_alerts": [
    {
      "city": "Delhi",
      "alert_type": "pollution",
      "severity": "critical",
      "title": "Hazardous PM2.5 Levels",
      "message": "PM2.5 at 451.0 µg/m³ exceeds safe threshold of 150.0 µg/m³.",
      "triggered_value": 451.0,
      "threshold": 150.0,
      "timestamp": "2026-02-25T10:00:00+00:00"
    }
  ],
  "news": [
    {
      "title": "Delhi pollution hits dangerous levels",
      "description": "Air quality worsens in the capital.",
      "source": "Times of India",
      "url": "https://example.com/article",
      "published_at": "2026-02-24T08:00:00Z"
    }
  ],
  "explanation": "Delhi's EHRI of 79.52 indicates severe environmental health risk...",
  "data_sources": {
    "pm25": "OpenAQ",
    "weather": "Open-Meteo"
  }
}
```

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `city` | string | Canonical city name |
| `state` | string | Indian state |
| `coordinates` | `{latitude, longitude}` | City coordinates |
| `metrics` | object | All 4 input metrics (live values) |
| `ehri` | float (0–100) | Predicted Environmental Health Risk Index |
| `alert` | AlertResponse | Tier-based alert with precautions |
| `dynamic_alerts` | DynamicAlertResponse[] | Contextual threshold-triggered alerts |
| `news` | NewsArticleResponse[] | Recent news articles for the city |
| `explanation` | string | LLM-generated narrative explanation |
| `data_sources` | object | Where the live data came from |

**Error cases:**
- `404` — City not found (response includes available cities list)
- `422` — Invalid/empty city name
- `502` — External data fetch failure (OpenAQ/Open-Meteo down)

---

### 4.3 City Forecast (History-Based)

Forecast EHRI for the next 2 days using stored analysis history. Requires the city to have been analyzed at least 3 times (via `/city/analyze` or `/dashboard/insights`).

```
POST /api/v1/city/forecast
Content-Type: application/json
```

**Request:**
```json
{
  "city": "Delhi"
}
```

**Response (200):**
```json
{
  "city": "Delhi",
  "input_window_days": 5,
  "forecast_horizon_days": 2,
  "forecast_next_2_days": [80.15, 81.02],
  "trend": "Rising",
  "history_values": [75.0, 76.5, 78.0, 79.52, 79.52],
  "explanation": "Delhi's EHRI is showing a rising trend..."
}
```

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `forecast_next_2_days` | float[] | Predicted EHRI for next 2 days |
| `trend` | string | `"Rising"`, `"Falling"`, or `"Stable"` |
| `history_values` | float[] | Historical EHRI values used |
| `input_window_days` | int | How many data points were available |

**Error cases:**
- `400` — Not enough history (need 3+ analyze calls first)
- `404` — City not found

---

### 4.4 Manual Risk Prediction

Predict EHRI from manually provided metrics (not from live data). Useful for custom/hypothetical scenarios.

```
POST /api/v1/risk/predict
Content-Type: application/json
```

**Request:**
```json
{
  "city": "Delhi",
  "metrics": {
    "PM2.5": 200.0,
    "Temperature": 38.0,
    "Humidity": 70.0,
    "PopulationDensity": 11312.0
  }
}
```

> ⚠️ Note the metric keys use **aliases** with exact casing: `"PM2.5"`, `"Temperature"`, `"Humidity"`, `"PopulationDensity"`

**Response (200):**
```json
{
  "city": "Delhi",
  "ehri": 65.3,
  "alert": {
    "level": "high",
    "message": "High environmental health risk...",
    "precautions": ["..."],
    "vulnerable_groups": ["..."]
  },
  "explanation": "With PM2.5 at 200 µg/m³..."
}
```

---

### 4.5 Manual Forecast

Forecast from a manually provided 7-day EHRI window.

```
POST /api/v1/risk/forecast
Content-Type: application/json
```

**Request:**
```json
{
  "city": "Delhi",
  "last_7_days_ehri": [45.0, 46.0, 47.0, 48.0, 49.0, 50.0, 51.0]
}
```

> Must be exactly 7 float values.

**Response (200):**
```json
{
  "city": "Delhi",
  "input_window_days": 7,
  "forecast_horizon_days": 2,
  "forecast_next_2_days": [52.1, 53.0],
  "trend": "Rising",
  "history_values": [45.0, 46.0, 47.0, 48.0, 49.0, 50.0, 51.0],
  "explanation": "The EHRI is steadily rising over the past week..."
}
```

---

### 4.6 Multi-City Compare ⭐

Compare EHRI for 2–5 cities side by side.

```
POST /api/v1/compare
Content-Type: application/json
```

**Request:**
```json
{
  "cities": ["Delhi", "Mumbai", "Bengaluru"]
}
```

**Validation:** 2–5 cities required. All must be valid Indian city names.

**Response (200):**
```json
{
  "cities": [
    {
      "city": "Delhi",
      "state": "Delhi",
      "ehri": 79.52,
      "alert_level": "severe",
      "metrics": {
        "PM2.5": 451.0,
        "Temperature": 28.4,
        "Humidity": 22.0,
        "PopulationDensity": 11312.0
      },
      "dynamic_alerts": [...],
      "data_sources": {"pm25": "OpenAQ", "weather": "Open-Meteo"}
    },
    {
      "city": "Mumbai",
      "state": "Maharashtra",
      "ehri": 27.39,
      "alert_level": "moderate",
      "metrics": {...},
      "dynamic_alerts": [],
      "data_sources": {...}
    },
    {
      "city": "Bengaluru",
      "state": "Karnataka",
      "ehri": 29.1,
      "alert_level": "moderate",
      "metrics": {...},
      "dynamic_alerts": [],
      "data_sources": {...}
    }
  ],
  "ranking": ["Delhi", "Bengaluru", "Mumbai"],
  "generated_at": "2026-02-25T10:00:00+00:00"
}
```

**Key fields:**
| Field | Type | Description |
|-------|------|-------------|
| `cities` | CitySummary[] | **Sorted worst → best** (highest EHRI first) |
| `ranking` | string[] | City names in order worst → best |
| `generated_at` | string (ISO-8601) | When the comparison was generated |

Each `CitySummary` has: `city`, `state`, `ehri`, `alert_level`, `metrics`, `dynamic_alerts`, `data_sources`.

---

### 4.7 Alert Feed

Global alert feed — scans all previously analyzed cities and returns triggered dynamic alerts.

```
GET /api/v1/alerts
```

No request body needed.

**Response (200):**
```json
{
  "total_alerts": 3,
  "alerts": [
    {
      "city": "Delhi",
      "alert_type": "pollution",
      "severity": "critical",
      "title": "Hazardous PM2.5 Levels",
      "message": "PM2.5 at 451.0 µg/m³ exceeds safe threshold of 150.0 µg/m³.",
      "triggered_value": 451.0,
      "threshold": 150.0,
      "timestamp": "2026-02-25T10:00:00+00:00"
    },
    {
      "city": "Delhi",
      "alert_type": "heat_stress",
      "severity": "warning",
      "title": "Extreme Heat Warning",
      "message": "Temperature at 42°C exceeds 40°C threshold.",
      "triggered_value": 42.0,
      "threshold": 40.0,
      "timestamp": "2026-02-25T10:00:00+00:00"
    }
  ],
  "cities_monitored": 2
}
```

**Alert types:** `"pollution"`, `"heat_stress"`, `"humidity"`, `"risk_surge"`  
**Severity levels:** `"critical"`, `"warning"`  
**Sort order:** Critical first, then warning. Alphabetical within same severity.

> ⚠️ Alerts only exist for cities that have been analyzed at least once in the current session. The backend stores data **in memory** — it resets on server restart.

---

### 4.8 Dashboard Insights ⭐⭐ (PRIMARY DASHBOARD ENDPOINT)

**This is the main endpoint for the Dashboard page.** One call returns everything the dashboard needs as structured cards.

```
POST /api/v1/dashboard/insights
Content-Type: application/json
```

**Request:**
```json
{
  "city": "Delhi"
}
```

**Response (200):**
```json
{
  "city": "Delhi",
  "risk_summary": {
    "card_type": "risk_summary",
    "city": "Delhi",
    "state": "Delhi",
    "ehri": 79.52,
    "alert_level": "severe",
    "summary": "Severe environmental health risk. Minimise outdoor exposure."
  },
  "health_advisory": {
    "card_type": "health_advisory",
    "precautions": [
      "Remain indoors as much as possible.",
      "Use N95 masks if outdoor travel is unavoidable.",
      "Run air purifiers continuously.",
      "Seek medical help for any respiratory or heat-related symptoms.",
      "Avoid all forms of outdoor exercise."
    ],
    "vulnerable_groups": [
      "Children", "Elderly", "Pregnant women",
      "People with cardiovascular disease",
      "People with asthma / COPD",
      "Outdoor workers", "Immunocompromised individuals"
    ],
    "health_impacts": [
      "Serious respiratory distress possible for general population.",
      "Emergency room visits for breathing issues likely to spike.",
      "Cardiovascular events (heart attacks, strokes) risk elevated.",
      "Heat-related illnesses including heatstroke possible.",
      "Vector-borne disease transmission risk (dengue, malaria) elevated.",
      "Mental health impacts from sustained poor conditions."
    ]
  },
  "metric_breakdown": {
    "card_type": "metric_breakdown",
    "metrics": [
      {
        "name": "PM2.5",
        "value": 451.0,
        "unit": "µg/m³",
        "severity": "hazardous",
        "description": "Health alert — everyone may experience serious effects."
      },
      {
        "name": "Temperature",
        "value": 28.4,
        "unit": "°C",
        "severity": "moderate",
        "description": "Warm — stay hydrated."
      },
      {
        "name": "Humidity",
        "value": 22.0,
        "unit": "%",
        "severity": "safe",
        "description": "Dry and comfortable."
      },
      {
        "name": "Population Density",
        "value": 11312.0,
        "unit": "per km²",
        "severity": "info",
        "description": "Delhi has 11312 people/km²."
      }
    ]
  },
  "news_digest": {
    "card_type": "news_digest",
    "articles": [
      {
        "title": "Delhi pollution hits dangerous levels",
        "description": "Air quality worsens...",
        "source": "Times of India",
        "url": "https://...",
        "published_at": "2026-02-24T08:00:00Z"
      }
    ]
  },
  "forecast_snapshot": {
    "card_type": "forecast_snapshot",
    "trend": "Rising",
    "forecast_values": [80.15, 81.02],
    "history_count": 5,
    "available": true
  },
  "dynamic_alerts": [...],
  "ai_summary": "Delhi currently faces a severe environmental health crisis. PM2.5 levels of 451 µg/m³ are approximately 30× the WHO guideline of 15 µg/m³, posing critical respiratory and cardiovascular risks. The EHRI of 79.52/100 signals that outdoor activities should be completely avoided..."
}
```

**Card Reference:**

| Card | `card_type` | Purpose | Key Fields |
|------|-------------|---------|------------|
| Risk Summary | `"risk_summary"` | Hero card — EHRI score, alert level | `ehri`, `alert_level`, `summary`, `city`, `state` |
| Health Advisory | `"health_advisory"` | What to do, who's at risk | `precautions[]`, `vulnerable_groups[]`, `health_impacts[]` |
| Metric Breakdown | `"metric_breakdown"` | Individual metric values + severity | `metrics[]` → each has `name`, `value`, `unit`, `severity`, `description` |
| News Digest | `"news_digest"` | Recent news articles | `articles[]` → each has `title`, `description`, `source`, `url`, `published_at` |
| Forecast Snapshot | `"forecast_snapshot"` | Trend + 2-day forecast | `trend`, `forecast_values[]`, `history_count`, `available` |

**Forecast availability:**
- `available: true` — forecast was computed (enough history)
- `available: false` — not enough data yet (need 3+ prior analyses). Show "Analyze a few more times to see forecast" message.

---

### 4.9 Conversation AI ⭐⭐ (PRIMARY CHAT ENDPOINT)

**This is the main endpoint for the Conversation page.** Freeform text in, structured response out.

```
POST /api/v1/ai/chat
Content-Type: application/json
```

**Request:**
```json
{
  "message": "Compare Delhi and Mumbai air quality",
  "audience": "public",
  "history": [
    {"role": "user", "content": "How is Bengaluru?"},
    {"role": "assistant", "content": "Bengaluru has moderate EHRI of 29..."}
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | **YES** (min 2 chars) | The user's message |
| `audience` | string | No (default: `"public"`) | `"public"` \| `"researcher"` \| `"professional"` |
| `history` | ChatMessage[] | No (max 20) | Previous conversation turns, oldest first |

Each `ChatMessage`: `{ "role": "user" | "assistant", "content": "..." }`

**Response (200):**
```json
{
  "text": "Based on the latest data, Delhi's air quality is significantly worse than Mumbai's...\n\n**Delhi:** EHRI 79.52 (Severe)\n**Mumbai:** EHRI 27.39 (Moderate)\n\n**What you should do:**\n- If in Delhi, stay indoors...",
  "cards": [
    {
      "card_type": "comparison_card",
      "cities": [
        {
          "card_type": "city_card",
          "city": "Delhi",
          "ehri": 79.52,
          "alert_level": "severe",
          "metrics": {
            "PM2.5": 451.0,
            "Temperature": 28.3,
            "Humidity": 22.0,
            "PopulationDensity": 11312.0
          }
        },
        {
          "card_type": "city_card",
          "city": "Mumbai",
          "ehri": 27.39,
          "alert_level": "moderate",
          "metrics": {
            "PM2.5": 20.4,
            "Temperature": 27.3,
            "Humidity": 72.0,
            "PopulationDensity": 20634.0
          }
        }
      ],
      "ranking": ["Delhi", "Mumbai"]
    }
  ],
  "mode": "comparison",
  "detected_cities": ["Delhi", "Mumbai"],
  "suggestions": [
    "Which city is safest to visit right now?",
    "What are the health risks in the worst-ranked city?",
    "Show me the pollution trends for these cities."
  ]
}
```

**Response fields:**

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Main LLM answer in **Markdown** format. Always present. |
| `cards` | dict[] | Array of heterogeneous card objects. May be empty. Read `card_type` to know how to render. |
| `mode` | string | Detected intent (see below) |
| `detected_cities` | string[] | Cities the AI found in the message and successfully fetched data for |
| `suggestions` | string[] | 3 follow-up question suggestions for the user to click |

**Mode values (intent classification):**

| Mode | When | Cards Expected |
|------|------|----------------|
| `"city_analysis"` | Exactly 1 city mentioned | `city_card` (+ `health_tip_card` if health keywords) |
| `"multi_city"` | 2+ cities but no compare keyword | Multiple `city_card`s |
| `"comparison"` | 2+ cities + compare/versus/better/worse/rank keyword | `comparison_card` |
| `"health_qa"` | No cities, but health-related keywords | Usually no cards, text-only answer |
| `"general"` | No cities, no health keywords | No cards, text-only answer |

**Card types that can appear in `cards[]`:**

| `card_type` | Fields | When |
|-------------|--------|------|
| `"city_card"` | `city`, `ehri`, `alert_level`, `metrics` | Single city mentioned |
| `"comparison_card"` | `cities[]` (array of city_cards), `ranking[]` | Compare mode |
| `"health_tip_card"` | `title`, `advice[]`, `audience` | Health keywords + city detected |
| `"news_card"` | `headline`, `source`, `url`, `relevance` | News keywords detected |

**How to render cards:** See [Section 5 — Card System](#5-card-system).

---

### 4.10 Legacy Chat

Older chat endpoint. Still works. Use `/ai/chat` for new features.

```
POST /api/v1/chat/query
Content-Type: application/json
```

**Request:**
```json
{
  "question": "How is Delhi air today?",
  "city": "Delhi",
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `question` | **YES** (min 3 chars) | The question text |
| `city` | No | Optionally specify city (auto-detected from question if omitted) |
| `metrics` | No | Manually provide metrics |
| `ehri` | No | Manually provide EHRI (0–100) |
| `history` | No | Conversation history (max 20 messages) |

**Response (200):**
```json
{
  "answer": "Delhi's air quality is currently severe with PM2.5 at 451 µg/m³...",
  "mode": "city_grounded"
}
```

| Mode | Meaning |
|------|---------|
| `"city_grounded"` | Answer is based on real data (city was detected/provided) |
| `"general"` | No city context — general environmental health Q&A |

---

## 5. Card System — How to Render

The backend uses a discriminated union pattern. Every card object has a `card_type` field. The frontend should use this to pick the right component.

### Card Routing Logic (React Example)

```tsx
function CardRenderer({ card }: { card: any }) {
  switch (card.card_type) {
    // Dashboard cards
    case 'risk_summary':
      return <RiskSummaryCard data={card} />;
    case 'health_advisory':
      return <HealthAdvisoryCard data={card} />;
    case 'metric_breakdown':
      return <MetricBreakdownCard data={card} />;
    case 'news_digest':
      return <NewsDigestCard data={card} />;
    case 'forecast_snapshot':
      return <ForecastSnapshotCard data={card} />;

    // Conversation cards
    case 'city_card':
      return <CityCard data={card} />;
    case 'comparison_card':
      return <ComparisonCard data={card} />;
    case 'health_tip_card':
      return <HealthTipCard data={card} />;
    case 'news_card':
      return <NewsCard data={card} />;

    default:
      return null; // Unknown card type — gracefully ignore
  }
}
```

### Card Color/Style Guide

| Alert Level / Severity | Suggested Color | Hex |
|------------------------|-----------------|-----|
| `"low"` / `"safe"` | Green | `#22c55e` |
| `"moderate"` | Yellow/Amber | `#f59e0b` |
| `"high"` / `"unhealthy"` | Orange | `#f97316` |
| `"severe"` / `"hazardous"` | Red | `#ef4444` |
| `"info"` | Blue/Gray | `#6366f1` |
| `"critical"` (alerts) | Dark Red | `#dc2626` |
| `"warning"` (alerts) | Orange | `#ea580c` |

---

## 6. Supported Cities

40 Indian cities are supported. The `city` field is **case-insensitive** on input but returns the **canonical form** in responses.

| City | State | Pop. Density |
|------|-------|-------------|
| Agra | Uttar Pradesh | 2,600 |
| Ahmedabad | Gujarat | 12,000 |
| Amritsar | Punjab | 2,100 |
| Bengaluru | Karnataka | 4,381 |
| Bhopal | Madhya Pradesh | 2,200 |
| Chandigarh | Chandigarh | 9,252 |
| Chennai | Tamil Nadu | 6,900 |
| Coimbatore | Tamil Nadu | 2,100 |
| Dehradun | Uttarakhand | 2,100 |
| Delhi | Delhi | 11,312 |
| Faridabad | Haryana | 7,500 |
| Ghaziabad | Uttar Pradesh | 9,800 |
| Gurugram | Haryana | 7,300 |
| Guwahati | Assam | 1,800 |
| Gwalior | Madhya Pradesh | 1,800 |
| Hyderabad | Telangana | 3,400 |
| Indore | Madhya Pradesh | 3,400 |
| Jaipur | Rajasthan | 6,500 |
| Jalandhar | Punjab | 2,100 |
| Jodhpur | Rajasthan | 1,600 |
| Kanpur | Uttar Pradesh | 2,800 |
| Kochi | Kerala | 6,200 |
| Kolkata | West Bengal | 24,000 |
| Lucknow | Uttar Pradesh | 3,029 |
| Mumbai | Maharashtra | 20,634 |
| Mysuru | Karnataka | 1,600 |
| Nagpur | Maharashtra | 2,800 |
| Navi Mumbai | Maharashtra | 4,400 |
| Noida | Uttar Pradesh | 11,000 |
| Patna | Bihar | 1,800 |
| Pune | Maharashtra | 5,600 |
| Raipur | Chhattisgarh | 2,200 |
| Ranchi | Jharkhand | 2,100 |
| Surat | Gujarat | 1,400 |
| Thane | Maharashtra | 8,500 |
| Thiruvananthapuram | Kerala | 5,300 |
| Tiruchirappalli | Tamil Nadu | 1,700 |
| Vadodara | Gujarat | 1,700 |
| Varanasi | Uttar Pradesh | 2,400 |
| Visakhapatnam | Andhra Pradesh | 3,100 |

**For city dropdowns/selectors:** Call `/api/v1/city/analyze` with any city to test. The 404 error response includes the full available cities list if the city isn't found.

---

## 7. EHRI Scale & Alert Levels

```
 EHRI Score    Alert Level    What it means
┌───────────────────────────────────────────────┐
│  0 ─ 25      low            Safe for most     │  🟢
│ 25 ─ 50      moderate       Some sensitivity  │  🟡
│ 50 ─ 75      high           Reduce outdoor    │  🟠
│ 75 ─ 100     severe         Stay indoors      │  🔴
└───────────────────────────────────────────────┘
```

**EHRI Formula:**  
`EHRI = 0.6 × PollutionStress + 0.3 × HeatStress + 0.1 × HumidityModifier`

This is a machine-learned prediction (RandomForestRegressor), not a simple formula. The weights above describe the training objective.

**Display Suggestions:**
- Use a **gauge/donut chart** for EHRI score (0–100)
- Color the gauge based on alert level
- Show the score prominently — this is the hero metric

---

## 8. Metric Severity System

Each metric has its own severity thresholds. Used in the Dashboard's `metric_breakdown` card.

### PM2.5 (µg/m³)
| Range | Severity | Color |
|-------|----------|-------|
| ≤ 30 | `"safe"` | Green |
| 31 – 60 | `"moderate"` | Yellow |
| 61 – 150 | `"unhealthy"` | Orange |
| > 150 | `"hazardous"` | Red |

### Temperature (°C)
| Range | Severity | Color |
|-------|----------|-------|
| ≤ 25 | `"safe"` | Green |
| 26 – 35 | `"moderate"` | Yellow |
| 36 – 40 | `"unhealthy"` | Orange |
| > 40 | `"hazardous"` | Red |

### Humidity (%)
| Range | Severity | Color |
|-------|----------|-------|
| ≤ 40 | `"safe"` | Green |
| 41 – 65 | `"moderate"` | Yellow |
| 66 – 85 | `"unhealthy"` | Orange |
| > 85 | `"hazardous"` | Red |

### Population Density
Always `"info"` severity — informational only.

---

## 9. Audience System

The Conversation AI supports 3 audience modes. This changes the LLM's tone and depth:

| Audience | Behavior | Use Case |
|----------|----------|----------|
| `"public"` (default) | Simple language, actionable advice, "what to DO" focus, bullet points, no jargon | General users, parents, travelers |
| `"researcher"` | Quantitative, evidence-based, references WHO/NAAQS thresholds, dose-response data, relative risk ratios | Researchers, academics, data scientists |
| `"professional"` | Concise, policy-oriented, cost-effective interventions, regulatory context, NCAP targets | Government officials, urban planners, NGOs |

**Frontend implementation:** Use a toggle/dropdown in the Conversation page (3 options). Send as `"audience"` field in the request.

---

## 10. Error Handling

All errors follow a **uniform envelope format**:

```json
{
  "error": "HTTPException",
  "detail": "City 'Atlantis' not found. Available: [Delhi, Mumbai, ...]",
  "code": 404
}
```

| HTTP Status | When |
|-------------|------|
| `400` | Bad request (e.g., not enough forecast history) |
| `404` | City not found |
| `422` | Validation error (empty city, missing fields, invalid audience) |
| `429` | Rate limit exceeded (60 req/min/IP) |
| `500` | Internal server error |
| `502` | External API failure (OpenAQ/Open-Meteo down) |

**Frontend handling:**
```ts
async function fetchAPI<T>(url: string, body?: any): Promise<T> {
  const resp = await fetch(`http://localhost:8000/api${url}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!resp.ok) {
    const err = await resp.json();
    // err.error, err.detail, err.code are always present
    throw new APIError(err.code, err.detail, err.error);
  }

  return resp.json();
}
```

---

## 11. CORS & Rate Limiting

### CORS
Backend allows:
- `http://localhost:3000` (Next.js default)
- `http://localhost:5173` (Vite default)
- All methods, all headers
- Credentials allowed
- `X-Request-ID` header exposed

### Rate Limiting
- **60 requests per minute per IP** (token bucket, 60-second window)
- Returns `429` with message when exceeded
- Show a "Please wait…" toast when you get 429

### Request ID
Every response includes `X-Request-ID` header. Use this for debugging/support tickets.

---

## 12. Conversation History (Client-Side)

History is stored **on the client side** and sent with each request. The backend is stateless.

**How it works:**
1. User sends a message → frontend sends `{ message: "...", history: [] }`
2. Backend responds with `{ text: "...", cards: [...], ... }`
3. Frontend appends both turns to local state:
   ```ts
   history.push({ role: "user", content: userMessage });
   history.push({ role: "assistant", content: response.text });
   ```
4. Next request: `{ message: "...", history: [all previous turns] }`

**Rules:**
- Maximum 20 messages in history (10 turns)
- Oldest first
- Each message: `{ "role": "user" | "assistant", "content": "..." }`
- Content must be non-empty
- Trim history when it exceeds 20 (drop oldest turns first)

**Implementation:**
```ts
const [history, setHistory] = useState<ChatMessage[]>([]);

async function sendMessage(text: string) {
  // Trim to last 20
  const trimmed = history.slice(-20);

  const response = await fetchAPI('/v1/ai/chat', {
    message: text,
    audience: selectedAudience,
    history: trimmed,
  });

  setHistory(prev => [
    ...prev,
    { role: 'user', content: text },
    { role: 'assistant', content: response.text },
  ]);

  return response;
}
```

---

## 13. Suggested Component Tree

```
App
├── Layout
│   ├── Header (logo, nav: Dashboard | Conversation)
│   └── Footer
│
├── DashboardPage
│   ├── CitySelector (dropdown of 40 cities)
│   ├── RiskSummaryCard
│   │   ├── EHRIGauge (circular 0-100)
│   │   ├── AlertBadge (low/moderate/high/severe)
│   │   └── SummaryText
│   ├── HealthAdvisoryCard
│   │   ├── PrecautionsList
│   │   ├── VulnerableGroupsTags
│   │   └── HealthImpactsList
│   ├── MetricBreakdownCard
│   │   └── MetricRow × 4 (name, value+unit, severity badge, description)
│   ├── ForecastSnapshotCard
│   │   ├── TrendBadge (Rising ↑ / Falling ↓ / Stable →)
│   │   └── MiniChart (2-day forecast values)
│   ├── NewsDigestCard
│   │   └── NewsArticleRow × 5
│   ├── DynamicAlertsBanner (if any critical/warning alerts)
│   ├── AISummarySection (render ai_summary as markdown)
│   └── CompareWidget (optional: pick a second city)
│       └── ComparisonTable
│
├── ConversationPage
│   ├── AudienceToggle (Public | Researcher | Professional)
│   ├── ChatHistory
│   │   └── MessageBubble × N
│   │       ├── UserMessage (plain text)
│   │       └── AssistantMessage
│   │           ├── MarkdownRenderer (for .text)
│   │           └── CardRenderer (for .cards[])
│   │               ├── CityCard
│   │               ├── ComparisonCard
│   │               ├── HealthTipCard
│   │               └── NewsCard
│   ├── SuggestionChips (clickable, populate input field)
│   ├── ChatInput (text input + send button)
│   └── DetectedCitiesBadges (show which cities were found)
│
└── Shared Components
    ├── EHRIGauge
    ├── AlertBadge
    ├── SeverityBadge (safe/moderate/unhealthy/hazardous)
    ├── LoadingSpinner
    ├── ErrorToast
    ├── MarkdownRenderer (for LLM text)
    └── CitySelector
```

---

## 14. Data Flow Diagrams

### Dashboard Flow
```
User selects "Delhi" from CitySelector
         │
         ▼
POST /api/v1/dashboard/insights { city: "Delhi" }
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Backend fetches PM2.5 + Weather + News          │
│ Predicts EHRI → Generates alerts                │
│ Builds 5 cards + AI summary                     │
│ Returns DashboardInsightsResponse               │
└─────────────────────────────────────────────────┘
         │
         ▼
Frontend renders each card as a separate component
```

### Conversation Flow
```
User types: "Compare Delhi and Mumbai health risks"
         │
         ▼
POST /api/v1/ai/chat {
  message: "Compare Delhi and Mumbai health risks",
  audience: "public",
  history: [...previous turns...]
}
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Backend detects: ["Delhi", "Mumbai"]            │
│ Classifies intent: "comparison"                 │
│ Fetches live data for both cities               │
│ Fetches news for first city                     │
│ Builds comparison_card + health_tip_card        │
│ LLM generates markdown answer                  │
│ Returns ConversationResponse                    │
└─────────────────────────────────────────────────┘
         │
         ▼
Frontend:
  1. Renders text as Markdown in assistant bubble
  2. Renders comparison_card + health_tip_card below text
  3. Shows suggestion chips at bottom
  4. Appends user + assistant turns to history state
```

### Alert Polling Flow (Optional)
```
Every 60 seconds (or on page load):

GET /api/v1/alerts
         │
         ▼
┌──────────────────────────────────┐
│ Backend scans all tracked cities │
│ Returns triggered alerts         │
└──────────────────────────────────┘
         │
         ▼
If total_alerts > 0:
  Show alert banner/ticker at top of page
```

---

## 15. TypeScript Interfaces

Copy-paste these into your frontend codebase:

```ts
// ──────────────────────────────────────────────
// Shared Types
// ──────────────────────────────────────────────

type AlertLevel = 'low' | 'moderate' | 'high' | 'severe';
type MetricSeverityLevel = 'safe' | 'moderate' | 'unhealthy' | 'hazardous' | 'info';
type Audience = 'public' | 'researcher' | 'professional';
type ConversationMode = 'city_analysis' | 'multi_city' | 'comparison' | 'health_qa' | 'general';
type DynamicAlertType = 'pollution' | 'heat_stress' | 'humidity' | 'risk_surge';
type DynamicAlertSeverity = 'critical' | 'warning';
type ForecastTrend = 'Rising' | 'Falling' | 'Stable';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ──────────────────────────────────────────────
// Common Response Sub-Types
// ──────────────────────────────────────────────

interface AlertResponse {
  level: AlertLevel;
  message: string;
  precautions: string[];
  vulnerable_groups: string[];
}

interface DynamicAlertResponse {
  city: string;
  alert_type: DynamicAlertType;
  severity: DynamicAlertSeverity;
  title: string;
  message: string;
  triggered_value: number;
  threshold: number;
  timestamp: string; // ISO-8601
}

interface NewsArticleResponse {
  title: string;
  description: string | null;
  source: string;
  url: string;
  published_at: string; // ISO-8601
}

interface MetricSeverity {
  name: string;      // "PM2.5" | "Temperature" | "Humidity" | "Population Density"
  value: number;
  unit: string;      // "µg/m³" | "°C" | "%" | "per km²"
  severity: MetricSeverityLevel;
  description: string;
}

// ──────────────────────────────────────────────
// City Analyze (POST /v1/city/analyze)
// ──────────────────────────────────────────────

interface CityAnalyzeRequest {
  city: string;
}

interface CityAnalyzeResponse {
  city: string;
  state: string;
  coordinates: { latitude: number; longitude: number };
  metrics: {
    'PM2.5': number;
    Temperature: number;
    Humidity: number;
    PopulationDensity: number;
  };
  ehri: number;
  alert: AlertResponse;
  dynamic_alerts: DynamicAlertResponse[];
  news: NewsArticleResponse[];
  explanation: string;
  data_sources: { pm25: string; weather: string };
}

// ──────────────────────────────────────────────
// City Forecast (POST /v1/city/forecast)
// ──────────────────────────────────────────────

interface CityForecastRequest {
  city: string;
}

interface CityForecastResponse {
  city: string;
  input_window_days: number;
  forecast_horizon_days: number;
  forecast_next_2_days: number[];
  trend: ForecastTrend;
  history_values: number[];
  explanation: string;
}

// ──────────────────────────────────────────────
// Manual Risk Prediction (POST /v1/risk/predict)
// ──────────────────────────────────────────────

interface RiskPredictRequest {
  city: string;
  metrics: {
    'PM2.5': number;
    Temperature: number;
    Humidity: number;
    PopulationDensity: number;
  };
}

interface RiskPredictResponse {
  city: string;
  ehri: number;
  alert: AlertResponse;
  explanation: string;
}

// ──────────────────────────────────────────────
// Manual Forecast (POST /v1/risk/forecast)
// ──────────────────────────────────────────────

interface ManualForecastRequest {
  city: string;
  last_7_days_ehri: [number, number, number, number, number, number, number];
}

interface ManualForecastResponse {
  city: string;
  input_window_days: number;
  forecast_horizon_days: number;
  forecast_next_2_days: number[];
  trend: ForecastTrend;
  history_values: number[];
  explanation: string;
}

// ──────────────────────────────────────────────
// Multi-City Compare (POST /v1/compare)
// ──────────────────────────────────────────────

interface CompareRequest {
  cities: string[]; // 2-5 cities
}

interface CitySummary {
  city: string;
  state: string;
  ehri: number;
  alert_level: AlertLevel;
  metrics: {
    'PM2.5': number;
    Temperature: number;
    Humidity: number;
    PopulationDensity: number;
  };
  dynamic_alerts: DynamicAlertResponse[];
  data_sources: { pm25: string; weather: string };
}

interface CompareResponse {
  cities: CitySummary[];   // sorted worst → best
  ranking: string[];       // city names worst → best
  generated_at: string;    // ISO-8601
}

// ──────────────────────────────────────────────
// Alert Feed (GET /v1/alerts)
// ──────────────────────────────────────────────

interface AlertFeedResponse {
  total_alerts: number;
  alerts: DynamicAlertResponse[];
  cities_monitored: number;
}

// ──────────────────────────────────────────────
// Dashboard Insights (POST /v1/dashboard/insights)
// ──────────────────────────────────────────────

interface DashboardInsightsRequest {
  city: string;
}

interface RiskSummaryCard {
  card_type: 'risk_summary';
  city: string;
  state: string;
  ehri: number;
  alert_level: AlertLevel;
  summary: string;
}

interface HealthAdvisoryCard {
  card_type: 'health_advisory';
  precautions: string[];
  vulnerable_groups: string[];
  health_impacts: string[];
}

interface MetricBreakdownCard {
  card_type: 'metric_breakdown';
  metrics: MetricSeverity[];
}

interface NewsDigestCard {
  card_type: 'news_digest';
  articles: NewsArticleResponse[];
}

interface ForecastSnapshotCard {
  card_type: 'forecast_snapshot';
  trend: ForecastTrend | 'Unknown';
  forecast_values: number[];
  history_count: number;
  available: boolean;
}

interface DashboardInsightsResponse {
  city: string;
  risk_summary: RiskSummaryCard;
  health_advisory: HealthAdvisoryCard;
  metric_breakdown: MetricBreakdownCard;
  news_digest: NewsDigestCard;
  forecast_snapshot: ForecastSnapshotCard;
  dynamic_alerts: DynamicAlertResponse[];
  ai_summary: string;  // Markdown
}

// ──────────────────────────────────────────────
// Conversation AI (POST /v1/ai/chat)
// ──────────────────────────────────────────────

interface ConversationRequest {
  message: string;               // min 2 chars
  audience?: Audience;           // default: "public"
  history?: ChatMessage[];       // max 20, oldest first
}

// Cards that can appear in conversation response
interface CityCard {
  card_type: 'city_card';
  city: string;
  ehri: number;
  alert_level: AlertLevel;
  metrics: {
    'PM2.5': number;
    Temperature: number;
    Humidity: number;
    PopulationDensity: number;
  };
}

interface ComparisonCard {
  card_type: 'comparison_card';
  cities: CityCard[];
  ranking: string[];  // worst → best
}

interface HealthTipCard {
  card_type: 'health_tip_card';
  title: string;
  advice: string[];
  audience: Audience;
}

interface NewsCard {
  card_type: 'news_card';
  headline: string;
  source: string;
  url: string;
  relevance: string;
}

type ConversationCard = CityCard | ComparisonCard | HealthTipCard | NewsCard;

interface ConversationResponse {
  text: string;                     // Markdown
  cards: ConversationCard[];        // heterogeneous — check card_type
  mode: ConversationMode;
  detected_cities: string[];
  suggestions: string[];            // follow-up questions
}

// ──────────────────────────────────────────────
// Legacy Chat (POST /v1/chat/query)
// ──────────────────────────────────────────────

interface LegacyChatRequest {
  question: string;       // min 3 chars
  city?: string;
  metrics?: {
    'PM2.5': number;
    Temperature: number;
    Humidity: number;
    PopulationDensity: number;
  };
  ehri?: number;          // 0-100
  history?: ChatMessage[];
}

interface LegacyChatResponse {
  answer: string;
  mode: 'city_grounded' | 'general';
}

// ──────────────────────────────────────────────
// Error Envelope (all error responses)
// ──────────────────────────────────────────────

interface APIError {
  error: string;    // Error type name
  detail: string;   // Human-readable message
  code: number;     // HTTP status code
}
```

---

## 16. Example Fetch Calls

### API Client Setup

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const err: APIError = await res.json();
    throw new Error(`[${err.code}] ${err.detail}`);
  }

  return res.json();
}
```

### Dashboard Page — Load All Data

```ts
// Main dashboard call — returns everything in one shot
const insights = await api<DashboardInsightsResponse>(
  '/v1/dashboard/insights',
  { method: 'POST', body: JSON.stringify({ city: selectedCity }) }
);

// insights.risk_summary     → render RiskSummaryCard
// insights.health_advisory  → render HealthAdvisoryCard
// insights.metric_breakdown → render MetricBreakdownCard
// insights.news_digest      → render NewsDigestCard
// insights.forecast_snapshot → render ForecastSnapshotCard (check .available)
// insights.dynamic_alerts   → render alert banner if any
// insights.ai_summary       → render as markdown
```

### Dashboard — Compare Widget

```ts
const comparison = await api<CompareResponse>(
  '/v1/compare',
  { method: 'POST', body: JSON.stringify({ cities: ['Delhi', 'Mumbai'] }) }
);

// comparison.cities   → render side-by-side cards
// comparison.ranking  → display ranking badges
```

### Dashboard — Alert Ticker (poll every 60s)

```ts
const alerts = await api<AlertFeedResponse>('/v1/alerts');

if (alerts.total_alerts > 0) {
  // Show alert banner
  // alerts.alerts[0].title, .message, .severity, .city
}
```

### Dashboard — Detailed City Forecast

```ts
// After the city has been analyzed 3+ times:
try {
  const forecast = await api<CityForecastResponse>(
    '/v1/city/forecast',
    { method: 'POST', body: JSON.stringify({ city: 'Delhi' }) }
  );
  // forecast.trend, forecast.forecast_next_2_days, forecast.history_values
} catch (e) {
  // 400 = not enough history yet — show "Analyze a few more times" message
}
```

### Conversation Page — Send Message

```ts
const response = await api<ConversationResponse>(
  '/v1/ai/chat',
  {
    method: 'POST',
    body: JSON.stringify({
      message: userInput,
      audience: selectedAudience, // 'public' | 'researcher' | 'professional'
      history: conversationHistory.slice(-20),
    }),
  }
);

// response.text             → render markdown in chat bubble
// response.cards            → render embedded cards (check each card.card_type)
// response.mode             → adjust UI behavior
// response.detected_cities  → show city badges
// response.suggestions      → render clickable chips below the message

// Update local history
setHistory(prev => [
  ...prev,
  { role: 'user', content: userInput },
  { role: 'assistant', content: response.text },
]);
```

### Conversation — Handle Suggestion Click

```ts
function onSuggestionClick(suggestion: string) {
  // Just send it as a new message
  setUserInput(suggestion);
  sendMessage(suggestion);
}
```

---

## Quick Reference: All Endpoints

| Method | Path | Primary Use | Page |
|--------|------|-------------|------|
| `GET` | `/api/health` | Health check | — |
| `POST` | `/api/v1/city/analyze` | Full EHRI analysis for a city | Dashboard |
| `POST` | `/api/v1/city/forecast` | History-based forecast (needs 3+ analyses) | Dashboard |
| `POST` | `/api/v1/risk/predict` | Manual metric input prediction | Advanced |
| `POST` | `/api/v1/risk/forecast` | Manual 7-day EHRI forecast | Advanced |
| `POST` | `/api/v1/compare` | Compare 2–5 cities | Dashboard |
| `GET` | `/api/v1/alerts` | Global dynamic alert feed | Dashboard |
| `POST` | `/api/v1/dashboard/insights` | ⭐ Card-based dashboard intelligence | **Dashboard** |
| `POST` | `/api/v1/ai/chat` | ⭐ Freeform conversation AI | **Conversation** |
| `POST` | `/api/v1/chat/query` | Legacy chat (backward compat) | — |

---

## Important Notes

1. **Backend stores data in-memory.** EHRI history resets on server restart. Forecast requires history from prior `/city/analyze` or `/dashboard/insights` calls in the same session.

2. **LLM responses are markdown.** Use a markdown renderer (e.g., `react-markdown` or `marked`) for `text`, `explanation`, and `ai_summary` fields.

3. **Cards are heterogeneous.** The `cards[]` array in conversation responses can contain different card types. Always check `card_type` before rendering.

4. **Forecast snapshot may be unavailable.** Check `forecast_snapshot.available` before rendering forecast data. If `false`, show a placeholder message.

5. **News may be empty.** NewsAPI has rate limits. `news_digest.articles` or conversation `news_card`s may be empty arrays.

6. **Live data can fail.** OpenAQ/Open-Meteo may have transient failures. The conversation endpoint handles this gracefully (city will be in `detected_cities` but may have no card if data fetch failed).

7. **Rate limit: 60 req/min/IP.** Implement debouncing on the chat input and don't auto-refresh dashboard more than once per minute.

8. **City names are case-insensitive.** Send `"delhi"`, `"DELHI"`, or `"Delhi"` — all work. Response always returns canonical form (e.g., `"Delhi"`).
