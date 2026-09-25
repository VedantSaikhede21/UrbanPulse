"""Provision the staff roles that the admin dashboards need.

`app.auth.deps` resolves a staff user's role from the `officers` table, not
from the JWT. The deployment had only field-officer rows, so:

* `/api/audit` (admin/super_admin only) answered 403 for every user, leaving the
  Audit Log page permanently showing a raw error;
* department-head, city-admin and super-admin identities did not exist, so
  those dashboards had no reachable principal.

Idempotent: matched on (name, role); re-running adds nothing.
Dry run by default; pass --apply to write.
"""

import argparse
import sys

from sqlalchemy import text

from app.db.session import SessionLocal

# (name, role, department)
#
# NOTE: `officers.department` has a CHECK constraint in the baseline migration
# limiting it to Roads | Water | Sanitation | Electrical. Admin/Super-admin rows
# are city-wide, not department-scoped, so they are attached to Roads purely to
# satisfy the constraint — their `role` is what authorisation actually reads.
ALLOWED_DEPARTMENTS = {"Roads", "Water", "Sanitation", "Electrical"}

STAFF = [
    ("Anita Desai", "dept_head", "Roads"),
    ("Rohit Salvi", "dept_head", "Water"),
    ("Meera Iyer", "admin", "Roads"),
    ("Karthik Rao", "super_admin", "Roads"),
]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--print-ids",
        action="store_true",
        help="Print QA_ROLE_IDS JSON (role -> real officer UUID) and exit. "
        "deps.py resolves staff roles by officers.id == JWT sub, so QA "
        "harnesses must mint tokens with these exact UUIDs or the role "
        "silently downgrades to citizen.",
    )
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if args.print_ids:
            import json

            mapping = {}
            for r in db.execute(
                text("select role, id from officers where is_active = true order by role, name")
            ):
                # Keep the first row per role; harnesses only need one identity.
                mapping.setdefault(r.role, str(r.id))
            print(json.dumps(mapping, indent=2))
            return 0

        existing = {
            (r.name, r.role): r
            for r in db.execute(text("select id, name, role, department, is_active from officers"))
        }
        by_name = {}
        for (name, role), row in existing.items():
            by_name.setdefault(name.lower(), []).append(row)

        inserts = []
        for name, role, dept in STAFF:
            assert dept in ALLOWED_DEPARTMENTS, f"{dept} violates officers_department_check"
            matches = by_name.get(name.lower(), [])
            if any(m.role == role for m in matches):
                continue
            inserts.append({"name": name, "role": role, "dept": dept})

        print(f"== PLAN ({'APPLYING' if args.apply else 'DRY RUN'}) ==")
        print(f"staff roles to create: {len(inserts)}")
        for i in inserts:
            print(f"  {i['role']:12} {i['name']!r} — {i['dept']}")

        print("\ncurrent role spread:")
        for r in db.execute(
            text("select role, count(*) n from officers group by role order by role")
        ):
            print(f"  {r.role:12} {r.n}")

        if not args.apply:
            print("\ndry run — pass --apply to write")
            return 0

        for i in inserts:
            db.execute(
                text(
                    "insert into officers (name, role, department, is_active)"
                    " values (:n, :r, :d, true)"
                ),
                {"n": i["name"], "r": i["role"], "d": i["dept"]},
            )
        db.commit()
        print("\ncommitted")

        print("\nfinal role spread:")
        for r in db.execute(
            text("select role, count(*) n from officers group by role order by role")
        ):
            print(f"  {r.role:12} {r.n}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
