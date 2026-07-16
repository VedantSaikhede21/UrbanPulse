"""Quick smoke test for the full 9-agent LangGraph pipeline."""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from app.agents.graph import app_graph, TicketState, GEMINI_AVAILABLE

print("Gemini available:", GEMINI_AVAILABLE)

state = TicketState(
    ticket_id="test-123",
    citizen_text="There is a deep pothole near MG Road intersection causing accidents."
)

result = app_graph.invoke(state)

print("Pipeline complete!")
print("  Status   :", result["status"])
print("  Category :", result["category"])
print("  Severity :", result["severity"])
print("  Priority :", result["priority_score"])
print("  Dept     :", result["assigned_department"])
print()
print("--- Agent Trace ---")
for log in result["trace_logs"]:
    agent = log.get("agent", "?")
    reason = log.get("reasoning", "")[:120]
    print(f"[{agent}] {reason}")
