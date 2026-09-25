import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from app.services import pipeline


class FakeState:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    def model_dump(self):
        return dict(self.__dict__)


class CumulativeGraph:
    def stream(self, _state):
        yield {
            "cx_agent": {
                "trace_logs": [{"agent": "CX Agent", "action": "Parse", "reasoning": "one"}],
                "category": "Roads & Potholes",
                "severity": "medium",
                "priority_score": 2,
                "status": "assigned",
            }
        }
        yield {
            "vision_agent": {
                "trace_logs": [
                    {"agent": "CX Agent", "action": "Parse", "reasoning": "one"},
                    {"agent": "Vision Agent", "action": "Classify", "reasoning": "two"},
                ],
                "category": "Roads & Potholes",
                "severity": "medium",
                "priority_score": 2,
                "status": "assigned",
            }
        }


def test_run_triage_sync_persists_only_new_trace_entries():
    ticket = SimpleNamespace(
        id=uuid.uuid4(),
        citizen_id=None,
        description="test",
        original_media_url=None,
        voice_note_url=None,
        latitude=12.9715,
        longitude=77.5945,
        category="Roads & Potholes",
        severity="medium",
        status="reported",
        priority_score=1,
        assigned_officer_id=None,
        department_id=None,
        is_spam=False,
        is_duplicate=False,
        duplicate_of_id=None,
    )
    db = MagicMock()
    with patch.object(pipeline.agent_logs, "record_trace_entries") as record:
        result = pipeline.run_triage_sync(
            ticket,
            CumulativeGraph(),
            FakeState,
            db,
        )

    assert result["success"] is True
    assert record.call_count == 2
    assert [len(call.args[2]) for call in record.call_args_list] == [1, 1]
