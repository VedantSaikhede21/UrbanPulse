"""Write a persistent snapshot of the demo dataset to the repo (qa/backups/).

The geography migration kept its rollback copy in the container's /tmp, which is
wiped whenever the container is recreated — the copy did not survive. This
script writes the CURRENT, verified state to a path that persists on the host so
any later data edit has a real rollback point.

Read-only: it only SELECTs. No --apply, nothing is mutated.
"""

import json
import os
import pathlib
import sys
from datetime import datetime, timezone

from sqlalchemy import text

from app.db.session import SessionLocal

# The container's /app is read-only, so default to a writable dir and let the
# caller redirect it. Output is copied to the host repo afterwards.
OUT_DIR = pathlib.Path(os.environ.get("SNAPSHOT_DIR", "/tmp/urbanpulse-snapshots"))

TABLES = {
    "tickets": "id, category, status, description, latitude, longitude, priority_score",
    "officers": "id, name, role, department, is_active",
    "wards": "id, name, uhs_score",
}


def _plain(value):
    """UUID / datetime / Decimal -> JSON-safe primitives."""
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def main() -> int:
    db = SessionLocal()
    try:
        payload = {
            "snapshot_at": datetime.now(timezone.utc).isoformat(),
            "tables": {},
        }
        for table, cols in TABLES.items():
            try:
                rows = db.execute(text(f"select {cols} from {table}")).mappings().all()
            except Exception as exc:  # table may not exist in every environment
                payload["tables"][table] = {"error": str(exc)[:200]}
                continue
            payload["tables"][table] = [
                {k: _plain(v) for k, v in dict(r).items()}
                for r in rows
            ]

        OUT_DIR.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        path = OUT_DIR / f"demo-data-snapshot-{stamp}.json"
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

        print(f"snapshot written: {path}")
        for table, rows in payload["tables"].items():
            if isinstance(rows, list):
                print(f"  {table:9} {len(rows)} rows")
            else:
                print(f"  {table:9} unavailable ({rows.get('error', 'unknown')})")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
