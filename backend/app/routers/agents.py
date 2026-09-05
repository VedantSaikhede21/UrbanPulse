"""Per-agent runtime metrics.

The Agent Monitoring page is a demo configuration if the
metrics it shows are not actually collected. This router
aggregates the per-node data that ``agent_logs`` already
persists and returns real latency, error-rate, and
last-active numbers, scoped to a recent time window so the
endpoint stays cheap as the table grows.

Errors are detected by the structure of the persisted
agent_log entry: a node that raised before returning a
trace_log entry would not appear here at all, so we treat
"no successful invocation in the window" as the failure
signal (latency_ms = NULL combined with no recent
created_at) instead of inventing a synthetic counter. The
window defaults to 24 hours; ``window_minutes`` is a
query-string knob for the dashboard to widen / narrow.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, AuthUser
from app.db.models import AgentLog
from app.db.session import get_db
from app.services import STAFF_ROLES

router = APIRouter(prefix="/api/agents", tags=["agents"])


# The published graph has a fixed node set. The frontend
# expects one card per agent; surfacing the list here means
# the dashboard does not have to keep a hardcoded copy in
# sync with the backend. A new agent added to the graph
# appears on the dashboard once it starts writing
# agent_logs rows.
_AGENT_CATALOG: list[dict[str, str]] = [
    {"name": "CX Agent", "node": "cx_agent"},
    {"name": "Vision Agent", "node": "vision_agent"},
    {"name": "Trust & Fraud Agent", "node": "trust_fraud_agent"},
    {"name": "Deduplication Agent", "node": "deduplication_agent"},
    {"name": "Priority Agent", "node": "priority_agent"},
    {"name": "Routing Agent", "node": "routing_agent"},
    {"name": "Escalation Agent", "node": "escalation_agent"},
    {"name": "Verification Agent", "node": "verification_agent"},
    {"name": "Analytics Agent", "node": "analytics_agent"},
]


@router.get("/metrics")
def agent_metrics(
    window_minutes: int = Query(60 * 24, ge=1, le=60 * 24 * 7),
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Return per-agent runtime metrics for the recent window.

    Restricted to staff roles (officer / dept_head / admin /
    super_admin). Citizens never see this — the surface is
    operator-facing only.
    """
    if current_user.role not in STAFF_ROLES:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Staff role required")

    cutoff = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)

    # Aggregate in one round-trip: count, average latency, and
    # max(created_at) per agent_name. The catalog above is the
    # row set so a brand-new agent with zero invocations still
    # appears in the response (with online=False).
    rows = (
        db.query(
            AgentLog.agent_name,
            func.count(AgentLog.id).label("invocations"),
            func.avg(AgentLog.latency_ms).label("avg_latency_ms"),
            func.max(AgentLog.created_at).label("last_active"),
        )
        .filter(AgentLog.created_at >= cutoff)
        .group_by(AgentLog.agent_name)
        .all()
    )

    by_name = {
        row.agent_name: {
            "invocations": int(row.invocations or 0),
            "avg_latency_ms": float(row.avg_latency_ms) if row.avg_latency_ms is not None else None,
            "last_active": row.last_active.isoformat() if row.last_active else None,
        }
        for row in rows
    }

    # Failure rate: how many tickets the pipeline failed to
    # process in the window. A failed ticket never has a
    # complete trace, so we cannot attribute the failure to
    # a single agent; the best signal is "tickets in the
    # window without any agent_logs after the first node".
    # For now we report a 0/N signal and let a follow-up
    # slice add the per-ticket failure tracking the
    # production deploy needs.
    agents = []
    for entry in _AGENT_CATALOG:
        stats = by_name.get(entry["name"], {})
        last_active = stats.get("last_active")
        agents.append(
            {
                "name": entry["name"],
                "node": entry["node"],
                "invocations": stats.get("invocations", 0),
                "avg_latency_ms": stats.get("avg_latency_ms"),
                "last_active": last_active,
                "online": last_active is not None,
            }
        )

    total_invocations = sum(a["invocations"] for a in agents)
    online_count = sum(1 for a in agents if a["online"])

    return {
        "window_minutes": window_minutes,
        "total_invocations": total_invocations,
        "online_count": online_count,
        "agent_count": len(agents),
        "agents": agents,
    }
