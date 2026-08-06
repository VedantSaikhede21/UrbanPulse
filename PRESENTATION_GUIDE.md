# UrbanPulse AI — 10-Minute Presentation Guide

## Time Budget: 10 min total

| Section | Time | Slides |
|---------|------|--------|
| 1. Problem & Context | 1.5 min | 1-3 |
| 2. Solution & Architecture | 2 min | 4-6 |
| 3. Live Demo (HERO) | 4 min | — |
| 4. Innovation & Tech Stack | 1.5 min | 11-14 |
| 5. Closing & Q&A | 1 min | 15 |

---

## SECTION 1: PROBLEM & CONTEXT (1.5 min) — Slides 1-3

### Slide 1 — Cover
> "Good morning, we are presenting **UrbanPulse AI** — an AI-powered civic infrastructure reporting and triage platform."

### Slide 2 — Problem
**What to say:**
- "Municipal complaints are **siloed** — WhatsApp groups, phone calls, web forms — no unified system"
- "There is **no automated triage**: no spam detection, no duplicate merging, no priority scoring"
- "Citizens are left in the **dark** after filing — no visibility into resolution progress"
- "Officers lack a **prioritized queue** — they don't know which issue to address first"

### Slide 3 — Comparison
- "Current system: manual, fragmented, reactive"
- "Our system: AI-driven, unified, proactive with **Urban Health Score** (UHS)"

---

## SECTION 2: SOLUTION & ARCHITECTURE (2 min) — Slides 4-6

### Slide 4 — Solution Overview
**What to say:**
- "UrbanPulse AI is a **pilot-ready civic platform** with 3 key stakeholders:"
  - **Citizens** → report issues with photos/voice, track resolution live
  - **Officers** → prioritized work queue with AI-assigned tasks
  - **Admins** → city analytics, heatmaps, escalation monitoring

### Slide 5 — Architecture
**What to say:**
- "FastAPI backend with a **9-agent LangGraph pipeline**"
- "**Gemini 2.5 Flash** for vision classification and enrichment — with deterministic fallbacks"
- "**PostgreSQL + PostGIS** for spatial duplicate detection (100m radius)"
- "**SSE streaming** → citizens watch agents process their report in real-time"
- "React + Vite + Tailwind dark-themed frontend with **40+ routes, 7 role groups**"

### Slide 6 — AI Pipeline Diagram
**Walk through the 8 agents (left to right):**

| Agent | What it does |
|-------|-------------|
| 1. CX Agent | Ingests and normalizes citizen report text |
| 2. Vision Agent | Classifies photo → category + severity (Gemini) |
| 3. Trust & Fraud | Checks reputation score, rate-limits spammers |
| 4. Dedup Agent | Spatial check (100m PostGIS radius) for duplicates |
| 5. Priority Agent | Severity + community impact → priority score (1-3) |
| 6. Routing Agent | Maps category → department, load-balances officers |
| 7. Escalation Agent | Sets SLA timer (6/24/72h) |
| 8. Analytics Agent | Updates Urban Health Score per ward |

**Key point**: "Every agent has a deterministic fallback — the pipeline works even **without Gemini**."

---

## SECTION 3: LIVE DEMO (4 min) — THE HERO MOMENT

### Setup Check (BEFORE starting presentation)
- [ ] Backend running: `http://localhost:8000/api/health`
- [ ] Frontend running: `http://localhost:3000`
- [ ] Two browser tabs open (will switch during demo)
- [ ] Dev mode enabled (anonymous super_admin)

---

### ACT 1: Landing Page (30s)
**Navigate to:** `http://localhost:3000`

**What to show:**
- Live **City UHS badge** in top bar (e.g., 78.4/100)
- "Report an Issue" CTA button
- "A Nine-Agent Orchestrated System" section with 4 feature cards
- Role switcher dropdown (mention multi-role support)

**What to SAY:**
> "This is our landing page. Notice the live Urban Health Score — 78.4 out of 100. This is a city-wide metric updated in real-time by our Analytics Agent. Citizens can report issues, officers get prioritized queues, and administrators see city-wide analytics — all on one platform."

---

### ACT 2: Citizen Reports an Issue (1.5 min) — THE HERO MOMENT

**Navigate to:** `/citizen/report` (use role switcher to "Citizen Role" first)

**Step-by-step:**
1. **Step 1 — Evidence**: Show the file upload button. Click "Skip to details step"
2. **Step 2 — Details**: Click "Water Leak" category. Type description: "Main pipeline burst near school entrance"
3. **Step 3 — Location**: (Show map picker briefly) — Mention GPS geolocation support
4. **Submit** the form

**If you can't submit via UI (form needs auth):**
→ Use API in Terminal:
```bash
curl -s -X POST http://localhost:8000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"description":"Demo: Water leak near school","category":"Water Leak","latitude":12.9715,"longitude":77.5945,"ward_id":1,"citizen_id":"00000000-0000-0000-0000-000000000000"}'
```
→ Copy the returned `id`

**Then demonstrate the processing page:**
1. Navigate to `/citizen/processing/<TICKET_ID>`
2. **Watch the SSE stream** — agents fire one by one:
   - 🗣️ CX Agent → 👁️ Vision Agent → 🛡️ Trust & Fraud → 🔄 Dedup → ⚡ Priority → 📍 Routing → ⏰ Escalation → 📊 Analytics
3. After completion → auto-redirects to `/citizen/report/<TICKET_ID>`

**What to SAY:**
> "Let's submit a Water Leak report near a school. After submission, the citizen is redirected to this processing page where they can **watch all 8 AI agents work in real-time** via SSE streaming. Each agent has a specific job — notice how the Dedup Agent checked for nearby duplicates within 100 meters, and the Routing Agent assigned it to the Water department."

**Point out the final report:**
- Category, Severity, Priority Score (3/3)
- Assigned Officer and Department
- Resolution Timeline
- UHS change in the top bar

---

### ACT 3: Officer Queue (45s)
**Navigate to:** `/officer/queue`

**What to show:**
- Tickets sorted by priority (HIGH > MEDIUM > LOW)
- Status filters: All / Assigned / In Progress
- Each ticket shows: category, priority badge, status, description, location, "Agent Trace" link
- "Start Work" and "Resolve" buttons for assigned tickets

**What to SAY:**
> "Officers see a prioritized queue. Each ticket has an AI-computed priority score, and they can start work with one click. The polling updates every 15 seconds. They can also submit resolution with a closure photo — which triggers the Verification Agent to compare before/after images."

---

### ACT 4: Admin Dashboards (45s)
**Navigate to:** `/admin/city-analytics`

**What to show:**
- **Stats cards**: Total Tickets (22), Open (22), Critical Wards (0)
- **Tickets by Status**: Assigned (8), Reported (13), In Progress (1)
- **Tickets by Category**: Water Leak (13), Roads & Potholes (6), etc.
- **Ward UHS Leaderboard**: Ward 1 (66.5), Ward 2 (94.2), Ward 3 (72.1)
- **Pulse Alert**: "Ward 1 — UHS 66. Monitor for emerging issues"

**Then quickly show:**
- **Ward Health Map** at `/public-map` — mention "spatial visualization with Leaflet"
- **Escalation Monitor** at `/admin/escalation-monitor` — "SLA timers tracking overdue tickets"

**What to SAY:**
> "Administrators get a bird's-eye view of the entire city. The Ward UHS Leaderboard shows which wards need attention — Ward 1 is at 66.5, triggering a pulse alert. The system auto-generates these insights. You can also view a heatmap of all incidents and monitor SLA escalations."

---

### ACT 5: Super Admin — Agent Monitoring (30s)
**Navigate to:** `/super-admin/agent-monitoring` (switch role to Super Admin)

**What to show:**
- Agent status dashboard
- Per-agent health metrics
- Pipeline success/failure rates

**What to SAY:**
> "Super admins can inspect the health of each AI agent — success rates, latency, and error logs. This is the control room for the entire pipeline."

---

## SECTION 4: INNOVATION & TECH STACK (1.5 min) — Slides 11-14

### Slide 11 — Workflow / Innovation
**Mention these 3 key innovations:**
1. **Urban Health Score (UHS)**: "A ward-level metric — penalized on new reports (severity-weighted), rewarded on verified resolution. Makes the system outcome-driven, not just ticket-count-driven."
2. **Spatial Deduplication**: "PostGIS ST_DWithin with 100m radius — if two citizens report the same pothole, the system merges them and boosts priority."
3. **Live SSE Agent Trace**: "Citizens literally watch AI agents process their complaint — full transparency, no black box."

### Slide 12 — Innovation
- "**9 specialized agents** replace one monolithic LLM call — auditable, debuggable, each replaceable"
- "**Deterministic fallbacks** — pipeline works even if Gemini API is down"
- "**Multi-role design** — 7 personas from citizen to super admin"

### Slide 13 — Future
- WhatsApp voice note integration (Twilio)
- Predictive analytics (issue forecasting)
- Multi-city tenant isolation
- Mobile app (React Native)
- ML priority model trained on real data

### Slide 14 — Tech Stack
- Backend: **FastAPI + LangGraph + Gemini 2.5 Flash**
- Database: **PostgreSQL + PostGIS (Supabase)**
- Frontend: **React 18 + Vite + TypeScript + Tailwind CSS**
- Auth: **Supabase Auth (JWT / OTP)**
- Maps: **Leaflet + React-Leaflet**
- Deploy: **Docker multi-stage + nginx + docker-compose**

---

## SECTION 5: CLOSING (1 min) — Slide 15

**What to SAY:**
> "UrbanPulse AI is **pilot-ready** — the backend has 19 endpoints, 9 agents, SSE streaming. The frontend has 40+ routes across 7 role groups. We have Playwright QA with 19 routes, Docker deployment config, and a knowledge graph of 263 nodes. We're looking for a municipal pilot partner to deploy this in a real ward."

### Q&A Prep — Likely Judge Questions

**Q: "What if Gemini is down?"**
A: Every agent has a deterministic fallback — the pipeline degrades gracefully to a rule-based engine.

**Q: "How do you prevent spam?"**
A: Trust & Fraud Agent checks reputation score (110/200 baseline) and rate-limits (>10 reports/24h = flagged).

**Q: "How is UHS calculated?"**
A: Baseline 100. Penalty: Low=-1, Medium=-2, High=-3.5. Reward: +2 on verified resolution. Capped [0, 100].

**Q: "Why LangGraph over one LLM call?"**
A: Each agent does a specialized check (spatial dedup, reputation, routing) that an LLM alone would hallucinate. The graph is auditable and each node is independently replaceable.

**Q: "How long does the pipeline take?"**
A: ~5-15 seconds depending on Gemini API latency. SSE updates the citizen in real-time.

### THINGS TO AVOID
- ❌ "It's production-ready" — say "pilot-ready"
- ❌ "Gemini does everything" — many agents are deterministic
- ❌ "It's fully secure" — mention intended model (Supabase RLS + JWT), not current dev mode
- ❌ Scale claims without evidence
- ❌ "All pages are complete" — 3 pages are stubs (auth-owned)

### DEMO FALLBACKS
- **Gemini fails**: Pipeline still runs (fallback mode). Say "This is the deterministic fallback"
- **SSE drops**: Navigate manually to `/citizen/report/<ID>`
- **Map tiles fail**: Mention "this uses Leaflet/CDN tiles — works with any tile provider"
- **CORS issue**: Make sure frontend is on port 3000, backend on 8000
- **No image upload**: Use "Skip to details" — describe the fallback path
