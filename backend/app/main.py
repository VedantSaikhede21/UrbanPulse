import asyncio
import json as _json
import os
import secrets
import uuid
from typing import Optional, List

from fastapi import FastAPI, Depends, Header, HTTPException, UploadFile, File, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.agents import runtime
from app.auth.deps import AuthUser, get_current_user
from app.config import settings
from app.db.session import get_db
from app.db.models import Ticket, Citizen, Officer
from app.routers.analytics import router as analytics_router
from app.routers.health import router as health_router
from app.schemas.auth import MeResponse
from app.schemas.tickets import NotificationOut, TicketOut
from app.schemas.upload import UploadResponse

app = FastAPI(
    title="UrbanPulse AI Backend",
    description="Multi-agent civic infrastructure triage and routing platform backend",
    version="0.2.0",
)

app.include_router(health_router)
app.include_router(analytics_router)

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

@app.on_event("startup")
async def load_graphs():
    runtime.load_graphs()


STAFF_ROLES = ("officer", "dept_head", "admin", "super_admin")


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Demo Seed Endpoint ────────────────────────────────


@app.post("/api/demo/seed")
async def demo_seed(authorization: str = Header(None)):
    """Re-seed the database with demo data. Accessible only in development mode."""
    if settings.ENV != "development":
        raise HTTPException(status_code=403, detail="Demo seed is only available in development mode")

    from app.db.seed import seed_db
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, seed_db)
        return {"status": "ok", "message": "Database re-seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Seed failed: {str(e)}")


# ── Serializers ──────────────────────────────────────────

def serialize_ticket(t: Ticket) -> dict:
    return {
        "id": str(t.id),
        "citizen_id": str(t.citizen_id) if t.citizen_id else None,
        "latitude": t.latitude,
        "longitude": t.longitude,
        "category": t.category,
        "severity": t.severity,
        "description": t.description,
        "status": t.status,
        "is_spam": t.is_spam,
        "is_duplicate": t.is_duplicate,
        "duplicate_of_id": str(t.duplicate_of_id) if t.duplicate_of_id else None,
        "priority_score": t.priority_score,
        "priority_reason": t.priority_reason,
        "assigned_officer_id": str(t.assigned_officer_id) if t.assigned_officer_id else None,
        "verification_status": t.verification_status,
        "verification_reason": t.verification_reason,
        "original_media_url": t.original_media_url,
        "closure_media_url": t.closure_media_url,
        "voice_note_url": t.voice_note_url,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
    }


# ── Request models ───────────────────────────────────────

class CreateTicketRequest(BaseModel):
    category: str
    severity: str = "medium"
    description: Optional[str] = None
    latitude: float
    longitude: float
    original_media_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    status: str = "reported"
    priority_score: int = Field(default=2, ge=1, le=3)
    priority_reason: Optional[str] = None

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v):
        if v < -90 or v > 90:
            raise ValueError("latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v):
        if v < -180 or v > 180:
            raise ValueError("longitude must be between -180 and 180")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v):
        if v and len(v) > 2000:
            raise ValueError("description must not exceed 2000 characters")
        return v

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if len(v) > 100:
            raise ValueError("category must not exceed 100 characters")
        return v


class ResolveTicketRequest(BaseModel):
    closure_media_url: str
    notes: Optional[str] = None


class UpdateTicketStatusRequest(BaseModel):
    status: str


# ── Health ───────────────────────────────────────────────

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".webm", ".mp3", ".wav", ".m4a", ".pdf"}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    current_user: AuthUser = Depends(get_current_user),
):
    ext = (os.path.splitext(file.filename or "file")[1] or ".bin").lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail=f"File exceeds maximum size of {MAX_UPLOAD_SIZE // (1024*1024)} MB")
    filename = f"{secrets.token_hex(12)}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)
    base_url = str(request.base_url).rstrip("/")
    return {"url": f"{base_url}/uploads/{filename}"}


# ── Notifications ─────────────────────────────────────────

@app.get("/api/notifications", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: AuthUser = Depends(get_current_user)):
    from app.agents.graph import CATEGORY_TO_DEPT
    try:
        query = db.query(Ticket)
        if current_user.role == "citizen" and current_user.id != "00000000-0000-0000-0000-000000000000":
            query = query.filter(Ticket.citizen_id == current_user.id)
        tickets = query.order_by(Ticket.updated_at.desc()).limit(30).all()

        STATUS_MESSAGES = {
            "reported": "Your report was received and is being triaged by AI.",
            "assigned": "Your report has been assigned to the {dept} department.",
            "in_progress": "An officer has started work on your report.",
            "resolved": "Your report has been marked resolved — please confirm.",
            "verified": "Resolution verified — thank you for reporting this issue.",
        }

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


# ── Tickets CRUD ─────────────────────────────────────────

@app.get("/api/tickets")
def list_tickets(db: Session = Depends(get_db), current_user: AuthUser = Depends(get_current_user)):
    try:
        query = db.query(Ticket)
        if current_user.role == "citizen" and current_user.id != "00000000-0000-0000-0000-000000000000":
            query = query.filter(Ticket.citizen_id == current_user.id)
        tickets = query.order_by(Ticket.created_at.desc()).all()
        return [serialize_ticket(t) for t in tickets]
    except Exception as e:
        print(f"Database error, falling back to mock: {e}")
        return [
            {
                "id": "e4b2d352-78d1-4db5-bdf9-0db9bfad83ef",
                "category": "Roads & Potholes",
                "severity": "medium",
                "description": "Deep pothole near the bus stop intersection. Hazardous for bikers.",
                "latitude": 12.9715,
                "longitude": 77.5945,
                "status": "assigned",
                "priority_score": 2,
                "created_at": "2026-07-14T18:00:00Z",
            },
        ]


@app.get("/api/tickets/near", response_model=List[TicketOut])
def find_nearby_tickets(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_meters: float = Query(default=1000.0, ge=1, le=50000),
    db: Session = Depends(get_db),
):
    try:
        rows = db.execute(
            text("""
                SELECT id FROM tickets
                WHERE ST_DWithin(
                    location_geom,
                    ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                    :radius
                )
            """),
            {"lng": longitude, "lat": latitude, "radius": radius_meters},
        ).fetchall()
        ids = [str(r[0]) for r in rows]
        if not ids:
            return []
        tickets = db.query(Ticket).filter(Ticket.id.in_(ids)).all()
        return [serialize_ticket(t) for t in tickets]
    except Exception as e:
        print(f"Spatial query error: {e}")
        return []


@app.get("/api/tickets/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    try:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    except Exception:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    # Citizens may only view their own tickets; staff roles may view any.
    # 404 (not 403) avoids revealing whether a ticket exists.
    if current_user.role == "citizen" and current_user.id != "00000000-0000-0000-0000-000000000000":
        if ticket.citizen_id is None or str(ticket.citizen_id) != current_user.id:
            raise HTTPException(status_code=404, detail="Ticket not found")
    return serialize_ticket(ticket)


@app.post("/api/tickets", status_code=201, response_model=TicketOut)
def create_ticket(
    body: CreateTicketRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    citizen_id = None
    if current_user.role == "citizen" and current_user.id != "00000000-0000-0000-0000-000000000000":
        # Defense in depth: get_current_user already rejects non-UUID subs,
        # but a malformed citizen identity must never produce an unowned
        # ticket even if a future code path constructs AuthUser differently.
        try:
            citizen_id = uuid.UUID(current_user.id)
        except (ValueError, TypeError):
            raise HTTPException(status_code=401, detail="Invalid citizen identity")
    else:
        try:
            first_citizen = db.query(Citizen).first()
            if first_citizen:
                citizen_id = first_citizen.id
        except Exception:
            db.rollback()

    ticket = Ticket(
        citizen_id=citizen_id,
        latitude=body.latitude,
        longitude=body.longitude,
        category=body.category,
        severity=body.severity,
        description=body.description,
        original_media_url=body.original_media_url,
        voice_note_url=body.voice_note_url,
        status=body.status,
        priority_score=body.priority_score,
        priority_reason=body.priority_reason,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)


# ── Officer endpoints ────────────────────────────────────

@app.get("/api/officers/queue", response_model=List[TicketOut])
def officer_queue(db: Session = Depends(get_db), current_user: AuthUser = Depends(get_current_user)):
    if current_user.role not in ("officer", "dept_head", "admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Officer access required")

    query = db.query(Ticket).filter(Ticket.status.in_(["assigned", "in_progress", "reported"]))
    # If a real officer UUID matches, filter to their assignments
    try:
        officer_uuid = uuid.UUID(current_user.id)
        officer = db.query(Officer).filter(Officer.id == officer_uuid).first()
        if officer:
            query = query.filter(Ticket.assigned_officer_id == officer.id)
    except ValueError:
        pass

    tickets = query.order_by(Ticket.priority_score.desc(), Ticket.created_at.asc()).all()
    return [serialize_ticket(t) for t in tickets]


@app.patch("/api/tickets/{ticket_id}/status", response_model=TicketOut)
def update_ticket_status(
    ticket_id: str,
    body: UpdateTicketStatusRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    if current_user.role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="Officer access required")
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = body.status
    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)


@app.post("/api/tickets/{ticket_id}/resolve", response_model=TicketOut)
async def resolve_ticket(
    ticket_id: str,
    body: ResolveTicketRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    if current_user.role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="Officer access required")
    if runtime.verification_graph is None:
        raise HTTPException(status_code=503, detail="Agent graphs not loaded")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.closure_media_url = body.closure_media_url
    ticket.status = "resolved"
    db.commit()

    state = runtime.TicketState(
        ticket_id=ticket_id,
        citizen_text=ticket.description or "",
        original_media_url=ticket.original_media_url,
        closure_media_url=body.closure_media_url,
        category=ticket.category,
        latitude=ticket.latitude,
        longitude=ticket.longitude,
        status="resolved",
    )

    final = runtime.verification_graph.invoke(state)

    ticket.verification_status = final.get("verification_status")
    ticket.verification_reason = final.get("verification_reason")
    ticket.status = final.get("status", "verified")
    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)


# ── Analytics ────────────────────────────────────────────

# ── SSE pipeline ─────────────────────────────────────────

@app.get("/api/tickets/{ticket_id}/process")
async def process_ticket_sse(ticket_id: str, db: Session = Depends(get_db)):
    if runtime.triage_graph is None:
        raise HTTPException(status_code=503, detail="Agent graphs not loaded")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    async def event_stream():
        state = runtime.TicketState(
            ticket_id=ticket_id,
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
                    for step in runtime.triage_graph.stream(state):
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
                        event_data = _json.dumps({
                            "agent": log_entry.get("agent", node_name),
                            "action": log_entry.get("action", "Processing..."),
                            "reasoning": log_entry.get("reasoning", ""),
                            "node": node_name,
                            "status": "running",
                        })
                        yield f"data: {event_data}\n\n"

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

            done_data = _json.dumps({
                "agent": "Pipeline",
                "action": "Complete",
                "reasoning": (
                    f"Ticket {ticket_id} fully processed. "
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
            })
            yield f"data: {done_data}\n\n"

        except Exception as e:
            err_data = _json.dumps({"agent": "Pipeline", "status": "error", "reasoning": str(e)})
            yield f"data: {err_data}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.get("/api/trace/{ticket_id}")
async def get_agent_trace(ticket_id: str):
    return {"ticket_id": ticket_id, "steps": [], "note": "Use /api/tickets/{id}/process for live SSE"}


@app.delete("/api/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    if not settings.DEV_ALLOW_DELETE:
        raise HTTPException(status_code=403, detail="DELETE endpoint is disabled outside development")
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin or super_admin role required")
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()
    return {"deleted": ticket_id}


@app.get("/api/me", response_model=MeResponse)
def get_me(current_user: AuthUser = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "role": current_user.role,
        "email": current_user.email,
        "phone": current_user.phone,
        "name": current_user.name,
    }
