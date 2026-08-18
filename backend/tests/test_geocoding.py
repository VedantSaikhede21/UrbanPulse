"""Tests for Geocoding service: confident match, low confidence, zero results, network failure."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.geocoding import GeocodingService


# Fixture responses from Nominatim
CONFIDENT_MATCH_RESPONSE = [
    {
        "place_id": 123456,
        "licence": "Data © OpenStreetMap contributors",
        "osm_type": "way",
        "osm_id": 789012,
        "boundingbox": ["12.97", "12.98", "77.59", "77.60"],
        "lat": "12.9715",
        "lon": "77.5945",
        "display_name": "MG Road, Bangalore, Karnataka, India",
        "class": "highway",
        "type": "primary",
        "importance": 0.85,
    }
]

LOW_CONFIDENCE_MATCH_RESPONSE = [
    {
        "place_id": 123457,
        "licence": "Data © OpenStreetMap contributors",
        "osm_type": "node",
        "osm_id": 789013,
        "boundingbox": ["12.90", "13.00", "77.50", "77.70"],
        "lat": "12.95",
        "lon": "77.60",
        "display_name": "Market, Bangalore, Karnataka, India",
        "class": "place",
        "type": "suburb",
        "importance": 0.45,
    }
]

ZERO_RESULTS_RESPONSE = []


class TestGeocodingService:
    """Tests for GeocodingService class."""

    @pytest.fixture
    def service(self):
        """Create a GeocodingService instance with mocked client."""
        svc = GeocodingService()
        svc._client = MagicMock()
        return svc

    @pytest.mark.asyncio
    async def test_geocode_confident_match(self, service):
        """Geocoding a clear address should return coordinates with high confidence."""
        mock_response = MagicMock()
        mock_response.json.return_value = CONFIDENT_MATCH_RESPONSE
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("MG Road, Bangalore")

        assert result is not None
        lat, lng, confidence, display_name = result
        assert lat == 12.9715
        assert lng == 77.5945
        assert confidence == 0.85
        assert display_name == "MG Road, Bangalore, Karnataka, India"
        assert service.is_confident(confidence) is True

    @pytest.mark.asyncio
    async def test_geocode_low_confidence_match(self, service):
        """Geocoding a vague landmark should return coordinates with low confidence."""
        mock_response = MagicMock()
        mock_response.json.return_value = LOW_CONFIDENCE_MATCH_RESPONSE
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("near the market")

        assert result is not None
        lat, lng, confidence, display_name = result
        assert lat == 12.95
        assert lng == 77.60
        assert confidence == 0.45
        assert display_name == "Market, Bangalore, Karnataka, India"
        assert service.is_confident(confidence) is False

    @pytest.mark.asyncio
    async def test_geocode_zero_results(self, service):
        """Geocoding an unknown place should return None."""
        mock_response = MagicMock()
        mock_response.json.return_value = ZERO_RESULTS_RESPONSE
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("nonexistent place xyz123")

        assert result is None

    @pytest.mark.asyncio
    async def test_geocode_network_timeout_returns_none(self, service):
        """Network timeout should return None, not raise."""
        service._client.get = AsyncMock(side_effect=Exception("Timeout"))

        result = await service.geocode("some place")

        assert result is None

    @pytest.mark.asyncio
    async def test_geocode_http_error_returns_none(self, service):
        """HTTP error should return None, not raise."""
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = Exception("404 Not Found")
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("some place")

        assert result is None

    @pytest.mark.asyncio
    async def test_geocode_empty_query_returns_none(self, service):
        """Empty or whitespace query should return None immediately."""
        assert await service.geocode("") is None
        assert await service.geocode("   ") is None
        assert await service.geocode(None) is None  # type: ignore

    @pytest.mark.asyncio
    async def test_geocode_uses_correct_params(self, service):
        """Geocode should call Nominatim with correct parameters."""
        mock_response = MagicMock()
        mock_response.json.return_value = CONFIDENT_MATCH_RESPONSE
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        await service.geocode("MG Road, Bangalore")

        call_args = service._client.get.call_args
        assert call_args[0][0] == "https://nominatim.openstreetmap.org/search"
        params = call_args[1]["params"]
        assert params["q"] == "MG Road, Bangalore"
        assert params["format"] == "json"
        assert params["limit"] == 1
        assert params["addressdetails"] == 1

    def test_is_confident_threshold(self, service):
        """is_confident should correctly compare against threshold."""
        service.confidence_threshold = 0.7
        assert service.is_confident(0.8) is True
        assert service.is_confident(0.7) is True
        assert service.is_confident(0.69) is False
        assert service.is_confident(0.0) is False
        assert service.is_confident(1.0) is True

    def test_confidence_threshold_default(self):
        """Default confidence threshold should be 0.7."""
        svc = GeocodingService()
        assert svc.confidence_threshold == 0.7


# Additional test with different OSM types/classes to verify classification behavior
class TestGeocodingClassification:
    """Tests to understand how OSM class/type affects confidence interpretation."""

    @pytest.fixture
    def service(self):
        svc = GeocodingService()
        svc._client = MagicMock()
        return svc

    @pytest.mark.asyncio
    async def test_amenity_type_high_importance(self, service):
        """Amenity type (shop, restaurant) with good importance."""
        response = [
            {
                "lat": "12.9715",
                "lon": "77.5945",
                "display_name": "Coffee Shop, MG Road, Bangalore",
                "class": "amenity",
                "type": "cafe",
                "importance": 0.65,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("coffee shop on MG Road")
        assert result is not None
        _, _, confidence, _ = result
        assert confidence == 0.65
        # With default threshold 0.7, this would NOT be confident
        assert service.is_confident(confidence) is False

    @pytest.mark.asyncio
    async def test_building_type(self, service):
        """Building type result."""
        response = [
            {
                "lat": "12.9715",
                "lon": "77.5945",
                "display_name": "Building 123, Bangalore",
                "class": "building",
                "type": "yes",
                "importance": 0.55,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("Building 123")
        assert result is not None
        _, _, confidence, _ = result
        assert confidence == 0.55
        assert service.is_confident(confidence) is False

    @pytest.mark.asyncio
    async def test_place_type_city(self, service):
        """Place type (city) - typically high importance."""
        response = [
            {
                "lat": "12.9715",
                "lon": "77.5945",
                "display_name": "Bangalore, Karnataka, India",
                "class": "place",
                "type": "city",
                "importance": 0.92,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("Bangalore")
        assert result is not None
        _, _, confidence, _ = result
        assert confidence == 0.92
        assert service.is_confident(confidence) is True