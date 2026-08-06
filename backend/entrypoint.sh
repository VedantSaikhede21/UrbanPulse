#!/bin/sh
# UrbanPulse backend entrypoint.
# Runs Alembic migrations (with retry while the DB warms up),
# then starts uvicorn. The `exec` keeps uvicorn as PID 1 so
# SIGTERM/SIGINT (docker stop) triggers graceful shutdown.
set -e

echo "[entrypoint] Running database migrations…"
i=0
until alembic upgrade head; do
  i=$((i+1))
  if [ "$i" -ge 12 ]; then
    echo "[entrypoint] ERROR: migrations failed after 12 attempts. Database unreachable?" >&2
    exit 1
  fi
  echo "[entrypoint] Database not ready, retrying (attempt ${i}/12)…"
  sleep 5
done
echo "[entrypoint] Migrations up to date."

exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips "*"
