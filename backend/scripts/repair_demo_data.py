"""Repair the seeded demo data so the deployed roles have something to show.

Found on the live database before the hackathon demo:

* every one of the 25 tickets had department_id = NULL, so the department
  dashboard, city analytics and routing views had nothing to group by even
  though the AI router resolves a Department row for every new ticket;
* 18 tickets referenced officer UUIDs with no officers row and 7 more sat on
  rows that no Supabase Auth user can claim, so no queue was reachable;
* the four demo logins all resolved to role="officer", which bounced the dept
  head, city admin and super admin accounts off their own routes;
* leftover "Test Officer" rows and four duplicate officer rows (same name and
  role as a demo account, but a random id) were still in the roster.

Mirrors app/agents/graph.py CATEGORY_TO_DEPT so backfilled departments match
what the live router would have chosen. Only Test Officer rows and officers
that duplicate a demo account's name and role are deleted, and only after
their tickets have been reassigned.

Usage:
    docker exec urbanpulse-backend python /tmp/repair_demo_data.py
    docker exec urbanpulse-backend python /tmp/repair_demo_data.py --apply
"""
import os
import sys
import uuid
from collections import Counter

sys.path.insert(0, "/app")

import httpx
from sqlalchemy import func

from app.config import settings
from app.db.models import Department, Officer, Ticket
from app.db.session import SessionLocal

APPLY = "--apply" in sys.argv
DEMO_PASSWORD = os.environ.get("QA_DEMO_PASSWORD", "UrbanPulse@2026")

# Kept in sync with app/agents/graph.py.
CATEGORY_TO_DEPT = {
    "Roads & Potholes": "Roads",
    "Water Leak": "Water",
    "Garbage & Sanitation": "Sanitation",
    "Streetlight & Electrical": "Electrical",
    "Signage & Hazards": "Roads",
}

DEMO_ACCOUNTS = {
    "officer@urbanpulse.demo": "officer",
    "dept@urbanpulse.demo": "dept_head",
    "admin@urbanpulse.demo": "admin",
    "superadmin@urbanpulse.demo": "super_admin",
}
DEMO_DEPARTMENT = "Roads"
OFFICER_QUEUE_TARGET = 7
OPEN_STATUSES = ("reported", "assigned", "in_progress", "needs_review")


def auth_uuid(email):
    r = httpx.post(
        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password",
        headers={"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"},
        json={"email": email, "password": DEMO_PASSWORD},
        timeout=30,
    )
    r.raise_for_status()
    return uuid.UUID(r.json()["user"]["id"])


def main():
    db = SessionLocal()
    depts = {d.name: d for d in db.query(Department).all()}
    print("departments:", {n: str(d.id) for n, d in depts.items()})

    # 1. resolve the demo officers and correct their role
    demo = {}
    for email, role in DEMO_ACCOUNTS.items():
        uid = auth_uuid(email)
        off = db.query(Officer).filter(Officer.id == uid).first()
        if off is None:
            print(f"  MISSING officer row for {email} ({uid})")
            continue
        demo[email] = off
        note = "" if off.role == role else f"  {off.role} -> {role}"
        print(f"  {email:30} {off.name:20} {off.role:11} -> {role:11}{note}")
        off.role = role
        off.is_active = True
        if role in ("officer", "dept_head"):
            off.department = DEMO_DEPARTMENT
            off.department_id = depts[DEMO_DEPARTMENT].id
        else:
            # officers_department_check only admits the four operational
            # departments, so city-wide roles still carry a home department and
            # leave department_id NULL to mark them as not department-scoped.
            off.department = DEMO_DEPARTMENT
            off.department_id = None

    officer = demo.get("officer@urbanpulse.demo")
    dept_head = demo.get("dept@urbanpulse.demo")
    if not officer or not dept_head:
        print("abort: demo officer or dept head row missing")
        db.close()
        return
    reachable = {o.id for o in demo.values()}

    # 2. backfill ticket departments from the category the router would use
    tickets = db.query(Ticket).order_by(Ticket.created_at).all()
    unknown = sorted({t.category for t in tickets if t.category not in CATEGORY_TO_DEPT})
    print(f"\ntickets={len(tickets)} statuses={dict(Counter(t.status for t in tickets))}")
    print(f"categories outside CATEGORY_TO_DEPT: {unknown or 'none'}")
    for t in tickets:
        target = depts.get(CATEGORY_TO_DEPT.get(t.category, ""))
        if target and t.department_id != target.id:
            t.department_id = target.id
    db.flush()
    after = Counter(
        (depts_name := next((n for n, d in depts.items() if d.id == t.department_id), "NULL"))
        for t in db.query(Ticket).all()
    )
    print(f"tickets per department after backfill: {dict(after)}")

    # 3. redistribute assignments onto officers a demo login can actually claim
    #    The dept head covers the city; the field officer keeps a working queue
    #    in his own department.
    roads = depts[DEMO_DEPARTMENT].id
    orphans = [t for t in tickets if t.assigned_officer_id not in reachable]
    in_dept_open = [t for t in orphans if t.department_id == roads and t.status in OPEN_STATUSES]
    spare = [t for t in orphans if t not in in_dept_open]
    to_officer = (in_dept_open + spare)[:OFFICER_QUEUE_TARGET]
    officer_ids = {t.id for t in to_officer}
    for t in orphans:
        t.assigned_officer_id = officer.id if t.id in officer_ids else dept_head.id
    print(f"\nunreachable assignments reassigned: {len(orphans)} "
          f"({len(to_officer)} to field officer, {len(orphans) - len(to_officer)} to dept head)")

    # 4. drop leftover QA rows and officers duplicating a demo account
    demo_names = {(o.name, o.role) for o in demo.values()}
    removable = []
    for o in db.query(Officer).all():
        if o.id in reachable:
            continue
        if o.name.strip().lower() == "test officer":
            removable.append((o, "Test Officer leftover"))
        elif (o.name, "officer") in demo_names or (o.name, "dept_head") in demo_names:
            removable.append((o, "duplicates a demo account"))
    for o, why in removable:
        held = db.query(func.count(Ticket.id)).filter(Ticket.assigned_officer_id == o.id).scalar()
        print(f"  remove {o.name:20} {o.role:11} ({why}); still holding {held} tickets")

    legacy = depts.get("Legacy")
    if legacy is not None:
        legacy.is_active = False
        print("  deactivated stray 'Legacy' department")

    if not APPLY:
        print("\nDRY RUN — pass --apply to write")
        db.close()
        return

    for o, _ in removable:
        db.delete(o)
    db.commit()

    counts = dict(db.query(Ticket.assigned_officer_id, func.count(Ticket.id))
                  .group_by(Ticket.assigned_officer_id).all())
    still = sum(n for oid, n in counts.items() if oid not in reachable)
    print(f"\napplied. field officer queue={counts.get(officer.id, 0)} "
          f"dept head={counts.get(dept_head.id, 0)} unreachable={still} "
          f"officers={db.query(func.count(Officer.id)).scalar()}")
    db.close()


if __name__ == "__main__":
    main()
