import asyncio
import json as _json
import os
import secrets
import uuid
from typing import Optional, List

from fastapi import FastAPI, Depends, Header, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, load_only
from sqlalchemy import text, func
import jwt

from app.config import settings
from app.db.session import get_db
from app.db.models import Ticket, Citizen, Officer, Ward

app = FastAPI(
    title="UrbanPulse AI Backend",
    description="Multi-agent civic infrastructure triage and routing platform backend",
    version="0.2.0",
)

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

_triage_graph = None
_verification_graph = None
TicketState = None


@app.on_event("startup")
async def load_graphs():
    global _triage_graph, _verification_graph, TicketState
    from app.agents.graph import triage_graph, verification_graph, TicketState as TS
    _triage_graph = triage_graph
    _verification_graph = verification_graph
    TicketState = TS


JWT_SECRET = settings.SUPABASE_JWT_SECRET or "placeholder-secret"


class AuthUser:
    def __init__(self, id: str, role: str, email: str = None, phone: str = None, name: str = None):
        self.id = id
        self.role = role
        self.email = email
        self.phone = phone
        self.name = name


def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> AuthUser:
    if not authorization:
        if settings.ENV == "development" and settings.DEV_ALLOW_ANONYMOUS:
            return AuthUser(
                id="00000000-0000-0000-0000-000000000000",
                role="super_admin",
                email="admin@urbanpulse.ai",
                name="Developer Admin",
            )
        raise HTTPException(status_code=401, detail="Authorization header required")

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        decode_options = {}
        if not settings.SUPABASE_JWT_SECRET:
            decode_options = {"verify_signature": False}
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options=decode_options)
        user_id = payload.get("sub")
        email = payload.get("email")
        phone = payload.get("phone")
        user_metadata = payload.get("user_metadata", {})
        role = user_metadata.get("role")
        if not role:
            role = "officer" if email else "citizen"
        name = "Unknown User"
        if role == "citizen":
            citizen = db.query(Citizen).filter(Citizen.id == user_id).first()
            if citizen:
                name = citizen.name
        else:
            officer = db.query(Officer).filter(Officer.id == user_id).first()
            if officer:
                name = officer.name
        return AuthUser(id=user_id, role=role, email=email, phone=phone, name=name)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Could not validate credentials: {str(e)}")


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


class ResolveTicketRequest(BaseModel):
    closure_media_url: str
    notes: Optional[str] = None


class UpdateTicketStatusRequest(BaseModel):
    status: str


# ── Health ───────────────────────────────────────────────

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        pass

    return {
        "status": "healthy",
        "environment": settings.ENV,
        "database_connected": db_connected,
        "supabase_configured": settings.SUPABASE_ANON_KEY != "placeholder-anon-key",
        "gemini_configured": settings.GEMINI_API_KEY is not None,
        "twilio_configured": settings.TWILIO_ACCOUNT_SID is not None,
        "graphs_loaded": _triage_graph is not None,
    }


# ── File Upload ───────────────────────────────────────────

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".webm", ".mp3", ".wav", ".m4a", ".pdf"}

@app.post("/api/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
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


@app.get("/api/tickets/{ticket_id}")
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    try:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    except Exception:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return serialize_ticket(ticket)


@app.post("/api/tickets", status_code=201)
def create_ticket(
    body: CreateTicketRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    citizen_id = None
    if current_user.role == "citizen" and current_user.id != "00000000-0000-0000-0000-000000000000":
        citizen_id = uuid.UUID(current_user.id)
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


@app.get("/api/tickets/near")
def find_nearby_tickets(
    latitude: float,
    longitude: float,
    radius_meters: float = 1000.0,
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


# ── Officer endpoints ────────────────────────────────────

@app.get("/api/officers/queue")
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


@app.patch("/api/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: str,
    body: UpdateTicketStatusRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = body.status
    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)


@app.post("/api/tickets/{ticket_id}/resolve")
async def resolve_ticket(
    ticket_id: str,
    body: ResolveTicketRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    if _verification_graph is None:
        raise HTTPException(status_code=503, detail="Agent graphs not loaded")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.closure_media_url = body.closure_media_url
    ticket.status = "resolved"
    db.commit()

    state = TicketState(
        ticket_id=ticket_id,
        citizen_text=ticket.description or "",
        original_media_url=ticket.original_media_url,
        closure_media_url=body.closure_media_url,
        category=ticket.category,
        latitude=ticket.latitude,
        longitude=ticket.longitude,
        status="resolved",
    )

    final = _verification_graph.invoke(state)

    ticket.verification_status = final.get("verification_status")
    ticket.verification_reason = final.get("verification_reason")
    ticket.status = final.get("status", "verified")
    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)


# ── Analytics ────────────────────────────────────────────

@app.get("/api/analytics/wards")
def ward_analytics(db: Session = Depends(get_db)):
    wards = db.query(Ward).options(load_only(Ward.id, Ward.name, Ward.uhs_score)).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "uhs_score": float(w.uhs_score),
        }
        for w in wards
    ]


@app.get("/api/analytics/city-pulse")
def city_pulse(db: Session = Depends(get_db)):
    """AI City Pulse — ward health summary with trending issues."""
    wards = db.query(Ward).options(load_only(Ward.id, Ward.name, Ward.uhs_score)).order_by(Ward.uhs_score.asc()).all()
    critical = [w for w in wards if float(w.uhs_score) < 50]

    trending = (
        db.query(Ticket.category, func.count(Ticket.id).label("count"))
        .filter(Ticket.status.in_(["reported", "assigned", "in_progress"]))
        .group_by(Ticket.category)
        .order_by(func.count(Ticket.id).desc())
        .limit(3)
        .all()
    )

    alerts = []
    for w in critical[:3]:
        ward_tickets = (
            db.query(Ticket)
            .filter(Ticket.status.in_(["reported", "assigned", "in_progress"]))
            .count()
        )
        alerts.append(
            f"{w.name} (Critical): UHS {float(w.uhs_score):.0f}. "
            f"Review open incidents and dispatch field teams."
        )

    if not alerts and wards:
        lowest = wards[0]
        alerts.append(
            f"Pulse Alert: {lowest.name} — UHS {float(lowest.uhs_score):.0f}. "
            f"Monitor for emerging infrastructure issues."
        )

    return {
        "wards": [{"name": w.name, "uhs_score": float(w.uhs_score)} for w in wards],
        "critical_wards": len(critical),
        "trending_categories": [{"category": c, "count": n} for c, n in trending],
        "pulse_alerts": alerts,
    }


# ── SSE pipeline ─────────────────────────────────────────

@app.get("/api/tickets/{ticket_id}/process")
async def process_ticket_sse(ticket_id: str, db: Session = Depends(get_db)):
    if _triage_graph is None:
        raise HTTPException(status_code=503, detail="Agent graphs not loaded")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    async def event_stream():
        state = TicketState(
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
            seen_logs = 0
            for step in _triage_graph.stream(state):
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
                        await asyncio.sleep(0)

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


@app.get("/api/me")
def get_me(current_user: AuthUser = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "role": current_user.role,
        "email": current_user.email,
        "phone": current_user.phone,
        "name": current_user.name,
    }
