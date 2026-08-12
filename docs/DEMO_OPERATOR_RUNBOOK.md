# UrbanPulse AI — Demo Operator Runbook

> For the presenter standing in front of judges. One page of decisions, not
> a novel. Baseline: frontend `63b4538` / backend `806dc7a`. Companion docs:
> `docs/DEMO_SCRIPT.md` (narrative), `docs/REHEARSAL_CHECKLIST.md` (full
> rehearsal matrix).

---

## 1. Preflight — 10 minutes before (in order)

| # | Check | Pass condition |
|---|-------|----------------|
| 1 | Backend health | `curl http://127.0.0.1:8000/api/health` → `"status":"healthy"`, `database_connected:true`, `graphs_loaded:true` |
| 2 | Backend ready | `curl http://127.0.0.1:8000/api/health/ready` → 200 |
| 3 | Frontend | `curl -o /dev/null -w "%{http_code}" http://localhost/` → 200 |
| 4 | Containers | `docker ps` → both `(healthy)` |
| 5 | Compose | `docker compose config --quiet` → exit 0 |
| 6 | Internet | Open `https://www.google.com` in a tab — must load (login + map tiles + Gemini need it) |
| 7 | Citizen data | Dashboard shows exactly 3 tickets (Vijay) |
| 8 | Officer data | Queue shows 20 open tickets (roads.officer) — officer queue = reported + assigned + in_progress (needs_review is NOT shown) |
| 9 | Backup | `/tmp/opencode/demo_backup_20260812.sql` exists |
| 10 | Tabs | Tab A: citizen logged in. Tab B: officer logged in. Tab C: `/public-map` (guest). All logged-out state cleared first |

**If any check fails:** do NOT start. Use the recovery tree (§6) or the
emergency route (§5).

## 2. Browser tabs / URL sequence

| Tab | URL | State |
|-----|-----|-------|
| A | `/` → login → `/citizen` | Citizen (Vijay) — 3 tickets |
| B | `/auth/staff-login` → `/officer/queue` | Officer (roads.officer) — 20 open (reported + assigned + in_progress) |
| C | `/public-map` | Guest — ward health |
| D (spare) | `/citizen/processing/7ab1d063-bafc-4787-a163-45b7e381380f` | Emergency pipeline (no login) |

## 3. Stopwatch plan — 5 minutes

| Time | Tab | Action | Say (cue) |
|------|-----|--------|-----------|
| 0:00 | A | Landing visible | "A citizen spots a pothole. Today that report enters a black hole. UrbanPulse makes every step visible." |
| 0:20 | A | Click **Report an Issue** → Google login | "Real authentication — every ticket is scoped to its citizen." |
| 0:45 | A | **New Report** → skip photo → category (Water Leak) + description → click map to pin → **Submit & Process with AI** | "Three steps: evidence, details, location. The map pin is required — the form tells you if you miss it." |
| 1:15 | A | `/citizen/processing/<new-id>` — SSE stream | Narrate agents as they appear (§4). |
| 2:15 | A | **AI Pipeline Complete** + status | "Eight agents, one pipeline, streamed live — no black box." (Auto-redirects to detail in 30s if untouched.) |
| 2:30 | A | **View Report** → timeline | "Priority score with a written reason; the resolution timeline." |
| 3:00 | B | Queue shows the new ticket → **Start Work** → **Use Sample & Resolve** | "The officer gets a priority-sorted queue. Closure photo triggers the Verification Agent." |
| 4:00 | A | `/citizen/notifications` + dashboard | "The citizen is notified at every status change — not just 'ticket created'." |
| 4:30 | C | `/public-map` | "City intelligence: ward health scores and pulse alerts, no sign-up required." |
| 5:00 | — | Close | "Every decision streamed, every step visible, every override auditable." |

## 4. Narration cues — the 8-agent stream (in order)

| Agent appears | Say |
|---------------|-----|
| CX Agent | "Normalises the report into a clean record." |
| Vision Agent | "Classifies category and severity — from the photo when present." |
| Trust & Fraud Agent | "Checks the reporter's reputation — spam is held for review." |
| Deduplication Agent | "Searches a 100-metre geo-radius — duplicates merge." |
| Priority Agent | "Scores urgency 1–3 with a written reason." |
| Routing Agent | "Assigns the right department and the least-loaded officer." |
| Escalation Agent | "Starts the SLA countdown — unresolved tickets escalate." |
| Analytics Agent | "Updates the ward's Urban Health Score in real time." |

## 5. Success criteria (exact)

| Stage | Must see |
|-------|----------|
| Citizen | Dashboard: 3 tickets; new report creates a 4th |
| Processing | 8 agent steps stream; "AI Pipeline Complete"; real status (Assigned) |
| Detail | Timeline, priority reason, map pin |
| Officer | Queue: 20 open before the new ticket (reported + assigned + in_progress), 21 after; Start Work → in_progress; Resolve → verified |
| Verification | Ticket leaves the queue; status verified |
| Notification | Citizen notifications show the new ticket's status messages |
| Public map | City Avg UHS 71.3, 3 wards, 1 critical, pulse alert |

## 6. Emergency route — 2 minutes, no login

1. Tab C: `/public-map` — ward health (30s).
2. Tab D: `/citizen/processing/7ab1d063-bafc-4787-a163-45b7e381380f` — full
   8-agent SSE, no auth (60s). Note: re-processing sets this ticket to
   `assigned`; restore from backup if exact state matters.
3. `/trace` → paste the same UUID → Run Pipeline (30s).

## 7. Failure recovery — decision tree

```
Google login fails ──► Emergency route (§6) — public pages only
Officer login fails ─► Citizen-side resolution only, or /trace with 7ab1d063
Gemini/API slow ─────► Keep narrating §4; rule-based fallback completes the pipeline
Map tiles fail ──────► Form still works (GPS/default pin); detail shows coordinates
Backend down ────────► Landing + /public-map static content; tell the story from §4
Data mutated ────────► Restore /tmp/opencode/demo_backup_20260812.sql
```

## 8. Cleanup / reset (after the demo)

1. Log out of both tabs (Sign Out in the header).
2. If a live report was created: note its UUID; restore the backup
   `/tmp/opencode/demo_backup_20260812.sql` to return to the 22-ticket
   known-good state (3 Vijay tickets, 20 open = reported + assigned + in_progress).
3. Verify: `docker ps` both healthy; `/api/health` healthy; Vijay tickets = 3.
4. Close spare tabs; leave Tab A/B/C logged out.

## 9. DO NOT SAY

- ❌ "9 agents" — the pipeline is **8 agents**.
- ❌ "Under 12 seconds" / any specific pipeline latency — not measured.
- ❌ "Production-ready / deployed in a real city" — this is a verified
  prototype on a demo stack.
- ❌ "AI preview modal", "role toggle", "voice transcription works" — not in
  the verified build.
- ❌ "DEV_ALLOW_ANONYMOUS" or any auth bypass — authentication is real.
- ❌ Any metric not visible on screen (reports today, resolution rates,
  response times on the landing are example/demo copy — do not quote them
  as live data).
- ❌ "Officer roads.officer is Dave Kumar" — it is a separate account that
  sees the full queue.