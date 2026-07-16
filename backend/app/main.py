import asyncio
import json as _json
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import jwt
from app.config import settings
from app.db.session import get_db
from app.db.models import Ticket, Citizen, Officer
from app.agents.graph import app_graph, TicketState

app = FastAPI(
    title="UrbanPulse AI Backend",
    description="Multi-agent civic infrastructure triage and routing platform backend",
    version="0.1.0"
)

# JWT Secret config fallback
JWT_SECRET = getattr(settings, "SUPABASE_JWT_SECRET", "placeholder-secret")

class AuthUser:
    def __init__(self, id: str, role: str, email: str = None, phone: str = None, name: str = None):
        self.id = id
        self.role = role
        self.email = email
        self.phone = phone
        self.name = name

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> AuthUser:
    if not authorization:
        # Development override fallback when no headers are supplied
        return AuthUser(
            id="00000000-0000-0000-0000-000000000000",
            role="super_admin",
            email="admin@urbanpulse.ai",
            name="Developer Admin"
        )
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        options = {}
        if JWT_SECRET == "placeholder-secret":
            options = {"verify_signature": False}
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options=options)
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
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Could not validate credentials: {str(e)}")

# Configure CORS for local development with our React client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "twilio_configured": settings.TWILIO_ACCOUNT_SID is not None
    }

@app.get("/api/tickets")
def list_tickets(db: Session = Depends(get_db)):
    try:
        tickets = db.query(Ticket).all()
        # Manually serialize to avoid GeoAlchemy geometry JSON serialization issues
        return [
            {
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
                "priority_score": t.priority_score,
                "priority_reason": t.priority_reason,
                "assigned_officer_id": str(t.assigned_officer_id) if t.assigned_officer_id else None,
                "verification_status": t.verification_status,
                "verification_reason": t.verification_reason,
                "original_media_url": t.original_media_url,
                "closure_media_url": t.closure_media_url,
                "created_at": t.created_at.isoformat() if t.created_at else None,
                "updated_at": t.updated_at.isoformat() if t.updated_at else None,
            }
            for t in tickets
        ]
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
                "created_at": "2026-07-14T18:00:00Z"
            },
            {
                "id": "a9e21bf4-c24d-45db-9c3f-c3f2d2b51201",
                "category": "Water Leak",
                "severity": "high",
                "description": "Main pipe line burst, water is spraying over the sidewalk.",
                "latitude": 12.9730,
                "longitude": 77.6120,
                "status": "reported",
                "priority_score": 3,
                "created_at": "2026-07-14T18:05:00Z"
            }
        ]

@app.get("/api/tickets/near")
def find_nearby_tickets(latitude: float, longitude: float, radius_meters: float = 1000.0, db: Session = Depends(get_db)):
    try:
        # Spatial search using GeoAlchemy2/PostGIS
        from sqlalchemy import func
        point = func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)
        tickets = db.query(Ticket).filter(
            func.ST_DWithin(Ticket.location_geom, point, radius_meters)
        ).all()
        return tickets
    except Exception as e:
        print(f"Spatial query error, falling back to mock: {e}")
        return []

@app.get("/api/tickets/{ticket_id}/process")
async def process_ticket_sse(ticket_id: str, db: Session = Depends(get_db)):
    """
    Server-Sent Events endpoint: runs the LangGraph pipeline for a ticket
    and streams each agent step to the client as it executes.
    On completion, writes results back to Supabase.
    """
    # (imports moved to top-level)

    # Load ticket from DB
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        return {"error": "Ticket not found"}

    async def event_stream():
        # Build initial state from DB ticket
        state = TicketState(
            ticket_id=ticket_id,
            citizen_text=ticket.description or "",
            original_media_url=ticket.original_media_url,
        )

        # We stream step-by-step by running the graph with stream=True
        try:
            # LangGraph streams node-by-node via .stream()
            for step in app_graph.stream(state):
                # step is a dict: {node_name: updated_state_dict}
                for node_name, node_output in step.items():
                    # Extract latest trace log entry
                    logs = node_output.get("trace_logs", [])
                    latest = logs[-1] if logs else {}
                    event_data = _json.dumps({
                        "agent": latest.get("agent", node_name),
                        "action": latest.get("action", "Processing..."),
                        "reasoning": latest.get("reasoning", ""),
                        "node": node_name,
                        "status": "running"
                    })
                    yield f"data: {event_data}\n\n"
                    await asyncio.sleep(0)  # yield control to event loop

            # Get final state
            final_state_dict = app_graph.invoke(state)

            # Write results back to Supabase ticket
            try:
                ticket.category = final_state_dict.get("category") or ticket.category
                ticket.severity = final_state_dict.get("severity") or ticket.severity
                ticket.is_spam = final_state_dict.get("is_spam", False)
                ticket.is_duplicate = final_state_dict.get("is_duplicate", False)
                ticket.priority_score = final_state_dict.get("priority_score", ticket.priority_score)
                ticket.priority_reason = final_state_dict.get("priority_reason")
                ticket.status = final_state_dict.get("status", "assigned")
                ticket.verification_status = final_state_dict.get("verification_status")
                ticket.verification_reason = final_state_dict.get("verification_reason")
                db.commit()
            except Exception as db_err:
                print(f"DB commit error: {db_err}")
                db.rollback()

            # Send done event
            done_data = _json.dumps({
                "agent": "Pipeline",
                "action": "Complete",
                "reasoning": f"Ticket {ticket_id} fully processed. Category: {final_state_dict.get('category')}, Priority: {final_state_dict.get('priority_score')}.",
                "node": "END",
                "status": "done",
                "result": {
                    "category": final_state_dict.get("category"),
                    "severity": final_state_dict.get("severity"),
                    "priority_score": final_state_dict.get("priority_score"),
                    "assigned_department": final_state_dict.get("assigned_department"),
                    "status": final_state_dict.get("status"),
                }
            })
            yield f"data: {done_data}\n\n"

        except Exception as e:
            err_data = _json.dumps({"agent": "Pipeline", "status": "error", "reasoning": str(e)})
            yield f"data: {err_data}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@app.get("/api/trace/{ticket_id}")
async def get_agent_trace(ticket_id: str):
    """Legacy stub — use /api/tickets/{ticket_id}/process for live SSE streaming."""
    return {"ticket_id": ticket_id, "steps": [], "note": "Use /api/tickets/{id}/process for live SSE"}


@app.get("/api/me")
def get_me(current_user: AuthUser = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "role": current_user.role,
        "email": current_user.email,
        "phone": current_user.phone,
        "name": current_user.name
    }

