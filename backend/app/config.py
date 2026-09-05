from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from typing import Optional


class Settings(BaseSettings):
    # API Configurations
    SUPABASE_URL: str = "http://localhost:54321"
    SUPABASE_ANON_KEY: str = "placeholder-anon-key"
    SUPABASE_JWT_SECRET: Optional[str] = None
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/postgres"

    GEMINI_API_KEY: Optional[str] = None

    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"
    NOMINATIM_USER_AGENT: str = "UrbanPulse/1.0"

    # Environment
    ENV: str = "development"
    # Must be explicitly enabled — even in dev
    DEV_ALLOW_ANONYMOUS: bool = False
    DEV_ALLOW_DELETE: bool = False

    # Comma-separated list of allowed CORS origins
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"

    # Rate-limiter storage. When set (e.g. redis://redis:6379/0), all
    # backend instances share a single rate-limit counter store, which is
    # required for horizontal scale. When unset, the limiter falls back to
    # in-process memory — fine for single-instance dev, but counts reset on
    # restart and do not span multiple workers.
    REDIS_URL: Optional[str] = None

    @field_validator("ALLOWED_ORIGINS", mode="after")
    @classmethod
    def _validate_cors_origins(cls, v: str) -> str:
        """Ensure CORS origins are not wildcard in production."""
        # Note: we can't access other fields in field_validator easily,
        # but we check for wildcard which is never acceptable
        if "*" in v:
            raise ValueError("CORS wildcard '*' not allowed - use explicit origins")
        return v

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", mode="after")
    @classmethod
    def _empty_to_none(cls, v: Optional[str]) -> Optional[str]:
        """Convert empty strings to None so they're properly unset."""
        if v == "":
            return None
        return v

    @model_validator(mode="after")
    def _require_jwt_secret_in_prod(self) -> "Settings":
        """JWT secret is required in production."""
        if self.ENV == "production" and not self.SUPABASE_JWT_SECRET:
            raise ValueError("SUPABASE_JWT_SECRET is required in production")
        return self

    @model_validator(mode="after")
    def _refuse_dev_bypass_outside_development(self) -> "Settings":
        """Refuse to load if a dev-only bypass is enabled outside development.

        The `DEV_ALLOW_ANONYMOUS` flag grants any unauthenticated caller
        super_admin privileges. Leaving it on in a non-dev build turns the
        entire API into a publicly-writable admin terminal — a worse failure
        mode than a hard crash. Fail fast at import time so a misconfigured
        deploy never reaches the network.
        """
        if self.ENV != "development" and self.DEV_ALLOW_ANONYMOUS:
            raise ValueError(
                "DEV_ALLOW_ANONYMOUS is set to True but ENV is "
                f"{self.ENV!r}. The anonymous-sudo bypass must never be "
                "enabled in staging or production. Set ENV=development or "
                "DEV_ALLOW_ANONYMOUS=False."
            )
        return self

    @property
    def twilio_configured(self) -> bool:
        """Check if Twilio credentials are fully configured."""
        return bool(self.TWILIO_ACCOUNT_SID and self.TWILIO_AUTH_TOKEN)

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse ALLOWED_ORIGINS into a list, filtering empty values."""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()
