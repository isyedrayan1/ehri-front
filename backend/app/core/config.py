from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "EHRI Backend"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    model_path: Path = Path("./risk_model.pkl")
    scaler_path: Path = Path("./scaler.pkl")
    feature_columns_path: Path = Path("./feature_columns.pkl")

    # External data APIs
    openaq_api_key: str = ""
    news_api_key: str = ""

    # LLM / Gemini
    gemini_api_key: str = ""
    llm_provider: str = "gemini"
    llm_api_key: str = ""
    llm_model: str = "gemini-2.0-flash"
    llm_base_url: str = "https://generativelanguage.googleapis.com/v1beta/openai"

    # Fallback LLM (OpenRouter)
    openrouter_api_key: str = ""
    openrouter_model: str = "google/gemini-2.0-flash-001"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"

    # Fallback LLM (Groq)
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    groq_base_url: str = "https://api.groq.com/openai/v1"

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # Rate limiting (requests per minute per IP)
    rate_limit_rpm: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
