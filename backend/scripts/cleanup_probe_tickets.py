"""Remove the QA probe tickets and restore the ward UHS they depressed.

Each triage run applies a real UHS penalty (analytics_agent), so the probe
tickets dropped "Vashi & Nerul" from 92.2 to the low 80s. The probe rows are
safe to delete: they are identified by the fixed probe description, they were
created by qa/submit_probe_ticket.mjs, and none of them are referenced by a
closure or an audit entry a human would look at.

Dry run by default. Pass --apply to write.
"""

import argparse
import re
import sys

from sqlalchemy import text

from app.db.session import SessionLocal

# The exact description the probe script posts.
PROBE_TEXT = ("Large water pipeline burst on the main road near the station, "
              "water is pooling across the road and vehicles are splashing "
              "pedestrians.")

# The UHS each ward held before the probe tickets existed.
TARGET_UHS = {"Vashi & Nerul": 92.2}

# Children that must not outlive a deleted ticket. Verified against
# information_schema: agent_logs and notifications are the only tables with a
# ticket_id column.
DEPENDENT_TABLES = {
    "notifications": "ticket_id",
    "agent_logs": "ticket_id",
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    db = SessionLocal()
    try:
        # 1. find the probe rows
        probes = db.execute(
            text("select id, category, status, created_at, processing_state"
                 " from tickets where description = :d order by created_at"),
            {"d": PROBE_TEXT},
        ).fetchall()
        ids = [r.id for r in probes]

        print(f"== PLAN ({'APPLYING' if args.apply else 'DRY RUN'}) ==")
        print(f"\nprobe tickets to delete: {len(ids)}")
        for r in probes:
            print(f"  {str(r.id)[:8]}  {r.category:20} {r.status:12} {r.created_at}")

        # 2. dependent rows that go with them
        print("\ndependent rows to delete:")
        total_dep = 0
        for table, col in DEPENDENT_TABLES.items():
            if not ids:
                break
            n = db.execute(
                text(f"select count(*) from {table} where {col} = any(:ids)"),
                {"ids": ids},
            ).scalar()
            total_dep += n or 0
            print(f"  {table:16} {n or 0}")

        # 3. UHS before/after
        print("\nward UHS:")
        ward_rows = db.execute(
            text("select id, name, uhs_score from wards order by name")
        ).fetchall()
        for w in ward_rows:
            target = TARGET_UHS.get(w.name)
            drift = (target - float(w.uhs_score)) if target is not None else None
            note = ""
            if target is not None:
                note = f"  -> restore to {target} (drift {drift:+.1f})"
            print(f"  {w.name:22} {float(w.uhs_score):6.1f}{note}")

        if not args.apply:
            print("\ndry run — pass --apply to write")
            return 0

        # 4. delete dependents first, then the tickets
        for table, col in DEPENDENT_TABLES.items():
            if not ids:
                break
            res = db.execute(text(f"delete from {table} where {col} = any(:ids)"),
                             {"ids": ids})
            print(f"deleted {res.rowcount} from {table}")

        # Undo the duplicate links the probe tickets created against real rows.
        db.execute(
            text("update tickets set duplicate_of_id = null where duplicate_of_id = any(:ids)"),
            {"ids": ids},
        )
        res = db.execute(text("delete from tickets where id = any(:ids)"), {"ids": ids})
        print(f"deleted {res.rowcount} tickets")

        for w in ward_rows:
            target = TARGET_UHS.get(w.name)
            if target is None:
                continue
            db.execute(text("update wards set uhs_score = :t where id = :i"),
                       {"t": target, "i": w.id})
            print(f"restored {w.name} -> {target}")

        db.commit()

        print("\n=== final state ===")
        for w in db.execute(text("select name, uhs_score from wards order by name")):
            print(f"  {w.name:22} {float(w.uhs_score):6.1f}")
        n = db.execute(text("select count(*) from tickets")).scalar()
        stale = db.execute(
            text("select count(*) from tickets where description = :d"), {"d": PROBE_TEXT}
        ).scalar()
        print(f"  tickets total: {n}   probe rows left: {stale}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
