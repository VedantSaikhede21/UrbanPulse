from typing import Optional

from pydantic import BaseModel


class TicketOut(BaseModel):
    id: str
    citizen_id: Optional[str] = None
    latitude: float
    longitude: float
    category: str
    severity: str
    description: Optional[str] = None
    status: str
    is_spam: bool
    is_duplicate: bool
    duplicate_of_id: Optional[str] = None
    priority_score: int
    priority_reason: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    verification_status: Optional[str] = None
    verification_reason: Optional[str] = None
    original_media_url: Optional[str] = None
    closure_media_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class PublicTicketOut(BaseModel):
    """Guest-facing incident shape for public geospatial APIs."""

    id: str
    category: str
    severity: str
    description: Optional[str] = None
    status: str
    latitude: float
    longitude: float
    created_at: Optional[str] = None


class NotificationOut(BaseModel):
    id: str
    ticket_id: str
    category: Optional[str] = None
    status: str
    message: str
    timestamp: Optional[str] = None