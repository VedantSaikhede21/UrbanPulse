import uuid
from sqlalchemy import Column, String, Integer, Boolean, Numeric, ForeignKey, Text, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.db.session import Base

class Ward(Base):
    __tablename__ = "wards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    boundary = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)
    uhs_score = Column(Numeric(4, 1), default=100.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Citizen(Base):
    __tablename__ = "citizens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    reputation_score = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Officer(Base):
    __tablename__ = "officers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    department = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

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
