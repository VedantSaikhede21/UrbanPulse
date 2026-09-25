"""Build a Railway-ready variables file from the local .env.

The DATABASE_URL is rewritten to Supabase's IPv4 **session pooler**. The local
value points at db.<ref>.supabase.co, which Supabase publishes as IPv6-only, so
a container on a host without IPv6 egress can never connect to it. The pooler
also requires the username to be `postgres.<project-ref>` rather than `postgres`.

The password is carried over from the local .env so it cannot be mistyped, and
the result is written OUTSIDE the repo (to temp) so the secret never lands in
the working tree or in chat.
"""

import os
import pathlib
import re
import sys

REPO = pathlib.Path(__file__).resolve().parent.parent  # repo root, not qa/
SRC = REPO / ".env"
DST = pathlib.Path(os.environ["TEMP"]) / "opencode" / "railway-backend.env"

NEW_HOST = "aws-1-ap-northeast-2.pooler.supabase.com"
NEW_PORT = "5432"
NEW_USER = "postgres.lppdrsgqppyfcstrpksg"
DB_NAME = "postgres"

# Keys the backend service needs. VITE_* / *_PORT belong to Compose and Vercel;
# TWILIO_* is empty and unused for this deploy.
KEEP = [
    "ENV",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_JWT_SECRET",
    "GEMINI_API_KEY",
]


def load_pairs(path: pathlib.Path) -> dict:
    pairs = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        pairs[k.strip()] = v.strip()
    return pairs


def main() -> int:
    src = load_pairs(SRC)
    old_url = src.get("DATABASE_URL", "")
    m = re.match(r"^postgres(?:ql)?://([^:]+):(.+)@([^/]+)/(.+)$", old_url)
    if not m:
        print("ERROR: could not parse the local DATABASE_URL", file=sys.stderr)
        return 1
    _old_user, password, _old_host, _old_db = m.groups()

    out = {k: src[k] for k in KEEP if src.get(k)}
    out["DATABASE_URL"] = (
        f"postgresql://{NEW_USER}:{password}@{NEW_HOST}:{NEW_PORT}/{DB_NAME}"
    )
    out["PORT"] = "8080"
    out["REDIS_URL"] = "${{ redis.REDIS_URL }}"
    out["ALLOWED_ORIGINS"] = "https://placeholder.vercel.app"
    out["NOMINATIM_USER_AGENT"] = "UrbanPulse/1.0 (set-your-email@example.com)"

    DST.parent.mkdir(parents=True, exist_ok=True)
    body = "\n".join(f"{k}={v}" for k, v in out.items())
    DST.write_text(body + "\n", encoding="utf-8")

    # Report keys and a redacted URL only. The password is never printed.
    print(f"written: {DST}")
    print(f"keys ({len(out)}): {', '.join(out)}\n")
    redacted = re.sub(r"://[^:]+:[^@]+@", "://***:***@", out["DATABASE_URL"])
    print(f"DATABASE_URL -> {redacted}")
    missing = [k for k in ("SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_JWT_SECRET",
                           "GEMINI_API_KEY") if k not in out]
    print(f"missing from local .env: {missing or 'none'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
