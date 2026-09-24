#!/usr/bin/env bash
# UrbanPulse — end-to-end Docker smoke test.
#
# Brings the full compose stack up from a clean build, waits for the
# backend healthcheck to return 200, hits one public endpoint, then
# tears the stack down. Exits non-zero on any failure.
#
# Usage:  bash scripts/docker-smoke.sh
#
# Requires:  docker compose (v2), curl, jq
#            Docker Desktop must be running locally; the script does
#            not start it for you.
#
# What it does NOT verify:
#   - Real Supabase connectivity (the .env here points at a real
#     Supabase project; if the project is paused, the backend
#     /api/health/ready check will 503)
#   - Frontend browser flow (Playwright is the right tool for that)
#   - Multi-instance / load behavior (Phase 5 work)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

BACKEND_PORT="${BACKEND_PORT:-8000}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-90}"   # seconds to wait for /api/health/ready
COMPOSE_PROFILES="${COMPOSE_PROFILES:-}" # e.g. "local-db" to bring up the bundled Postgres

# Color helpers, but only if stdout is a TTY (so CI logs stay plain).
if [ -t 1 ]; then
  C_OK=$'\033[32m'; C_ERR=$'\033[31m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'
else
  C_OK=""; C_ERR=""; C_DIM=""; C_RST=""
fi
log()  { echo "${C_DIM}[smoke]${C_RST} $*"; }
pass() { echo "${C_OK}[PASS]${C_RST} $*"; }
fail() { echo "${C_ERR}[FAIL]${C_RST} $*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || fail "docker not found in PATH"
docker compose version >/dev/null 2>&1 || fail "docker compose v2 not found (need 'docker compose', not 'docker-compose')"
command -v curl   >/dev/null 2>&1 || fail "curl not found in PATH"
command -v jq     >/dev/null 2>&1 || fail "jq not found in PATH"

# Compose up. --build forces a fresh image so the smoke catches a
# broken Dockerfile as well as a broken app.
log "docker compose up --build ${COMPOSE_PROFILES:+--profile $COMPOSE_PROFILES}"
docker compose up -d --build $COMPOSE_PROFILES

cleanup() {
  log "docker compose down -v"
  docker compose down -v >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Wait for /api/health/ready to return 200 (or any 2xx). The compose
# healthcheck already polls this, but a fresh image can be slower than
# the 5-retry window, so we wait explicitly.
log "waiting up to ${HEALTH_TIMEOUT}s for http://localhost:${BACKEND_PORT}/api/health/ready"
deadline=$((SECONDS + HEALTH_TIMEOUT))
ready=0
while [ $SECONDS -lt $deadline ]; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${BACKEND_PORT}/api/health/ready" || echo "000")
  if [ "$code" = "200" ]; then
    ready=1
    break
  fi
  sleep 2
done
[ $ready -eq 1 ] || fail "backend never became ready (last code: $code)"
pass "backend /api/health/ready → 200"

# Public geospatial endpoint — should return a JSON array, even if empty.
log "GET /api/tickets/near?latitude=12.97&longitude=77.59&radius_meters=2000"
resp=$(curl -s -w "\n%{http_code}" "http://localhost:${BACKEND_PORT}/api/tickets/near?latitude=12.97&longitude=77.59&radius_meters=2000")
code=$(echo "$resp" | tail -n 1)
body=$(echo "$resp" | sed '$d')
[ "$code" = "200" ] || fail "nearby-tickets returned HTTP $code: $body"
echo "$body" | jq -e 'type == "array"' >/dev/null \
  || fail "nearby-tickets did not return a JSON array: $body"
pass "nearby-tickets returned a JSON array"

# CORS sanity — allowed origin in .env.example is http://localhost;
# the response should reflect that and not the wildcard.
log "OPTIONS /api/tickets/near with Origin: http://localhost"
cors_origin=$(curl -s -i -X OPTIONS \
  -H "Origin: http://localhost" \
  -H "Access-Control-Request-Method: GET" \
  "http://localhost:${BACKEND_PORT}/api/tickets/near" \
  | tr -d '\r' | grep -i '^access-control-allow-origin:' || true)
echo "${cors_origin:-<header missing>}"
case "$cors_origin" in
  *"access-control-allow-origin: http://localhost"*|*"Access-Control-Allow-Origin: http://localhost"*)
    pass "CORS reflects explicit allowlist" ;;
  *) fail "CORS allow-origin is not the configured allowlist" ;;
esac

# Auth gate — an unauthenticated POST to /api/tickets must 401, never
# 200/201. This is the cheapest check that the dev-bypass is OFF in
# production builds.
log "POST /api/tickets without Authorization header (expect 401)"
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"category":"x","latitude":12.97,"longitude":77.59}' \
  "http://localhost:${BACKEND_PORT}/api/tickets")
[ "$code" = "401" ] || fail "expected 401 from /api/tickets without auth, got $code"
pass "/api/tickets rejects unauthenticated POST (401)"

log "smoke complete"
