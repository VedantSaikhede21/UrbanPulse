#!/usr/bin/env bash
# UrbanPulse — backup-and-restore round-trip test.
#
# This is the "tested restore procedure" the Production Readiness
# Roadmap Phase 2 calls for. It does the minimum useful verification:
#
#   1. Bring up a fresh, throwaway Postgres (the postgis image
#      from the local-db compose profile).
#   2. Apply alembic migrations + seed the demo data.
#   3. Snapshot row counts on the tables we care about.
#   4. Run scripts/backup_db.sh against the throwaway DB.
#   5. Wipe the throwaway DB and re-create it empty.
#   6. Run scripts/restore_db.sh against the same backup.
#   7. Snapshot row counts again. Assert they match the pre-backup
#      counts exactly.
#   8. Tear the throwaway DB down.
#
# Exits 0 on success, non-zero on any divergence. Used as the
# verification command for the "pg_dump backup with tested restore"
# slice of Phase 2; can be re-run any time as a CI smoke test.
#
# Usage:  bash scripts/backup-restore-test.sh
#
# Requires: docker compose v2, bash 4+, curl (for healthcheck
# wait — not strictly needed, kept for parity with docker-smoke.sh).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

BACKUP_DIR="$REPO_ROOT/backups/test-$$"
mkdir -p "$BACKUP_DIR"

PG_IMAGE="${BACKUP_PG_IMAGE:-postgis/postgis:16-3.4}"
CONTAINER="urbanpulse-bkrt-$$"
TARGET_DB_URL="postgresql://postgres:postgres@localhost:55432/postgres"
BACKUP_FILE=""

command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found in PATH" >&2; exit 2; }
docker compose version >/dev/null 2>&1 || { echo "ERROR: docker compose v2 not found" >&2; exit 2; }

# Color helpers, plain when not a TTY.
if [ -t 1 ]; then
  C_OK=$'\033[32m'; C_ERR=$'\033[31m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'
else
  C_OK=""; C_ERR=""; C_DIM=""; C_RST=""
fi
log()  { echo "${C_DIM}[bkrt]${C_RST} $*"; }
pass() { echo "${C_OK}[PASS]${C_RST} $*"; }
fail() { echo "${C_ERR}[FAIL]${C_RST} $*" >&2; cleanup; exit 1; }

cleanup() {
  log "tearing down throwaway database $CONTAINER"
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
    rm -f "$BACKUP_FILE"
  fi
  rmdir "$BACKUP_DIR" 2>/dev/null || true
}
trap cleanup EXIT

# 1. Bring up a fresh Postgres on a non-default port so we never
# collide with the dev local-db profile.
log "starting throwaway Postgres ($CONTAINER) on :55432"
docker run -d --rm \
  --name "$CONTAINER" \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=postgres \
  -p 55432:5432 \
  "$PG_IMAGE" >/dev/null

# Wait for it to be ready. `pg_isready` would be nice but is not
# in the image's default PATH; SELECT 1 against the DB is the
# universally available check.
deadline=$((SECONDS + 60))
ready=0
while [ $SECONDS -lt $deadline ]; do
  if docker exec "$CONTAINER" \
      psql -U postgres -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
[ $ready -eq 1 ] || fail "throwaway DB did not become ready in 60s"

# 2. Apply migrations + seed. The seed script is idempotent and
# creates a small, known data set. seed_db() refuses to run unless
# ENV=development (defense against wiping a production DB by
# accident), so we set that for the subprocess only — we never
# let that env var leak back to the host.
log "applying migrations + seed against throwaway DB"
export DATABASE_URL="$TARGET_DB_URL"
(
  cd backend
  export ENV=development
  # load_dotenv is not used; Settings reads the live process env.
  # The .env file is NOT sourced — DATABASE_URL was exported above.
  alembic upgrade head
) >/dev/null
(
  cd backend
  export ENV=development
  python -c "from app.db.seed import seed_db; seed_db()"
) >/dev/null

# 3. Snapshot row counts.
snapshot() {
  docker exec "$CONTAINER" \
    psql -U postgres -d postgres -tA -F'|' -c "$1"
}

counts_before=$(snapshot "
  SELECT 'tickets', COUNT(*) FROM tickets
  UNION ALL SELECT 'officers', COUNT(*) FROM officers
  UNION ALL SELECT 'departments', COUNT(*) FROM departments
  UNION ALL SELECT 'citizens', COUNT(*) FROM citizens
  UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
")
log "row counts before backup:"
echo "$counts_before" | sed 's/^/    /'

# 4. Backup.
log "running backup_db.sh"
bash scripts/backup_db.sh "$BACKUP_DIR" >/dev/null
BACKUP_FILE=$(ls -1 "$BACKUP_DIR"/urbanpulse-*.dump | head -n 1)
[ -n "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ] || fail "backup file not produced or empty"
pass "backup produced: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"

# 5. Wipe the throwaway DB and re-create it empty.
log "wiping throwaway DB and re-creating empty"
docker exec "$CONTAINER" \
  psql -U postgres -d postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" >/dev/null
# Re-enable extensions the schema assumes; alembic will skip these
# on the second upgrade only if they already exist, so we install
# them here.
docker exec "$CONTAINER" \
  psql -U postgres -d postgres -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"; CREATE EXTENSION IF NOT EXISTS postgis;" >/dev/null

# 6. Restore from the .dump.
log "running restore_db.sh (into throwaway DB)"
bash scripts/restore_db.sh "$BACKUP_FILE" "$TARGET_DB_URL" >/dev/null 2>&1 \
  || fail "restore_db.sh exited non-zero"

# 7. Snapshot row counts again. They MUST match.
counts_after=$(snapshot "
  SELECT 'tickets', COUNT(*) FROM tickets
  UNION ALL SELECT 'officers', COUNT(*) FROM officers
  UNION ALL SELECT 'departments', COUNT(*) FROM departments
  UNION ALL SELECT 'citizens', COUNT(*) FROM citizens
  UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
")
log "row counts after restore:"
echo "$counts_after" | sed 's/^/    /'

if [ "$counts_before" != "$counts_after" ]; then
  echo "$counts_before" > /tmp/urbanpulse-bkrt-before.txt
  echo "$counts_after"  > /tmp/urbanpulse-bkrt-after.txt
  fail "row counts diverged (before=/tmp/urbanpulse-bkrt-before.txt after=/tmp/urbanpulse-bkrt-after.txt)"
fi
pass "row counts match before/after restore"

# Bonus check: alembic_version survived. Without this, a restore
# that dropped alembic_version would still pass the row-count
# check above (alembic_version is one row, the seed doesn't touch
# it, so before==after trivially), and a future migration would
# blow up because alembic thinks the schema is at head.
ver=$(snapshot "SELECT version_num FROM alembic_version LIMIT 1")
if [ -z "$ver" ]; then
  fail "alembic_version was not restored"
fi
pass "alembic_version restored: $ver"

log "backup-restore round-trip OK"
