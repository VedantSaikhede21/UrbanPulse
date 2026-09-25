"""Point seed locations for the demo dataset.

Every coordinate sits inside a real serviced ward (see ``app.city``) so the
spatial ``ST_Contains`` join in ``analytics.py`` resolves them. The previous
values were Bengaluru (12.97, 77.59) while the UI claimed Navi Mumbai.
"""

from typing import Dict, Tuple

# category -> (latitude, longitude, human-readable place)
SEED_LOCATIONS: Dict[str, Tuple[float, float, str]] = {
    # Kharghar ward
    "pothole": (19.0440, 73.0610, "5th Main Road, Kharghar"),
    "streetlight": (19.0380, 73.0520, "Sector 17, Kharghar"),
    "water_leak": (19.0330, 73.0700, "Central Park, Kharghar"),
    # Vashi & Nerul ward
    "dumping": (19.0520, 73.0230, "Nerul East, Navi Mumbai"),
    "sewage": (19.0410, 73.0100, "Vashi Sector 7, Navi Mumbai"),
    # Taloja & Karanjade ward
    "road_damage": (19.0140, 73.0560, "Karanjade, Navi Mumbai"),
    "garbage": (19.0060, 73.0680, "Taloja MIDC, Navi Mumbai"),
}


def location_for(key: str) -> Tuple[float, float]:
    lat, lng, _ = SEED_LOCATIONS[key]
    return lat, lng


def place_for(key: str) -> str:
    return SEED_LOCATIONS[key][2]
