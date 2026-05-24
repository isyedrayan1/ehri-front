# EHRI Backend

AI-Powered **Environmental Health Intelligence** platform for India — FastAPI backend.

## Architecture

```
app/
├── api/
│   ├── router.py          # Registers all endpoint routers
│   └── routes/
│       ├── health.py       # GET  /api/health
│       ├── risk.py         # POST /api/v1/risk/predict
│       ├── forecast.py     # POST /api/v1/risk/forecast
│       └── chat.py         # POST /api/v1/chat/query
├── core/
│   └── config.py           # Pydantic-settings (env driven)
├── schemas/
│   ├── requests.py         # Request models
│   └── responses.py        # Response models
└── services/
    ├── alert.py            # Tiered EHRI alert classification
    ├── container.py        # DI container (startup singleton)
    ├── forecasting.py      # 7→2 day LinearRegression forecast
    ├── llm.py              # Hybrid LLM reasoning (Gemini / OpenAI-compat)
    ├── model_loader.py     # Pickle artifact loader + feature-order validation
    ├── predictor.py        # RandomForestRegressor inference
    └── types.py            # Shared domain types
```

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create .env from example
cp .env.example .env          # then fill in LLM_API_KEY

# 3. Run the server
uvicorn app.main:app --reload
```

## API Endpoints

| Method | Path                     | Description                             |
|--------|--------------------------|-----------------------------------------|
| GET    | `/api/health`            | Liveness check                          |
| POST   | `/api/v1/risk/predict`   | Predict EHRI + alert + LLM explanation  |
| POST   | `/api/v1/risk/forecast`  | 7-day history → 2-day EHRI forecast     |
| POST   | `/api/v1/chat/query`     | Hybrid Q&A (city-grounded or general)   |

## EHRI Model

- **Type**: `RandomForestRegressor` (regression, continuous 0–100)
- **Features** (strict order): `PM2.5`, `Temperature`, `Humidity`, `PopulationDensity`
- **Artifacts**: `risk_model.pkl`, `scaler.pkl`, `feature_columns.pkl`

## Hybrid AI Modes

| Mode            | Trigger                                    | LLM receives                        |
|-----------------|--------------------------------------------|--------------------------------------|
| City-grounded   | city + metrics + EHRI supplied             | Full environmental context + EHRI    |
| General Q&A     | Only a question                            | Question only                        |

ML computes EHRI. LLM explains and reasons — never computes scores.

## Environment Variables

See `.env.example` for all available settings.