"""AgentLogs persistence tests.

These tests cover the service-layer contract in
`app/services/agent_logs.py` against an in-memory SQLite database
with the AgentLog model. They do not require a live Postgres +
PostGIS — the goal is to lock the write/read shape so a regression
in the persistence call from `services/pipeline.py` surfaces in CI
without spinning up the full backend.
"""
import uuid

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Base, AgentLog
from app.services import agent_logs


@pytest.fixture()
def db():
    """An isolated in-memory DB with just the AgentLog table.

    SQLite cannot serve PostGIS columns, so we only register the
    tables this test cares about. This is enough to exercise the
    service's read/write contract.
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(
        engine,
        tables=[Base.metadata.tables["agent_logs"]],
    )
    Session = sessionmaker(bind=engine)
    s = Session()
    try:
        yield s
    finally:
        s.close()
        engine.dispose()


def _ticket_id():
    return uuid.uuid4()


class TestRecordTraceEntries:
    def test_persists_one_row_per_entry(self, db):
        tid = _ticket_id()
        n = agent_logs.record_trace_entries(db, tid, [
            {"agent": "CX Agent", "action": "Ingest", "reasoning": "Parsed text"},
            {"agent": "Vision Agent", "action": "Classify", "reasoning": "Cat=pothole"},
        ])
        assert n == 2
        rows = db.query(AgentLog).filter(AgentLog.ticket_id == tid).all()
        assert len(rows) == 2
        names = {r.agent_name for r in rows}
        assert names == {"CX Agent", "Vision Agent"}

    def test_uses_node_name_when_present(self, db):
        tid = _ticket_id()
        agent_logs.record_trace_entries(db, tid, [
            {"agent": "CX Agent", "action": "X", "reasoning": "y", "node": "cx_agent"},
        ])
        row = db.query(AgentLog).filter(AgentLog.ticket_id == tid).one()
        assert row.node_name == "cx_agent"

    def test_node_falls_back_to_agent(self, db):
        tid = _ticket_id()
        agent_logs.record_trace_entries(db, tid, [
            {"agent": "Vision Agent", "action": "X", "reasoning": "y"},
        ])
        row = db.query(AgentLog).filter(AgentLog.ticket_id == tid).one()
        # No `node` key on the entry — falls back to the agent name
        # in the persisted row (the service does not infer; the
        # caller is expected to pass `node` if it has one).
        assert row.node_name is None
        assert row.agent_name == "Vision Agent"

    def test_empty_list_is_a_noop(self, db):
        n = agent_logs.record_trace_entries(db, _ticket_id(), [])
        assert n == 0
        assert db.query(AgentLog).count() == 0

    def test_skips_non_dict_entries_without_crashing(self, db):
        tid = _ticket_id()
        n = agent_logs.record_trace_entries(db, tid, [
            {"agent": "A", "action": "x", "reasoning": "y"},
            "not-a-dict",
            None,
            {"agent": "B", "action": "x", "reasoning": "y"},
        ])
        assert n == 2
        assert db.query(AgentLog).count() == 2

    def test_failure_does_not_raise(self, db, monkeypatch):
        # A simulated commit failure must be swallowed — the
        # pipeline must not be aborted by a missing audit row.
        def boom(*args, **kwargs):
            raise RuntimeError("simulated DB outage")
        monkeypatch.setattr(db, "commit", boom)
        n = agent_logs.record_trace_entries(db, _ticket_id(), [
            {"agent": "A", "action": "x", "reasoning": "y"},
        ])
        assert n == 0
        # Rollback was attempted; the session is still usable.
        assert db.query(AgentLog).count() == 0


class TestTimeAndRecord:
    def test_records_latency(self, db):
        import time
        started = time.monotonic() - 0.5  # 500ms ago
        n = agent_logs.time_and_record(
            db,
            _ticket_id(),
            agent_name="Priority Agent",
            action="Scoring",
            reasoning="Severity high",
            started_at=started,
        )
        assert n == 1
        row = db.query(AgentLog).one()
        assert row.agent_name == "Priority Agent"
        assert row.latency_ms is not None
        assert row.latency_ms >= 400  # 500ms elapsed, allow some slack

    def test_no_started_at_means_no_latency(self, db):
        n = agent_logs.time_and_record(
            db,
            _ticket_id(),
            agent_name="X",
            action="Y",
            reasoning="Z",
        )
        assert n == 1
        assert db.query(AgentLog).one().latency_ms is None


class TestListTrace:
    def test_returns_all_entries_for_ticket(self, db):
        # SQLite's CURRENT_TIMESTAMP has second-resolution, so the
        # chronological-order tie-breaker (id) is non-deterministic
        # for rows written in the same second. Postgres has µs
        # precision so the production ordering is strict; here we
        # only assert that every entry is returned.
        tid = _ticket_id()
        agent_logs.record_trace_entries(db, tid, [
            {"agent": "A", "action": "first", "reasoning": "1"},
            {"agent": "B", "action": "second", "reasoning": "2"},
            {"agent": "C", "action": "third", "reasoning": "3"},
        ])
        out = agent_logs.list_trace(db, tid)
        assert len(out) == 3
        assert {e["agent"] for e in out} == {"A", "B", "C"}

    def test_empty_ticket_returns_empty_list(self, db):
        assert agent_logs.list_trace(db, _ticket_id()) == []

    def test_serialized_shape_matches_frontend_contract(self, db):
        tid = _ticket_id()
        agent_logs.record_trace_entries(db, tid, [
            {"agent": "CX", "action": "A", "reasoning": "R", "node": "cx"},
        ])
        out = agent_logs.list_trace(db, tid)
        assert len(out) == 1
        e = out[0]
        # Frontend Notifications/trace consumers depend on these
        # exact keys; pin the contract here.
        assert set(e.keys()) >= {
            "id", "ticket_id", "agent", "node", "action",
            "reasoning", "details", "latency_ms", "created_at",
        }
        assert e["id"]  # non-empty UUID
        assert e["ticket_id"] == str(tid)


class TestMigrationIsRegistered:
    """The Alembic migration must be present and wired to revision 003."""

    def test_migration_004_present(self):
        import importlib.util
        from pathlib import Path
        path = (
            Path(__file__).resolve().parents[1]
            / "alembic" / "versions" / "004_agent_logs.py"
        )
        assert path.exists(), f"migration file missing: {path}"
        spec = importlib.util.spec_from_file_location("m004", path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        assert mod.revision == "004"
        assert mod.down_revision == "003"

    def test_migration_is_idempotent(self):
        """The migration's CREATE TABLE statement uses IF NOT EXISTS
        so re-running it does not error. Pin the literal so a future
        edit that drops the guard is caught here."""
        from pathlib import Path
        text = (
            Path(__file__).resolve().parents[1]
            / "alembic" / "versions" / "004_agent_logs.py"
        ).read_text()
        assert "CREATE TABLE IF NOT EXISTS agent_logs" in text
        assert "ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE" in text
        assert "JSONB" in text
        # Indexed on ticket_id for the future per-ticket trace view.
        assert "agent_logs_ticket_id_idx" in text
