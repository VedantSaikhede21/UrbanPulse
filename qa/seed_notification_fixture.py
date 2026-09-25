"""Give a real citizen a notification so the notification -> report navigation
can be exercised end to end.

The QA citizen fixtures own no tickets, so /api/notifications returned an empty
list and the row-level controls (mark-read, "View report") never rendered —
meaning the navigation fix was untested.

This picks a citizen that actually owns a ticket and inserts a notification
referencing it. It does NOT create tickets, so the AI pipeline is never invoked.

Idempotent: skips if that citizen already has a notification.
"""

import sys

from sqlalchemy import text

from app.db.session import SessionLocal

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

db = SessionLocal()
try:
    row = db.execute(text("""
        select t.id, t.citizen_id
        from tickets t
        where t.citizen_id is not null
        order by t.created_at desc
        limit 1
    """)).fetchone()

    if not row:
        print("no ticket with a citizen_id; nothing to do")
        raise SystemExit(1)

    ticket_id, citizen_id = row.id, row.citizen_id
    print(f"ticket   {ticket_id}")
    print(f"citizen  {citizen_id}")

    existing = db.execute(
        text("select count(*) from notifications where citizen_id = :c"),
        {"c": citizen_id},
    ).scalar()
    if existing:
        print(f"citizen already has {existing} notification(s); leaving as-is")
    else:
        db.execute(
            text("""
                insert into notifications (citizen_id, ticket_id, type, title, message)
                values (:c, :t, 'status', 'Field team assigned your report',
                        'An officer has been assigned and will visit the site today.')
            """),
            {"c": citizen_id, "t": ticket_id},
        )
        db.commit()
        print("inserted 1 notification")

    n = db.execute(
        text("select count(*) from notifications where citizen_id = :c"),
        {"c": citizen_id},
    ).scalar()
    print(f"notifications for this citizen: {n}")
    print(f"\nUSE_THIS_CITIZEN={citizen_id}")
finally:
    db.close()
