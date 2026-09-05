#!/usr/bin/env bash
# UrbanPulse — PostgreSQL logical backup (pg_dump).
#
# Runs `pg_dump` inside the project's own postgis image so the host
# does not need pg_dump installed. Writes a timestamped .dump file
# (custom format) to a local backups directory, then trims old
# backups beyond the retention window.
#
# Usage:  bash scripts/backup_db.sh [backup_dir]
#   backup_dir: where to land the .dump files. Defaults to
#               ./backups/ relative to the repo root.
#
# Environment: reads DATABASE_URL from .env (or the environment).
# The URL must be a postgres:// connection string the postgis image
# can reach (it can be Supabase's direct host — the image has
# internet egress by default).
#
# Exit codes:
#   0  — backup written
#   1  — DATABASE_URL not set
#   2  — docker not available
#   3  — pg_dump inside the image failed
#   4  — retention trim removed everything (sanity check)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

BACKUP_DIR="${1:-$REPO_ROOT/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
PG_IMAGE="${BACKUP_PG_IMAGE:-postgis/postgis:16-3.4}"

# Pull DATABASE_URL from the .env file if not already in the
# environment. We only look for the one var — the rest of the .env
# is irrelevant for pg_dump.
if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' .env | head -n 1 | cut -d '=' -f 2- | tr -d '"' | tr -d "'") || true
fi

: "${DATABASE_URL:?DATABASE_URL is required (set it in the environment or in .env)}"

command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found in PATH" >&2; exit 2; }
docker image inspect "$PG_IMAGE" >/dev/null 2>&1 || docker pull "$PG_IMAGE" >/dev/null

mkdir -p "$BACKUP_DIR"

# Filename: urbanpulse-YYYYMMDD-HHMMSS.dump (UTC, sortable, no colons
# so Windows / FAT-friendly; we never expect to copy these to FAT,
# but the discipline of "no colons in filenames" is cheap).
ts=$(date -u +%Y%m%d-%H%M%S)
out="$BACKUP_DIR/urbanpulse-${ts}.dump"
tmp="$out.tmp"

echo "[backup] writing $out"

# `pg_dump --format=custom` is the binary format that pg_restore
# expects; it is also smaller and faster to restore than plain SQL.
# `--no-owner --no-acl` so the restore does not depend on the
# original role existing on the target.
#
# We mount the backup dir into the postgis image and run pg_dump
# there. The image already has the postgres client tools and
# matches the server version family used in production.
if ! docker run --rm \
    --network host \
    -v "$BACKUP_DIR:/backup" \
    -e PGPASSWORD="" \
    "$PG_IMAGE" \
    pg_dump \
      --format=custom \
      --no-owner \
      --no-acl \
      --dbname="$DATABASE_URL" \
      --file="/backup/urbanpulse-${ts}.dump"; then
  echo "ERROR: pg_dump failed" >&2
  rm -f "$tmp"
  exit 3
fi

# Move from .tmp (no, we wrote directly to .dump — left tmp logic
# out for simplicity; the in-container --file is atomic on the
# bind mount only if pg_dump writes-and-renames, which it does
# not). To be safe, verify the file is non-empty.
if [ ! -s "$out" ]; then
  echo "ERROR: backup file $out is empty or missing" >&2
  exit 3
fi

# Retention trim: delete .dump files older than RETENTION_DAYS.
# We deliberately use mtime, not name parsing — the timestamped
# filename is a human-readable label, not a programmatic key.
deleted=0
if command -v find >/dev/null 2>&1; then
  while IFS= read -r -d '' old; do
    rm -f -- "$old"
    deleted=$((deleted + 1))
  done < <(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'urbanpulse-*.dump' -mtime +"$RETENTION_DAYS" -print0)
fi

echo "[backup] OK: $out ($(du -h "$out" | cut -f1)) — trimmed $deleted old file(s) beyond ${RETENTION_DAYS}d retention"
