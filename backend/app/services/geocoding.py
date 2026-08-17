"""Geocoding service using Nominatim (OpenStreetMap).

Provides address/landmark to coordinates conversion with confidence scoring.
"""

import httpx
from typing import Optional, Tuple
from app.config import settings


class GeocodingService:
    """Service for geocoding text addresses/landmarks via Nominatim."""

    def __init__(self):
        self.base_url = "https://nominatim.openstreetmap.org/search"
        self.user_agent = getattr(settings, "NOMINATIM_USER_AGENT", "UrbanPulse/1.0")
        self._client: Optional[httpx.AsyncClient] = None
        # Confidence threshold - Nominatim returns importance 0-1
        # 0.7+ is generally a good match for address/POI
        self.confidence_threshold = 0.7

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

            return (lat, lng, importance, display_name)

        except Exception as e:
            print(f"Geocoding failed for '{query}': {e}")
            return None

    def is_confident(self, confidence: float) -> bool:
        """Check if geocoding confidence meets threshold."""
        return confidence >= self.confidence_threshold


# Global instance
geocoding_service = GeocodingService()