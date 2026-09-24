#!/usr/bin/env bash
# UrbanPulse — PostgreSQL logical restore (pg_restore).
#
# The production-shaped counterpart to backup_db.sh. Runs
# `pg_restore` inside the postgis image so the host does not need
# pg_restore installed.
#
# Usage:  bash scripts/restore_db.sh <backup_file> [target_database_url]
#   backup_file: absolute or repo-relative path to a .dump produced
#                by backup_db.sh.
#   target_database_url: defaults to DATABASE_URL. Pass an explicit
#                value when restoring into a throwaway test DB
#                (this is what the restore-test script does).
#
# Safety:
#   - Refuses to run if the target URL matches the one used to
#     produce the backup AND the caller did not pass
#     --force-restore-into-live. This prevents the obvious foot-gun
#     of restoring on top of a healthy prod DB by accident.
#   - Uses --clean --if-exists so the restore is idempotent
#     against a target that already has the schema.
#
# Exit codes:
#   0  — restore completed (warnings from pg_restore are not fatal)
#   1  — usage / missing file
#   2  — docker not available
#   3  — pg_restore failed
#   4  — refused because target equals source without --force flag

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file> [target_database_url] [--force-restore-into-live]" >&2
  exit 1
fi

BACKUP_FILE="$1"
shift

TARGET_URL="${DATABASE_URL:-}"
FORCE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --force-restore-into-live) FORCE=1; shift ;;
    --) shift; break ;;
    *)
      if [ -z "$TARGET_URL" ] || [ "$TARGET_URL" = "${DATABASE_URL:-}" ]; then
        TARGET_URL="$1"
      fi
      shift ;;
  esac
done

# Load DATABASE_URL from .env if missing.
if [ -z "$TARGET_URL" ] && [ -f .env ]; then
  TARGET_URL=$(grep -E '^DATABASE_URL=' .env | head -n 1 | cut -d '=' -f 2- | tr -d '"' | tr -d "'") || true
fi

: "${TARGET_URL:?target DATABASE_URL is required}"

# Resolve backup file path. Reject obviously bogus inputs.
case "$BACKUP_FILE" in
  /*) resolved="$BACKUP_FILE" ;;
  *)  resolved="$REPO_ROOT/$BACKUP_FILE" ;;
esac
if [ ! -f "$resolved" ]; then
  echo "ERROR: backup file $resolved does not exist" >&2
  exit 1
fi

# Same-URL safety: if the target and the original (still in env, or
# the same .env) match, refuse unless --force is set. We do not
# store the source URL inside the .dump, so we compare against the
# current .env DATABASE_URL.
SOURCE_URL=""
if [ -f .env ]; then
  SOURCE_URL=$(grep -E '^DATABASE_URL=' .env | head -n 1 | cut -d '=' -f 2- | tr -d '"' | tr -d "'") || true
fi
if [ -n "$SOURCE_URL" ] && [ "$SOURCE_URL" = "$TARGET_URL" ] && [ "$FORCE" -ne 1 ]; then
  echo "ERROR: target URL matches the .env DATABASE_URL. Refusing to restore" >&2
  echo "       on top of the live database. Pass --force-restore-into-live" >&2
  echo "       to override (you should almost never need to)." >&2
  exit 4
fi

command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found in PATH" >&2; exit 2; }

PG_IMAGE="${BACKUP_PG_IMAGE:-postgis/postgis:16-3.4}"
docker image inspect "$PG_IMAGE" >/dev/null 2>&1 || docker pull "$PG_IMAGE" >/dev/null

BACKUP_DIR=$(dirname "$resolved")
BACKUP_BASENAME=$(basename "$resolved")

echo "[restore] target=$TARGET_URL"
echo "[restore] source=$resolved"

# --clean --if-exists drops existing objects before recreating
# them, so re-restoring the same .dump is a no-op rather than a
# duplicate-object error. --no-owner --no-acl matches the backup
# settings so the restore does not depend on the source role
# existing on the target.
if ! docker run --rm \
    --network host \
    -v "$BACKUP_DIR:/backup" \
    -e PGPASSWORD="" \
    "$PG_IMAGE" \
    pg_restore \
      --clean --if-exists \
      --no-owner --no-acl \
      --dbname="$TARGET_URL" \
      "/backup/$BACKUP_BASENAME"; then
  echo "ERROR: pg_restore returned non-zero" >&2
  exit 3
fi

echo "[restore] OK"
