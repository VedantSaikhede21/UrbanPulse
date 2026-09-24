from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator, model_validator
from typing import Optional


class Settings(BaseSettings):
    # API Configurations
    SUPABASE_URL: str = "http://localhost:54321"
    SUPABASE_ANON_KEY: str = "placeholder-anon-key"
    # Service-role key: bypasses RLS, used for backend-only operations
    # (Supabase Storage uploads with private buckets, pg_dump via
    # the supabase dashboard, etc.). MUST NEVER be sent to the browser —
    # the frontend gets only the anon key via VITE_SUPABASE_ANON_KEY.
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/postgres"

    # Storage bucket for media uploads (citizen photos, voice notes,
    # Twilio rehosted images). When empty, the backend uses a local
    # filesystem fallback so a developer with no Supabase project can
    # still demo end-to-end. When set, the backend uploads to this
    # Supabase Storage bucket and returns time-limited signed URLs.
    SUPABASE_STORAGE_BUCKET: str = ""

    GEMINI_API_KEY: Optional[str] = None

    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_NUMBER: str = "whatsapp:+14155238886"
    NOMINATIM_USER_AGENT: str = "UrbanPulse/1.0"

    # Sentry error tracking. When SENTRY_DSN is unset, init_sentry()
    # is a no-op — dev / CI never sends events. The DSN lives in
    # the secrets manager in staging and production, never in
    # the .env file that ships with the repo.
    SENTRY_DSN: Optional[str] = None
    # Default 10% keeps cost bounded; raise deliberately when
    # chasing a specific incident.
    SENTRY_TRACES_SAMPLE_RATE: float = 0.1

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

    # Environments that must behave like production for safety checks.
    # Both "production" and "staging" reject placeholder secrets at
    # import time and refuse to enable dev-bypass flags. "staging"
    # exists so a real staging deploy (separate DB, separate Twilio
    # number, real JWT) gets the same guardrails as prod without
    # requiring a separate config profile.
    PROD_LIKE_ENVS: tuple[str, ...] = ("production", "staging")

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
        """JWT secret must be set AND must be a real value in production-like envs.

        The bare presence check is not enough: an operator who copies
        `.env.example` to `.env` without filling in real values would
        otherwise boot the app with placeholder-secret as the JWT
        signing key, which silently breaks every authenticated
        request. Reject placeholder values explicitly in both
        production and staging (anything in `PROD_LIKE_ENVS`).
        """
        if self.ENV not in self.PROD_LIKE_ENVS:
            return self
        secret = self.SUPABASE_JWT_SECRET
        if not secret:
            raise ValueError(
                f"SUPABASE_JWT_SECRET is required when ENV={self.ENV!r}"
            )
        if secret == "placeholder-secret" or secret == "your-supabase-jwt-secret":
            raise ValueError(
                "SUPABASE_JWT_SECRET is set to a placeholder/example value. "
                "Configure a real JWT signing key from Supabase → Settings → "
                "API → JWT Secret before deploying."
            )
        return self

    @model_validator(mode="after")
    def _reject_placeholders_in_production(self) -> "Settings":
        """Refuse to boot any production-like env with placeholder secrets.

        This is a defense-in-depth pass on top of
        `_require_jwt_secret_in_prod`. Each optional secret has a default
        in `Settings` so dev/test can run without it; the same default
        must never reach a production-like build. Failure here means
        the process exits at import time with a list of every secret
        that still needs to be set — far better than a quiet
        half-working deploy.
        """
        if self.ENV not in self.PROD_LIKE_ENVS:
            return self

        placeholders = {
            "SUPABASE_URL": ("http://localhost:54321", "https://your-project.supabase.co"),
            "SUPABASE_ANON_KEY": ("placeholder-anon-key", "your-supabase-anon-key"),
        }
        problems: list[str] = []
        for field, bad_values in placeholders.items():
            value = getattr(self, field, None)
            if not value or value in bad_values:
                problems.append(
                    f"{field} is set to a placeholder ({value!r}). Configure a real value."
                )
        if problems:
            raise ValueError(
                f"Cannot boot ENV={self.ENV!r} with placeholder secrets:\n  - "
                + "\n  - ".join(problems)
            )
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
