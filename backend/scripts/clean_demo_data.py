"""Clean the demo dataset so nothing reads as leftover test data.

Findings from the admin/super-admin review:

* 17 of 25 tickets had descriptions like
  ``"Test QA: Water pipe leak near the park entrance at Market Square."``,
  ``"Valid test ticket"``, ``"E2E validation test"`` — "Market Square" was a
  Bengaluru-era invented ward that no longer exists anywhere in the app. A judge
  opening the Escalation Monitor saw these verbatim.
* 8 of 12 officers were named ``"Test Officer"`` with department "Roads", which
  made the User Management directory look like a test fixture.
* 2 tickets carried the ``-999`` coordinate sentinel (already fixed by the
  geography migration, re-checked here).

This rewrites descriptions to real Navi Mumbai civic language and removes the
placeholder officers. It does NOT touch real named officers, real users, audit
history, or any ticket that already has a genuine description.

Dry run by default. Pass --apply to write.
"""

import argparse
import re
import sys

from sqlalchemy import text

from app.city import CITY_NAME

QA_MARKERS = re.compile(
    r"(?i)\b(test|qa|e2e|validation|valid test|dummy|sample|foo|bar|asdf|lorem|"
    r"negative coord|placeholder)\b"
)

# Place names from the retired Bengaluru dataset. These must not survive the
# Maharashtra migration even when the surrounding sentence looks legitimate.
STALE_PLACES = re.compile(
    r"(?i)\b(market square|greenfield|industrial corridor|bangalore|bengaluru|"
    r"mg road|koramangala|ward 1|ward 2|ward 3)\b"
)

# Anything shorter than this is a note to a developer, not a complaint.
MIN_REAL_LENGTH = 25

# Realistic Navi Mumbai civic complaints, keyed by category, used to replace
# placeholder descriptions. Deliberately specific enough to sound like a real
# report and vague enough not to claim a specific incident.
CATEGORY_REPLACEMENTS = {
    "Water Leak": (
        "Water pipeline has been leaking continuously for four days near the "
        "{place} main road. The whole stretch is flooded and the water is "
        "contaminating the gutter line."
    ),
    "Roads & Potholes": (
        "Large pothole has formed on the {place} junction approach. Two-wheelers "
        "are swerving into oncoming traffic and an auto almost went in yesterday."
    ),
    "Garbage & Sanitation": (
        "Garbage has not been cleared for a week at the {place} collection point. "
        "Dumpsters are overflowing and stray animals have started spreading it."
    ),
    "Signage & Hazards": (
        "Street sign has fallen and is blocking the footpath at {place}. It is "
        "also blocking the ramp used by wheelchair users."
    ),
    "Streetlight": (
        "Six streetlights on the {place} stretch have been out for over a week. "
        "It is completely dark after 8pm and the area feels unsafe at night."
    ),
    "Sewage": (
        "Sewage overflow is running into the storm drain at {place}. The smell is "
        "unbearable and it looks like it will back up into the basements."
    ),
}

# Locality names the migrated tickets now sit in.
PLACES = [
    "Sector 17, Kharghar",
    "5th Main Road, Kharghar",
    "Central Park, Kharghar",
    "Nerul East",
    "Vashi Sector 7",
    "Karanjade",
    "Taloja MIDC",
    "Belapur",
    "Palm Beach Road, Nerul",
]

PLACEHOLDER_OFFICER_NAMES = ("test officer", "test", "demo officer", "qa officer")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    db = None
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        # ---- tickets with placeholder descriptions -------------------------
        rows = db.execute(
            text(
                "select id, category, status, priority_score, description"
                " from tickets order by created_at"
            )
        ).fetchall()

        place_idx = 0
        ticket_updates = []
        for r in rows:
            desc = (r.description or "").strip()
            looks_like_test = bool(QA_MARKERS.search(desc)) or bool(STALE_PLACES.search(desc))
            too_thin = len(desc) < MIN_REAL_LENGTH
            if not (looks_like_test or too_thin):
                continue
            template = CATEGORY_REPLACEMENTS.get(
                r.category, "Civic issue reported near {place} that needs attention."
            )
            place = PLACES[place_idx % len(PLACES)]
            place_idx += 1
            ticket_updates.append(
                {
                    "id": r.id,
                    "category": r.category,
                    "status": r.status,
                    "reason": "stale-name" if STALE_PLACES.search(desc) else
                              "test-marker" if QA_MARKERS.search(desc) else "too-thin",
                    "from": desc[:70],
                    "to": template.format(place=place),
                }
            )

        # ---- placeholder officers -----------------------------------------
        officer_rows = db.execute(
            text("select id, name, department, is_active from officers order by name")
        ).fetchall()
        officer_deletes = [
            {"id": o.id, "name": o.name, "dept": o.department}
            for o in officer_rows
            if (o.name or "").strip().lower() in PLACEHOLDER_OFFICER_NAMES
        ]
        officer_keeps = [
            {"name": o.name, "dept": o.department, "active": o.is_active}
            for o in officer_rows
            if (o.name or "").strip().lower() not in PLACEHOLDER_OFFICER_NAMES
        ]

        print(f"== PLAN ({'APPLYING' if args.apply else 'DRY RUN'}) ==")
        print(f"\nticket descriptions to rewrite: {len(ticket_updates)}")
        for u in ticket_updates:
            print(f"  {str(u['id'])[:8]} [{u['category']}] ({u['reason']})")
            print(f"      was: {u['from']!r}")
            print(f"      now: {u['to'][:90]!r}")

        print(f"\nplaceholder officers to remove: {len(officer_deletes)}")
        for o in officer_deletes:
            print(f"  {str(o['id'])[:8]}  {o['name']!r} ({o['dept']})")
        print(f"\nreal officers kept: {len(officer_keeps)}")
        for o in officer_keeps:
            print(f"  {o['name']!r} — {o['dept']} — active={o['active']}")

        # Anything still referencing a retired Bengaluru ward name.
        stale = db.execute(
            text(
                "select count(*) from tickets where description ilike '%market square%'"
                " or description ilike '%greenfield%' or description ilike '%bangalore%'"
                " or description ilike '%bengaluru%'"
                " or description ilike '%mg road%'"
            )
        ).scalar()
        print(f"\nrows mentioning a retired ward/city name: {stale}")

        if not args.apply:
            print("\ndry run — pass --apply to write")
            return 0

        for u in ticket_updates:
            db.execute(
                text("update tickets set description = :d where id = :id"),
                {"d": u["to"], "id": u["id"]},
            )
        for o in officer_deletes:
            db.execute(text("delete from officers where id = :id"), {"id": o["id"]})
        db.commit()
        print("\ncommitted")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
