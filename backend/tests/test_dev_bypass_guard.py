"""Build-time / import-time guards against the DEV_ALLOW_ANONYMOUS bypass.

The dev anonymous-sudo toggle (`DEV_ALLOW_ANONYMOUS=True`) grants any
unauthenticated caller super_admin privileges via
`backend/app/auth/deps.py:_resolve_user`. Leaving it on in any
non-development build turns the entire API into a publicly-writable
admin terminal. These tests assert the validator in `app.config.Settings`
refuses to construct a settings object in that combination, so a
misconfigured deploy fails at import time before the process can serve
traffic.

The validator is checked here directly with in-memory settings (no
.env), so these tests do not require a live database or JWT secret.
"""
import pytest
from pydantic import ValidationError

from app.config import Settings


def _settings(**overrides) -> Settings:
    """Build a Settings instance with explicit env, no .env fallback."""
    return Settings(_env_file=None, **overrides)


class TestDevBypassRefusedInNonDev:
    def test_production_with_anonymous_bypass_raises(self):
        with pytest.raises(ValidationError) as exc:
            _settings(ENV="production", DEV_ALLOW_ANONYMOUS=True)
        assert "DEV_ALLOW_ANONYMOUS" in str(exc.value)

    def test_staging_with_anonymous_bypass_raises(self):
        with pytest.raises(ValidationError) as exc:
            _settings(ENV="staging", DEV_ALLOW_ANONYMOUS=True)
        assert "DEV_ALLOW_ANONYMOUS" in str(exc.value)

    @pytest.mark.parametrize("env", ["production", "staging", "test", "preview"])
    def test_any_non_development_env_with_bypass_raises(self, env):
        with pytest.raises(ValidationError):
            _settings(ENV=env, DEV_ALLOW_ANONYMOUS=True)


class TestDevBypassPermittedInDevelopment:
    def test_development_with_anonymous_bypass_allowed(self):
        s = _settings(ENV="development", DEV_ALLOW_ANONYMOUS=True)
        assert s.ENV == "development"
        assert s.DEV_ALLOW_ANONYMOUS is True


class TestBypassOffIsAlwaysSafe:
    @pytest.mark.parametrize("env", ["development", "staging", "production", "test"])
    def test_bypass_off_in_any_env(self, env):
        # production also requires SUPABASE_JWT_SECRET (different validator);
        # supply it so the anonymous-bypass check is the only one exercised.
        s = _settings(ENV=env, DEV_ALLOW_ANONYMOUS=False,
                      SUPABASE_JWT_SECRET="dummy-secret-for-test")
        assert s.DEV_ALLOW_ANONYMOUS is False
        assert s.ENV == env


class TestExistingAppModuleRefusesMisconfig:
    """Smoke-test that re-importing the live settings module also fails.

    settings is built at import time from the real environment. We can't
    override it post-hoc through Pydantic, so this test only covers the
    happy path (settings loaded successfully with the current env). The
    matrix above covers the rejection paths directly via the validator.
    """

    def test_live_settings_loaded(self):
        from app.config import settings  # noqa: F401
        assert settings.ENV in {"development", "staging", "production", "test", "preview"}
        # The import-time validator must not have raised. The current
        # .env is dev with bypass off, so this holds.
        assert settings.DEV_ALLOW_ANONYMOUS is False or settings.ENV == "development"
