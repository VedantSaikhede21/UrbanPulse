"""Integration tests for WhatsApp webhook endpoint."""

import os
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.main import app
from app.db.models import Citizen, Ticket
from app.config import settings

# Test database URL - use Supabase URL from .env
DATABASE_URL = "postgresql://postgres.lppdrsgqppyfcstrpksg:Danger0722D%40%40@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def db_engine():
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 10})
    yield engine
    engine.dispose()


def _make_test_phone() -> str:
    """Generate a test phone number that fits in VARCHAR(20) after 'whatsapp:' prefix is stripped."""
    # After stripping 'whatsapp:' (9 chars), we have 20 chars max.
    # Use format like '+1555' + 8 hex chars = 12 chars total
    return f"+1555{uuid.uuid4().hex[:8]}"


@pytest.fixture(autouse=True)
def cleanup(db_engine):
    """Clean up test data after each test."""
    yield
    with db_engine.begin() as conn:
        conn.execute(text("DELETE FROM tickets WHERE citizen_id IN (SELECT id FROM citizens WHERE phone LIKE '+1555%')"))
        conn.execute(text("DELETE FROM citizens WHERE phone LIKE '+1555%'"))


def _make_webhook_request(client, form_data, signature_header=None, env="development"):
    """Helper to make a webhook request with proper signature handling."""
    original_env = settings.ENV
    settings.ENV = env
    try:
        headers = {}
        if signature_header:
            headers["X-Twilio-Signature"] = signature_header
        response = client.post("/api/whatsapp/webhook", data=form_data, headers=headers)
        return response
    finally:
        settings.ENV = original_env


class TestWhatsAppWebhook:
    """Integration tests for the WhatsApp webhook endpoint."""

    @pytest.mark.asyncio
    async def test_location_pin_creates_ticket_with_gps_source(self, client, db_engine):
        """Location pin in payload should create ticket with location_source=gps."""
        phone = _make_test_phone()

        form_data = {
            "From": f"whatsapp:{phone}",
            "Body": "Pothole here",
            "NumMedia": "0",
            "Latitude": "12.9715",
            "Longitude": "77.5945",
        }

        with patch("app.routers.whatsapp.twilio_service.send_whatsapp_message", new_callable=AsyncMock) as mock_send:
            with patch("app.routers.whatsapp.pipeline.run_triage_sync") as mock_pipeline:
                mock_pipeline.return_value = {"success": False, "error": "Pipeline not available"}
                mock_send.return_value = True
                response = _make_webhook_request(client, form_data, env="development")

        assert response.status_code == 200

        # Verify ticket created with gps source
        with db_engine.connect() as conn:
            row = conn.execute(
                text("SELECT id, citizen_id, latitude, longitude, location_source, category, description FROM tickets WHERE description = 'Pothole here'")
            ).fetchone()

        assert row is not None, "Ticket should be created"
        ticket_id, citizen_id, lat, lng, location_source, category, description = row
        assert location_source == "gps"
        assert lat == 12.9715
        assert lng == 77.5945
        assert category == "Uncategorized"  # Pipeline mocked to not run

        # Verify citizen was created with phone
        with db_engine.connect() as conn:
            citizen = conn.execute(
                text("SELECT id, phone, name FROM citizens WHERE phone = :phone"),
                {"phone": phone}
            ).fetchone()
        assert citizen is not None
        assert citizen[1] == phone

    @pytest.mark.asyncio
    async def test_text_with_high_confidence_geocode_creates_ticket_geocoded(self, client, db_engine):
        """Text with high-confidence geocode should create ticket with location_source=geocoded."""
        phone = _make_test_phone()

        form_data = {
            "From": f"whatsapp:{phone}",
            "Body": "Pothole on MG Road, Bangalore",
            "NumMedia": "0",
        }

        # Mock geocoding to return high confidence
        with patch("app.routers.whatsapp.geocoding_service.geocode", new_callable=AsyncMock) as mock_geocode:
            mock_geocode.return_value = (12.9715, 77.5945, 0.85, "MG Road, Bangalore, Karnataka, India")
            with patch("app.routers.whatsapp.twilio_service.send_whatsapp_message", new_callable=AsyncMock) as mock_send:
                mock_send.return_value = True
                response = _make_webhook_request(client, form_data, env="development")

        assert response.status_code == 200

        # Verify ticket created with geocoded source
        with db_engine.connect() as conn:
            row = conn.execute(
                text("SELECT latitude, longitude, location_source FROM tickets WHERE description = 'Pothole on MG Road, Bangalore'")
            ).fetchone()

        assert row is not None, "Ticket should be created"
        lat, lng, location_source = row
        assert location_source == "geocoded"
        assert lat == 12.9715
        assert lng == 77.5945

    @pytest.mark.asyncio
    async def test_text_with_low_confidence_geocode_sends_retry_prompt_no_ticket(self, client, db_engine):
        """Text with low-confidence geocode should send retry prompt and NOT create ticket."""
        phone = _make_test_phone()

        form_data = {
            "From": f"whatsapp:{phone}",
            "Body": "Pothole near the market",
            "NumMedia": "0",
        }

        # Mock geocoding to return low confidence
        with patch("app.routers.whatsapp.geocoding_service.geocode", new_callable=AsyncMock) as mock_geocode:
            mock_geocode.return_value = (12.95, 77.60, 0.45, "Market, Bangalore")
            with patch("app.routers.whatsapp.twilio_service.send_whatsapp_message", new_callable=AsyncMock) as mock_send:
                mock_send.return_value = True
                response = _make_webhook_request(client, form_data, env="development")

        assert response.status_code == 200

        # Verify NO ticket was created
        with db_engine.connect() as conn:
            count = conn.execute(
                text("SELECT count(*) FROM tickets WHERE description = 'Pothole near the market'")
            ).scalar()
        assert count == 0, "No ticket should be created for low confidence geocode"

        # Verify retry prompt was sent
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        assert "location pin" in call_args[0][1].lower() or "landmark" in call_args[0][1].lower()

    @pytest.mark.asyncio
    async def test_second_message_after_failed_retry_sends_error_clears_state(self, client, db_engine):
        """Second message from same phone after failed retry should send error and clear retry state."""
        phone = _make_test_phone()

        form_data = {
            "From": f"whatsapp:{phone}",
            "Body": "Pothole near the market",
            "NumMedia": "0",
        }

        # First message - low confidence geocode
        with patch("app.routers.whatsapp.geocoding_service.geocode", new_callable=AsyncMock) as mock_geocode:
            mock_geocode.return_value = (12.95, 77.60, 0.45, "Market, Bangalore")
            with patch("app.routers.whatsapp.twilio_service.send_whatsapp_message", new_callable=AsyncMock) as mock_send:
                mock_send.return_value = True
                response1 = _make_webhook_request(client, form_data, env="development")

        assert response1.status_code == 200

        # Second message - should send error message and clear retry state
        with patch("app.routers.whatsapp.twilio_service.send_whatsapp_message", new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True
            response2 = _make_webhook_request(client, form_data, env="development")

        assert response2.status_code == 200

        # Verify error message was sent (not retry prompt)
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        sent_message = call_args[0][1]
        assert "couldn't determine your location" in sent_message.lower() or "sorry" in sent_message.lower()

        # Verify no ticket created
        with db_engine.connect() as conn:
            count = conn.execute(
                text("SELECT count(*) FROM tickets WHERE description = 'Pothole near the market'")
            ).scalar()
        assert count == 0

    @pytest.mark.asyncio
    async def test_same_phone_twice_reuses_citizen(self, client, db_engine):
        """Same phone number messaging twice should reuse citizen, not duplicate."""
        phone = _make_test_phone()

        form_data = {
            "From": f"whatsapp:{phone}",
            "Body": "First report",
            "NumMedia": "0",
            "Latitude": "12.9715",
            "Longitude": "77.5945",
        }

        form_data2 = {
            "From": f"whatsapp:{phone}",
            "Body": "Second report",
            "NumMedia": "0",
            "Latitude": "12.9716",
            "Longitude": "77.5946",
        }

        with patch("app.routers.whatsapp.twilio_service.send_whatsapp_message", new_callable=AsyncMock) as mock_send:
            mock_send.return_value = True
            _make_webhook_request(client, form_data, env="development")
            _make_webhook_request(client, form_data2, env="development")

        # Verify only one citizen exists for this phone
        with db_engine.connect() as conn:
            count = conn.execute(
                text("SELECT count(*) FROM citizens WHERE phone = :phone"),
                {"phone": phone}
            ).scalar()
        assert count == 1, "Should reuse existing citizen"

        # Verify two tickets created for same citizen
        with db_engine.connect() as conn:
            rows = conn.execute(
                text("SELECT id, description FROM tickets WHERE citizen_id = (SELECT id FROM citizens WHERE phone = :phone)"),
                {"phone": phone}
            ).fetchall()
        assert len(rows) == 2
        descriptions = {row[1] for row in rows}
        assert "First report" in descriptions
        assert "Second report" in descriptions

    @pytest.mark.asyncio
    async def test_invalid_signature_in_production_returns_403(self, client):
        """Invalid/missing Twilio signature in non-development env should return 403."""
        phone = _make_test_phone()

        form_data = {
            "From": f"whatsapp:{phone}",
            "Body": "Test report",
            "NumMedia": "0",
            "Latitude": "12.9715",
            "Longitude": "77.5945",
        }

        # No signature header, production env
        response = _make_webhook_request(client, form_data, signature_header=None, env="production")

        assert response.status_code == 403
        assert "Invalid Twilio signature" in response.json().get("detail", "")

    @pytest.mark.asyncio
    async def test_pipeline_exception_ticket_persists_fallback_confirmation(self, client, db_engine):
        """Pipeline exception should not 500 - ticket persists, fallback confirmation sent."""
        phone = _make_test_phone()

        form_data = {
            "From": f"whatsapp:{phone}",
            "Body": "Pipeline error test",
            "NumMedia": "0",
            "Latitude": "12.9715",
            "Longitude": "77.5945",
        }

        # Mock pipeline to raise exception
        with patch("app.routers.whatsapp.pipeline.run_triage_sync") as mock_pipeline:
            mock_pipeline.side_effect = Exception("Pipeline crashed")
            with patch("app.routers.whatsapp.twilio_service.send_whatsapp_message", new_callable=AsyncMock) as mock_send:
                mock_send.return_value = True
                response = _make_webhook_request(client, form_data, env="development")

        assert response.status_code == 200, "Should not 500 on pipeline failure"

        # Verify ticket was created despite pipeline failure
        with db_engine.connect() as conn:
            row = conn.execute(
                text("SELECT id, status FROM tickets WHERE description = 'Pipeline error test'")
            ).fetchone()
        assert row is not None, "Ticket should persist even if pipeline fails"
        ticket_id, status = row
        assert status == "reported"

        # Verify fallback confirmation was sent (not the detailed one)
        mock_send.assert_called_once()
        call_args = mock_send.call_args
        sent_message = call_args[0][1]
        assert "team will review" in sent_message.lower() or "categorize this shortly" in sent_message.lower()


# Note: Tests require DATABASE_URL and SUPABASE_JWT_SECRET to be set in environment
# Run with: pytest backend/tests/test_whatsapp_webhook.py -v