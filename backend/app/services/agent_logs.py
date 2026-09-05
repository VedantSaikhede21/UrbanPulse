"""Persistence for per-agent AI reasoning entries.

The AI triage pipeline (app/agents/graph.py) streams live trace
events to the browser via SSE for an animated, "watch the AI work"
UX. Those same entries must also be written to the `agent_logs`
table so the decision is auditable months later, not just live
during the original session — see the Production Readiness
Roadmap Phase 1 "AgentLogs / audit-trail persistence".

Each entry maps to one `AgentLog` row keyed by ticket_id. Persistence
is best-effort: a failing write must never take down the primary
pipeline it is documenting, so failures are logged and swallowed.
"""
import time
import uuid as _uuid
from typing import Any, Dict, Iterable, List, Optional, Union

from sqlalchemy.orm import Session

from app.db.models import AgentLog


def _coerce_ticket_id(ticket_id: Union[str, _uuid.UUID]) -> _uuid.UUID:
    """Accept str or UUID, return a UUID. The AgentLog column is typed
    as `UUID(as_uuid=True)`; SQLAlchemy's PG dialect wants a UUID
    object on write."""
    if isinstance(ticket_id, _uuid.UUID):
        return ticket_id
    return _uuid.UUID(str(ticket_id))


def _entry_to_row(ticket_id: _uuid.UUID, entry: Dict[str, Any]) -> AgentLog:
    """Translate a graph `trace_logs` entry into an AgentLog row."""
    return AgentLog(
        ticket_id=ticket_id,
        agent_name=(entry.get("agent") or "Unknown Agent")[:100],
        node_name=entry.get("node"),
        action=(entry.get("action") or "Processing")[:255],
        reasoning=entry.get("reasoning"),
        details=entry.get("details"),
        latency_ms=entry.get("latency_ms"),
    )


def record_trace_entries(
    db: Session,
    ticket_id: Union[str, _uuid.UUID],
    entries: Iterable[Dict[str, Any]],
) -> int:
    """Persist a batch of trace entries for one ticket.

    Returns the number of rows written. Failures are logged and
    swallowed (a failed audit row must never abort the pipeline).
    """
    tid = _coerce_ticket_id(ticket_id)
    rows: List[AgentLog] = []
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        rows.append(_entry_to_row(tid, entry))
    if not rows:
        return 0
    try:
        db.add_all(rows)
        db.commit()
        return len(rows)
    except Exception as e:
        db.rollback()
        print(f"agent_logs write failed for ticket {tid}: {e}")
        return 0


def time_and_record(
    db: Session,
    ticket_id: Union[str, _uuid.UUID],
    agent_name: str,
    action: str,
    reasoning: Optional[str],
    details: Optional[Dict[str, Any]] = None,
    started_at: Optional[float] = None,
) -> int:
    """Record a single trace entry with a measured latency.

    Convenience wrapper for callers that do not have a pre-built
    entry dict (e.g. inline agent invocations).
    """
    latency_ms: Optional[int] = None
    if started_at is not None:
        latency_ms = int((time.monotonic() - started_at) * 1000)
    entry = {
        "agent": agent_name,
        "action": action,
        "reasoning": reasoning,
        "details": details,
        "latency_ms": latency_ms,
    }
    return record_trace_entries(db, ticket_id, [entry])


def list_trace(db: Session, ticket_id: Union[str, _uuid.UUID]) -> List[dict]:
    """Return all persisted trace entries for a ticket, in order."""
    tid = _coerce_ticket_id(ticket_id)
    rows = (
        db.query(AgentLog)
        .filter(AgentLog.ticket_id == tid)
        .order_by(AgentLog.created_at.asc(), AgentLog.id.asc())
        .all()
    )
    return [
        {
            "id": str(row.id),
            "ticket_id": str(row.ticket_id),
            "agent": row.agent_name,
            "node": row.node_name,
            "action": row.action,
            "reasoning": row.reasoning,
            "details": row.details,
            "latency_ms": row.latency_ms,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        }
        for row in rows
    ]
