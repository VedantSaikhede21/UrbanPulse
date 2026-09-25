"""Put a ticket back into the officer's active queue.

Used after a closure was submitted with unsuitable evidence: the verification
agent correctly sent the ticket to needs_review, which the officer queue does
not list, so the officer has no way to retry with a better photo. This clears
the rejected closure evidence and reopens the ticket for another attempt.

The verification verdict is left in place unless --clear-verdict is passed, so
the rejection stays auditable while the retry happens.

Usage:
    docker exec urbanpulse-backend python /tmp/reopen_ticket.py <id-prefix>
    docker exec urbanpulse-backend python /tmp/reopen_ticket.py <id-prefix> --clear-verdict
"""
import sys
sys.path.insert(0, "/app")

from sqlalchemy import String, cast

from app.db.models import Ticket
from app.db.session import SessionLocal


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        print("usage: reopen_ticket.py <id-prefix> [--clear-verdict]")
        return
    prefix = args[0]
    clear = "--clear-verdict" in sys.argv

    db = SessionLocal()
    t = db.query(Ticket).filter(cast(Ticket.id, String).ilike(f"%{prefix}%")).first()
    if t is None:
        print(f"no ticket matching {prefix!r}")
        return
    print(f"before: status={t.status} verification={t.verification_status}")
    print(f"        closure={t.closure_media_url}")
    t.status = "in_progress"
    t.closure_media_url = None
    if clear:
        t.verification_status = None
        t.verification_reason = None
    db.commit()
    print(f"after:  status={t.status} verification={t.verification_status} closure={t.closure_media_url}")
    db.close()


if __name__ == "__main__":
    main()
