# EHRI Dashboard — 5-Step Premium Implementation Plan

> **Goal:** Connect the existing premium frontend to the **real FastAPI backend** and upgrade the data layer, layout intelligence, and feature set — without changing the design system, color palette, typography, or visual identity.

> **Status:** ✅ 100% Complete (Frontend Ready for Live Data)

---

## 🚀 Final Integration Summary

| Phase | Milestone | Status |
|-------|-----------|--------|
| **Step 1** | Data Layer, API Client, and TypeScript Schema Alignment | ✅ DONE |
| **Step 2** | Dashboard Page Re-wiring (Insights Endpoint + Bento Grid) | ✅ DONE |
| **Step 3** | Chat Page Re-wiring (AI Stream + Embedded Cards) | ✅ DONE |
| **Step 4** | Advanced Features (Compare Hook + Alert Polling) | ✅ DONE |
| **Step 5** | Production Polish (Skeletons + Error Boundaries) | ✅ DONE |

---

## 🛠️ Critical Backend Alignment (For Backend Copilot)

The frontend is now fully active and attempting to sync with `http://localhost:8000/api`. To resolve current connectivity blocks, the backend must implement the following:

### 1. CORS Configuration
The backend must whitelist `http://localhost:9002` (or use `["*"]` for dev).
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Required Endpoints
- `POST /api/v1/dashboard/insights` -> Returns full 5-card dashboard state + AI summary.
- `POST /api/v1/ai/chat` -> Returns AI text + embedded cards + suggestions.
- `POST /api/v1/compare` -> Returns ranked city deltas for side-by-side analysis.
- `GET /api/v1/alerts` -> Returns global threshold alerts.

### 3. Localization Requirement
The frontend has been updated to use **OpenStreetMap** for all map-based visual grounding. 
- **Constraint Met:** No Google Maps or key-based location services are used.
- **Implementation:** The UI generates OSRM search queries based on the `city` and `state` strings provided in the backend response.

---

## 🧪 Verification Steps
1. **Health Check:** Ensure `localhost:8000/api/health` returns `{"status": "ok"}`.
2. **Dashboard Load:** Verify `GET /api/v1/dashboard/insights?city=Delhi` populates the bento grid.
3. **Chat Grounding:** Ask the AI "Is it safe in Mumbai?" and verify that `detected_cities: ["Mumbai"]` is returned in the JSON payload to trigger the frontend badges.
