from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # API Configurations
    SUPABASE_URL: Optional[str] = "http://localhost:54321"
    SUPABASE_ANON_KEY: Optional[str] = "placeholder-anon-key"
    SUPABASE_JWT_SECRET: Optional[str] = None
    DATABASE_URL: Optional[str] = "postgresql://postgres:postgres@localhost:5432/postgres"

    GEMINI_API_KEY: Optional[str] = None

    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: Optional[str] = "whatsapp:+14155238886"
    NOMINATIM_USER_AGENT: Optional[str] = "UrbanPulse/1.0"

    # Environment
    ENV: str = "development"
    # Must be explicitly enabled — even in dev
    DEV_ALLOW_ANONYMOUS: bool = False
    DEV_ALLOW_DELETE: bool = False

    # Comma-separated list of allowed CORS origins
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
