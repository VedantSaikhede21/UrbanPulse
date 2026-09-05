"""Agent pipeline integration tests.

Catches regressions in the *wiring* of the LangGraph graph —
node order, partial-state updates, fallbacks, and structural
properties of the final state. We do not assert on exact LLM
text (Gemini is non-deterministic by design), only on the
shape the system needs to be correct: a category from the
known set, a severity from the known set, a priority score
in {1, 2, 3}, a status that advanced past 'reported', and one
trace-log entry per node in the published order.

The graph's external dependencies (Gemini, the database) are
mocked so the test runs offline and finishes in well under a
second. The mocks preserve the structural behaviour: Gemini
returns parseable JSON the first time, the database returns
deterministic rows for the relevant queries, and the trust/
fraud agent sees a normal citizen (reputation=100,
recent_count=0).
"""
from __future__ import annotations

import json
import uuid
from types import SimpleNamespace
from typing import Any
from unittest.mock import MagicMock, patch

import pytest

from app.agents import graph as agent_graph


# ── fixtures ──────────────────────────────────────────────


@pytest.fixture()
def base_state() -> agent_graph.TicketState:
    """A clean, ready-to-triage state.

    The state lives at the start of the graph; the test calls
    graph.stream(state) and accumulates the per-node output
    just like the real pipeline does.
    """
    return agent_graph.TicketState(
        ticket_id=str(uuid.uuid4()),
        citizen_id=str(uuid.uuid4()),
        latitude=12.9715,
        longitude=77.5945,
        original_media_url=None,
        voice_note_url=None,
        citizen_text="Pothole on the main road near the school",
    )


@pytest.fixture()
def mock_gemini(monkeypatch: pytest.MonkeyPatch):
    """Force every Gemini call to return a deterministic, parseable JSON.

    Each agent that calls _ask_gemini expects a slightly different
    shape, so we hand back role-specific JSON from a single
    function. The same mock is used for _ask_gemini_with_images
    and _ask_gemini_with_audio because the graph is what matters;
    the multimodal variants are exercised in the next slice.
    """
    def _ask(prompt: str, fallback: str) -> str:
        # The vision agent's prompt asks for category/severity JSON.
        if "category" in prompt and "severity" in prompt:
            return json.dumps({
                "category": "Roads & Potholes",
                "severity": "medium",
                "reasoning": "Clear pothole image.",
            })
        # The priority agent's prompt asks for score/reason JSON.
        if "priority level" in prompt.lower():
            return json.dumps({"score": 2, "reason": "Standard medium-severity."})
        # Default: hand back the fallback so we test the
        # code path that consumes a generic string.
        return fallback

    monkeypatch.setattr(agent_graph, "_ask_gemini", _ask)
    monkeypatch.setattr(agent_graph, "_ask_gemini_with_images", _ask)
    monkeypatch.setattr(agent_graph, "_ask_gemini_with_audio", _ask)


@pytest.fixture()
def mock_db(monkeypatch: pytest.MonkeyPatch):
    """Stub the database session returned by ``_get_db_session``.

    The graph calls three queries that hit the DB:
      - trust_fraud: SELECT reputation_score FROM citizens
      - trust_fraud: SELECT COUNT(*) FROM tickets
      - dedup: spatial query (returns None for no duplicate)
      - routing: department/officer lookup (returns no dept so
        the routing falls through to the CATEGORY_TO_DEPT name
        without an officer — covers the "no officers available"
        path which is a valid production outcome)
      - analytics: ST_Contains ward boundary
    """
    db = MagicMock()

    def _execute(query, params=None):
        sql = str(query).lower()
        result = MagicMock()
        if "reputation_score" in sql:
            result.fetchone.return_value = (100,)
        elif "count(*)" in sql:
            result.scalar.return_value = 0
        elif "st_dwithin" in sql or "st_contains" in sql:
            result.fetchone.return_value = None
        else:
            result.fetchone.return_value = None
            result.scalar.return_value = 0
        return result

    db.execute.side_effect = _execute
    db.query.return_value.filter.return_value.first.return_value = None
    db.query.return_value.filter.return_value.all.return_value = []

    monkeypatch.setattr(agent_graph, "_get_db_session", lambda: db)
    return db


# ── graph shape ───────────────────────────────────────────


class TestGraphShape:
    def test_stream_yields_every_expected_node(
        self, base_state, mock_gemini, mock_db
    ) -> None:
        """The published graph order is fixed (cx → vision → trust → dedup
        → priority → routing → escalation → analytics). A future edit
        that reorders, drops, or duplicates a node surfaces here.
        """
        seen: list[str] = []
        for step in agent_graph.triage_graph.stream(base_state):
            for node_name in step.keys():
                seen.append(node_name)
        assert seen == [
            "cx_agent",
            "vision_agent",
            "trust_fraud_agent",
            "deduplication_agent",
            "priority_agent",
            "routing_agent",
            "escalation_agent",
            "analytics_agent",
        ]


class TestGraphOutput:
    """The pipeline must produce a structurally valid state on a
    well-formed input. The exact LLM text varies; the shape does
    not."""

    def _run(self, base_state):
        final: dict[str, Any] = base_state.model_dump()
        for step in agent_graph.triage_graph.stream(base_state):
            for node_name, output in step.items():
                if isinstance(output, dict):
                    final.update(output)
        return final

    def test_category_is_known(
        self, base_state, mock_gemini, mock_db
    ) -> None:
        out = self._run(base_state)
        assert out["category"] in {
            "Roads & Potholes",
            "Water Leak",
            "Garbage & Sanitation",
            "Streetlight & Electrical",
            "Signage & Hazards",
        }

    def test_severity_is_known(
        self, base_state, mock_gemini, mock_db
    ) -> None:
        out = self._run(base_state)
        assert out["severity"] in {"low", "medium", "high"}

    def test_priority_score_in_range(
        self, base_state, mock_gemini, mock_db
    ) -> None:
        out = self._run(base_state)
        assert out["priority_score"] in {1, 2, 3}

    def test_status_advances_past_reported(
        self, base_state, mock_gemini, mock_db
    ) -> None:
        out = self._run(base_state)
        # The graph's last non-analytics node sets status to
        # "assigned" via the routing agent. The analytics
        # node does not change status. Anything that keeps
        # the status at "reported" after a full pass is a
        # regression in the routing agent.
        assert out["status"] != "reported"
        assert out["status"] in {"assigned", "in_progress"}

    def test_trace_logs_contain_every_node(
        self, base_state, mock_gemini, mock_db
    ) -> None:
        out = self._run(base_state)
        agents = [entry["agent"] for entry in out["trace_logs"]]
        # Every node emits a trace entry. The agent name in
        # the entry may differ from the graph node name
        # (e.g. "cx_agent" -> "CX Agent") — that mapping is
        # part of the user-facing trace, so the test
        # compares agent-name strings, not graph keys.
        expected = {
            "CX Agent",
            "Vision Agent",
            "Trust & Fraud Agent",
            "Deduplication Agent",
            "Priority Agent",
            "Routing Agent",
            "Escalation Agent",
            "Analytics Agent",
        }
        assert expected.issubset(set(agents)), (
            f"missing agents: {expected - set(agents)}"
        )

    def test_is_duplicate_false_when_no_spatial_match(
        self, base_state, mock_gemini, mock_db
    ) -> None:
        out = self._run(base_state)
        # The mocked spatial query returns None → no duplicate.
        assert out["is_duplicate"] is False
        assert "duplicate_of_id" not in out or out.get("duplicate_of_id") is None

    def test_is_spam_false_for_normal_citizen(
        self, base_state, mock_gemini, mock_db
    ) -> None:
        out = self._run(base_state)
        # reputation=100, recent_count=0 → not spam.
        assert out["is_spam"] is False
        # Credibility is reputation / 150, clamped to [0, 1].
        assert 0.0 <= out["credibility_score"] <= 1.0

    def test_duplicate_boosts_priority(
        self, base_state, mock_gemini, mock_db, monkeypatch
    ) -> None:
        # The priority agent computes a local baseline
        # (severity -> score) and applies a +1 boost when
        # ``state.is_duplicate`` is True, capped at 3. The
        # production code then asks Gemini for a score and
        # uses whatever the model returns — so the local
        # boost is the *fallback* path. We exercise the
        # fallback by stubbing the priority agent's Gemini
        # call to return the static fallback string and
        # confirming the boosted score is what propagates
        # downstream.
        db = mock_db

        def _execute(query, params=None):
            sql = str(query).lower()
            result = MagicMock()
            if "st_dwithin" in sql:
                result.fetchone.return_value = (uuid.uuid4(),)
            elif "reputation_score" in sql:
                result.fetchone.return_value = (100,)
            elif "count(*)" in sql:
                result.scalar.return_value = 0
            else:
                result.fetchone.return_value = None
                result.scalar.return_value = 0
            return result

        db.execute.side_effect = _execute

        # Force the priority agent to use the local fallback
        # by stubbing _ask_gemini specifically for the
        # priority prompt. The vision agent's mock stays
        # active for its own prompt.
        real_ask = agent_graph._ask_gemini

        def _ask_uses_fallback(prompt: str, fallback: str) -> str:
            if "priority level" in prompt.lower():
                return fallback
            return real_ask(prompt, fallback)

        monkeypatch.setattr(agent_graph, "_ask_gemini", _ask_uses_fallback)

        out = self._run(base_state)
        assert out["is_duplicate"] is True
        # Baseline: severity=medium -> 2. Boost: +1. Cap: 3.
        # The fallback embeds this number, so a regression
        # in the boost would drop it back to 2.
        assert out["priority_score"] == 3


# ── fallback path ─────────────────────────────────────────


class TestFallbacks:
    def test_gemini_unavailable_uses_fallback(
        self, base_state, mock_db, monkeypatch
    ) -> None:
        """When GEMINI_AVAILABLE is False, the agent functions
        return their static fallback strings. The graph must
        still complete and produce a structurally valid state.

        This is the path a backend boots into when there is no
        API key (dev / CI). The "AI degraded" badge on the
        frontend surfaces this fact to the user.
        """
        monkeypatch.setattr(agent_graph, "GEMINI_AVAILABLE", False)
        # Replace the helpers with a wrapper that returns the
        # fallback directly (the production path under
        # GEMINI_AVAILABLE=False does the same).
        monkeypatch.setattr(
            agent_graph, "_ask_gemini", lambda prompt, fallback: fallback
        )
        monkeypatch.setattr(
            agent_graph,
            "_ask_gemini_with_images",
            lambda prompt, urls, fallback: fallback,
        )
        monkeypatch.setattr(
            agent_graph,
            "_ask_gemini_with_audio",
            lambda prompt, url, fallback: fallback,
        )

        final: dict[str, Any] = base_state.model_dump()
        for step in agent_graph.triage_graph.stream(base_state):
            for _, output in step.items():
                if isinstance(output, dict):
                    final.update(output)

        # The graph still produced a category, a severity,
        # a priority, and an assignment. The exact values
        # are the static fallbacks defined in the agent
        # functions — a regression that breaks the fallback
        # path would leave one of these as None or wrong.
        assert final["category"] is not None
        assert final["severity"] in {"low", "medium", "high"}
        assert final["priority_score"] in {1, 2, 3}
        assert final["status"] != "reported"


# ── graph entry-point sanity ──────────────────────────────


class TestGraphEntryPoint:
    def test_triage_and_verification_graphs_are_distinct(self) -> None:
        # The two graphs are independent compilations. A
        # regression that aliased one to the other would
        # pass the SSE handler silently and break the
        # verification flow.
        assert agent_graph.triage_graph is not agent_graph.verification_graph

    def test_verification_graph_emits_two_nodes(self) -> None:
        # verification_graph is the smaller pipeline used
        # for the AFTER-photo check.
        seen: list[str] = []
        state = agent_graph.TicketState(
            ticket_id=str(uuid.uuid4()),
            original_media_url="key/before.jpg",
            closure_media_url="key/after.jpg",
            category="Roads & Potholes",
        )
        for step in agent_graph.verification_graph.stream(state):
            seen.extend(step.keys())
        assert seen == ["verification_agent", "analytics_agent"]
