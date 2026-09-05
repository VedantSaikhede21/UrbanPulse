"""Voice transcription wire-up tests for cx_agent.

Phase 4's first backend slice: when a ticket carries a `voice_note_url`
but no citizen text, cx_agent must call `_ask_gemini_with_audio` to
transcribe the voice note, then summarise the transcript. The
transcription must propagate to downstream nodes via
`state.transcription`.

We mock both Gemini helpers and assert on the call pattern + returned
state. No external network. No DB. No graph.stream() — we call cx_agent
directly so the test stays focused on the voice branch and runs in
well under 50ms.
"""
from __future__ import annotations

import uuid
from unittest.mock import MagicMock

import pytest

from app.agents import graph as agent_graph


@pytest.fixture()
def call_recorder(monkeypatch: pytest.MonkeyPatch) -> dict[str, list]:
    """Patch _ask_gemini and _ask_gemini_with_audio to record calls.

    Returns a dict with two keys: 'text' and 'audio', each a list of
    tuples (prompt, fallback) capturing every invocation in order.
    """
    recorder: dict[str, list] = {"text": [], "audio": []}

    def _text(prompt: str, fallback: str) -> str:
        recorder["text"].append((prompt, fallback))
        return "CX summary sentence."

    def _audio(prompt: str, audio_url: str, fallback: str) -> str:
        recorder["audio"].append((prompt, audio_url, fallback))
        return "There is a large pothole near the school gate."

    monkeypatch.setattr(agent_graph, "_ask_gemini", _text)
    monkeypatch.setattr(agent_graph, "_ask_gemini_with_audio", _audio)
    return recorder


def _state(*, citizen_text=None, voice_note_url=None, transcription=None):
    return agent_graph.TicketState(
        ticket_id=str(uuid.uuid4()),
        citizen_id=str(uuid.uuid4()),
        latitude=12.97,
        longitude=77.59,
        original_media_url=None,
        voice_note_url=voice_note_url,
        citizen_text=citizen_text,
        transcription=transcription,
    )


class TestCxAgentVoice:
    def test_voice_only_calls_audio_once_and_returns_transcript(
        self, call_recorder: dict[str, list]
    ) -> None:
        """Voice-only state: audio branch fires once, returns the
        transcript (not the summary) as state.transcription."""
        state = _state(voice_note_url="https://storage/voice.webm")
        out = agent_graph.cx_agent(state)

        assert len(call_recorder["audio"]) == 1
        assert len(call_recorder["text"]) == 1
        prompt, url, _fallback = call_recorder["audio"][0]
        assert "Transcribe" in prompt
        assert url == "https://storage/voice.webm"
        # The transcription field must hold the audio transcript,
        # not the summary returned by _ask_gemini.
        assert (
            out["transcription"]
            == "There is a large pothole near the school gate."
        )

    def test_voice_plus_text_skips_audio_branch(
        self, call_recorder: dict[str, list]
    ) -> None:
        """When both channels are present, the citizen's text wins.
        Audio branch never fires — text is the higher-signal channel.
        """
        state = _state(
            citizen_text="Streetlight broken on 5th cross",
            voice_note_url="https://storage/voice.webm",
        )
        out = agent_graph.cx_agent(state)

        assert call_recorder["audio"] == []
        assert len(call_recorder["text"]) == 1
        assert (
            out["transcription"] == "Streetlight broken on 5th cross"
        )
        # Trace entry should record the source as 'text', not 'voice'.
        actions = [
            entry["action"]
            for entry in out["trace_logs"]
            if entry["agent"] == "CX Agent"
        ]
        assert any("source: text" in a for a in actions)

    def test_no_voice_no_text_returns_fallback(
        self, call_recorder: dict[str, list]
    ) -> None:
        """No voice, no text: behaviour is byte-identical to the
        pre-Phase-4 cx_agent. Audio branch never fires."""
        state = _state()
        out = agent_graph.cx_agent(state)

        assert call_recorder["audio"] == []
        assert len(call_recorder["text"]) == 1
        assert (
            out["transcription"]
            == "Report submitted without text description."
        )

    def test_existing_transcription_is_respected(
        self, call_recorder: dict[str, list]
    ) -> None:
        """If state already has a transcription (e.g. a retry path
        that pre-populated it), cx_agent should not re-run the audio
        branch."""
        state = _state(
            voice_note_url="https://storage/voice.webm",
            transcription="Pre-existing transcript.",
        )
        out = agent_graph.cx_agent(state)

        assert call_recorder["audio"] == []
        assert out["transcription"] == "Pre-existing transcript."

    def test_gemini_unavailable_falls_back_cleanly(
        self, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """When _ask_gemini_with_audio returns its fallback string
        (e.g. Gemini key missing), cx_agent must not raise — the
        fallback text must flow into transcription so the rest of
        the pipeline still runs."""
        monkeypatch.setattr(
            agent_graph,
            "_ask_gemini_with_audio",
            lambda prompt, url, fallback: fallback,
        )
        monkeypatch.setattr(
            agent_graph,
            "_ask_gemini",
            lambda prompt, fallback: fallback,
        )
        state = _state(voice_note_url="https://storage/voice.webm")
        out = agent_graph.cx_agent(state)
        assert (
            out["transcription"]
            == "Voice note attached but transcription unavailable."
        )
        # The graph summary path still ran and produced a reasoning
        # trace entry.
        assert any(
            entry["agent"] == "CX Agent" for entry in out["trace_logs"]
        )

    def test_voice_branch_source_is_logged(
        self, call_recorder: dict[str, list]
    ) -> None:
        """When the audio branch fires, the trace entry should record
        source=voice so production logs make the wire-up visible."""
        state = _state(voice_note_url="https://storage/voice.webm")
        out = agent_graph.cx_agent(state)
        actions = [
            entry["action"]
            for entry in out["trace_logs"]
            if entry["agent"] == "CX Agent"
        ]
        assert any("source: voice" in a for a in actions)
