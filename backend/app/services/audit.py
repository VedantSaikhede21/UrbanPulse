"""Audit trail for ticket/platform lifecycle actions.

The AuditLog table exists in the baseline migration but was never written.
Every action here is best-effort: a failing audit insert must never take
down the primary operation it describes, so failures are logged and
swallowed.
"""
from typing import List, Optional

from sqlalchemy.orm import Session

from app.db.models import AuditLog


def record_audit(
    db: Session,
    user_id: Optional[str],
    action: str,
    target_table: str,
    record_id: Optional[str] = None,
    details: Optional[dict] = None,
) -> None:
    try:
        db.add(
            AuditLog(
                user_id=user_id,
                action=action,
                target_table=target_table,
                record_id=record_id,
                details=details,
            )
        )
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Audit record failed ({action}): {e}")


def list_audit(db: Session, limit: int = 100) -> List[dict]:
    rows = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(min(max(limit, 1), 500))
        .all()
    )
    return [
        {
            "id": row.id,
            "user_id": str(row.user_id) if row.user_id else None,
            "action": row.action,
            "target_table": row.target_table,
            "record_id": str(row.record_id) if row.record_id else None,
            "details": row.details,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]
