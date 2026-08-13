import asyncio
import uuid
from typing import Any, AsyncGenerator, Dict

from sqlalchemy.orm import Session

from app.db.models import Ticket
from app.services.tickets import serialize_ticket


async def stream_triage_events(
    ticket: Ticket,
    graph,
    TicketState,
    db: Session,
) -> AsyncGenerator[Dict[str, Any], None]:
    """Run the 8-agent triage graph, yield SSE event payloads, and persist results."""
    state = TicketState(
        ticket_id=str(ticket.id),
        citizen_id=str(ticket.citizen_id) if ticket.citizen_id else None,
        citizen_text=ticket.description or "",
        original_media_url=ticket.original_media_url,
        voice_note_url=ticket.voice_note_url,
        latitude=ticket.latitude,
        longitude=ticket.longitude,
        category=ticket.category,
        severity=ticket.severity,
    )

    final_state_dict = state.model_dump()

    try:
        queue = asyncio.Queue()
        seen_logs = 0

        async def run_pipeline():
            loop = asyncio.get_running_loop()

            def _sync_stream():
                for step in graph.stream(state):
                    queue.put_nowait(step)
                queue.put_nowait(None)

            await loop.run_in_executor(None, _sync_stream)

        task = asyncio.create_task(run_pipeline())

        while True:
            step = await queue.get()
            if step is None:
                break

            for node_name, node_output in step.items():
                if isinstance(node_output, dict):
                    final_state_dict.update(node_output)

                logs = node_output.get("trace_logs", []) if isinstance(node_output, dict) else []
                new_logs = logs[seen_logs:]
                seen_logs = len(logs)

                for log_entry in new_logs:
                    yield {
                        "agent": log_entry.get("agent", node_name),
                        "action": log_entry.get("action", "Processing..."),
                        "reasoning": log_entry.get("reasoning", ""),
                        "node": node_name,
                        "status": "running",
                    }

        await task

        try:
            ticket.category = final_state_dict.get("category") or ticket.category
            ticket.severity = final_state_dict.get("severity") or ticket.severity
            ticket.is_spam = final_state_dict.get("is_spam", False)
            ticket.is_duplicate = final_state_dict.get("is_duplicate", False)
            dup_id = final_state_dict.get("duplicate_of_id")
            if dup_id:
                ticket.duplicate_of_id = uuid.UUID(dup_id)
            ticket.priority_score = final_state_dict.get("priority_score", ticket.priority_score)
            ticket.priority_reason = final_state_dict.get("priority_reason")
            ticket.status = final_state_dict.get("status", "assigned")
            officer_id = final_state_dict.get("assigned_officer_id")
            if officer_id:
                ticket.assigned_officer_id = uuid.UUID(officer_id)
            db.commit()
        except Exception as db_err:
            print(f"DB commit error: {db_err}")
            db.rollback()

        yield {
            "agent": "Pipeline",
            "action": "Complete",
            "reasoning": (
                f"Ticket {ticket.id} fully processed. "
                f"Category: {final_state_dict.get('category')}, "
                f"Priority: {final_state_dict.get('priority_score')}."
            ),
            "node": "END",
            "status": "done",
            "result": {
                "category": final_state_dict.get("category"),
                "severity": final_state_dict.get("severity"),
                "priority_score": final_state_dict.get("priority_score"),
                "assigned_department": final_state_dict.get("assigned_department"),
                "assigned_officer_id": final_state_dict.get("assigned_officer_id"),
                "status": final_state_dict.get("status"),
                "is_duplicate": final_state_dict.get("is_duplicate"),
            },
        }

    except Exception as e:
        yield {"agent": "Pipeline", "status": "error", "reasoning": str(e)}


def run_verification(
    ticket: Ticket,
    closure_media_url: str,
    graph,
    TicketState,
    db: Session,
) -> dict:
    ticket.closure_media_url = closure_media_url
    ticket.status = "resolved"
    db.commit()

    state = TicketState(
        ticket_id=str(ticket.id),
        citizen_text=ticket.description or "",
        original_media_url=ticket.original_media_url,
        closure_media_url=closure_media_url,
        category=ticket.category,
        latitude=ticket.latitude,
        longitude=ticket.longitude,
        status="resolved",
    )

    final = graph.invoke(state)

    ticket.verification_status = final.get("verification_status")
    ticket.verification_reason = final.get("verification_reason")
    ticket.status = final.get("status", "verified")
    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)