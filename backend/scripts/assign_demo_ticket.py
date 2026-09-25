"""Move a freshly triaged ticket onto the demo field officer.

The router deliberately assigns to the least-loaded officer in the matched
department, so a ticket filed during a demo lands on whichever real officer
happens to be emptiest — not necessarily the account the demo signs in with.
This is correct routing behaviour, so the fix is applied to the data rather
than by changing the router.

Usage:
    docker exec urbanpulse-backend python /tmp/assign_demo_ticket.py <ticket_id_substring>
"""
import os
import sys
import uuid

sys.path.insert(0, "/app")

import httpx

from sqlalchemy import String, cast

from app.db.models import Officer, Ticket
from app.db.session import SessionLocal

DEMO_OFFICER = "officer@urbanpulse.demo"
DEMO_PASSWORD = os.environ.get("QA_DEMO_PASSWORD", "UrbanPulse@2026")


def main():
    needle = sys.argv[1] if len(sys.argv) > 1 else ""
    if not needle:
        print("usage: assign_demo_ticket.py <ticket-id-prefix>")
        return

    r = httpx.post(
        f"{os.environ['SUPABASE_URL'].rstrip('/')}/auth/v1/token?grant_type=password",
        headers={"apikey": os.environ["SUPABASE_ANON_KEY"], "Content-Type": "application/json"},
        json={"email": DEMO_OFFICER, "password": DEMO_PASSWORD},
        timeout=30,
    )
    r.raise_for_status()
    officer_id = uuid.UUID(r.json()["user"]["id"])

    db = SessionLocal()
    # Ticket.id is a UUID column, so the prefix match has to cast to text.
    ticket = db.query(Ticket).filter(cast(Ticket.id, String).ilike(f"%{needle}%")).first()
    if ticket is None:
        print(f"no ticket matching {needle!r}")
        return
    before = ticket.assigned_officer_id
    ticket.assigned_officer_id = officer_id
    db.commit()

    print(f"ticket {str(ticket.id)[:8]}  {ticket.status}  {ticket.category}")
    print(f"  assigned_officer_id: {before} -> {officer_id}")
    off = db.query(Officer).filter(Officer.id == officer_id).first()
    print(f"  now with {off.name} ({off.role}, {off.department})")
    db.close()


if __name__ == "__main__":
    main()
