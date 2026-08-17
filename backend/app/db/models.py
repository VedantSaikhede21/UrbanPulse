import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Numeric, ForeignKey, Text, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.db.session import Base
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry

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

class Citizen(Base):
    __tablename__ = "citizens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=True)
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
    location_source = Column(String(20), default="gps", nullable=False)  # 'gps' or 'geocoded'
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
