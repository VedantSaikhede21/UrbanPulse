"""Tests for Geocoding service: confident match, low confidence, zero results, network failure."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.geocoding import GeocodingService


# Fixture responses from Nominatim (realistic importance values based on actual Nominatim responses)
# MG Road - highway/primary typically gets importance ~0.05, but with class/type boosting logic
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
        "importance": 0.05,  # Realistic Nominatim importance for highway
    }
]

# Market area - place/suburb typically gets importance ~0.15, medium boost (0.2) -> 0.35
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
        "importance": 0.15,  # Realistic Nominatim importance for suburb
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
    async def test_geocode_highway_gets_low_confidence(self, service):
        """Geocoding a highway (road) returns low confidence - no class/type boost."""
        mock_response = MagicMock()
        mock_response.json.return_value = CONFIDENT_MATCH_RESPONSE
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("MG Road, Bangalore")

        assert result is not None
        lat, lng, confidence, display_name = result
        assert lat == 12.9715
        assert lng == 77.5945
        # highway/primary gets 0 boost: 0.05 + 0 = 0.05
        assert confidence == 0.05
        assert display_name == "MG Road, Bangalore, Karnataka, India"
        assert service.is_confident(confidence) is False

    @pytest.mark.asyncio
    async def test_geocode_place_suburb_gets_medium_confidence(self, service):
        """Geocoding a place/suburb gets medium boost (0.2) and IS confident with threshold 0.3."""
        mock_response = MagicMock()
        mock_response.json.return_value = LOW_CONFIDENCE_MATCH_RESPONSE
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("near the market")

        assert result is not None
        lat, lng, confidence, display_name = result
        assert lat == 12.95
        assert lng == 77.60
        # place/suburb gets 0.2 boost: 0.15 + 0.2 = 0.35
        assert confidence == 0.35
        assert display_name == "Market, Bangalore, Karnataka, India"
        assert service.is_confident(confidence) is True

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
        """Default confidence threshold should be 0.3 (lowered for Nominatim's importance scale)."""
        svc = GeocodingService()
        assert svc.confidence_threshold == 0.3


# Additional test with different OSM types/classes to verify classification behavior
class TestGeocodingClassification:
    """Tests to understand how OSM class/type affects confidence interpretation."""

    @pytest.fixture
    def service(self):
        svc = GeocodingService()
        svc._client = MagicMock()
        return svc

    @pytest.mark.asyncio
    async def test_amenity_type_gets_no_boost(self, service):
        """Amenity type (shop, restaurant) gets no boost even with high importance."""
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
        # amenity/cafe gets 0 boost: 0.65 + 0 = 0.65
        assert confidence == 0.65
        # With threshold 0.3, this IS confident
        assert service.is_confident(confidence) is True

    @pytest.mark.asyncio
    async def test_building_type_gets_high_boost(self, service):
        """Building type gets high boost (0.4)."""
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
        # building/yes gets 0.4 boost: 0.55 + 0.4 = 0.95
        assert confidence == pytest.approx(0.95)
        assert service.is_confident(confidence) is True

    @pytest.mark.asyncio
    async def test_place_type_city(self, service):
        """Place type (city) - typically high importance (capped at 1.0)."""
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
        # 0.92 + 0.4 boost = 1.32, capped at 1.0
        assert confidence == 1.0
        assert service.is_confident(confidence) is True


# New tests for enhanced confidence calculation with class/type boosting
class TestGeocodingEnhancedConfidence:
    """Tests for the enhanced confidence calculation using OSM class/type signals."""

    @pytest.fixture
    def service(self):
        svc = GeocodingService()
        svc._client = MagicMock()
        return svc

    @pytest.mark.asyncio
    async def test_leisure_park_gets_high_boost(self, service):
        """Leisure/park should get high confidence boost (0.4) even with moderate importance."""
        response = [
            {
                "lat": "12.9743",
                "lon": "77.5922",
                "display_name": "Cubbon Park, Bangalore",
                "class": "leisure",
                "type": "park",
                "importance": 0.37,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("Cubbon Park")
        assert result is not None
        _, _, confidence, _ = result
        # 0.37 + 0.4 boost = 0.77 (capped at 1.0)
        assert confidence == 0.77
        assert service.is_confident(confidence) is True

    @pytest.mark.asyncio
    async def test_water_lake_gets_high_boost(self, service):
        """Water/lake should get high confidence boost."""
        response = [
            {
                "lat": "12.9371",
                "lon": "77.6720",
                "display_name": "Bellandur Lake, Bangalore",
                "class": "water",
                "type": "lake",
                "importance": 0.43,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("Bellandur Lake")
        assert result is not None
        _, _, confidence, _ = result
        # 0.43 + 0.4 boost = 0.83
        assert confidence == pytest.approx(0.83)
        assert service.is_confident(confidence) is True

    @pytest.mark.asyncio
    async def test_railway_station_gets_high_boost(self, service):
        """Railway station should get high confidence boost."""
        response = [
            {
                "lat": "12.9759",
                "lon": "77.5654",
                "display_name": "Krantivira Sangolli Rayanna Railway Station, Bangalore",
                "class": "railway",
                "type": "station",
                "importance": 0.25,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("Bangalore City Railway Station")
        assert result is not None
        _, _, confidence, _ = result
        # 0.25 + 0.4 boost = 0.65
        assert confidence == 0.65
        # With threshold 0.3, this IS confident now
        assert service.is_confident(confidence) is True

    @pytest.mark.asyncio
    async def test_place_suburb_gets_medium_boost(self, service):
        """Place/suburb should get medium confidence boost (0.2)."""
        response = [
            {
                "lat": "12.9357",
                "lon": "77.6241",
                "display_name": "Koramangala, Bangalore",
                "class": "place",
                "type": "suburb",
                "importance": 0.15,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("Koramangala")
        assert result is not None
        _, _, confidence, _ = result
        # 0.15 + 0.2 boost = 0.35
        assert confidence == 0.35
        assert service.is_confident(confidence) is True

    @pytest.mark.asyncio
    async def test_highway_primary_gets_no_boost(self, service):
        """Highway/primary (road) should get no boost - low confidence."""
        response = [
            {
                "lat": "12.9748",
                "lon": "77.6097",
                "display_name": "MG Road, Bangalore",
                "class": "highway",
                "type": "primary",
                "importance": 0.05,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("MG Road")
        assert result is not None
        _, _, confidence, _ = result
        # 0.05 + 0.0 boost = 0.05
        assert confidence == 0.05
        assert service.is_confident(confidence) is False

    @pytest.mark.asyncio
    async def test_amenity_cafe_gets_no_boost(self, service):
        """Amenity/cafe should get no boost - low confidence."""
        response = [
            {
                "lat": "12.9756",
                "lon": "77.6052",
                "display_name": "Cafe Coffee Day, MG Road, Bangalore",
                "class": "amenity",
                "type": "cafe",
                "importance": 0.0,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        result = await service.geocode("Coffee Day MG Road")
        assert result is not None
        _, _, confidence, _ = result
        # 0.0 + 0.0 boost = 0.0
        assert confidence == 0.0
        assert service.is_confident(confidence) is False

    @pytest.mark.asyncio
    async def test_geocode_uses_viewbox_and_bounded_params(self, service):
        """Geocode should call Nominatim with viewbox and bounded parameters for Bangalore."""
        response = [
            {
                "lat": "12.9715",
                "lon": "77.5945",
                "display_name": "MG Road, Bangalore",
                "class": "highway",
                "type": "primary",
                "importance": 0.05,
            }
        ]
        mock_response = MagicMock()
        mock_response.json.return_value = response
        mock_response.raise_for_status = MagicMock()
        service._client.get = AsyncMock(return_value=mock_response)

        await service.geocode("MG Road")

        call_args = service._client.get.call_args
        params = call_args[1]["params"]
        assert params["viewbox"] == "77.5,13.0,77.7,12.9"
        assert params["bounded"] == 1

    @pytest.mark.asyncio
    async def test_confidence_capped_at_1_0(self, service):
        """Confidence should be capped at 1.0 even with high importance + boost."""
        response = [
            {
                "lat": "12.9715",
                "lon": "77.5945",
                "display_name": "Bangalore City Center",
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
        # 0.92 + 0.4 boost = 1.32, capped at 1.0
        assert confidence == 1.0