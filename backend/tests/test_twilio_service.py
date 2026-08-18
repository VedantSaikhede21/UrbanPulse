"""Tests for Twilio WhatsApp service: signature validation, webhook parsing, media download, outbound messages."""

import os
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import Request
from starlette.datastructures import Headers

from app.services.twilio_service import TwilioService
from app.config import settings


class TestValidateSignature:
    """Tests for validate_signature method."""

    def test_valid_signature_passes(self):
        """A correctly computed signature should validate."""
        service = TwilioService()
        service.auth_token = "test_auth_token"
        service.account_sid = "test_account_sid"

        # Build a test request with valid signature
        form_data = {
            "From": "whatsapp:+15551234567",
            "Body": "Test message",
            "NumMedia": "0",
        }
        url = "https://example.com/api/whatsapp/webhook"

        # Compute the expected signature
        from urllib.parse import urlencode
        import hmac
        import hashlib
        import base64

        sorted_params = sorted(form_data.items())
        data_string = url + urlencode(sorted_params)
        expected_sig = base64.b64encode(
            hmac.new(
                service.auth_token.encode("utf-8"),
                data_string.encode("utf-8"),
                hashlib.sha1,
            ).digest()
        ).decode("utf-8")

        # Create mock request
        request = MagicMock(spec=Request)
        request.headers = Headers({"x-twilio-signature": expected_sig})
        request.url = url

        assert service.validate_signature(request, url, form_data) is True

    def test_tampered_form_param_fails(self):
        """A tampered form parameter should fail validation."""
        service = TwilioService()
        service.auth_token = "test_auth_token"
        service.account_sid = "test_account_sid"

        # Valid form data
        form_data = {
            "From": "whatsapp:+15551234567",
            "Body": "Test message",
            "NumMedia": "0",
        }
        url = "https://example.com/api/whatsapp/webhook"

        # Compute valid signature for original data
        from urllib.parse import urlencode
        import hmac
        import hashlib
        import base64

        sorted_params = sorted(form_data.items())
        data_string = url + urlencode(sorted_params)
        expected_sig = base64.b64encode(
            hmac.new(
                service.auth_token.encode("utf-8"),
                data_string.encode("utf-8"),
                hashlib.sha1,
            ).digest()
        ).decode("utf-8")

        # But use tampered form data for validation
        tampered_form_data = {
            "From": "whatsapp:+15551234567",
            "Body": "TAMPERED MESSAGE",
            "NumMedia": "0",
        }

        request = MagicMock(spec=Request)
        request.headers = Headers({"x-twilio-signature": expected_sig})
        request.url = url

        assert service.validate_signature(request, url, tampered_form_data) is False

    def test_missing_x_twilio_signature_header_fails(self):
        """Missing X-Twilio-Signature header should fail validation."""
        service = TwilioService()
        service.auth_token = "test_auth_token"
        service.account_sid = "test_account_sid"

        form_data = {"From": "whatsapp:+15551234567", "Body": "Test", "NumMedia": "0"}
        url = "https://example.com/api/whatsapp/webhook"

        request = MagicMock(spec=Request)
        request.headers = Headers({})  # No X-Twilio-Signature
        request.url = url

        assert service.validate_signature(request, url, form_data) is False

    def test_dev_mode_bypass_when_env_development_and_no_auth_token(self):
        """Dev mode bypass should work when ENV=development AND TWILIO_AUTH_TOKEN is unset."""
        service = TwilioService()
        service.auth_token = None
        service.account_sid = "test_account_sid"

        # Temporarily set ENV to development
        original_env = settings.ENV
        settings.ENV = "development"
        try:
            form_data = {"From": "whatsapp:+15551234567", "Body": "Test", "NumMedia": "0"}
            url = "https://example.com/api/whatsapp/webhook"

            request = MagicMock(spec=Request)
            request.headers = Headers({})  # No signature header
            request.url = url

            assert service.validate_signature(request, url, form_data) is True
        finally:
            settings.ENV = original_env

    def test_dev_mode_bypass_not_when_env_not_development_even_without_token(self):
        """Dev mode bypass should NOT apply when ENV != development even without token."""
        service = TwilioService()
        service.auth_token = None
        service.account_sid = "test_account_sid"

        # Set ENV to production
        original_env = settings.ENV
        settings.ENV = "production"
        try:
            form_data = {"From": "whatsapp:+15551234567", "Body": "Test", "NumMedia": "0"}
            url = "https://example.com/api/whatsapp/webhook"

            request = MagicMock(spec=Request)
            request.headers = Headers({})  # No signature header
            request.url = url

            assert service.validate_signature(request, url, form_data) is False
        finally:
            settings.ENV = original_env

    def test_dev_mode_bypass_not_when_env_development_but_token_exists(self):
        """Dev mode bypass should NOT apply when ENV=development but TWILIO_AUTH_TOKEN is set."""
        service = TwilioService()
        service.auth_token = "real_token"
        service.account_sid = "test_account_sid"

        original_env = settings.ENV
        settings.ENV = "development"
        try:
            form_data = {"From": "whatsapp:+15551234567", "Body": "Test", "NumMedia": "0"}
            url = "https://example.com/api/whatsapp/webhook"

            request = MagicMock(spec=Request)
            request.headers = Headers({})  # No signature header
            request.url = url

            # Should fail because token exists but no signature provided
            assert service.validate_signature(request, url, form_data) is False
        finally:
            settings.ENV = original_env


class TestParseWebhook:
    """Tests for parse_webhook method."""

    def test_text_only_message(self):
        """Parse a text-only WhatsApp message."""
        service = TwilioService()

        form_data = {
            "From": "whatsapp:+15551234567",
            "Body": "Hello, there's a pothole on Main St",
            "NumMedia": "0",
        }

        result = service.parse_webhook(form_data)

        assert result["from_number"] == "whatsapp:+15551234567"
        assert result["body"] == "Hello, there's a pothole on Main St"
        assert result["media"] == []
        assert result["location"] is None

    def test_location_pin_message(self):
        """Parse a message with WhatsApp location pin."""
        service = TwilioService()

        form_data = {
            "From": "whatsapp:+15551234567",
            "Body": "",
            "NumMedia": "0",
            "Latitude": "12.9715",
            "Longitude": "77.5945",
        }

        result = service.parse_webhook(form_data)

        assert result["from_number"] == "whatsapp:+15551234567"
        assert result["body"] == ""
        assert result["media"] == []
        assert result["location"] == {"latitude": 12.9715, "longitude": 77.5945}

    def test_multi_media_message(self):
        """Parse a message with multiple media attachments."""
        service = TwilioService()

        form_data = {
            "From": "whatsapp:+15551234567",
            "Body": "Look at this pothole",
            "NumMedia": "2",
            "MediaUrl0": "https://api.twilio.com/Media0",
            "MediaContentType0": "image/jpeg",
            "MediaSid0": "ME0001",
            "MediaUrl1": "https://api.twilio.com/Media1",
            "MediaContentType1": "image/png",
            "MediaSid1": "ME0002",
        }

        result = service.parse_webhook(form_data)

        assert result["from_number"] == "whatsapp:+15551234567"
        assert result["body"] == "Look at this pothole"
        assert len(result["media"]) == 2
        assert result["media"][0]["url"] == "https://api.twilio.com/Media0"
        assert result["media"][0]["content_type"] == "image/jpeg"
        assert result["media"][0]["sid"] == "ME0001"
        assert result["media"][1]["url"] == "https://api.twilio.com/Media1"
        assert result["media"][1]["content_type"] == "image/png"
        assert result["media"][1]["sid"] == "ME0002"
        assert result["location"] is None

    def test_malformed_missing_lat_lng(self):
        """Parse should handle missing or malformed lat/lng gracefully."""
        service = TwilioService()

        # Missing longitude
        form_data = {
            "From": "whatsapp:+15551234567",
            "Body": "Test",
            "NumMedia": "0",
            "Latitude": "12.9715",
        }

        result = service.parse_webhook(form_data)
        assert result["location"] is None

        # Invalid latitude
        form_data = {
            "From": "whatsapp:+15551234567",
            "Body": "Test",
            "NumMedia": "0",
            "Latitude": "not-a-number",
            "Longitude": "77.5945",
        }

        result = service.parse_webhook(form_data)
        assert result["location"] is None


class TestDownloadMedia:
    """Tests for download_media method."""

    @pytest.mark.asyncio
    async def test_download_media_success(self):
        """Successful media download should write file and return local path."""
        service = TwilioService()
        service.account_sid = "test_sid"
        service.auth_token = "test_token"

        # Mock the httpx client
        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.content = b"fake image data"
        mock_response.raise_for_status = MagicMock()
        mock_client.get.return_value = mock_response
        service._client = mock_client

        with patch("os.makedirs"), patch("builtins.open", MagicMock()) as mock_open:
            result = await service.download_media(
                "https://api.twilio.com/Media0", "image/jpeg"
            )

        assert result is not None
        assert result.startswith("/uploads/")
        assert result.endswith(".jpg")
        mock_client.get.assert_called_once_with("https://api.twilio.com/Media0")

    @pytest.mark.asyncio
    async def test_download_media_failure_returns_none(self):
        """Failed media download should return None, not raise."""
        service = TwilioService()
        service.account_sid = "test_sid"
        service.auth_token = "test_token"

        mock_client = AsyncMock()
        mock_client.get.side_effect = Exception("Network error")
        service._client = mock_client

        result = await service.download_media(
            "https://api.twilio.com/Media0", "image/jpeg"
        )

        assert result is None

    @pytest.mark.asyncio
    async def test_download_media_http_error_returns_none(self):
        """HTTP error on media download should return None."""
        service = TwilioService()
        service.account_sid = "test_sid"
        service.auth_token = "test_token"

        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = Exception("404 Not Found")
        mock_client.get.return_value = mock_response
        service._client = mock_client

        result = await service.download_media(
            "https://api.twilio.com/Media0", "image/jpeg"
        )

        assert result is None


class TestSendWhatsAppMessage:
    """Tests for send_whatsapp_message method."""

    @pytest.mark.asyncio
    async def test_send_whatsapp_message_success(self):
        """Successful message send should return True."""
        service = TwilioService()
        service.account_sid = "test_sid"
        service.auth_token = "test_token"
        service.whatsapp_number = "whatsapp:+14155238886"

        mock_client = AsyncMock()
        mock_response = MagicMock()
        mock_response.raise_for_status = MagicMock()
        mock_client.post.return_value = mock_response
        service._client = mock_client

        result = await service.send_whatsapp_message(
            "whatsapp:+15551234567", "Test message"
        )

        assert result is True
        mock_client.post.assert_called_once()
        call_args = mock_client.post.call_args
        assert call_args[1]["data"]["From"] == "whatsapp:+14155238886"
        assert call_args[1]["data"]["To"] == "whatsapp:+15551234567"
        assert call_args[1]["data"]["Body"] == "Test message"

    @pytest.mark.asyncio
    async def test_send_whatsapp_message_api_failure_returns_false(self):
        """API failure should return False, not raise."""
        service = TwilioService()
        service.account_sid = "test_sid"
        service.auth_token = "test_token"
        service.whatsapp_number = "whatsapp:+14155238886"

        mock_client = AsyncMock()
        mock_client.post.side_effect = Exception("API error")
        service._client = mock_client

        result = await service.send_whatsapp_message(
            "whatsapp:+15551234567", "Test message"
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_send_whatsapp_message_missing_credentials_returns_false(self):
        """Missing credentials should return False, not raise."""
        service = TwilioService()
        service.account_sid = None
        service.auth_token = None
        service.whatsapp_number = "whatsapp:+14155238886"

        result = await service.send_whatsapp_message(
            "whatsapp:+15551234567", "Test message"
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_send_whatsapp_message_empty_account_sid_returns_false(self):
        """Empty account_sid should return False."""
        service = TwilioService()
        service.account_sid = ""
        service.auth_token = "test_token"
        service.whatsapp_number = "whatsapp:+14155238886"

        result = await service.send_whatsapp_message(
            "whatsapp:+15551234567", "Test message"
        )

        assert result is False