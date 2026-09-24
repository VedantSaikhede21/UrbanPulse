"""Production secrets validator tests.

These tests build a `Settings` instance with each combination of real
vs placeholder secret values and assert the validator's response:

- A production build with any placeholder secret must raise.
- A development build with placeholders must load (dev is allowed to
  run on local placeholders).
- A production build with real, non-placeholder values must load.

A separate test confirms `.env` is not tracked in git, so a leaked
local file cannot be the deployment.
"""
import subprocess
from pathlib import Path

import pytest
from pydantic import ValidationError

from app.config import Settings


REPO_ROOT = Path(__file__).resolve().parents[2]


def _settings(**overrides) -> Settings:
    return Settings(_env_file=None, **overrides)


_REAL_JWT = "v_real_supabase_jwt_secret_at_least_32_chars_long_for_hs256"
_REAL_URL = "https://abcd1234.supabase.co"
_REAL_ANON = "eyJhbGciOiJIUzI1NiJ9.real-anon-key-not-placeholder"


class TestJwtSecretInProduction:
    def test_production_with_real_jwt_loads(self):
        s = _settings(
            ENV="production",
            SUPABASE_JWT_SECRET=_REAL_JWT,
            SUPABASE_URL=_REAL_URL,
            SUPABASE_ANON_KEY=_REAL_ANON,
        )
        assert s.SUPABASE_JWT_SECRET == _REAL_JWT

    def test_production_with_empty_jwt_rejected(self):
        with pytest.raises(ValidationError) as exc:
            _settings(ENV="production", SUPABASE_JWT_SECRET="")
        assert "SUPABASE_JWT_SECRET" in str(exc.value)

    @pytest.mark.parametrize("placeholder", ["placeholder-secret", "your-supabase-jwt-secret"])
    def test_production_with_placeholder_jwt_rejected(self, placeholder):
        with pytest.raises(ValidationError) as exc:
            _settings(ENV="production", SUPABASE_JWT_SECRET=placeholder)
        assert "SUPABASE_JWT_SECRET" in str(exc.value)
        assert "placeholder" in str(exc.value).lower()


class TestOtherPlaceholdersInProduction:
    def test_placeholder_supabase_url_rejected(self):
        with pytest.raises(ValidationError) as exc:
            _settings(
                ENV="production",
                SUPABASE_JWT_SECRET=_REAL_JWT,
                SUPABASE_URL="https://your-project.supabase.co",
                SUPABASE_ANON_KEY=_REAL_ANON,
            )
        assert "SUPABASE_URL" in str(exc.value)

    def test_placeholder_anon_key_rejected(self):
        with pytest.raises(ValidationError) as exc:
            _settings(
                ENV="production",
                SUPABASE_JWT_SECRET=_REAL_JWT,
                SUPABASE_URL=_REAL_URL,
                SUPABASE_ANON_KEY="your-supabase-anon-key",
            )
        assert "SUPABASE_ANON_KEY" in str(exc.value)

    def test_default_anon_key_rejected(self):
        """The Pydantic default `placeholder-anon-key` is a stand-in
        that should never ship to production."""
        with pytest.raises(ValidationError) as exc:
            _settings(
                ENV="production",
                SUPABASE_JWT_SECRET=_REAL_JWT,
                SUPABASE_URL=_REAL_URL,
                # SUPABASE_ANON_KEY omitted -> default kicks in
            )
        assert "SUPABASE_ANON_KEY" in str(exc.value)


class TestDevelopmentIsPermissive:
    @pytest.mark.parametrize("env", ["development", "test", "preview"])
    def test_placeholders_allowed_outside_production_like(self, env):
        # Production-like envs (production, staging) reject placeholder
        # secrets at import time. True dev/test envs (development,
        # test, preview) are allowed to use placeholders for local work.
        s = _settings(ENV=env, SUPABASE_JWT_SECRET="placeholder-secret")
        assert s.ENV == env

    @pytest.mark.parametrize("env", ["production", "staging"])
    def test_placeholders_rejected_in_production_like(self, env):
        # staging joined production in the strict-env class. A real
        # staging deploy is supposed to have real secrets; refusing to
        # boot on a placeholder is the correct behavior.
        with pytest.raises(ValidationError) as exc:
            _settings(ENV=env, SUPABASE_JWT_SECRET="placeholder-secret")
        assert "SUPABASE_JWT_SECRET" in str(exc.value)


class TestEnvFileNotCommitted:
    """The whole point of `.env.example` + `.gitignore` is that real
    secrets never reach the repo. This test guards against an operator
    accidentally `git add -f .env`-ing the file."""

    def test_dotenv_is_gitignored(self):
        # `git check-ignore` exits 0 when the path is ignored.
        result = subprocess.run(
            ["git", "check-ignore", "backend/.env", ".env"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        # At least one of the two paths must be ignored; in this repo
        # both are (see .gitignore).
        assert result.returncode == 0, (
            f"Neither backend/.env nor .env is gitignored. "
            f"stderr: {result.stderr}"
        )

    def test_dotenv_not_tracked(self):
        # `git ls-files` returns nothing for a properly-ignored file.
        result = subprocess.run(
            ["git", "ls-files", "--error-unmatch", "backend/.env"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        assert result.returncode != 0, (
            "backend/.env is tracked by git. Remove it from the index "
            "and add a .gitignore rule — committing real secrets to a "
            "repo is a P0 incident."
        )
