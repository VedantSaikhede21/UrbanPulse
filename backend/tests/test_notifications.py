"""Notifications persistence + read state tests.

Exercises the service contract in `app/services/notifications.py`
against an in-memory SQLite DB. The previous implementation
derived notifications on the fly from tickets.status; this slice
introduces a real `notifications` table with a server-side `read`
flag. The tests pin the write/read/mark-read shape so a regression
in the persistence or authorization surfaces in CI.
"""
import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Base, Citizen, Notification, Ticket
from app.services import notifications as notif_service


# ── fixtures ──────────────────────────────────────────────


@pytest.fixture()
def db():
    """Isolated in-memory DB with citizens + tickets + notifications.
    Other tables (wards, officers, agent_logs) are skipped — sqlite
    cannot serve the PostGIS GEOGRAPHY type on wards, and the
    notifications service only joins citizens and tickets."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(
        engine,
        tables=[
            Base.metadata.tables["citizens"],
            Base.metadata.tables["tickets"],
            Base.metadata.tables["notifications"],
        ],
    )
    Session = sessionmaker(bind=engine)
    s = Session()
    try:
        yield s
    finally:
        s.close()
        engine.dispose()


@pytest.fixture()
def citizen(db):
    cid = uuid.uuid4()
    db.add(Citizen(id=cid, name="Test Citizen", email=f"{cid}@test.local"))
    db.commit()
    return cid


def _make_ticket(db, citizen_id, **overrides) -> Ticket:
    defaults = dict(
        id=uuid.uuid4(),
        citizen_id=citizen_id,
        latitude=19.0,
        longitude=72.0,
        category="Roads & Potholes",
        severity="medium",
        status="reported",
    )
    defaults.update(overrides)
    t = Ticket(**defaults)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


# ── record_notification ──────────────────────────────────


class TestRecordNotification:
    def test_creates_a_row(self, db, citizen):
        tid = _make_ticket(db, citizen).id
        n = notif_service.record_notification(
            db, citizen, tid,
            type_="status",
            title="Triage complete",
            message="Your report has been routed to Roads.",
        )
        assert n.id is not None
        assert n.read is False
        assert n.type == "status"
        assert n.title == "Triage complete"
        assert n.citizen_id == citizen

    def test_duplicate_creates_a_second_row(self, db, citizen):
        """The (citizen, ticket) pair is not unique — a ticket can
        produce many notifications over its lifetime."""
        tid = _make_ticket(db, citizen).id
        notif_service.record_notification(db, citizen, tid, type_="info",
                                          title="t1", message="m1")
        notif_service.record_notification(db, citizen, tid, type_="status",
                                          title="t2", message="m2")
        rows = (
            db.query(Notification)
            .filter(Notification.citizen_id == citizen, Notification.ticket_id == tid)
            .all()
        )
        assert len(rows) == 2


# ── backfill_for_citizen ──────────────────────────────────


class TestBackfill:
    def test_creates_one_notification_per_ticket(self, db, citizen):
        t1 = _make_ticket(db, citizen, status="reported")
        t2 = _make_ticket(db, citizen, status="assigned")
        created = notif_service.backfill_for_citizen(db, citizen)
        assert created == 2
        assert db.query(Notification).count() == 2

    def test_is_idempotent(self, db, citizen):
        t1 = _make_ticket(db, citizen)
        first = notif_service.backfill_for_citizen(db, citizen)
        second = notif_service.backfill_for_citizen(db, citizen)
        assert first == 1
        assert second == 0
        assert db.query(Notification).count() == 1

    def test_skips_other_citizens_tickets(self, db, citizen):
        other = uuid.uuid4()
        db.add(Citizen(id=other, name="Other", email=f"{other}@test.local"))
        db.commit()
        _make_ticket(db, other)
        _make_ticket(db, citizen)
        created = notif_service.backfill_for_citizen(db, citizen)
        assert created == 1
        # The other citizen's ticket did not get a notification for
        # the test citizen's feed.
        assert (
            db.query(Notification)
            .filter(Notification.citizen_id == citizen)
            .count()
        ) == 1

    def test_message_includes_dept_name(self, db, citizen):
        _make_ticket(db, citizen, category="Water Leak", status="assigned")
        notif_service.backfill_for_citizen(db, citizen)
        n = db.query(Notification).one()
        assert "Water" in n.message

    def test_type_maps_to_status(self, db, citizen):
        _make_ticket(db, citizen, status="reported")
        _make_ticket(db, citizen, status="verified")
        notif_service.backfill_for_citizen(db, citizen)
        types = {n.type for n in db.query(Notification).all()}
        # reported -> info, verified -> status
        assert "info" in types
        assert "status" in types


# ── list_notifications ───────────────────────────────────


class TestListNotifications:
    def test_returns_backfilled_notifications(self, db, citizen):
        _make_ticket(db, citizen)
        notif_service.backfill_for_citizen(db, citizen)
        out = notif_service.list_notifications(db, str(citizen))
        assert len(out) == 1
        n = out[0]
        # Frontend consumer depends on this exact key set.
        assert set(n.keys()) >= {"id", "ticket_id", "message", "read", "type", "timestamp"}

    def test_empty_for_citizen_without_tickets(self, db, citizen):
        out = notif_service.list_notifications(db, str(citizen))
        assert out == []

    def test_explicit_none_returns_empty(self, db):
        out = notif_service.list_notifications(db, None)
        assert out == []


# ── mark_read / mark_all_read ────────────────────────────


class TestMarkRead:
    def test_marks_one_read(self, db, citizen):
        tid = _make_ticket(db, citizen).id
        notif_service.record_notification(db, citizen, tid, type_="status",
                                          title="t", message="m")
        n = db.query(Notification).one()
        assert n.read is False
        ok = notif_service.mark_read(db, citizen, n.id)
        assert ok is True
        db.refresh(n)
        assert n.read is True

    def test_returns_false_for_other_citizens_notification(self, db, citizen):
        other = uuid.uuid4()
        db.add(Citizen(id=other, name="Other", email=f"{other}@test.local"))
        db.commit()
        tid = _make_ticket(db, citizen).id
        notif_service.record_notification(db, citizen, tid, type_="status",
                                          title="t", message="m")
        n = db.query(Notification).one()
        ok = notif_service.mark_read(db, other, n.id)
        assert ok is False
        db.refresh(n)
        assert n.read is False

    def test_returns_false_if_already_read(self, db, citizen):
        tid = _make_ticket(db, citizen).id
        notif_service.record_notification(db, citizen, tid, type_="status",
                                          title="t", message="m")
        n = db.query(Notification).one()
        notif_service.mark_read(db, citizen, n.id)
        ok = notif_service.mark_read(db, citizen, n.id)
        assert ok is False

    def test_returns_false_for_unknown_id(self, db, citizen):
        ok = notif_service.mark_read(db, citizen, uuid.uuid4())
        assert ok is False


class TestMarkAllRead:
    def test_marks_every_unread(self, db, citizen):
        tid = _make_ticket(db, citizen).id
        notif_service.record_notification(db, citizen, tid, type_="info",
                                          title="a", message="x")
        notif_service.record_notification(db, citizen, tid, type_="info",
                                          title="b", message="y")
        n = notif_service.mark_all_read(db, citizen)
        assert n == 2
        assert db.query(Notification).filter(Notification.read.is_(False)).count() == 0

    def test_returns_zero_when_all_already_read(self, db, citizen):
        tid = _make_ticket(db, citizen).id
        notif_service.record_notification(db, citizen, tid, type_="info",
                                          title="a", message="x")
        notif_service.mark_all_read(db, citizen)
        n = notif_service.mark_all_read(db, citizen)
        assert n == 0


class TestUnreadCount:
    def test_counts_only_unread(self, db, citizen):
        tid = _make_ticket(db, citizen).id
        notif_service.record_notification(db, citizen, tid, type_="info",
                                          title="a", message="x")
        notif_service.record_notification(db, citizen, tid, type_="info",
                                          title="b", message="y")
        n = notif_service.notification_unread_count(db, citizen) if hasattr(
            notif_service, "notification_unread_count") else notif_service.unread_count(db, citizen)
        assert n == 2
        notif_service.mark_all_read(db, citizen)
        n = notif_service.unread_count(db, citizen)
        assert n == 0


# ── migration pinning ─────────────────────────────────────


class TestMigrationIsRegistered:
    def test_migration_005_present_and_idempotent(self):
        import importlib.util
        from pathlib import Path
        path = (
            Path(__file__).resolve().parents[1]
            / "alembic" / "versions" / "005_notifications.py"
        )
        assert path.exists()
        spec = importlib.util.spec_from_file_location("m005", path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        assert mod.revision == "005"
        assert mod.down_revision == "004"
        src = path.read_text()
        assert "CREATE TABLE IF NOT EXISTS notifications" in src
        assert "citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE" in src
        assert "ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE" in src
        # Indexes that keep the unread-count query cheap.
        assert "notifications_citizen_id_read_idx" in src
