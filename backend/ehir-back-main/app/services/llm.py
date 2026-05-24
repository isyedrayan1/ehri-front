"""LLM integration service with hybrid mode routing.

Mode 1 – City-grounded explanation: when city + metrics + EHRI are provided.
Mode 2 – General environmental-health Q&A: when only a question is given.
"""

from __future__ import annotations

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


_SYSTEM_PROMPT = (
    "You are an expert environmental-health analyst for India. "
    "You explain Environmental Health Risk Index (EHRI) results, "
    "health impacts, precautions, and vulnerable-group guidance. "
    "Be concise, evidence-based, and actionable."
)

# ── Audience-specific system prompts for Conversation AI ────────

_AUDIENCE_PROMPTS = {
    "public": (
        "You are a friendly, helpful environmental health assistant for India. "
        "Explain health risks in simple, everyday language. Focus on what people "
        "should DO — practical precautions, when to wear masks, when to stay indoors, "
        "how to protect children and elderly. Use bullet points. Avoid jargon. "
        "When given live data, reference the actual numbers to ground your advice. "
        "You can discuss any Indian city, compare cities, explain trends, and "
        "answer health questions. Be warm but direct about serious risks."
    ),
    "researcher": (
        "You are a data-driven environmental health analyst for India. "
        "Provide quantitative, evidence-based analysis. Reference PM2.5 thresholds "
        "(WHO guidelines: 15 µg/m³ annual, 45 µg/m³ 24-hour; NAAQS India: 60 µg/m³ annual, "
        "40 µg/m³ 24-hour). Discuss dose-response relationships, epidemiological context, "
        "and statistical trends. Include relative risk ratios where relevant. "
        "When comparing cities, provide systematic quantitative comparison. "
        "Use precise language and cite measurement units."
    ),
    "professional": (
        "You are a concise environmental health policy advisor for India. "
        "Provide actionable intelligence for decision-makers. Focus on: "
        "risk level assessment, vulnerable population impact, recommended interventions, "
        "and regulatory thresholds exceeded. Keep responses structured with clear headings. "
        "Highlight policy-relevant findings and cost-effective mitigation measures. "
        "Reference NAAQS, WHO standards, and NCAP targets where relevant."
    ),
}


class LLMService:
    """Thin wrapper around an OpenAI-compatible chat-completions endpoint.

    Primary: Gemini (or whatever LLM_BASE_URL points to).
    Fallback: OpenRouter (auto-used when primary returns 4xx/5xx).
    """

    def __init__(self):
        # Build ordered provider chain: Groq, OpenRouter, Gemini
        self._providers: list[tuple[str, str, str, str]] = []  # (name, base_url, key, model)
        if settings.groq_api_key:
            self._providers.append((
                "Groq",
                settings.groq_base_url.rstrip("/"),
                settings.groq_api_key,
                settings.groq_model,
            ))
        if settings.openrouter_api_key:
            self._providers.append((
                "OpenRouter",
                settings.openrouter_base_url.rstrip("/"),
                settings.openrouter_api_key,
                settings.openrouter_model,
            ))
        self.api_key = settings.llm_api_key
        self.model = settings.llm_model
        self.base_url = settings.llm_base_url.rstrip("/")
        if self.api_key:
            self._providers.append(("Gemini", self.base_url, self.api_key, self.model))

    # ── internal helpers ────────────────────────────────────────────

    async def _call_provider(
        self, base_url: str, api_key: str, model: str, messages: list[dict[str, str]],
    ) -> str:
        url = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": model,
            "messages": messages,
            "temperature": 0.4,
            "max_tokens": 600,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, headers=headers, json=body)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _chat(self, messages: list[dict[str, str]]) -> str:
        if not self._providers:
            return "(LLM explanation unavailable – no API key configured)"

        last_error = None
        for name, base_url, api_key, model in self._providers:
            try:
                result = await self._call_provider(base_url, api_key, model, messages)
                logger.info("LLM response from %s", name)
                return result
            except Exception as exc:
                last_error = exc
                logger.warning("%s LLM failed: %s", name, exc)

        return f"(LLM explanation temporarily unavailable – all providers failed)"

    # ── public API ──────────────────────────────────────────────────

    async def explain_city_risk(
        self,
        city: str,
        metrics: dict[str, float],
        ehri: float,
        alert_level: str,
    ) -> str:
        user_prompt = (
            f"City: {city}\n"
            f"PM2.5: {metrics.get('PM2.5')}\n"
            f"Temperature: {metrics.get('Temperature')}\n"
            f"Humidity: {metrics.get('Humidity')}\n"
            f"PopulationDensity: {metrics.get('PopulationDensity')}\n"
            f"EHRI Score: {ehri:.2f} (alert level: {alert_level})\n\n"
            "Explain the risk, likely health impacts, and recommended precautions "
            "for the general population and vulnerable groups."
        )
        return await self._chat([
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ])

    async def explain_forecast(
        self,
        city: str,
        historical_ehri: list[float],
        forecast_ehri: list[float],
        trend: str = "Stable",
    ) -> str:
        user_prompt = (
            f"City: {city}\n"
            f"Last 7 days EHRI: {historical_ehri}\n"
            f"Forecast next 2 days EHRI: {[round(v, 2) for v in forecast_ehri]}\n"
            f"Trend direction: {trend}\n\n"
            "Explain the trend, whether risk is rising or falling, and what "
            "people should prepare for over the next two days."
        )
        return await self._chat([
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ])

    async def generate_dashboard_summary(
        self,
        city: str,
        metrics: dict[str, float],
        ehri: float,
        alert_level: str,
        dynamic_alerts: list[str],
        news_headlines: list[str],
        trend: str | None = None,
    ) -> str:
        """Generate a concise dashboard narrative that ties all insight cards together."""
        parts = [
            f"City: {city}",
            f"EHRI: {ehri:.2f} (alert: {alert_level})",
            f"PM2.5: {metrics.get('PM2.5')} µg/m³, Temp: {metrics.get('Temperature')}°C, Humidity: {metrics.get('Humidity')}%",
        ]
        if dynamic_alerts:
            parts.append(f"Active alerts: {', '.join(dynamic_alerts)}")
        if news_headlines:
            parts.append(f"Recent headlines: {' | '.join(news_headlines)}")
        if trend:
            parts.append(f"Trend: {trend}")

        user_prompt = (
            "\n".join(parts) + "\n\n"
            "Write a concise (3-4 sentence) dashboard summary for the general public. "
            "Highlight the most important health concern RIGHT NOW, the key precaution "
            "to take, and whether conditions are improving or worsening. "
            "Reference the news if relevant. Be actionable."
        )
        return await self._chat([
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ])

    async def answer_conversation(
        self,
        question: str,
        context: str | None = None,
        audience: str = "public",
        mode: str = "general",
        history: list[dict[str, str]] | None = None,
    ) -> str:
        """Power the freeform Conversation AI page.

        Audience-aware system prompt + injected city context.
        """
        system = _AUDIENCE_PROMPTS.get(audience, _AUDIENCE_PROMPTS["public"])

        user_parts: list[str] = []
        if context:
            user_parts.append(f"[Live data context]\n{context}\n")
        user_parts.append(question)
        user_content = "\n".join(user_parts)

        messages: list[dict[str, str]] = [
            {"role": "system", "content": system},
        ]
        if history:
            for msg in history[-10:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_content})

        return await self._chat(messages)

    async def answer_question(
        self,
        question: str,
        city: str | None = None,
        metrics: dict[str, float] | None = None,
        ehri: float | None = None,
        history: list[dict[str, str]] | None = None,
    ) -> tuple[str, str]:
        """Return (answer, mode). Legacy chat endpoint.

        Mode 1 – city-grounded (metrics + EHRI injected into prompt).
        Mode 2 – general environmental-health Q&A.
        """
        if city and metrics and ehri is not None:
            context = (
                f"City: {city}\n"
                f"PM2.5: {metrics.get('PM2.5')}\n"
                f"Temperature: {metrics.get('Temperature')}\n"
                f"Humidity: {metrics.get('Humidity')}\n"
                f"PopulationDensity: {metrics.get('PopulationDensity')}\n"
                f"EHRI Score: {ehri:.2f}\n\n"
                f"User question: {question}"
            )
            mode = "city_grounded"
        else:
            context = question
            mode = "general"

        messages: list[dict[str, str]] = [
            {"role": "system", "content": _SYSTEM_PROMPT},
        ]
        if history:
            for msg in history[-10:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if role in ("user", "assistant") and content:
                    messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": context})

        answer = await self._chat(messages)
        return answer, mode
