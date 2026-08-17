"""Twilio WhatsApp integration service.

Handles:
- Webhook signature validation (security-critical)
- Media download and rehost to local /uploads
- Outbound WhatsApp message sending
- Webhook payload parsing
"""

import hmac
import hashlib
import base64
import os
import httpx
from urllib.parse import urlencode
from typing import Optional, List, Dict, Any
from fastapi import Request, HTTPException

from app.config import settings


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
            # In development without real credentials, skip validation
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
        Download media from Twilio's temporary URL and rehost to local /uploads.

        Returns the local URL (e.g., http://localhost:8000/uploads/abc123.jpg)
        or None on failure.
        """
        if not media_url:
            return None

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

            # Save to uploads directory
            import secrets
            filename = f"{secrets.token_hex(12)}{ext}"
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            upload_dir = os.path.join(base_dir, "uploads")
            os.makedirs(upload_dir, exist_ok=True)
            filepath = os.path.join(upload_dir, filename)

            with open(filepath, "wb") as f:
                f.write(resp.content)

            # Return absolute URL (will be constructed by caller with request.base_url)
            return f"/uploads/{filename}"

        except Exception as e:
            print(f"Media download failed: {e}")
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
        if not self.account_sid or not self.auth_token:
            print("Twilio credentials not configured")
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
            return True
        except Exception as e:
            print(f"Failed to send WhatsApp message: {e}")
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