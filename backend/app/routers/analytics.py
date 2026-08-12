from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import func, text
from sqlalchemy.orm import Session, load_only

from app.db.models import Ticket, Ward
from app.db.session import get_db
from app.schemas.analytics import CityPulseResponse, WardScore

router = APIRouter()


@router.get("/api/analytics/wards", response_model=List[WardScore])
def ward_analytics(db: Session = Depends(get_db)):
    wards = db.query(Ward).options(load_only(Ward.id, Ward.name, Ward.uhs_score)).all()
    return [
        {
            "id": str(w.id),
            "name": w.name,
            "uhs_score": float(w.uhs_score),
        }
        for w in wards
    ]


@router.get("/api/analytics/city-pulse", response_model=CityPulseResponse)
def city_pulse(db: Session = Depends(get_db)):
    """AI City Pulse — ward health summary with trending issues."""
    wards = db.query(Ward).options(load_only(Ward.id, Ward.name, Ward.uhs_score)).order_by(Ward.uhs_score.asc()).all()
    critical = [w for w in wards if float(w.uhs_score) < 50]

    trending = (
        db.query(Ticket.category, func.count(Ticket.id).label("count"))
        .filter(Ticket.status.in_(["reported", "assigned", "in_progress"]))
        .group_by(Ticket.category)
        .order_by(func.count(Ticket.id).desc())
        .limit(3)
        .all()
    )

    alerts = []
    for w in critical[:3]:
        ward_tickets = (
            db.query(Ticket)
            .filter(Ticket.status.in_(["reported", "assigned", "in_progress"]))
            .count()
        )
        alerts.append(
            f"{w.name} (Critical): UHS {float(w.uhs_score):.0f}. "
            f"Review open incidents and dispatch field teams."
        )

    if not alerts and wards:
        lowest = wards[0]
        alerts.append(
            f"Pulse Alert: {lowest.name} — UHS {float(lowest.uhs_score):.0f}. "
            f"Monitor for emerging infrastructure issues."
        )

    return {
        "wards": [{"name": w.name, "uhs_score": float(w.uhs_score)} for w in wards],
        "critical_wards": len(critical),
        "trending_categories": [{"category": c, "count": n} for c, n in trending],
        "pulse_alerts": alerts,
    }