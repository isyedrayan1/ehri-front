"""Tests for POST /api/v1/dashboard/insights endpoint."""


class TestDashboardInsights:
    """Dashboard AI — card-based proactive insights for a city."""

    def test_insights_valid_city(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={"city": "Delhi"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["city"] == "Delhi"

    def test_insights_risk_summary_card(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={"city": "Mumbai"})
        data = resp.json()
        rs = data["risk_summary"]
        assert rs["card_type"] == "risk_summary"
        assert rs["city"] == "Mumbai"
        assert 0 <= rs["ehri"] <= 100
        assert rs["alert_level"] in ("low", "moderate", "high", "severe")
        assert isinstance(rs["summary"], str)

    def test_insights_health_advisory_card(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={"city": "Delhi"})
        data = resp.json()
        ha = data["health_advisory"]
        assert ha["card_type"] == "health_advisory"
        assert isinstance(ha["precautions"], list)
        assert len(ha["precautions"]) > 0
        assert isinstance(ha["vulnerable_groups"], list)
        assert len(ha["vulnerable_groups"]) > 0
        assert isinstance(ha["health_impacts"], list)

    def test_insights_metric_breakdown_card(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={"city": "Bengaluru"})
        data = resp.json()
        mb = data["metric_breakdown"]
        assert mb["card_type"] == "metric_breakdown"
        metrics = mb["metrics"]
        assert len(metrics) >= 3
        names = [m["name"] for m in metrics]
        assert "PM2.5" in names
        assert "Temperature" in names
        assert "Humidity" in names
        for m in metrics:
            assert "severity" in m
            assert m["severity"] in ("safe", "moderate", "unhealthy", "hazardous", "info")

    def test_insights_news_digest_card(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={"city": "Chennai"})
        data = resp.json()
        nd = data["news_digest"]
        assert nd["card_type"] == "news_digest"
        assert isinstance(nd["articles"], list)
        # Mock provides 2 articles
        assert len(nd["articles"]) > 0

    def test_insights_forecast_card_present(self, client):
        """Forecast card should exist (may be None if no history yet)."""
        resp = client.post("/api/v1/dashboard/insights", json={"city": "Hyderabad"})
        data = resp.json()
        # forecast_snapshot may be None if < 3 history points
        assert "forecast_snapshot" in data

    def test_insights_ai_summary(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={"city": "Delhi"})
        data = resp.json()
        assert "ai_summary" in data
        assert isinstance(data["ai_summary"], str)
        assert len(data["ai_summary"]) > 0

    def test_insights_unknown_city_404(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={"city": "Atlantis"})
        assert resp.status_code == 404

    def test_insights_empty_city_422(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={"city": ""})
        assert resp.status_code == 422

    def test_insights_missing_body_422(self, client):
        resp = client.post("/api/v1/dashboard/insights", json={})
        assert resp.status_code == 422
