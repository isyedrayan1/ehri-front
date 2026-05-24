"""Tests for service-layer units: predictor, alert, history, city_resolver."""

from app.services.alert import AlertService
from app.services.city_resolver import CityResolver
from app.services.history import EHRIHistoryStore


class TestCityResolver:
    def test_resolve_known_city(self):
        cr = CityResolver()
        info = cr.resolve("Delhi")
        assert info is not None
        assert info.city == "Delhi"
        assert info.state == "Delhi"
        assert info.latitude > 0

    def test_resolve_case_insensitive(self):
        cr = CityResolver()
        info = cr.resolve("dElHi")
        assert info is not None
        assert info.city == "Delhi"

    def test_resolve_unknown_city(self):
        cr = CityResolver()
        assert cr.resolve("Atlantis") is None

    def test_list_cities(self):
        cr = CityResolver()
        cities = cr.list_cities()
        assert isinstance(cities, list)
        assert len(cities) >= 30
        assert "Delhi" in cities
        assert "Mumbai" in cities

    def test_populations_positive(self):
        cr = CityResolver()
        for c in cr.list_cities():
            info = cr.resolve(c)
            assert info.population_density > 0


class TestAlertService:
    def test_low_alert(self):
        svc = AlertService()
        alert = svc.generate_alert(15.0)
        assert alert.level == "low"

    def test_moderate_alert(self):
        svc = AlertService()
        alert = svc.generate_alert(35.0)
        assert alert.level == "moderate"

    def test_high_alert(self):
        svc = AlertService()
        alert = svc.generate_alert(55.0)
        assert alert.level == "high"

    def test_severe_alert(self):
        svc = AlertService()
        alert = svc.generate_alert(80.0)
        assert alert.level == "severe"

    def test_dynamic_alerts_pm25(self):
        svc = AlertService()
        metrics = {"PM2.5": 200.0, "Temperature": 30.0, "Humidity": 50.0}
        alerts = svc.evaluate_dynamic_alerts("TestCity", metrics, ehri=60.0)
        triggered = [a.alert_type for a in alerts]
        assert "pollution" in triggered

    def test_dynamic_alerts_heat(self):
        svc = AlertService()
        metrics = {"PM2.5": 50.0, "Temperature": 45.0, "Humidity": 50.0}
        alerts = svc.evaluate_dynamic_alerts("TestCity", metrics, ehri=50.0)
        triggered = [a.alert_type for a in alerts]
        assert "heat_stress" in triggered

    def test_dynamic_alerts_humidity(self):
        svc = AlertService()
        metrics = {"PM2.5": 50.0, "Temperature": 30.0, "Humidity": 90.0}
        alerts = svc.evaluate_dynamic_alerts("TestCity", metrics, ehri=50.0)
        triggered = [a.alert_type for a in alerts]
        assert "humidity" in triggered


class TestEHRIHistory:
    def test_record_and_retrieve(self):
        h = EHRIHistoryStore()
        h.record("TestCity", 50.0, {"PM2.5": 100})
        values = h.get_ehri_values("TestCity")
        assert len(values) == 1
        assert values[0] == 50.0

    def test_max_buffer(self):
        h = EHRIHistoryStore(max_entries=5)
        for i in range(10):
            h.record("TestCity", float(i), {})
        values = h.get_ehri_values("TestCity")
        assert len(values) == 5
        assert values[-1] == 9.0

    def test_list_tracked_cities(self):
        h = EHRIHistoryStore()
        h.record("A", 10.0, {})
        h.record("B", 20.0, {})
        cities = h.list_tracked_cities()
        assert "a" in cities
        assert "b" in cities

    def test_get_last_n(self):
        h = EHRIHistoryStore()
        for i in range(5):
            h.record("X", float(i * 10), {})
        last2 = h.get_last_n("X", 2)
        assert len(last2) == 2

    def test_empty_city(self):
        h = EHRIHistoryStore()
        assert h.get_ehri_values("NonExistent") == []
        assert h.count("NonExistent") == 0


class TestErrorEnvelope:
    """Verify the uniform error envelope format."""

    def test_404_envelope(self, client):
        resp = client.get("/api/nonexistent")
        assert resp.status_code == 404
        data = resp.json()
        assert "error" in data
        assert "detail" in data
        assert "code" in data
        assert data["code"] == 404

    def test_422_envelope(self, client):
        resp = client.post("/api/v1/city/analyze", json={})
        assert resp.status_code == 422
        data = resp.json()
        assert "error" in data
        assert "code" in data
        assert data["code"] == 422
