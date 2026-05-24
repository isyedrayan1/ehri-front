# EHRI Backend — Implementation Plan

> AI-Powered Environmental Health Intelligence Platform for India
> ML computes EHRI. LLM explains and reasons — never computes scores.

---

## Current State (Phase 1 Complete)

```
ehir-back/
├── app/
│   ├── api/routes/        health · risk · forecast · chat
│   ├── core/config.py     pydantic-settings (.env driven)
│   ├── schemas/           request / response contracts
│   ├── services/
│   │   ├── model_loader   joblib + feature-order guard
│   │   ├── predictor      RandomForestRegressor inference
│   │   ├── forecasting    7→2 day LinearRegression
│   │   ├── alert          tiered EHRI classification
│   │   ├── llm            Gemini chat-completions (hybrid)
│   │   └── container      DI / startup singleton
│   └── main.py            FastAPI app + lifespan
├── risk_model.pkl          trained model (sklearn 1.6.1)
├── scaler.pkl              StandardScaler
├── feature_columns.pkl     ['PM2.5','Temperature','Humidity','PopulationDensity']
├── .env / .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

Server starts, model loads, all routes respond (LLM needs API key).

---

## Phase 2 — Live Data Integration

**Goal:** Replace manual metric input with real-time data from OpenAQ + Open-Meteo.

| # | Task | Module | Details |
|---|------|--------|---------|
| 2.1 | City coordinate mapping | `data/city_coordinates.csv` | Lat/Lng for major Indian cities |
| 2.2 | Population density lookup | `data/population_data.json` | Per-city density (persons/km²) |
| 2.3 | PM2.5 fetcher | `services/data_fetcher.py` | OpenAQ v3 API → latest PM2.5 for nearest station |
| 2.4 | Weather fetcher | `services/data_fetcher.py` | Open-Meteo current weather → temp + humidity |
| 2.5 | Unified city resolver | `services/city_resolver.py` | city name → (lat, lng, population_density) |
| 2.6 | Wire `/analyze-city` endpoint | `api/routes/city.py` | Fetch live data → predict → alert → explain |

**APIs used:**
- **OpenAQ** (key required) — PM2.5
- **Open-Meteo** (no key) — Temperature, Humidity
- No API needed for population density (static lookup)

**Deliverable:** `POST /api/v1/city/analyze` takes only `{ "city": "Delhi" }` and returns full EHRI analysis with real-time data.

---

## Phase 3 — Forecast Engine & Historical Tracking

**Goal:** Produce 2-day EHRI forecasts from recent history and explain trends via LLM.

| # | Task | Module | Details |
|---|------|--------|---------|
| 3.1 | EHRI history store | `services/history.py` | In-memory or SQLite — stores last N days per city |
| 3.2 | Auto-populate history | scheduled / on-demand | Fetch + predict → append to history |
| 3.3 | Forecast integration | `api/routes/forecast.py` | Auto-fetch last 7 from history if not supplied |
| 3.4 | Trend direction label | `services/forecasting.py` | Rising / Falling / Stable tag from slope |
| 3.5 | LLM forecast explanation | `services/llm.py` | Explain trend + next 2 days in plain language |

**Deliverable:** `POST /api/v1/city/forecast` takes `{ "city": "Mumbai" }`, pulls 7-day history, predicts next 2 days, returns trend + explanation.

---

## Phase 4 — Alerts, News & Comparison

**Goal:** Rich situational awareness layer on top of EHRI predictions.

| # | Task | Module | Details |
|---|------|--------|---------|
| 4.1 | Dynamic alert rules | `services/alert.py` | PM2.5 > 150 → Severe Pollution; Temp > 40 → Heat Stress; rapid EHRI rise → Risk Surge |
| 4.2 | News integration | `services/news.py` | NewsAPI — environment/health headlines for city |
| 4.3 | City comparison endpoint | `api/routes/compare.py` | Compare EHRI + alerts for 2–5 cities side-by-side |
| 4.4 | Alert feed endpoint | `api/routes/alerts.py` | Latest triggered alerts across monitored cities |

**Deliverable:** `/api/v1/alerts`, `/api/v1/compare` live with real-time contextual alerts and multi-city comparison.

---

## Phase 5 — Intelligent AI Engine (Dashboard + Conversation)

> **Two AI surfaces, one brain.**
> Dashboard AI = proactive, card-based, context-grounded.
> Conversation AI = freeform, multi-city, multi-topic, health-centric.
> Both serve: **Public** → **Researchers** → **Professionals.**

---

### 5A — Dashboard AI Engine

**Endpoint:** `POST /api/v1/dashboard/insights`
**Input:** `{ "city": "Delhi" }` (sent by frontend when user opens a city dashboard)
**Output:** Structured JSON with typed **cards** for frontend rendering — NOT just text.

| Card | Key | Data |
|------|-----|------|
| Risk Summary | `risk_summary` | EHRI score, alert level, one-line AI summary |
| Health Advisory | `health_advisory` | Precautions, vulnerable groups, health impacts |
| Metric Breakdown | `metric_breakdown` | PM2.5 / Temp / Humidity with severity labels per metric |
| News Digest | `news_digest` | Top 3–5 environment/health headlines for the city |
| Forecast Snapshot | `forecast_snapshot` | Trend direction + next 2-day values (if enough history) |
| AI Narrative | `ai_summary` | LLM-generated paragraph tying all cards together |

Frontend renders each card as a visual component (not just a text wall).

---

### 5B — Conversation AI Engine

**Endpoint:** `POST /api/v1/ai/chat`
**Input:** `{ "message": "...", "history": [...], "audience": "public" }`
**Output:** Rich `ConversationResponse` with:

| Field | Type | Purpose |
|-------|------|---------|
| `text` | string | Main LLM answer (markdown) |
| `cards` | Card[] | Optional embedded cards (city, comparison, health tip, metric, news) |
| `mode` | string | Detected intent: `city_analysis`, `multi_city`, `health_qa`, `comparison`, `general` |
| `detected_cities` | string[] | Cities auto-resolved from the question |
| `suggestions` | string[] | 2–3 follow-up question suggestions |

**Key behaviours:**
- Not stuck to one city — detects ALL city mentions, fetches live data for each
- Can compare cities mid-conversation ("Is Delhi worse than Mumbai right now?")
- Health-first — prioritises precautions, vulnerable groups, medical guidance
- Audience-aware — `public` (simple + actionable), `researcher` (quantitative + data-rich), `professional` (concise + policy)
- Reads news context and factors it into answers
- Multi-turn — accepts client-side `history[]` for follow-up questions
- Suggests follow-ups to keep the conversation useful

**Card types the AI can embed in responses:**

| Card Type | When Triggered |
|-----------|----------------|
| `city_card` | User asks about a specific city → live EHRI + alert |
| `comparison_card` | User compares 2+ cities → side-by-side EHRI |
| `health_tip_card` | Health advice given → structured do/don't |
| `metric_card` | User asks about PM2.5 / temp / humidity → value + severity |
| `news_card` | Relevant news found → headline + source + link |

---

### 5C — Production Hardening (already complete)

| # | Task | Status |
|---|------|--------|
| 5C.1 | CORS for React/Next.js frontend | ✅ Done |
| 5C.2 | Rate limiting (60 rpm/IP) | ✅ Done |
| 5C.3 | Structured JSON logging + Request-ID | ✅ Done |
| 5C.4 | Uniform error envelope `{error, detail, code}` | ✅ Done |
| 5C.5 | Dockerfile + Procfile + docker-compose.yml | ✅ Done |

---

### 5D — Full Test Suite (66 tests, all passing)

| # | Tests | Status |
|---|-------|--------|
| 5D.1 | Health endpoint | ✅ |
| 5D.2 | City analyze (valid, invalid, missing, metrics, coordinates, alerts) | ✅ |
| 5D.3 | Manual forecast | ✅ |
| 5D.4 | Compare endpoint (2-city, ranking, validation) | ✅ |
| 5D.5 | Alert feed (no params, with city) | ✅ |
| 5D.6 | Dashboard insights (all card types, validation) | ✅ |
| 5D.7 | Conversation AI (single/multi/comparison/health_qa/general, audience, history) | ✅ |
| 5D.8 | Legacy chat endpoint | ✅ |
| 5D.9 | Service units: CityResolver, AlertService, EHRIHistoryStore | ✅ |
| 5D.10 | Error envelope (404, 422) | ✅ |

**Deliverable:** Two AI engines powering a smart dashboard + freeform health conversation.
Not just an AQI viewer — a **health intelligence platform**.

---

## Phase Execution Order

```
Phase 1  ██████████  COMPLETE — skeleton + model + routes
Phase 2  ██████████  COMPLETE — live data (OpenAQ + Open-Meteo + city resolver)
Phase 3  ██████████  COMPLETE — forecast + history + trend direction
Phase 4  ██████████  COMPLETE — alerts + news + compare
Phase 5  ██████████  COMPLETE — AI engine + production + 66 tests
```

Each phase is self-contained and testable before moving to the next.

---

## Key Principles

1. **ML = quantitative brain.** Model computes EHRI; LLM never generates numbers.
2. **Feature order is sacred.** Always `[PM2.5, Temperature, Humidity, PopulationDensity]`.
3. **No hardcoded secrets.** Everything through `.env` → `pydantic-settings`.
4. **Module per concern.** One file, one job. Easy to test, easy to replace.
5. **Stepwise delivery.** Health-check → hardcoded prediction → live data → forecast → alerts → LLM → deploy.
