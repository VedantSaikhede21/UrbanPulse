"""Report which Supabase Auth users are linked to Officer rows, and how many
tickets sit on officers that no real login can reach.

A demo account is only useful if the backend can resolve it to an Officer row
(Officer.id == JWT sub). Officer rows seeded with random UUIDs are invisible to
email/password logins, so their tickets never appear in anyone's queue.

Read-only. Use --apply on link_demo_auth_users.py to fix.
"""
import os
import sys
import uuid

sys.path.insert(0, "/app")

import httpx
from sqlalchemy import func

from app.db.models import Officer, Ticket
from app.db.session import SessionLocal
from app.config import settings

DEMO = {
    "officer": "officer@urbanpulse.demo",
    "dept_head": "dept@urbanpulse.demo",
    "admin": "admin@urbanpulse.demo",
    "super_admin": "superadmin@urbanpulse.demo",
}


def auth_uuid(email: str):
    """Resolve a demo email to its auth.users UUID via the password grant."""
    r = httpx.post(
        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password",
        headers={"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"},
        json={"email": email, "password": os.environ.get("QA_DEMO_PASSWORD", "UrbanPulse@2026")},
        timeout=30,
    )
    if r.status_code != 200:
        return None, f"login failed HTTP {r.status_code}"
    return r.json()["user"]["id"], None


def main():
    db = SessionLocal()
    counts = dict(
        db.query(Ticket.assigned_officer_id, func.count(Ticket.id))
        .group_by(Ticket.assigned_officer_id)
        .all()
    )

    print(f"{'AUTH USER':38} {'OFFICER ROW':10} {'TICKETS':>8}  NAME / EMAIL")
    print("-" * 100)
    linked, unlinked_officers = [], []
    for role, email in DEMO.items():
        uid, err = auth_uuid(email)
        if err:
            print(f"{email:38} {'ERROR':10} {'-':>8}  {err}")
            continue
        off = db.query(Officer).filter(Officer.id == uuid.UUID(uid)).first()
        if off:
            n = counts.get(off.id, 0)
            print(f"{email:38} {'linked':10} {n:>8}  {off.name} / {off.role}")
            linked.append((role, uid, off))
        else:
            print(f"{email:38} {'MISSING':10} {'-':>8}  no Officer row with id {uid}")
            linked.append((role, uid, None))

    print("\nOfficer rows that no demo login can reach:")
    reachable = {o.id for _, _, o in linked if o}
    for off in db.query(Officer).order_by(Officer.role, Officer.name).all():
        if off.id in reachable:
            continue
        n = counts.get(off.id, 0)
        flag = "  <-- has tickets, unreachable" if n else ""
        print(f"  {str(off.id)[:36]:38} {off.role:11} {n:>4} tickets  {off.name}{flag}")
        unlinked_officers.append((off, n))

    total = sum(counts.values())
    assigned = sum(n for n in counts.values() if n)
    print(f"\ntickets total={total} assigned={assigned} unassigned={total - assigned}")
    print(f"tickets parked on unreachable officers: {sum(n for _, n in unlinked_officers)}")
    db.close()


if __name__ == "__main__":
    main()
