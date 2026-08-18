"""Geocoding service using Nominatim (OpenStreetMap).

Provides address/landmark to coordinates conversion with confidence scoring.
"""

import httpx
from typing import Optional, Tuple
from app.config import settings


class GeocodingService:
    """Service for geocoding text addresses/landmarks via Nominatim."""

    # Bangalore bounding box: left, top, right, bottom (lon_min, lat_max, lon_max, lat_min)
    BANGALORE_VIEWBOX = "77.5,13.0,77.7,12.9"

    # OSM class/type combinations that indicate precise, addressable locations
    HIGH_CONFIDENCE_TYPES = {
        ("leisure", "park"),
        ("water", "lake"),
        ("railway", "station"),
        ("railway", "stop"),
        ("office", "company"),
        ("place", "city"),
        ("place", "town"),
        ("place", "village"),
        ("building", "yes"),
        ("building", "commercial"),
        ("building", "residential"),
        ("amenity", "hospital"),
        ("amenity", "school"),
        ("amenity", "university"),
        ("amenity", "police"),
        ("amenity", "fire_station"),
        ("amenity", "post_office"),
        ("amenity", "townhall"),
        ("amenity", "courthouse"),
        ("amenity", "library"),
        ("amenity", "community_centre"),
    }

    # Medium confidence - named areas/neighbourhoods
    MEDIUM_CONFIDENCE_TYPES = {
        ("place", "suburb"),
        ("place", "quarter"),
        ("place", "neighbourhood"),
        ("place", "borough"),
        ("place", "district"),
        ("boundary", "administrative"),
        ("landuse", "residential"),
        ("landuse", "commercial"),
        ("landuse", "retail"),
    }

    # Low confidence - generic roads, POIs without address
    LOW_CONFIDENCE_TYPES = {
        ("highway", "*"),  # wildcard for all highway types
        ("shop", "*"),
        ("amenity", "*"),
        ("tourism", "*"),
        ("craft", "*"),
        ("manufactory", "*"),
    }

    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.user_agent = getattr(settings, "NOMINATIM_USER_AGENT", "UrbanPulse/1.0")
        self._client: Optional[httpx.AsyncClient] = None
        # Lowered base threshold - Nominatim importance is typically 0.0-0.5 for most results
        # We combine with class/type boosting for better accuracy
        self.confidence_threshold = 0.3

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=10.0,
                headers={"User-Agent": self.user_agent},
            )
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    def _class_type_boost(self, osm_class: str, osm_type: str) -> float:
        """
        Return confidence boost based on OSM class/type.
        Returns value 0.0-0.5 added to base importance.
        """
        key = (osm_class, osm_type)
        if key in self.HIGH_CONFIDENCE_TYPES:
            return 0.4
        if key in self.MEDIUM_CONFIDENCE_TYPES:
            return 0.2
        # Check wildcard for low confidence types
        if (osm_class, "*") in self.LOW_CONFIDENCE_TYPES:
            return 0.0
        # Unknown types get small boost
        return 0.1

    def _calculate_confidence(self, importance: float, osm_class: str, osm_type: str) -> float:
        """
        Calculate final confidence score combining Nominatim importance + class/type boost.

        Final score = min(1.0, importance + class_type_boost)
        This ensures well-classified results can exceed the threshold even with low importance.
        """
        boost = self._class_type_boost(osm_class, osm_type)
        return min(1.0, importance + boost)

    async def geocode(self, query: str) -> Optional[Tuple[float, float, float, str]]:
        """
        Geocode a text query to coordinates.

        Args:
            query: Address, landmark, or place name (e.g., "pothole near MG Road market")

        Returns:
            Tuple of (latitude, longitude, confidence, display_name) or None if not found
        """
        if not query or not query.strip():
            return None

        try:
            params = {
                "q": query.strip(),
                "format": "json",
                "limit": 1,
                "addressdetails": 1,
                "viewbox": self.BANGALORE_VIEWBOX,
                "bounded": 1,
            }
            resp = await self.client.get(self.base_url, params=params)
            resp.raise_for_status()
            results = resp.json()

            if not results:
                return None

            result = results[0]
            lat = float(result.get("lat", 0))
            lng = float(result.get("lon", 0))
            # Nominatim returns 'importance' as a confidence score 0-1
            importance = float(result.get("importance", 0))
            display_name = result.get("display_name", query)
            osm_class = result.get("class", "")
            osm_type = result.get("type", "")

            # Calculate enhanced confidence using class/type signals
            confidence = self._calculate_confidence(importance, osm_class, osm_type)

            return (lat, lng, confidence, display_name)

        except Exception as e:
            print(f"Geocoding failed for '{query}': {e}")
            return None

    def is_confident(self, confidence: float) -> bool:
        """Check if geocoding confidence meets threshold."""
        return confidence >= self.confidence_threshold


# Global instance
geocoding_service = GeocodingService()