"""WhatsApp webhook router for Twilio integration.

Handles incoming WhatsApp messages from citizens, processes them through
the AI triage pipeline, and sends confirmation replies.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Form, Header, HTTPException, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import get_db
from app.db.models import Citizen, Ticket
from app.services import audit, twilio_service, geocoding_service, pipeline
from app.agents import runtime

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


# Track retry state per phone number (in-memory for v1, consider Redis for production)
_retry_state: dict[str, bool] = {}


def _normalize_phone(from_number: str) -> str:
    """Extract clean phone number from WhatsApp format 'whatsapp:+15551234567'."""
    if from_number.startswith("whatsapp:"):
        return from_number[9:]  # Remove 'whatsapp:' prefix
    return from_number


def _get_or_create_citizen(db: Session, phone: str, name: Optional[str] = None) -> Citizen:
    """Lookup citizen by phone, create if not exists."""
    citizen = db.query(Citizen).filter(Citizen.phone == phone).first()
    if citizen:
        return citizen

    # Create new citizen with phone as primary identifier
    citizen = Citizen(
        phone=phone,
        email=f"{phone}@whatsapp.urbanpulse",  # Placeholder email for phone-only users
        name=name or f"Citizen {phone[-4:]}",
        reputation_score=100,
    )
    db.add(citizen)
    db.commit()
    db.refresh(citizen)
    return citizen


@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    # Twilio sends form data
    From: str = Form(...),
    Body: str = Form(default=""),
    NumMedia: str = Form(default="0"),
    Latitude: Optional[str] = Form(default=None),
    Longitude: Optional[str] = Form(default=None),
    # Media fields are dynamic (MediaUrl0, MediaContentType0, etc.)
    db: Session = Depends(get_db),
    x_twilio_signature: Optional[str] = Header(default=None),
):
    """
    Twilio WhatsApp webhook endpoint.

    Expected form fields:
    - From: "whatsapp:+15551234567"
    - Body: Text message content
    - NumMedia: Number of media items
    - MediaUrl{N}, MediaContentType{N}, MediaSid{N}: Media details
    - Latitude, Longitude: If location pin shared
    """
    # Collect all form data for signature validation
    form_data = await request.form()
    form_dict = dict(form_data)

    # Validate Twilio signature (security-critical)
    if not twilio_service.validate_signature(request, str(request.url), form_dict):
        # In development, allow if no credentials configured
        if not (settings.ENV == "development" and not settings.TWILIO_AUTH_TOKEN):
            raise HTTPException(status_code=403, detail="Invalid Twilio signature")

    # Parse webhook payload
    parsed = twilio_service.parse_webhook(form_dict)
    from_number = parsed["from_number"]
    body_text = parsed["body"]
    media_list = parsed["media"]
    location = parsed["location"]

    # Normalize phone for lookup
    phone = _normalize_phone(from_number)

    # Check retry state
    has_retried = _retry_state.get(phone, False)

    # Determine location
    lat: Optional[float] = None
    lng: Optional[float] = None
    location_source = "gps"

    if location:
        # Native WhatsApp location pin - use immediately
        lat = location["latitude"]
        lng = location["longitude"]
        location_source = "gps"
    elif body_text and not has_retried:
        # No location pin, but has text - attempt geocoding
        geocode_result = await geocoding_service.geocode(body_text)
        if geocode_result:
            geocode_lat, geocode_lng, confidence, display_name = geocode_result
            if geocoding_service.is_confident(confidence):
                lat = geocode_lat
                lng = geocode_lng
                location_source = "geocoded"
            else:
                # Low confidence - will prompt for location
                pass

    # If no location determined and not yet retried, send retry prompt
    if lat is None or lng is None:
        if not has_retried:
            _retry_state[phone] = True
            retry_msg = (
                "We need your location to file this report. "
                "Please share your location pin (tap 📎 → Location → Send Current Location) "
                "or reply with a nearby landmark/address (e.g., 'near MG Road market')."
            )
            await twilio_service.send_whatsapp_message(from_number, retry_msg)
            return Response(content="", media_type="application/xml")

        # Already retried once - give up for v1
        error_msg = (
            "Sorry, we couldn't determine your location. "
            "Please use the web app at UrbanPulse to report with a map pin, "
            "or try again with a clear landmark."
        )
        await twilio_service.send_whatsapp_message(from_number, error_msg)
        return Response(content="", media_type="application/xml")

    # Clear retry state on success
    if phone in _retry_state:
        del _retry_state[phone]

    # Get or create citizen
    citizen = _get_or_create_citizen(db, phone)

    # Download and rehost media
    media_url = None
    if media_list:
        # Use first image/media for now
        for media in media_list:
            if media.get("content_type", "").startswith("image/"):
                local_path = await twilio_service.download_media(
                    media["url"], media["content_type"]
                )
                if local_path:
                    # Convert to absolute URL
                    base_url = str(request.base_url).rstrip("/")
                    media_url = f"{base_url}{local_path}"
                break

    # Create ticket with placeholder category (will be updated by pipeline)
    ticket = Ticket(
        citizen_id=citizen.id,
        latitude=lat,
        longitude=lng,
        category="Uncategorized",  # Placeholder - pipeline will classify
        severity="medium",  # Default - pipeline will classify
        description=body_text or "WhatsApp report without description",
        original_media_url=media_url,
        status="reported",
        priority_score=1,
        location_source=location_source,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # Audit log
    audit.record_audit(
        db,
        user_id=str(citizen.id),
        action="ticket.create",
        target_table="tickets",
        record_id=str(ticket.id),
        details={
            "category": ticket.category,
            "severity": ticket.severity,
            "status": ticket.status,
            "source": "whatsapp",
            "location_source": location_source,
            "phone": phone,
        },
    )

    # Run triage pipeline synchronously
    try:
        if runtime.triage_graph is not None and runtime.TicketState is not None:
            result = pipeline.run_triage_sync(
                ticket, runtime.triage_graph, runtime.TicketState, db
            )
        else:
            result = {"success": False, "error": "Pipeline not available"}
    except Exception as e:
        # Pipeline crashed unexpectedly - log and use fallback
        print(f"Pipeline error: {e}")
        result = {"success": False, "error": str(e)}

    # Send confirmation reply
    if result.get("success"):
        category = result.get("category", "your issue")
        priority = result.get("priority_score", 1)
        priority_labels = {1: "Low", 2: "Medium", 3: "High"}
        priority_label = priority_labels.get(priority, "Medium")
        ticket_ref = str(ticket.id)[:8].upper()

        confirm_msg = (
            f"✅ Report received! Reference: {ticket_ref}\n"
            f"Category: {category}\n"
            f"Priority: {priority_label}\n"
            f"An officer has been assigned. Track updates at UrbanPulse."
        )
    else:
        confirm_msg = (
            f"✅ Report received! Reference: {str(ticket.id)[:8].upper()}\n"
            f"Our team will review and categorize this shortly."
        )

    await twilio_service.send_whatsapp_message(from_number, confirm_msg)

    # Return empty TwiML response (Twilio expects XML but empty is fine)
    return Response(content="", media_type="application/xml")


@router.get("/health")
def whatsapp_health():
    """Health check for WhatsApp integration."""
    return {
        "configured": settings.TWILIO_ACCOUNT_SID is not None,
        "account_sid_prefix": settings.TWILIO_ACCOUNT_SID[:8] if settings.TWILIO_ACCOUNT_SID else None,
    }