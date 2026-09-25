"""Deployment geography — the single source of truth for "where is UrbanPulse".

UrbanPulse is a civic-infrastructure platform for **Navi Mumbai, Maharashtra**
(Navi Mumbai Municipal Corporation). Before this module existed the city was
hard-coded in five separate places: ward seed polygons, seed ticket
coordinates, the Nominatim geocoding viewbox, the frontend map default, and
the "near me" query radius. The hard-coded values were **Bengaluru**
(12.97, 77.59) even though every user-facing string said Navi Mumbai, so the
city map rendered in the wrong state and address geocoding was hard-bounded to
a city 850 km away.

Everything geographic now reads from here. Values are overridable via
environment variables so a future deployment in another city is a config
change rather than a code change.
"""

import os
from dataclasses import dataclass, field
from typing import Dict, List, Tuple


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


@dataclass(frozen=True)
class Ward:
    """A ward polygon, used for both seeding and the spatial ticket->ward join."""

    name: str
    # (lon_min, lat_min, lon_max, lat_max) — the rectangle inscribed in the
    # boundary polygon. Kept alongside the WKT so tests and analytics can reason
    # about a ward without parsing geometry.
    bounds: Tuple[float, float, float, float]
    uhs_score: float

    @property
    def wkt(self) -> str:
        lon_min, lat_min, lon_max, lat_max = self.bounds
        return (
            f"POLYGON(({lon_min} {lat_min}, {lon_max} {lat_min}, "
            f"{lon_max} {lat_max}, {lon_min} {lat_max}, {lon_min} {lat_min}))"
        )


#: City centre. Navi Mumbai's Kharghar node area, which is also roughly the
#: centroid of the serviced ward set below.
CITY_NAME: str = os.getenv("URBANPULSE_CITY_NAME", "Navi Mumbai")
CITY_STATE: str = os.getenv("URBANPULSE_CITY_STATE", "Maharashtra")
CITY_AUTHORITY: str = os.getenv("URBANPULSE_CITY_AUTHORITY", "Navi Mumbai Municipal Corporation")
CITY_COUNTRY: str = os.getenv("URBANPULSE_CITY_COUNTRY", "India")

CITY_CENTER_LAT: float = _env_float("URBANPULSE_CITY_LAT", 19.0330)
CITY_CENTER_LNG: float = _env_float("URBANPULSE_CITY_LNG", 73.0298)

#: Radius used by "issues near here" public queries.
CITY_RADIUS_METERS: float = _env_float("URBANPULSE_CITY_RADIUS_M", 25000.0)

#: Nominatim `viewbox` = lon_min,lat_max,lon_max,lat_min. A generous box around
#: the whole Navi Mumbai taluka so address lookups are not clipped to one node.
CITY_GEOCODE_VIEWBOX: str = os.getenv(
    "URBANPULSE_CITY_VIEWBOX", "72.95,19.25,73.25,18.95"
)


#: The serviced wards. These three rectangles tile a contiguous block of
#: Navi Mumbai so the spatial join in `analytics.py` resolves every seeded
#: ticket to exactly one ward.
WARDS: Tuple[Ward, ...] = (
    Ward(
        name="Kharghar",
        bounds=(73.0400, 19.0250, 73.0850, 19.0650),
        uhs_score=88.5,
    ),
    Ward(
        name="Vashi & Nerul",
        bounds=(72.9900, 19.0250, 73.0400, 19.0650),
        uhs_score=94.2,
    ),
    Ward(
        name="Taloja & Karanjade",
        bounds=(73.0400, 18.9850, 73.0850, 19.0250),
        uhs_score=72.1,
    ),
)

WARD_BY_NAME: Dict[str, Ward] = {w.name: w for w in WARDS}


def ward_for_point(lat: float, lng: float):
    """Return the Ward containing a point, or None when it is out of area.

    Mirrors the ``ST_Contains`` predicate used by the analytics queries so
    seeding can guarantee that every seeded ticket lands inside a real ward.
    """
    for ward in WARDS:
        lon_min, lat_min, lon_max, lat_max = ward.bounds
        if lon_min <= lng <= lon_max and lat_min <= lat <= lat_max:
            return ward
    return None


def is_valid_point(lat: float, lng: float) -> bool:
    """Reject the -999 sentinels and anything outside the city catchment.

    Sentinel coordinates are what the WhatsApp and CX flows write when a
    citizen's location could not be resolved; they must never reach the map.
    """
    if lat is None or lng is None:
        return False
    if lat < CITY_CENTER_LAT - 1.0 or lat > CITY_CENTER_LAT + 1.0:
        return False
    if lng < CITY_CENTER_LNG - 1.0 or lng > CITY_CENTER_LNG + 1.0:
        return False
    return ward_for_point(lat, lng) is not None


def nearest_valid_point(lat: float, lng: float) -> Tuple[float, float]:
    """Clamp an out-of-area point to the city centre.

    Used when migrating legacy rows so a ticket can never sit at -999 and be
    silently dropped from the map and the heat layer.
    """
    if ward_for_point(lat, lng) is not None:
        return lat, lng
    return CITY_CENTER_LAT, CITY_CENTER_LNG


#: Convenience for callers that want a list (e.g. seeding loops).
WARD_LIST: List[Ward] = list(WARDS)
