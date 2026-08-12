from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.agents import runtime
from app.config import settings
from app.db.session import get_db
from app.schemas.health import HealthResponse, ReadinessResponse

router = APIRouter()


@router.get("/api/health", response_model=HealthResponse)
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
        "graphs_loaded": runtime.triage_graph is not None,
    }


@router.get("/api/health/ready", response_model=ReadinessResponse)
def readiness_check(db: Session = Depends(get_db)):
    """Readiness probe used by Docker healthchecks. 503 while the database is unreachable."""
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        pass

    if not db_connected:
        raise HTTPException(status_code=503, detail="Database unavailable")

    return {
        "status": "ready",
        "environment": settings.ENV,
        "database_connected": True,
        "graphs_loaded": runtime.triage_graph is not None,
    }