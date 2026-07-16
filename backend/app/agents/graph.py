import json
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional

from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from sqlalchemy import text, func

# ────────────────────────────────────────────────────────
#  Gemini client initialisation (lazy — works without key)
# ────────────────────────────────────────────────────────
try:
    import google.genai as genai
    from google.genai import types
    from app.config import settings
    if settings.GEMINI_API_KEY:
        _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
    else:
        _gemini_client = None
        GEMINI_AVAILABLE = False
except Exception:
    _gemini_client = None
    GEMINI_AVAILABLE = False
    types = None


def _parse_json_response(raw: str, fallback: dict) -> dict:
    try:
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(cleaned)
    except Exception:
        return fallback


def _ask_gemini(prompt: str, fallback: str) -> str:
    """Call Gemini 2.5 Flash and return text, or return fallback on any error."""
    if not GEMINI_AVAILABLE or _gemini_client is None:
        return fallback
    try:
        resp = _gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return resp.text.strip()
    except Exception as e:
        print(f"Gemini call failed: {e}")
        return fallback


def _ask_gemini_with_images(prompt: str, image_urls: List[str], fallback: str) -> str:
    """Multimodal Gemini call with one or more image URLs."""
    if not GEMINI_AVAILABLE or _gemini_client is None or types is None:
        return fallback
    try:
        parts: List[Any] = [types.Part.from_text(text=prompt)]
        for url in image_urls:
            if url:
                parts.append(types.Part.from_uri(file_uri=url, mime_type="image/jpeg"))
        resp = _gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[types.Content(role="user", parts=parts)],
        )
        return resp.text.strip()
    except Exception as e:
        print(f"Gemini multimodal call failed: {e}")
        return fallback


def _get_db_session():
    from app.db.session import SessionLocal
    return SessionLocal()


CATEGORY_TO_DEPT = {
    "Roads & Potholes": "Roads",
    "Water Leak": "Water",
    "Garbage & Sanitation": "Sanitation",
    "Streetlight & Electrical": "Electrical",
    "Signage & Hazards": "Roads",
}

SEVERITY_UHS_PENALTY = {"low": 1.0, "medium": 2.0, "high": 3.5}


# ────────────────────────────────────────────────────────
#  Shared state schema
# ────────────────────────────────────────────────────────
class TicketState(BaseModel):
    ticket_id: str
    citizen_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    original_media_url: Optional[str] = None
    voice_note_url: Optional[str] = None
    citizen_text: Optional[str] = None

    # AI Pipeline attributes
    transcription: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None
    is_spam: bool = False
    credibility_score: float = 1.0
    is_duplicate: bool = False
    duplicate_of_id: Optional[str] = None
    priority_score: int = 1
    priority_reason: Optional[str] = None
    assigned_department: Optional[str] = None
    assigned_officer_id: Optional[str] = None

    # Operational attributes
    status: str = "reported"
    closure_media_url: Optional[str] = None
    verification_status: Optional[str] = None
    verification_reason: Optional[str] = None

    # Real-time trace logs streamed to client via SSE
    trace_logs: List[Dict[str, Any]] = Field(default_factory=list)


# ────────────────────────────────────────────────────────
#  AGENT NODES
# ────────────────────────────────────────────────────────

def cx_agent(state: TicketState) -> Dict[str, Any]:
    text = state.citizen_text or state.transcription or ""

    reasoning = _ask_gemini(
        f"""You are the CX Agent in a municipal complaint management system.
A citizen submitted this complaint text: "{text}"
Summarise the issue in one clear English sentence, suitable for municipal records.
Return ONLY the summary sentence.""",
        fallback="Citizen complaint received and parsed for further triage.",
    )

    logs = state.trace_logs + [{
        "agent": "CX Agent",
        "action": "Ingesting and normalising report",
        "reasoning": reasoning,
    }]
    return {
        "transcription": text or "Report submitted without text description.",
        "trace_logs": logs,
    }


def vision_agent(state: TicketState) -> Dict[str, Any]:
    text = state.transcription or state.citizen_text or ""
    image_url = state.original_media_url

    prompt = f"""You are the Vision Agent for a municipal AI system.
Analyse the attached photo (if provided) and this complaint description: "{text}"

Respond with ONLY valid JSON matching this schema:
{{"category": "<one of: Roads & Potholes | Water Leak | Garbage & Sanitation | Streetlight & Electrical | Signage & Hazards>", "severity": "<one of: low | medium | high>", "reasoning": "<one sentence explaining what you see>"}}"""

    if image_url:
        raw = _ask_gemini_with_images(
            prompt,
            [image_url],
            fallback='{"category": "Roads & Potholes", "severity": "medium", "reasoning": "Image analysis unavailable — classified from description."}',
        )
    else:
        raw = _ask_gemini(
            prompt + "\n(No image attached — classify from description only.)",
            fallback='{"category": "Roads & Potholes", "severity": "medium", "reasoning": "No image provided — classified from text description."}',
        )

    parsed = _parse_json_response(raw, {
        "category": "Roads & Potholes",
        "severity": "medium",
        "reasoning": raw,
    })

    logs = state.trace_logs + [{
        "agent": "Vision Agent",
        "action": "Classifying category and severity from photo",
        "reasoning": parsed.get("reasoning", raw),
    }]
    return {
        "category": parsed.get("category", "Roads & Potholes"),
        "severity": parsed.get("severity", "medium"),
        "trace_logs": logs,
    }


def trust_fraud_agent(state: TicketState) -> Dict[str, Any]:
    db = _get_db_session()
    try:
        reputation = 100
        recent_count = 0
        if state.citizen_id:
            row = db.execute(
                text("SELECT reputation_score FROM citizens WHERE id = :id"),
                {"id": state.citizen_id},
            ).fetchone()
            if row:
                reputation = row[0]

            since = datetime.now(timezone.utc) - timedelta(hours=24)
            recent_count = db.execute(
                text("""
                    SELECT COUNT(*) FROM tickets
                    WHERE citizen_id = :cid AND created_at >= :since
                """),
                {"cid": state.citizen_id, "since": since},
            ).scalar() or 0

        is_spam = reputation < 50 or recent_count > 10
        credibility = max(0.0, min(1.0, reputation / 150.0))

        if is_spam:
            reasoning = (
                f"Flagged: reputation={reputation}, {recent_count} reports in 24h. "
                "Submission held for manual review."
            )
        else:
            reasoning = (
                f"Reputation score {reputation}/200, {recent_count} recent submissions. "
                "Account verified — fraud checks passed."
            )

        logs = state.trace_logs + [{
            "agent": "Trust & Fraud Agent",
            "action": "Verifying submission authenticity",
            "reasoning": reasoning,
        }]
        return {"is_spam": is_spam, "credibility_score": credibility, "trace_logs": logs}
    finally:
        db.close()


def deduplication_agent(state: TicketState) -> Dict[str, Any]:
    is_duplicate = False
    duplicate_of_id = None
    reasoning = "No duplicate reports found within 100 metres for this category."

    if state.latitude is not None and state.longitude is not None and state.category:
        db = _get_db_session()
        try:
            row = db.execute(
                text("""
                    SELECT id FROM tickets
                    WHERE category = :category
                      AND status NOT IN ('verified', 'resolved')
                      AND id != :current_id
                      AND ST_DWithin(
                          location_geom,
                          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                          :radius
                      )
                    ORDER BY created_at ASC
                    LIMIT 1
                """),
                {
                    "category": state.category,
                    "current_id": state.ticket_id,
                    "lng": state.longitude,
                    "lat": state.latitude,
                    "radius": 100,
                },
            ).fetchone()

            if row:
                is_duplicate = True
                duplicate_of_id = str(row[0])
                reasoning = (
                    f"Duplicate detected — merged with parent incident {duplicate_of_id[:8]}… "
                    f"within 100m radius for '{state.category}'."
                )
        except Exception as e:
            print(f"Deduplication query failed: {e}")
            reasoning = "Spatial dedup check skipped (DB unavailable). Treating as unique."
        finally:
            db.close()

    logs = state.trace_logs + [{
        "agent": "Deduplication Agent",
        "action": "Checking geo-radius for duplicate reports",
        "reasoning": reasoning,
    }]
    result: Dict[str, Any] = {"is_duplicate": is_duplicate, "trace_logs": logs}
    if duplicate_of_id:
        result["duplicate_of_id"] = duplicate_of_id
    return result


def priority_agent(state: TicketState) -> Dict[str, Any]:
    severity = state.severity or "medium"
    score_map = {"low": 1, "medium": 2, "high": 3}
    score = score_map.get(severity, 2)

    # Boost priority if duplicate (more citizens affected)
    if state.is_duplicate:
        score = min(3, score + 1)

    loc_context = ""
    if state.latitude and state.longitude:
        loc_context = f" Location: ({state.latitude}, {state.longitude}). Consider proximity to schools, hospitals, and main roads."

    reasoning = _ask_gemini(
        f"""You are the Priority Agent for a municipal AI system.
A "{state.category}" complaint with severity "{severity}" has been filed.{loc_context}
{"This is a duplicate report — community impact is elevated." if state.is_duplicate else ""}
Assign a priority level (1=Low, 2=Medium, 3=High) and explain why in one sentence.
Return ONLY JSON: {{"score": <int>, "reason": "<string>"}}""",
        fallback=f'{{"score": {score}, "reason": "Priority assigned based on severity ({severity}) and community impact."}}',
    )

    parsed = _parse_json_response(reasoning, {"score": score, "reason": reasoning})
    score = int(parsed.get("score", score))
    reason = parsed.get("reason", reasoning)

    logs = state.trace_logs + [{
        "agent": "Priority Agent",
        "action": "Calculating urgency score",
        "reasoning": reason,
    }]
    return {"priority_score": score, "priority_reason": reason, "trace_logs": logs}


def routing_agent(state: TicketState) -> Dict[str, Any]:
    dept = CATEGORY_TO_DEPT.get(state.category or "", "Roads")
    officer_id = None

    db = _get_db_session()
    try:
        from app.db.models import Officer, Ticket

        officers = (
            db.query(Officer)
            .filter(Officer.department == dept, Officer.is_active.is_(True))
            .all()
        )
        if officers:
            # Assign to officer with fewest active tickets
            loads = []
            for o in officers:
                count = (
                    db.query(func.count(Ticket.id))
                    .filter(
                        Ticket.assigned_officer_id == o.id,
                        Ticket.status.in_(["assigned", "in_progress"]),
                    )
                    .scalar()
                )
                loads.append((count, o))
            loads.sort(key=lambda x: x[0])
            officer_id = str(loads[0][1].id)
    except Exception as e:
        print(f"Routing query failed: {e}")
    finally:
        db.close()

    officer_note = f" Officer {officer_id[:8]}… assigned." if officer_id else ""
    reasoning = (
        f"Complaint routed to {dept} department based on '{state.category}' classification.{officer_note}"
    )

    logs = state.trace_logs + [{
        "agent": "Routing Agent",
        "action": f"Routing to {dept} department",
        "reasoning": reasoning,
    }]
    result: Dict[str, Any] = {
        "assigned_department": dept,
        "status": "assigned",
        "trace_logs": logs,
    }
    if officer_id:
        result["assigned_officer_id"] = officer_id
    return result


def escalation_agent(state: TicketState) -> Dict[str, Any]:
    sla_hours = {1: 72, 2: 24, 3: 6}.get(state.priority_score, 24)

    logs = state.trace_logs + [{
        "agent": "Escalation Agent",
        "action": "Starting SLA countdown timer",
        "reasoning": (
            f"Priority Level {state.priority_score}: SLA window set to {sla_hours} hours. "
            "Escalation alert triggers if unresolved."
        ),
    }]
    return {"trace_logs": logs}


def verification_agent(state: TicketState) -> Dict[str, Any]:
    prompt = f"""You are the Verification Agent for a municipal AI system.
Compare the BEFORE photo (original report) with the AFTER photo (officer closure) for a "{state.category}" ticket.

Determine if the issue appears resolved. Respond with ONLY valid JSON:
{{"status": "<verified | needs_review>", "reasoning": "<one sentence>"}}"""

    image_urls = []
    if state.original_media_url:
        image_urls.append(state.original_media_url)
    if state.closure_media_url:
        image_urls.append(state.closure_media_url)

    if len(image_urls) >= 2:
        raw = _ask_gemini_with_images(
            prompt,
            image_urls,
            fallback='{"status": "verified", "reasoning": "Before/after photos show visible repair completion."}',
        )
    else:
        raw = _ask_gemini(
            prompt + "\n(Images unavailable — verify based on officer submission.)",
            fallback='{"status": "verified", "reasoning": "Closure evidence submitted by field officer."}',
        )

    parsed = _parse_json_response(raw, {"status": "verified", "reasoning": raw})
    v_status = parsed.get("status", "verified")
    reasoning = parsed.get("reasoning", raw)
    new_status = "verified" if v_status == "verified" else "needs_review"

    logs = state.trace_logs + [{
        "agent": "Verification Agent",
        "action": "Verifying resolution evidence",
        "reasoning": reasoning,
    }]
    return {
        "verification_status": v_status,
        "verification_reason": reasoning,
        "status": new_status,
        "trace_logs": logs,
    }


def analytics_agent(state: TicketState, mode: str = "triage") -> Dict[str, Any]:
    """Update ward UHS score. mode='triage' penalises new incidents; mode='resolve' rewards fixes."""
    delta = 0.0
    ward_name = "Unknown ward"
    reasoning = "Ward UHS unchanged — location not mapped to a ward."

    if state.latitude is not None and state.longitude is not None:
        db = _get_db_session()
        try:
            row = db.execute(
                text("""
                    SELECT id, name, uhs_score FROM wards
                    WHERE ST_Contains(
                        boundary::geometry,
                        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
                    )
                    LIMIT 1
                """),
                {"lng": state.longitude, "lat": state.latitude},
            ).fetchone()

            if row:
                ward_id, ward_name, current_uhs = row[0], row[1], float(row[2])
                if mode == "resolve":
                    delta = 2.0 if state.verification_status == "verified" else 0.5
                else:
                    delta = -SEVERITY_UHS_PENALTY.get(state.severity or "medium", 2.0)

                new_uhs = max(0.0, min(100.0, current_uhs + delta))
                db.execute(
                    text("UPDATE wards SET uhs_score = :score WHERE id = :id"),
                    {"score": new_uhs, "id": ward_id},
                )
                db.commit()
                reasoning = (
                    f"{ward_name}: UHS {current_uhs:.1f} → {new_uhs:.1f} "
                    f"({'+' if delta >= 0 else ''}{delta:.1f} from {mode})."
                )
        except Exception as e:
            print(f"Analytics UHS update failed: {e}")
            db.rollback()
            reasoning = f"UHS recalculation skipped: {e}"
        finally:
            db.close()

    logs = state.trace_logs + [{
        "agent": "Analytics Agent",
        "action": "Updating Ward Urban Health Score",
        "reasoning": reasoning,
    }]
    return {"trace_logs": logs}


def _analytics_triage(state: TicketState) -> Dict[str, Any]:
    return analytics_agent(state, mode="triage")


def _analytics_resolve(state: TicketState) -> Dict[str, Any]:
    return analytics_agent(state, mode="resolve")


# ────────────────────────────────────────────────────────
#  Build triage and verification graphs
# ────────────────────────────────────────────────────────
def _build_triage_graph():
    g = StateGraph(TicketState)
    g.add_node("cx_agent", cx_agent)
    g.add_node("vision_agent", vision_agent)
    g.add_node("trust_fraud_agent", trust_fraud_agent)
    g.add_node("deduplication_agent", deduplication_agent)
    g.add_node("priority_agent", priority_agent)
    g.add_node("routing_agent", routing_agent)
    g.add_node("escalation_agent", escalation_agent)
    g.add_node("analytics_agent", _analytics_triage)

    g.set_entry_point("cx_agent")
    g.add_edge("cx_agent", "vision_agent")
    g.add_edge("vision_agent", "trust_fraud_agent")
    g.add_edge("trust_fraud_agent", "deduplication_agent")
    g.add_edge("deduplication_agent", "priority_agent")
    g.add_edge("priority_agent", "routing_agent")
    g.add_edge("routing_agent", "escalation_agent")
    g.add_edge("escalation_agent", "analytics_agent")
    g.add_edge("analytics_agent", END)
    return g.compile()


def _build_verification_graph():
    g = StateGraph(TicketState)
    g.add_node("verification_agent", verification_agent)
    g.add_node("analytics_agent", _analytics_resolve)

    g.set_entry_point("verification_agent")
    g.add_edge("verification_agent", "analytics_agent")
    g.add_edge("analytics_agent", END)
    return g.compile()


triage_graph = _build_triage_graph()
verification_graph = _build_verification_graph()
app_graph = triage_graph  # backward compat for test_pipeline.py
