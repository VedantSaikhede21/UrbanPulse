from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.models import Ticket

STATUS_MESSAGES = {
    "reported": "Your report was received and is being triaged by AI.",
    "assigned": "Your report has been assigned to the {dept} department.",
    "in_progress": "An officer has started work on your report.",
    "resolved": "Your report has been marked resolved — please confirm.",
    "verified": "Resolution verified — thank you for reporting this issue.",
}


def list_notifications(db: Session, citizen_id: Optional[str]) -> List[dict]:
    from app.agents.graph import CATEGORY_TO_DEPT
    try:
        query = db.query(Ticket)
        if citizen_id:
            query = query.filter(Ticket.citizen_id == citizen_id)
        tickets = query.order_by(Ticket.updated_at.desc()).limit(30).all()

        notifications = []
        for t in tickets:
            category_key = t.category if isinstance(t.category, str) else ""
            dept = CATEGORY_TO_DEPT.get(category_key, "the relevant")
            status = t.status if isinstance(t.status, str) else str(t.status)
            message = STATUS_MESSAGES.get(status, f"Status updated to {status}.")
            message = message.format(dept=dept)
            notifications.append({
                "id": str(t.id),
                "ticket_id": str(t.id),
                "category": t.category,
                "status": status,
                "message": message,
                "timestamp": t.updated_at.isoformat() if t.updated_at is not None else None,
            })
        return notifications
    except Exception as e:
        print(f"Notifications query failed: {e}")
        return []