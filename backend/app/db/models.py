import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Numeric, ForeignKey, Text, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.db.session import Base

class Ward(Base):
    __tablename__ = "wards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(100),nullable=False,unique=True)
    boundary: Mapped[object] = mapped_column(
        Geometry(geometry_type="POLYGON", srid=4326),
        nullable=False
    )

    uhs_score: Mapped[float] = mapped_column(
        Numeric(4, 1),
        default=100.0
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class Department(Base):
    """Department as a first-class configurable entity for multi-municipality support."""
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True)  # Short code for API/integration
    description = Column(Text, nullable=True)
    municipality = Column(String(100), nullable=False, default="default")  # For multi-city support
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to officers
    officers = relationship("Officer", back_populates="department_rel")


class Citizen(Base):
    __tablename__ = "citizens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=True)
    name = Column(String(100), nullable=False)
    reputation_score = Column(Integer, default=100)
    whatsapp_retry_count = Column(Integer, default=0)  # Track WhatsApp location retry attempts
    # Account linking: if this citizen was merged into another, this points to the canonical identity
    merged_into_id = Column(UUID(as_uuid=True), ForeignKey("citizens.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship for merged_into
    merged_into = relationship("Citizen", remote_side=[id], backref="merged_accounts")


class ProcessedMessage(Base):
    """Store processed Twilio MessageSid for idempotency."""
    __tablename__ = "processed_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_sid = Column(String(200), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Officer(Base):
    __tablename__ = "officers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False)  # legacy string — superseded by department_id
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    role = Column(String(20), nullable=False, default="officer")  # officer, dept_head, admin, super_admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Back-reference for Department.officers. Use foreign_keys to disambiguate
    # from any future "primary department" relationship that may point the
    # other way.
    department_rel = relationship("Department", back_populates="officers", foreign_keys=[department_id])

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    citizen_id = Column(UUID(as_uuid=True), ForeignKey("citizens.id", ondelete="SET NULL"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    # location_geom is managed by a DB trigger — excluded from ORM to avoid ST_AsEWKB issues
    category = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)
    voice_note_url = Column(String(500), nullable=True)
    original_media_url = Column(String(500), nullable=True)
    closure_media_url = Column(String(500), nullable=True)
    status = Column(String(50), default="reported", nullable=False)
    is_spam = Column(Boolean, default=False)
    is_duplicate = Column(Boolean, default=False)
    duplicate_of_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="SET NULL"), nullable=True)
    priority_score = Column(Integer, default=1)
    priority_reason = Column(Text, nullable=True)
    assigned_officer_id = Column(UUID(as_uuid=True), ForeignKey("officers.id", ondelete="SET NULL"), nullable=True)
    verification_status = Column(String(50), nullable=True)
    verification_reason = Column(Text, nullable=True)
    location_source = Column(String(20), default="gps", nullable=False)  # 'gps' or 'geocoded'
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    action = Column(String(100), nullable=False)
    target_table = Column(String(100), nullable=False)
    record_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AgentLog(Base):
    """One row per agent-node execution per ticket.

    The AI triage pipeline is a multi-node LangGraph. Each node
    appends a structured reasoning entry to its state; persisting
    that entry here turns the AI decision into a queryable,
    audit-grade record of *why* a ticket was prioritized and routed
    the way it was. Required by the Production Readiness Roadmap's
    Phase 1 "AgentLogs / audit-trail persistence" item: a civic
    system must be able to answer "why did the AI prioritize this
    ticket this way" months after the fact, not just live during
    the original session.
    """
    __tablename__ = "agent_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False, index=True)
    node_name = Column(String(100), nullable=True)
    action = Column(String(255), nullable=False)
    reasoning = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
