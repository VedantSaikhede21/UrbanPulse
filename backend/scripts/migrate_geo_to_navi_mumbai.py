"""One-off migration: move the deployment's geography from Bengaluru to Navi Mumbai.

WHY
---
The seeded and QA-created data was written with Bengaluru coordinates
(12.97, 77.59) and the ward polygons were Bengaluru rectangles, while every
user-facing string said "Navi Mumbai". Consequences in the live demo:

  * the public city map rendered centred on Bengaluru (or, for a signed-in
    visitor, on that visitor's single Bengaluru ticket);
  * `/api/tickets/near` centred on Navi Mumbai matched only 2 of 25 tickets,
    so the city looked almost empty;
  * 2 rows carried the -999 sentinel that the WhatsApp/CX flow writes when a
    location cannot be resolved, which silently drops them from the map.

WHAT
---
  1. Back up every ward polygon and ticket coordinate to JSON first.
  2. Replace the three ward polygons with the real Navi Mumbai wards from
     `app.city` (and give them real names).
  3. Re-point every out-of-area ticket into the city, deterministically, so
     that each lands inside exactly one ward (the `ST_Contains` join in
     `analytics.py` must keep resolving).
  4. Repair the -999 sentinel rows.

Idempotent: re-running finds nothing left to do. Pass --apply to write;
without it the script only reports what it would change.
"""

import argparse
import json
import pathlib
import sys
from datetime import datetime, timezone

from geoalchemy2 import WKTElement
from sqlalchemy import text

from app.city import (
    CITY_CENTER_LAT,
    CITY_CENTER_LNG,
    CITY_NAME,
    WARDS,
    is_valid_point,
    nearest_valid_point,
    ward_for_point,
)
from app.db.session import SessionLocal

BACKUP_DIR = pathlib.Path("/tmp/urbanpulse-geo-backup")


def backup_payload(db) -> dict:
    wards = [
        {
            "id": r.id,
            "name": r.name,
            "uhs_score": float(r.uhs_score) if r.uhs_score is not None else None,
            "boundary": r.boundary,
        }
        for r in db.execute(
            text("select id, name, uhs_score, st_astext(boundary) as boundary from wards order by id")
        )
    ]
    tickets = [
        {
            "id": r.id,
            "latitude": float(r.latitude),
            "longitude": float(r.longitude),
            "category": r.category,
            "status": r.status,
        }
        for r in db.execute(
            text("select id, latitude, longitude, category, status from tickets order by id")
        )
    ]
    return {
        "taken_at": datetime.now(timezone.utc).isoformat(),
        "city_before": "Bengaluru, Karnataka (12.97, 77.59)",
        "city_after": f"{CITY_NAME} ({CITY_CENTER_LAT}, {CITY_CENTER_LNG})",
        "wards": wards,
        "tickets": tickets,
    }


def jsonable(obj):
    """Decimal / UUID / geometry values all appear in these rows."""
    import decimal
    import uuid as _uuid

    if isinstance(obj, decimal.Decimal):
        return float(obj)
    if isinstance(obj, _uuid.UUID):
        return str(obj)
    raise TypeError(f"not JSON serializable: {type(obj).__name__}")


def write_backup(payload: dict) -> pathlib.Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = BACKUP_DIR / f"geo-before-migration-{stamp}.json"
    path.write_text(json.dumps(payload, indent=2, default=jsonable), encoding="utf-8")
    return path


def plan(db):
    """Return (ward_updates, ticket_updates, unchanged_count)."""
    ward_updates = []
    ticket_updates = []

    for ward in WARDS:
        existing = db.execute(
            text("select id, name, uhs_score, st_astext(boundary) as boundary from wards order by id")
        ).fetchall()
        match = next((r for r in existing if r.name == ward.name), None)
        if match is None:
            # Match positionally against the legacy ward list.
            idx = WARDS.index(ward)
            match = existing[idx] if idx < len(existing) else None
        if match is not None:
            current = match.boundary or ""
            if current != ward.wkt or match.name != ward.name:
                ward_updates.append(
                    {
                        "id": match.id,
                        "from_name": match.name,
                        "to_name": ward.name,
                        "from_wkt": current,
                        "to_wkt": ward.wkt,
                        "from_uhs": match.uhs_score,
                        "to_uhs": ward.uhs_score,
                    }
                )

    for row in db.execute(text("select id, latitude, longitude, category, status from tickets")):
        lat, lng = float(row.latitude), float(row.longitude)
        if is_valid_point(lat, lng):
            continue
        new_lat, new_lng = nearest_valid_point(lat, lng)
        # Spread the relocated rows deterministically inside the ward that
        # matches their original Bengaluru ward, so the dataset keeps its shape
        # instead of collapsing every row onto one pixel.
        idx = _legacy_ward_index(lat, lng)
        ward = WARDS[idx] if idx is not None else WARDS[0]
        jitter_lat, jitter_lng = _jitter(ward, row.id)
        ticket_updates.append(
            {
                "id": row.id,
                "category": row.category,
                "status": row.status,
                "from": [lat, lng],
                "to": [jitter_lat, jitter_lng],
                "raw_clamp": [new_lat, new_lng],
            }
        )

    return ward_updates, ticket_updates


def _legacy_ward_index(lat: float, lng: float):
    """Map an old Bengaluru coordinate onto the ward it used to belong to."""
    # Legacy ward 1: 12.96-12.98 / 77.58-77.60  -> Kharghar
    if 12.96 <= lat <= 12.98 and 77.58 <= lng <= 77.60:
        return 0
    # Legacy ward 2: 12.96-12.98 / 77.60-77.62  -> Vashi & Nerul
    if 12.96 <= lat <= 12.98 and 77.60 <= lng <= 77.62:
        return 1
    # Legacy ward 3: 12.94-12.96 / 77.58-77.60  -> Taloja & Karanjade
    if 12.94 <= lat <= 12.96 and 77.58 <= lng <= 77.60:
        return 2
    return None


def _jitter(ward, seed_id: str):
    """Deterministic interior point for a ticket inside `ward`."""
    import hashlib

    lon_min, lat_min, lon_max, lat_max = ward.bounds
    digest = hashlib.sha256(str(seed_id).encode()).digest()
    # Keep a 12% margin so the point never lands on the polygon edge, where
    # ST_Contains and ST_Intersects disagree.
    fx = 0.12 + (digest[0] / 255.0) * 0.76
    fy = 0.12 + (digest[1] / 255.0) * 0.76
    return (
        round(lat_min + (lat_max - lat_min) * fy, 6),
        round(lon_min + (lon_max - lon_min) * fx, 6),
    )


def apply_plan(db, ward_updates, ticket_updates):
    for u in ward_updates:
        db.execute(
            text(
                "update wards set name = :name, boundary = ST_GeomFromText(:wkt, 4326),"
                " uhs_score = :uhs where id = :id"
            ),
            {"name": u["to_name"], "wkt": u["to_wkt"], "uhs": u["to_uhs"], "id": u["id"]},
        )
    for u in ticket_updates:
        db.execute(
            text("update tickets set latitude = :lat, longitude = :lng where id = :id"),
            {"lat": u["to"][0], "lng": u["to"][1], "id": u["id"]},
        )
    db.commit()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write the changes")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        payload = backup_payload(db)
        path = write_backup(payload)
        print(f"backup written: {path}")
        print(f"  {len(payload['wards'])} wards, {len(payload['tickets'])} tickets")

        ward_updates, ticket_updates = plan(db)

        print(f"\n== PLAN ({'APPLYING' if args.apply else 'DRY RUN'}) ==")
        print(f"wards to move : {len(ward_updates)}")
        for u in ward_updates:
            print(f"  id={u['id']}  {u['from_name']!r} -> {u['to_name']!r}")
        print(f"tickets to move: {len(ticket_updates)}")
        for u in ticket_updates[:30]:
            print(f"  {str(u['id'])[:8]} {str(u['category'])[:20]:20} {u['from']} -> {u['to']}")
        if len(ticket_updates) > 30:
            print(f"  ... and {len(ticket_updates) - 30} more")

        if not args.apply:
            print("\ndry run — pass --apply to write")
            return 0

        apply_plan(db, ward_updates, ticket_updates)
        print("\nchanges committed")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
