"""Twilio WhatsApp integration service.

Handles:
- Webhook signature validation (security-critical)
- Media download and rehost via the configured storage backend
  (Supabase Storage in production, local /uploads in dev —
  see app.services.storage for the abstraction)
- Outbound WhatsApp message sending
- Webhook payload parsing
"""

import hmac
import hashlib
import base64
from urllib.parse import urlencode
from typing import Optional, List, Dict, Any
from fastapi import Request

import httpx
import structlog

from app.config import settings
from app.services.storage import get_storage

# File signature (magic bytes) validation for actual file type verification
FILE_SIGNATURES = {
    ".jpg": [b"\xFF\xD8\xFF"],
    ".jpeg": [b"\xFF\xD8\xFF"],
    ".png": [b"\x89\x50\x4E\x47\x0D\x0A\x1A\x0A"],
    ".webp": [b"RIFF"],
    ".mp4": [b"\x00\x00\x00\x18ftypmp4", b"\x00\x00\x00\x1Cftypmp4", b"\x00\x00\x00\x20ftypmp4"],
    ".mov": [b"\x00\x00\x00\x14ftypqt"],
    ".webm": [b"\x1A\x45\xDF\xA3"],
    ".mp3": [b"ID3", b"\xFF\xFB", b"\xFF\xF3", b"\xFF\xF2"],
    ".wav": [b"RIFF"],
    ".m4a": [b"\x00\x00\x00\x18ftypM4A", b"\x00\x00\x00\x1CftypM4A"],
    ".ogg": [b"OggS"],
    ".pdf": [b"%PDF"],
}

def validate_file_signature(content: bytes, ext: str) -> bool:
    """Verify file matches its extension by checking magic bytes."""
    signatures = FILE_SIGNATURES.get(ext.lower())
    if not signatures:
        return True  # No signature check defined for this type

    header = content[:32]  # Read enough bytes for all signatures

    # Special handling for WebP (RIFF + WEBP at offset 8)
    if ext.lower() == ".webp":
        return header.startswith(b"RIFF") and b"WEBP" in header[:16]

    # Special handling for WAV (RIFF + WAVE at offset 8)
    if ext.lower() == ".wav":
        return header.startswith(b"RIFF") and b"WAVE" in header[:16]

    # Special handling for OGG (OggS)
    if ext.lower() == ".ogg":
        return header.startswith(b"OggS")

    # Check other signatures
    for sig in signatures:
        if header.startswith(sig):
            return True
    return False


class TwilioService:
    """Service for Twilio WhatsApp API interactions."""

    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.whatsapp_number = settings.TWILIO_WHATSAPP_NUMBER
        self.base_url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}"
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                auth=(self.account_sid, self.auth_token),
                timeout=30.0,
            )
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    def validate_signature(self, request: Request, url: str, form_data: Dict[str, str]) -> bool:
        """
        Validate Twilio webhook signature.

        Twilio signs requests with X-Twilio-Signature header using HMAC-SHA1
        of the full URL + sorted form parameters, using Auth Token as key.
        """
        if not self.auth_token:
            # No credentials configured - allow bypass in development, otherwise reject
            if settings.ENV == "development":
                return True
            return False

        signature = request.headers.get("X-Twilio-Signature", "")
        if not signature:
            return False

        # Build the string to sign: full URL + sorted form params
        # Twilio uses the full URL including query string
        sorted_params = sorted(form_data.items())
        data_string = url + urlencode(sorted_params)

        # Compute HMAC-SHA1
        expected_sig = base64.b64encode(
            hmac.new(
                self.auth_token.encode("utf-8"),
                data_string.encode("utf-8"),
                hashlib.sha1
            ).digest()
        ).decode("utf-8")

        return hmac.compare_digest(signature, expected_sig)

    async def download_media(self, media_url: str, media_content_type: str) -> Optional[str]:
        """
        Download media from Twilio's temporary URL and rehost via the
        configured storage backend (Supabase Storage in production,
        local /uploads in dev).

        Returns a storage key (opaque) on success, or None on failure.
        Callers convert the key to a public URL via get_storage().public_url.
        """
        if not media_url:
            return None

        logger = structlog.get_logger(__name__)

        try:
            # Twilio media URLs require auth
            resp = await self.client.get(media_url)
            resp.raise_for_status()

            # Determine file extension from content type
            ext_map = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/webp": ".webp",
                "video/mp4": ".mp4",
                "audio/ogg": ".ogg",
                "audio/webm": ".webm",
                "audio/mpeg": ".mp3",
            }
            ext = ext_map.get(media_content_type, ".bin")

            # Validate file signature BEFORE handing to storage.
            # Same security check as the upload endpoint; reusing
            # the in-file bytes-only validator.
            if not validate_file_signature(resp.content, ext):
                logger.error("media_signature_mismatch", ext=ext, media_url=media_url)
                return None

            # Phase 5: downscale / recompress image content. A
            # no-op for non-image content types and for runs
            # where Pillow is missing.
            payload = resp.content
            payload_type = media_content_type
            if media_content_type.lower().startswith("image/"):
                try:
                    from app.services.image_opt import optimize_image
                    payload, payload_type = optimize_image(payload, payload_type)
                except ValueError as e:
                    logger.warning("twilio_image_opt_failed", error=str(e), media_url=media_url)
                    # Fall through with original bytes; storage
                    # will accept them.

            # Hand the validated bytes to the configured storage
            # backend. The returned key is what the caller (the
            # WhatsApp webhook) stores in the database.
            storage = get_storage()
            key = storage.save_bytes(payload, ext, payload_type, prefix="twilio")
            return key

        except Exception as e:
            logger.error("media_download_failed", error=str(e), media_url=media_url)
            return None

    async def send_whatsapp_message(self, to: str, body: str) -> bool:
        """
        Send an outbound WhatsApp message via Twilio API.

        Args:
            to: Recipient in format "whatsapp:+15551234567"
            body: Message text

        Returns:
            True if sent successfully, False otherwise
        """
        logger = structlog.get_logger(__name__)

        if not self.account_sid or not self.auth_token:
            logger.warning("twilio_credentials_not_configured")
            return False

        try:
            data = {
                "From": self.whatsapp_number,
                "To": to,
                "Body": body,
            }
            resp = await self.client.post(
                f"{self.base_url}/Messages.json",
                data=data,
            )
            resp.raise_for_status()
            logger.info("whatsapp_message_sent", to=to)
            return True
        except Exception as e:
            logger.error("whatsapp_message_send_failed", error=str(e), to=to)
            return False

    def parse_webhook(self, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse Twilio WhatsApp webhook form data into structured format.

        Returns dict with:
        - from_number: Sender's WhatsApp number (e.g., "whatsapp:+15551234567")
        - body: Text message body
        - media: List of dicts with url, content_type, sid
        - location: Dict with lat, lng if location shared
        """
        from_number = form_data.get("From", "")
        body = form_data.get("Body", "").strip()

        # Parse media (Twilio sends NumMedia, MediaUrl0, MediaContentType0, etc.)
        media = []
        num_media = int(form_data.get("NumMedia", "0"))
        for i in range(num_media):
            media_url = form_data.get(f"MediaUrl{i}")
            media_content_type = form_data.get(f"MediaContentType{i}")
            media_sid = form_data.get(f"MediaSid{i}")
            if media_url:
                media.append({
                    "url": media_url,
                    "content_type": media_content_type,
                    "sid": media_sid,
                })

        # Parse location (Latitude, Longitude if shared via WhatsApp location pin)
        location = None
        lat = form_data.get("Latitude")
        lng = form_data.get("Longitude")
        if lat and lng:
            try:
                location = {
                    "latitude": float(lat),
                    "longitude": float(lng),
                }
            except (ValueError, TypeError):
                pass

        return {
            "from_number": from_number,
            "body": body,
            "media": media,
            "location": location,
        }


# Global instance
twilio_service = TwilioService()