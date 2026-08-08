#!/bin/sh
# UrbanPulse backend entrypoint.
# Runs Alembic migrations (with retry while the DB warms up),
# then starts uvicorn. The `exec` keeps uvicorn as PID 1 so
# SIGTERM/SIGINT (docker stop) triggers graceful shutdown.
#
# Degraded mode: if the database is unreachable after the retry window
# (e.g. a Supabase outage), the backend still starts so the landing page,
# /api/health and static assets stay alive. Set FAIL_FAST_ON_DB_ERROR=1
# if you prefer the container to exit instead.
set -e

echo "[entrypoint] Running database migrations…"
i=0
until alembic upgrade head; do
  i=$((i+1))
  if [ "$i" -ge 12 ]; then
    echo "[entrypoint] WARNING: migrations failed after 12 attempts — database unreachable?" >&2
    if [ "${FAIL_FAST_ON_DB_ERROR:-0}" = "1" ]; then
      echo "[entrypoint] FAIL_FAST_ON_DB_ERROR=1 — exiting. Start the stack once the database is reachable." >&2
      exit 1
    fi
    echo "[entrypoint] Starting in DEGRADED mode — database-dependent APIs return 5xx until the DB is reachable."
    break
  fi
  echo "[entrypoint] Database not ready, retrying (attempt ${i}/12)…"
  sleep 5
done

if [ "$i" -eq 0 ]; then
  echo "[entrypoint] Migrations up to date."
else
  echo "[entrypoint] Migrations did not complete — starting uvicorn anyway (degraded mode)."
fi

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips "*"
