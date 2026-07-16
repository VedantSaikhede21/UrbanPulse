"""Test the SSE /process endpoint against a real Supabase ticket."""
import sys, urllib.request, json
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ticket_id = "48ecd567-a1fb-43b5-b533-57b82d0f3ee4"
url = f"http://127.0.0.1:8000/api/tickets/{ticket_id}/process"

print(f"Opening SSE stream for ticket: {ticket_id}")
req = urllib.request.Request(url, headers={"Accept": "text/event-stream"})
conn = urllib.request.urlopen(req, timeout=180)

print("Stream connected!\n")
for raw_line in conn:
    line = raw_line.decode("utf-8").strip()
    if not line.startswith("data:"):
        continue
    data = json.loads(line[5:])
    agent  = data.get("agent", "?")
    status = data.get("status", "")
    action = data.get("action", "")
    reasoning = data.get("reasoning", "")[:120]
    print(f"  [{agent}] {action}")
    if reasoning:
        print(f"    => {reasoning}")
    if status in ("done", "error"):
        if data.get("result"):
            print("\n=== FINAL RESULT ===")
            for k, v in data["result"].items():
                print(f"  {k}: {v}")
        break

print("\nTest complete.")
