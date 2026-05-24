"""Tests for POST /api/v1/city/analyze endpoint."""

from tests.conftest import FAKE_LLM_RESPONSE


class TestCityAnalyze:
    def test_analyze_valid_city(self, client):
        resp = client.post("/api/v1/city/analyze", json={"city": "Delhi"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["city"] == "Delhi"
        assert data["state"] == "Delhi"
        assert 0 <= data["ehri"] <= 100
        assert "alert" in data
        assert data["alert"]["level"] in ("low", "moderate", "high", "severe")
        assert isinstance(data["dynamic_alerts"], list)
        assert isinstance(data["news"], list)
        assert "explanation" in data
        assert data["data_sources"]["pm25"] == "mock"
        assert data["data_sources"]["weather"] == "mock"

    def test_analyze_returns_metrics(self, client):
        resp = client.post("/api/v1/city/analyze", json={"city": "Mumbai"})
        data = resp.json()
        assert "PM2.5" in data["metrics"]
        assert "Temperature" in data["metrics"]
        assert "Humidity" in data["metrics"]
        assert "PopulationDensity" in data["metrics"]
        # Verify mocked values
        assert data["metrics"]["PM2.5"] == 120.0
        assert data["metrics"]["Temperature"] == 35.0
        assert data["metrics"]["Humidity"] == 60.0

    def test_analyze_unknown_city_404(self, client):
        resp = client.post("/api/v1/city/analyze", json={"city": "Atlantis"})
        assert resp.status_code == 404
        data = resp.json()
        assert data["code"] == 404
        assert "error" in data

    def test_analyze_empty_city_422(self, client):
        resp = client.post("/api/v1/city/analyze", json={"city": ""})
        assert resp.status_code == 422

    def test_analyze_missing_city_422(self, client):
        resp = client.post("/api/v1/city/analyze", json={})
        assert resp.status_code == 422

    def test_analyze_dynamic_alerts_present(self, client):
        """PM2.5=120 is < 150, so no pollution alert. But field should exist."""
        resp = client.post("/api/v1/city/analyze", json={"city": "Bengaluru"})
        data = resp.json()
        assert isinstance(data["dynamic_alerts"], list)

    def test_analyze_coordinates(self, client):
        resp = client.post("/api/v1/city/analyze", json={"city": "Delhi"})
        data = resp.json()
        assert "latitude" in data["coordinates"]
        assert "longitude" in data["coordinates"]
        assert abs(data["coordinates"]["latitude"] - 28.6139) < 0.01
