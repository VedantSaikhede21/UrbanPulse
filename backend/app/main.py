import asyncio
import json as _json
import os
import uuid
from typing import Optional, List

from fastapi import FastAPI, Depends, Header, HTTPException, UploadFile, File, Request, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.limiter import limiter
from sqlalchemy.orm import Session

from app.agents import runtime
from app.auth.deps import AuthUser, get_current_user, get_optional_user
from app.config import settings
from app.db.session import get_db
from app.db.models import Ticket, Officer
from app.logging import configure_logging
from app.routers.analytics import router as analytics_router
from app.routers.agents import router as agents_router
from app.routers.whatsapp import router as whatsapp_router
from app.sentry import init_sentry
from app.services import agent_logs, audit, notifications, officers, pipeline, tickets
from app.services.storage import get_storage
from app.routers.health import router as health_router
from app.schemas.auth import MeResponse
from app.schemas.tickets import NotificationOut, TicketOut, PublicTicketOut
from app.schemas.audit import AuditOut
from app.schemas.officers import (
    OfficerOut,
    CreateOfficerRequest,
    UpdateOfficerRequest,
    AssignTicketRequest,
)
from app.schemas.upload import UploadResponse
from app.services.tickets import VALID_TICKET_STATUSES

# Constants
ANONYMOUS_USER_ID = "00000000-0000-0000-0000-000000000000"
STAFF_ROLES = ("officer", "dept_head", "admin", "super_admin")
MANAGER_ROLES = ("admin", "super_admin")

# Sentry first — must run before any module-level work that could
# raise (FastAPI app construction, structlog init). The function is
# a no-op when SENTRY_DSN is unset, so dev / CI / tests are
# unaffected. Initialising the API process with runtime="api" so
# the worker process can later init with runtime="worker" and the
# two streams are separable in the dashboard.
init_sentry(runtime="api")

app = FastAPI(
    title="UrbanPulse AI Backend",
    description="Multi-agent civic infrastructure triage and routing platform backend",
    version="0.2.0",
)

# Install the central structlog configuration before any module emits
# a log line. Idempotent — calling again is a no-op, so the ARQ worker
# (which reimports app.main) is safe.
configure_logging()

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(health_router)
app.include_router(analytics_router)
app.include_router(agents_router)
app.include_router(whatsapp_router)

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB
CHUNK_SIZE = 1024 * 1024  # 1 MB chunks for streaming upload


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    traceback.print_exc()
    # Forward to Sentry if initialised. The function is a no-op when
    # SENTRY_DSN is unset, so dev / tests are unaffected. The
    # ``before_send`` scrubber in app.sentry strips request bodies so
    # the citizen's phone number does not leave the process.
    from app.sentry import capture_exception
    capture_exception(exc, path=str(request.url), method=request.method)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.on_event("startup")
async def load_graphs():
    try:
        runtime.load_graphs()
    except Exception as e:
        import logging
        logging.error(f"Failed to load agent graphs: {e}")
        raise


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Static-files mount for the LocalStorage dev fallback. When
# SUPABASE_STORAGE_BUCKET is set (production), media lives in
# Supabase Storage and these URLs are not used by the app — the
# serializer rewrites keys to signed URLs at read time. We still
# keep the mount active so a stale key (e.g. an old DB row that
# predates the migration) does not 500; it will just 404 from
# the disk.
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
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


from app.services.tickets import VALID_TICKET_STATUSES


class ResolveTicketRequest(BaseModel):
    closure_media_url: str
    notes: Optional[str] = None


class UpdateTicketStatusRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in VALID_TICKET_STATUSES:
            raise ValueError(f"status must be one of {', '.join(VALID_TICKET_STATUSES)}")
        return v


# ── File Upload ───────────────────────────────────────────

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".mp4", ".mov", ".webm", ".mp3", ".wav", ".m4a", ".pdf"}
ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "video/mp4", "video/quicktime", "video/webm",
    "audio/mpeg", "audio/wav", "audio/mp4", "audio/x-m4a",
    "application/pdf"
}

# File signature (magic bytes) validation for actual file type verification
# Maps extension -> list of valid magic byte sequences at file start
FILE_SIGNATURES = {
    ".jpg": [b"\xFF\xD8\xFF"],
    ".jpeg": [b"\xFF\xD8\xFF"],
    ".png": [b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A"],
    ".webp": [b"RIFF"],  # RIFF header, check for WEBP at offset 8
    ".mp4": [b"\x00\x00\x00\x18ftypmp4", b"\x00\x00\x00\x1Cftypmp4", b"\x00\x00\x00\x20ftypmp4"],
    ".mov": [b"\x00\x00\x00\x14ftypqt"],
    ".webm": [b"\x1A\x45\xDF\xA3"],  # EBML header
    ".mp3": [b"ID3", b"\xFF\xFB", b"\xFF\xF3", b"\xFF\xF2"],
    ".wav": [b"RIFF"],
    ".m4a": [b"\x00\x00\x00\x18ftypM4A", b"\x00\x00\x00\x1CftypM4A"],
    ".pdf": [b"%PDF"],
}

def validate_file_signature(filepath: str, ext: str) -> bool:
    """Verify file matches its extension by checking magic bytes."""
    signatures = FILE_SIGNATURES.get(ext.lower())
    if not signatures:
        return True  # No signature check defined for this type

    try:
        with open(filepath, "rb") as f:
            header = f.read(32)  # Read enough bytes for all signatures

        # Special handling for WebP (RIFF + WEBP at offset 8)
        if ext.lower() == ".webp":
            return header.startswith(b"RIFF") and b"WEBP" in header[:16]

        # Special handling for WAV (RIFF + WAVE at offset 8)
        if ext.lower() == ".wav":
            return header.startswith(b"RIFF") and b"WAVE" in header[:16]

        # Check other signatures
        for sig in signatures:
            if header.startswith(sig):
                return True
        return False
    except Exception:
        return False


def validate_file_signature_bytes(content: bytes, ext: str) -> bool:
    """Same as validate_file_signature, but on in-memory bytes.

    Phase 2.2 swap: the upload endpoint used to write the file to
    disk first and then read it back to verify the magic bytes,
    which is wasted I/O now that we have the bytes in memory
    already. This is the bytes-only version, identical logic to
    twilio_service.validate_file_signature but kept inline to
    avoid coupling main.py to twilio_service.
    """
    signatures = FILE_SIGNATURES.get(ext.lower())
    if not signatures:
        return True

    header = content[:32]

    if ext.lower() == ".webp":
        return header.startswith(b"RIFF") and b"WEBP" in header[:16]
    if ext.lower() == ".wav":
        return header.startswith(b"RIFF") and b"WAVE" in header[:16]
    for sig in signatures:
        if header.startswith(sig):
            return True
    return False


@app.post("/api/upload", response_model=UploadResponse)
@limiter.limit("10/minute")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    current_user: AuthUser = Depends(get_current_user),
):
    # MIME type validation
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"MIME type {content_type} not allowed")
    ext = (os.path.splitext(file.filename or "file")[1] or ".bin").lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

    # Stream upload into memory (cap-bounded). The whole file is
    # validated before it ever hits the storage backend, so we do
    # not need a streaming write to storage.
    chunks: list[bytes] = []
    total_size = 0
    while chunk := await file.read(CHUNK_SIZE):
        total_size += len(chunk)
        if total_size > MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=413, detail=f"File exceeds maximum size of {MAX_UPLOAD_SIZE // (1024*1024)} MB")
        chunks.append(chunk)
    content = b"".join(chunks)

    # Validate actual file type via magic bytes (signature check)
    # BEFORE we hand the bytes to the storage backend. This keeps
    # the same security guarantee as the previous local-disk path.
    if not validate_file_signature_bytes(content, ext):
        raise HTTPException(status_code=400, detail=f"File content does not match extension {ext} — possible type spoofing")

    # Phase 5: downscale / recompress image uploads before they
    # hit storage or get sent to Gemini. A 5 MB phone photo
    # becomes ~300 KB at 1600px long-edge JPEG q85. The
    # optimizer is a no-op for non-image content types and
    # returns the original bytes when Pillow is unavailable.
    try:
        from app.services.image_opt import optimize_image
        content, content_type = optimize_image(content, content_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    storage = get_storage()
    # Save the validated bytes through the configured backend. The
    # returned key is what gets stored in the database; main.py
    # never sees a real URL — that is the storage backend's job.
    key = storage.save_bytes(content, ext, content_type, prefix="uploads")
    return {"url": storage.public_url(key), "key": key}


# ── Notifications ─────────────────────────────────────────

@app.get("/api/notifications", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: AuthUser = Depends(get_current_user)):
    citizen_id = current_user.id if current_user.role == "citizen" and current_user.id != "00000000-0000-0000-0000-000000000000" else None
    return notifications.list_notifications(db, citizen_id)


@app.patch("/api/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    """Mark a single notification read. Citizens may only mark
    their own notifications (the WHERE clause enforces this)."""
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can mark notifications read")
    if current_user.id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Authorization required")
    ok = notifications.mark_read(db, current_user.id, notification_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found or already read")
    return {"status": "ok"}


@app.post("/api/notifications/mark-all-read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    """Mark every unread notification for the current citizen read."""
    if current_user.role != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can mark notifications read")
    if current_user.id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=401, detail="Authorization required")
    n = notifications.mark_all_read(db, current_user.id)
    return {"status": "ok", "marked": n}


# ── Tickets CRUD ─────────────────────────────────────────

@app.get("/api/tickets")
def list_tickets(db: Session = Depends(get_db), current_user: AuthUser = Depends(get_current_user)):
    citizen_id = current_user.id if current_user.role == "citizen" and current_user.id != "00000000-0000-0000-0000-000000000000" else None
    return tickets.list_tickets(db, citizen_id)


@app.get("/api/tickets/near", response_model=List[PublicTicketOut])
@limiter.limit("60/minute")
def find_nearby_tickets(
    request: Request,
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_meters: float = Query(default=1000.0, ge=1, le=50000),
    db: Session = Depends(get_db),
):
    return tickets.find_nearby_tickets(db, latitude, longitude, radius_meters)


@app.get("/api/tickets/{ticket_id}", response_model=TicketOut)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return tickets.get_ticket(db, ticket_id, current_user.role, current_user.id)


@app.get("/api/tickets/{ticket_id}/trace")
def get_ticket_trace(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    """Return the persisted AI trace (per-agent reasoning) for a ticket.

    Requires the caller to be able to view the ticket itself: the
    ticket owner (citizen) or any staff role. The trace is the
    Phase 1 "AgentLogs / audit-trail persistence" deliverable; without
    this endpoint the data is write-only, which defeats the audit
    purpose.
    """
    # Re-use the ticket read authorization logic: a citizen who
    # cannot read the ticket must not be able to read its trace.
    tickets.get_ticket(db, ticket_id, current_user.role, current_user.id)
    return agent_logs.list_trace(db, ticket_id)


@app.post("/api/tickets", status_code=201, response_model=TicketOut)
@limiter.limit("20/minute")
def create_ticket(
    request: Request,
    body: CreateTicketRequest,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return tickets.create_ticket(db, current_user.role, current_user.id, body, background=background)


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

    ticket_rows = query.order_by(Ticket.priority_score.desc(), Ticket.created_at.asc()).all()
    return [tickets.serialize_ticket(t) for t in ticket_rows]


# ── Officer management ───────────────────────────────────

@app.get("/api/officers", response_model=List[OfficerOut])
def list_officers(db: Session = Depends(get_db), current_user: AuthUser = Depends(get_current_user)):
    if current_user.role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="Officer access required")
    return officers.list_officers(db)


@app.post("/api/officers", response_model=OfficerOut, status_code=201)
def create_officer(
    body: CreateOfficerRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return officers.create_officer(
        db, body.name, body.department, current_user.role, current_user.id,
        body.user_id, body.role, body.department_id,
    )


@app.patch("/api/officers/{officer_id}", response_model=OfficerOut)
def update_officer(
    officer_id: str,
    body: UpdateOfficerRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return officers.update_officer(db, officer_id, body.is_active, current_user.role, current_user.id)


@app.patch("/api/tickets/{ticket_id}/assign", response_model=TicketOut)
def assign_ticket(
    ticket_id: str,
    body: AssignTicketRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return officers.assign_ticket(db, ticket_id, body.officer_id, current_user.role, current_user.id)


@app.patch("/api/tickets/{ticket_id}/status", response_model=TicketOut)
def update_ticket_status(
    ticket_id: str,
    body: UpdateTicketStatusRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return tickets.update_ticket_status(db, ticket_id, body.status, current_user.role, current_user.id)


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

    result = pipeline.run_verification(
        ticket, body.closure_media_url, runtime.verification_graph, runtime.TicketState, db
    )
    audit.record_audit(
        db,
        user_id=current_user.id,
        action="ticket.resolve",
        target_table="tickets",
        record_id=ticket_id,
        details={
            "status": result.get("status"),
            "verification_status": result.get("verification_status"),
        },
    )
    return result


# ── Analytics ────────────────────────────────────────────

# ── SSE pipeline ─────────────────────────────────────────

@app.get("/api/tickets/{ticket_id}/process")
async def process_ticket_sse(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[AuthUser] = Depends(get_optional_user),
):
    try:
        uuid.UUID(ticket_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Identity gate: when a Bearer token is present, only the owning citizen
    # (or staff) may watch/trigger the pipeline; 404 hides other citizens'
    # tickets. Native EventSource clients cannot send Authorization headers,
    # so anonymous callers keep the capability-URL path — the ticket UUID is
    # unguessable and the public nearby API no longer leaks full tickets.
    if current_user is not None and current_user.role == "citizen" and current_user.id != "00000000-0000-0000-0000-000000000000":
        if ticket.citizen_id is None or str(ticket.citizen_id) != current_user.id:
            raise HTTPException(status_code=404, detail="Ticket not found")

    # Phase 2.1: SSE is now a *replay* channel, not a runner.
    # If the pipeline has already run (completed / failed), we
    # stream the persisted agent_logs back. We do NOT re-run
    # the graph — that would defeat the point of the worker.
    # If the pipeline is still pending / processing, we enqueue
    # and stream a small "still working" event so the client
    # knows the worker has the ticket; the worker doesn't
    # push to the SSE channel (no broker between worker and
    # HTTP), so the client polls /api/tickets/{id} until
    # processing_state moves to 'completed' and re-opens the
    # SSE stream if it wants the trace replay.
    async def event_stream():
        if ticket.processing_state in ("completed", "failed"):
            entries = agent_logs.list_trace(db, ticket_id)
            for entry in entries:
                yield f"data: {_json.dumps({
                    'agent': entry.get('agent'),
                    'action': entry.get('action'),
                    'reasoning': entry.get('reasoning'),
                    'node': entry.get('node'),
                    'status': 'done',
                })}\n\n"
            yield f"data: {_json.dumps({
                'agent': 'Pipeline',
                'action': 'Complete',
                'node': 'END',
                'status': 'done',
                'result': {
                    'category': ticket.category,
                    'severity': ticket.severity,
                    'priority_score': ticket.priority_score,
                    'status': ticket.status,
                },
            })}\n\n"
            return

        # pending or processing — make sure the worker has it.
        if ticket.processing_state == "pending":
            try:
                from app.queue import enqueue_triage
                await enqueue_triage(str(ticket.id))
            except Exception:
                pass

        yield f"data: {_json.dumps({
            'agent': 'Pipeline',
            'action': 'Queued — the AI worker will process this ticket shortly.',
            'node': 'WAIT',
            'status': 'running',
        })}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.delete("/api/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    return tickets.delete_ticket(db, ticket_id, current_user.role, current_user.id)


@app.get("/api/me", response_model=MeResponse)
def get_me(current_user: AuthUser = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "role": current_user.role,
        "email": current_user.email,
        "phone": current_user.phone,
        "name": current_user.name,
    }


# ── Account Linking ───────────────────────────────────────

class LinkPhoneRequest(BaseModel):
    phone: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$", description="Phone number in E.164 format")

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, v: str) -> str:
        """Normalize phone to E.164 format without leading +."""
        v = v.strip()
        if v.startswith("+"):
            v = v[1:]
        if v.startswith("whatsapp:"):
            v = v[9:]
        return v


@app.post("/api/citizen/link-phone")
def link_phone(
    body: LinkPhoneRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    """Link a phone number to the current citizen account.

    If the phone number belongs to an existing WhatsApp-only citizen,
    that citizen's tickets and data are merged into the current account.
    """
    if current_user.role != "citizen" or current_user.id == "00000000-0000-0000-0000-000000000000":
        raise HTTPException(status_code=403, detail="Only authenticated citizens can link phone numbers")

    citizen_uuid = uuid.UUID(current_user.id)
    citizen = db.query(Citizen).filter(Citizen.id == citizen_uuid).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")

    # Check if this phone is already linked to another citizen
    existing = db.query(Citizen).filter(
        Citizen.phone == body.phone,
        Citizen.merged_into_id.is_(None),
        Citizen.id != citizen_uuid
    ).first()

    if existing:
        # Merge the existing WhatsApp citizen into this one
        from app.auth.deps import _merge_citizens
        merged = _merge_citizens(db, existing, citizen_uuid, citizen.email, {"name": citizen.name})
        return {
            "status": "merged",
            "message": f"Linked phone and merged {merged.id} WhatsApp account",
            "tickets_merged": True,
        }

    # No existing citizen with this phone - just update current citizen
    if citizen.phone:
        raise HTTPException(status_code=400, detail="Phone number already linked to this account")

    citizen.phone = body.phone
    db.commit()
    return {"status": "linked", "message": "Phone number linked successfully"}


# ── Audit trail ─────────────────────────────────────────

@app.get("/api/audit", response_model=List[AuditOut])
def list_audit(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return audit.list_audit(db, limit)


# ── SLA configuration (Phase 4) ──────────────────────────────
# The citizen UI reads the per-category SLA map to render the
# "expected resolution by …" countdown on the ReportDetail page
# AND to show the promise on the report form before the citizen
# files. The PUT endpoint lets staff tune the values without a
# code deploy. The change is recorded in the audit log so a
# future review can answer "when did we promise 24h resolution
# for potholes?".

from app.schemas.sla import SLAResponse, SLAUpdateRequest
from app.services import sla as sla_service


@app.get("/api/sla", response_model=SLAResponse)
def get_sla(db: Session = Depends(get_db)):
    """Public — no auth. The map is non-sensitive; showing the
    promise publicly is the whole point of the feature.

    Returns the current per-category SLA minutes map plus the
    fallback used for categories the operator hasn't configured.
    """
    return SLAResponse(
        minutes_by_category=sla_service.get_sla_map(db),
        default_minutes=sla_service.DEFAULT_SLA_MINUTES,
    )


@app.put("/api/sla", response_model=SLAResponse)
def update_sla(
    body: SLAUpdateRequest,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user),
):
    """Staff-only. Updates the per-category SLA map.

    Reuses the same `STAFF_ROLES` guard as the other privileged
    endpoints (Phase 0 commitment: server-side RBAC is the only
    access control — frontend hidden-nav is a UX hint, not a
    gate). The audit log entry records the before/after so the
    change is reviewable.
    """
    if current_user.role not in STAFF_ROLES:
        raise HTTPException(status_code=403, detail="Staff access required")
    previous_map = sla_service.get_sla_map(db)
    updated_map = sla_service.upsert_sla_map(db, body.minutes_by_category)
    audit.record_audit(
        db,
        user_id=current_user.id,
        action="sla.update",
        target_table="system_settings",
        record_id=sla_service.SLA_KEY,
        details={
            "from": previous_map,
            "to": updated_map,
            "actor_role": current_user.role,
        },
    )
    return SLAResponse(
        minutes_by_category=updated_map,
        default_minutes=sla_service.DEFAULT_SLA_MINUTES,
    )
