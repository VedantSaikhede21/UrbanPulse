"""Tests for the Phase 5 per-call Gemini cost log.

The structured log is the operator's signal for "how many calls
in the last hour and what did they cost". These tests assert
the log fires with the expected fields, in both success and
failure branches of each Gemini helper. No external network.

Mirrors the monkeypatch pattern in ``test_cx_voice.py``.
"""
from __future__ import annotations

from unittest.mock import MagicMock

import pytest
import structlog

from app.agents import graph as agent_graph


class _FakeResponse:
    def __init__(self, text: str):
        self.text = text


@pytest.fixture()
def fake_gemini(monkeypatch: pytest.MonkeyPatch):
    """Patch _gemini_client.models.generate_content to a fake.

    Returns the calls list so the test can assert the right
    model was used.
    """
    calls: list[dict] = []

    def _gen(**kwargs):
        calls.append(kwargs)
        return _FakeResponse("ok-response")

    fake_models = MagicMock()
    fake_models.generate_content = _gen
    fake_client = MagicMock()
    fake_client.models = fake_models
    monkeypatch.setattr(agent_graph, "_gemini_client", fake_client)
    monkeypatch.setattr(agent_graph, "GEMINI_AVAILABLE", True)
    return calls


def _gemini_calls(records) -> list[dict]:
    return [e for e in records if e.get("event") == "gemini_call"]


def test_ask_gemini_logs_call(fake_gemini):
    with structlog.testing.capture_logs() as cap:
        out = agent_graph._ask_gemini("hello", "fallback")

    assert out == "ok-response"
    recs = _gemini_calls(cap)
    assert recs, "expected a gemini_call log record"
    rec = recs[0]
    assert rec["model"] == "gemini-2.5-flash"
    assert rec["agent"] == "cx"
    assert rec["input_chars"] == len("hello")
    assert rec["input_images"] == 0
    assert rec["has_audio"] is False
    assert rec["ok"] is True
    assert rec["latency_ms"] >= 0


def test_ask_gemini_failure_logs_error(fake_gemini, monkeypatch):
    def _boom(**kwargs):
        raise RuntimeError("rate limited")

    fake_models = MagicMock()
    fake_models.generate_content = _boom
    fake_client = MagicMock()
    fake_client.models = fake_models
    monkeypatch.setattr(agent_graph, "_gemini_client", fake_client)

    with structlog.testing.capture_logs() as cap:
        out = agent_graph._ask_gemini("hello", "fallback")

    # The failure path still returns the fallback (the helper's
    # contract — production keeps the pipeline alive on a
    # transient Gemini error).
    assert out == "fallback"
    recs = _gemini_calls(cap)
    assert recs
    rec = recs[0]
    assert rec["ok"] is False
    assert rec["error"] == "RuntimeError"


def test_ask_gemini_with_images_counts_input_images(fake_gemini):
    with structlog.testing.capture_logs() as cap:
        urls = ["https://example.com/a.jpg", "", "https://example.com/b.jpg"]
        out = agent_graph._ask_gemini_with_images("classify", urls, "fallback")

    assert out == "ok-response"
    recs = _gemini_calls(cap)
    assert recs
    rec = recs[0]
    assert rec["agent"] == "vision"
    assert rec["input_images"] == 2  # the empty string is skipped
    assert rec["has_audio"] is False


def test_ask_gemini_with_audio_marks_has_audio(fake_gemini):
    with structlog.testing.capture_logs() as cap:
        out = agent_graph._ask_gemini_with_audio("transcribe", "https://x/a.webm", "fallback")

    assert out == "ok-response"
    recs = _gemini_calls(cap)
    assert recs
    rec = recs[0]
    assert rec["agent"] == "audio"
    assert rec["has_audio"] is True

