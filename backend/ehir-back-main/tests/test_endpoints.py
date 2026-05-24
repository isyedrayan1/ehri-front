"""Tests for forecast, compare, and alert endpoints."""


class TestForecast:
    """POST /api/v1/risk/forecast — EHRI forecasting."""

    def test_forecast_valid(self, client):
        resp = client.post("/api/v1/risk/forecast", json={
            "city": "Delhi",
            "last_7_days_ehri": [45.0, 46.0, 47.0, 48.0, 49.0, 50.0, 51.0],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["city"] == "Delhi"
        assert isinstance(data["forecast_next_2_days"], list)
        assert len(data["forecast_next_2_days"]) == 2
        assert data["trend"] in ("Rising", "Falling", "Stable")

    def test_forecast_missing_ehri_422(self, client):
        resp = client.post("/api/v1/risk/forecast", json={"city": "Delhi"})
        assert resp.status_code == 422

    def test_forecast_empty_city_422(self, client):
        resp = client.post("/api/v1/risk/forecast", json={
            "city": "",
            "last_7_days_ehri": [1, 2, 3, 4, 5, 6, 7],
        })
        assert resp.status_code == 422


class TestCompare:
    """POST /api/v1/compare — multi-city comparison."""

    def test_compare_two_cities(self, client):
        resp = client.post("/api/v1/compare", json={
            "cities": ["Delhi", "Mumbai"],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["cities"]) == 2
        assert isinstance(data["ranking"], list)
        assert len(data["ranking"]) == 2

    def test_compare_single_city_422(self, client):
        resp = client.post("/api/v1/compare", json={
            "cities": ["Delhi"],
        })
        assert resp.status_code == 422

    def test_compare_too_many_cities_422(self, client):
        resp = client.post("/api/v1/compare", json={
            "cities": ["Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru", "Hyderabad"],
        })
        assert resp.status_code == 422

    def test_compare_unknown_city_partial(self, client):
        """Should still work if at least some cities are valid."""
        resp = client.post("/api/v1/compare", json={
            "cities": ["Delhi", "Atlantis"],
        })
        # Depending on implementation, may be 200 with partial or 404
        assert resp.status_code in (200, 404)

    def test_compare_ranking_sorted(self, client):
        resp = client.post("/api/v1/compare", json={
            "cities": ["Delhi", "Mumbai"],
        })
        data = resp.json()
        if resp.status_code == 200 and len(data["cities"]) >= 2:
            ehris = {r["city"]: r["ehri"] for r in data["cities"]}
            # ranking should be sorted by EHRI descending
            for i in range(len(data["ranking"]) - 1):
                c1, c2 = data["ranking"][i], data["ranking"][i + 1]
                assert ehris[c1] >= ehris[c2]


class TestAlerts:
    """GET /api/v1/alerts — alert feed."""

    def test_alerts_no_params(self, client):
        resp = client.get("/api/v1/alerts")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_alerts" in data
        assert isinstance(data["alerts"], list)
        assert isinstance(data["cities_monitored"], int)

    def test_alerts_with_city(self, client):
        # Seed history first
        client.post("/api/v1/city/analyze", json={"city": "Delhi"})
        resp = client.get("/api/v1/alerts", params={"city": "Delhi"})
        assert resp.status_code == 200
        data = resp.json()
        assert "total_alerts" in data
        assert isinstance(data["alerts"], list)


class TestLegacyChat:
    """POST /api/v1/chat/query — legacy chat endpoint."""

    def test_legacy_chat(self, client):
        resp = client.post("/api/v1/chat/query", json={
            "question": "How is Delhi air today?",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "answer" in data
        assert isinstance(data["answer"], str)

    def test_legacy_chat_with_history(self, client):
        resp = client.post("/api/v1/chat/query", json={
            "question": "What precautions should I take?",
            "history": [
                {"role": "user", "content": "Delhi air quality?"},
                {"role": "assistant", "content": "Delhi has severe EHRI."},
            ],
        })
        assert resp.status_code == 200

    def test_legacy_chat_auto_detect(self, client):
        resp = client.post("/api/v1/chat/query", json={
            "question": "Tell me about Mumbai",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data["answer"], str)
