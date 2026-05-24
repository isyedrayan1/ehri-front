"""Tests for POST /api/v1/ai/chat — Conversation AI engine."""


class TestConversationAI:
    """Freeform, multi-city, health-centric conversational AI."""

    # ── Single city analysis ────────────────────────────────────

    def test_single_city_query(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Tell me about air quality in Delhi",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["mode"] == "city_analysis"
        assert "Delhi" in data["detected_cities"]
        assert isinstance(data["text"], str)
        assert len(data["text"]) > 0

    def test_single_city_returns_city_card(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "How is Mumbai air today?",
        })
        data = resp.json()
        assert len(data["cards"]) >= 1
        city_cards = [c for c in data["cards"] if c["card_type"] == "city_card"]
        assert len(city_cards) >= 1
        cc = city_cards[0]
        assert cc["city"] == "Mumbai"
        assert 0 <= cc["ehri"] <= 100
        assert cc["alert_level"] in ("low", "moderate", "high", "severe")
        assert "PM2.5" in cc["metrics"]

    # ── Multi-city comparison ───────────────────────────────────

    def test_comparison_mode(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Compare Delhi and Mumbai air quality",
        })
        data = resp.json()
        assert data["mode"] == "comparison"
        assert len(data["detected_cities"]) == 2

    def test_comparison_returns_comparison_card(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Delhi versus Bengaluru — which is worse?",
        })
        data = resp.json()
        comp_cards = [c for c in data["cards"] if c["card_type"] == "comparison_card"]
        assert len(comp_cards) >= 1
        cc = comp_cards[0]
        assert len(cc["cities"]) == 2
        assert isinstance(cc["ranking"], list)

    def test_multi_city_without_compare_keyword(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Tell me about Delhi and Chennai",
        })
        data = resp.json()
        assert data["mode"] == "multi_city"
        assert len(data["detected_cities"]) >= 2

    # ── Health Q&A mode ─────────────────────────────────────────

    def test_health_qa_mode(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "What are the health risks of air pollution for asthma patients?",
        })
        data = resp.json()
        assert data["mode"] == "health_qa"
        assert data["detected_cities"] == []
        assert isinstance(data["text"], str)

    def test_general_mode(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Tell me about EHRI methodology",
        })
        data = resp.json()
        assert data["mode"] == "general"

    # ── Audience awareness ──────────────────────────────────────

    def test_audience_public(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "How is Delhi air?",
            "audience": "public",
        })
        assert resp.status_code == 200

    def test_audience_researcher(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Analyze Delhi PM2.5 levels",
            "audience": "researcher",
        })
        assert resp.status_code == 200

    def test_audience_professional(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Policy recommendations for Delhi air",
            "audience": "professional",
        })
        assert resp.status_code == 200

    def test_invalid_audience_422(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Hello",
            "audience": "invalid_audience",
        })
        assert resp.status_code == 422

    # ── Suggestions ─────────────────────────────────────────────

    def test_suggestions_present(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "Tell me about Delhi air",
        })
        data = resp.json()
        assert isinstance(data["suggestions"], list)
        assert len(data["suggestions"]) > 0

    # ── Conversation history ────────────────────────────────────

    def test_with_history(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "What precautions should I take?",
            "history": [
                {"role": "user", "content": "How is Delhi air today?"},
                {"role": "assistant", "content": "Delhi has severe air quality."},
            ],
        })
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data["text"], str)

    # ── Validation ──────────────────────────────────────────────

    def test_empty_message_422(self, client):
        resp = client.post("/api/v1/ai/chat", json={"message": ""})
        assert resp.status_code == 422

    def test_missing_message_422(self, client):
        resp = client.post("/api/v1/ai/chat", json={})
        assert resp.status_code == 422

    # ── Health keyword triggers health tip card ─────────────────

    def test_health_keyword_triggers_health_tip(self, client):
        resp = client.post("/api/v1/ai/chat", json={
            "message": "What health precautions in Delhi?",
        })
        data = resp.json()
        tip_cards = [c for c in data["cards"] if c["card_type"] == "health_tip_card"]
        assert len(tip_cards) >= 1
        tc = tip_cards[0]
        assert isinstance(tc["advice"], list)
        assert len(tc["advice"]) > 0
