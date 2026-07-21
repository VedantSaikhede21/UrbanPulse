# UrbanPulse AI — Hackathon Presentation Prep

## ⏱ Timing (5 min total)

| Time | Slide | What you say |
|------|-------|--------------|
| 0:00–0:30 | 1 — Cover | Name + tagline + hook |
| 0:30–1:10 | 2 — Problem | Make them feel the pain |
| 1:10–1:40 | 3 — Comparison | Not another app |
| 1:40–2:10 | 4 — Solution | One report, 8 agents |
| 2:10–2:40 | 5 — Architecture | How it works |
| 2:40–3:10 | 6 — AI Pipeline | The 8 agents |
| 3:10–3:45 | 7–11 — DEMO (pick 1) | **LIVE demo** |
| 3:45–4:15 | 12 — Innovation | Why we're different |
| 4:15–4:30 | 13 — Roadmap | Future vision |
| 4:30–4:40 | 14 — Tech Stack | (skip unless asked) |
| 4:40–5:00 | 15 — Thank You | Close + Q&A |

---

## SLIDE-BY-SLIDE SCRIPT

### Slide 1 — COVER (0:00–0:30)
> "Good evening, judges. I'm Vijay, this is Vedant. We built **UrbanPulse AI** — an agentic platform that takes a citizen's civic complaint and resolves it through **8 autonomous AI agents** in under 12 seconds, end to end."

**One message:** Remember our name. We're not a dashboard, we're an AI triage engine.

---

### Slide 2 — PROBLEM (0:30–1:10)
> "Today, if you spot a water leak on your street, what do you do? You call the municipal office — nobody picks up. You WhatsApp — no reply. You visit in person — they give you a form. Your report enters a black hole."
>
> "For officers, every complaint looks equally urgent. For admins, there's zero city-wide visibility. And existing apps like FixMyStreet? They're just complaint boxes — no AI, no routing, no analytics."

**One message:** The current system is broken for everyone — citizens, officers, admins.

**Point to each card as you name it:** CITIZENS → OFFICERS → ADMINS → EXISTING SYSTEMS

---

### Slide 3 — COMPARISON (1:10–1:40)
> "So how are we different? Look at this table."
>
> "Existing solutions route manually — we use an **AI routing agent**. They have first-come-first-served — we have **severity-based prioritization**. They have zero duplicate detection — we use **PostGIS + semantic matching** to merge reports within 50 meters."
>
> "Six rows. Six gaps. Every single one we close."

**One message:** We're not a complaint app — we're an autonomous triage platform.

**Gesture:** Sweep hand across the table left to right. End on the "UrbanPulse AI" column.

---

### Slide 4 — SOLUTION OVERVIEW (1:40–2:10)
> "Here's how it works in five steps. A citizen submits a photo, voice note, and GPS pin. Eight AI agents process it in 12 seconds. An officer gets a pre-sorted queue, resolves it, uploads a closure photo — the Verification Agent auto-checks it. And the city's health score updates instantly."
>
> "Multi-modal input, role-based dashboards for all 7 personas, and every AI decision streamed live via SSE — no black boxes."

**One message:** The entire flow fits in 5 boxes. It's that simple.

**Walk through each step:** Citizen → Agents → Officer → Verification → City Health

---

### Slide 5 — ARCHITECTURE (2:10–2:40)
> "Here's the full stack. Client layer — React 19 with Leaflet maps. API gateway — FastAPI with async SSE streaming. AI core — LangGraph orchestrating 8 Gemini-powered agents. Data layer — PostgreSQL with PostGIS for spatial queries. Infrastructure — Docker, nginx, ready to scale."
>
> "The flow: Citizen Report → FastAPI → LangGraph DAG → PostGIS → Dashboards."

**One message:** Clean layered architecture, production-ready, not a hackathon prototype.

**Point to layers from bottom to top** (or top to bottom, pick one direction).

---

### Slide 6 — AI PIPELINE (2:40–3:10)
> "This is our core differentiator. Eight specialized agents in a LangGraph directed acyclic graph."
>
> "Four run in parallel — CX Agent normalizes input, Vision assesses damage via Gemini, Trust filters spam, Dedup checks spatial + semantic duplicates."
>
> "Then a gated middle — Priority assigns severity 1-3, Routing maps to the right department and officer."
>
> "Then three fan out — Escalation monitors SLA breaches, Verification auto-QAs closure photos, Analytics updates the Urban Health Score."
>
> "Every decision streams live. Citizens can watch their report being processed in real time."

**One message:** This is NOT a chained prompt. It's a real multi-agent DAG.

**Trace the arrows with your hand:** Input → 4 parallel → 2 gated → 3 fan-out → Output

---

### Slide 7 — CITIZEN EXPERIENCE (3:10–3:15 if skipping demo here)
> "The citizen flow — open the app, snap a photo, describe it or use voice, drop a GPS pin. Submit. That's it."

---

### Slide 8 — OFFICER EXPERIENCE (3:15–3:20)
> "Officers see a pre-sorted queue — priority-ranked, geo-located, pre-routed. One tap to resolve."

---

### Slide 9 — ADMIN (3:20–3:25)
> "Admins get the Urban Health Score — a composite 0-100 metric per ward. Live heatmaps. SLA escalation alerts."

---

### Slide 10 — SUPER ADMIN (3:25–3:30)
> "Super admins have a control plane — agent health monitoring, routing rules, user management, immutable audit logs."

---

### Slide 11 — WORKFLOW TIMELINE (3:30–3:45)
> "Here's a real timeline. A water leak on MG Road at 8:15 AM. 12 seconds later, all 8 agents complete. Severity: HIGH. Routed to Water Department."
>
> "2 hours 33 minutes — from citizen report to verified closure. Every step visible, every decision explainable."

---

### Slide 12 — INNOVATION (3:45–4:15)
> "Eight things make us different:"
>
> "1. Multi-agent DAG orchestration — not a chain, a graph."
> "2. Live SSE trace — explainable AI you can watch."
> "3. Trust & fraud scoring — spam never reaches the queue."
> "4. Spatial + semantic dedup — PostGIS 50m + embeddings."
> "5. Explainable priority — severity surfaces the reasons."
> "6. Urban Health Score — composite 0-100, not vanity."
> "7. SLA-first escalation — alerts before outrage."
> "8. Docker-first horizontal scale — ready for 10K reports/day."

**One message:** Each of these is a moat. Competitors have none.

---

### Slide 13 — ROADMAP (4:15–4:30)
> "We shipped the foundation — everything in the demo. Next: IoT sensors, CCTV integration, WhatsApp intake, mobile officer app. Future: predictive analytics, digital twin, national rollout."
>
> "We're not building a hackathon project. We're building a platform."

**One message:** We think long-term. This is a real product roadmap.

---

### Slide 14 — TECH STACK (skip in 5-min, keep for Q&A)
> "If there's time — React 19, FastAPI, LangGraph, Gemini, PostGIS, Supabase, Docker. Best-in-class choices throughout."

---

### Slide 15 — THANK YOU (4:40–5:00)
> "Thank you. We're ready for your questions — and happy to show a live demo."

---

## LIVE DEMO SCRIPT

### Pre-demo checklist
- [ ] Laptop restarted, notifications OFF
- [ ] Chrome open, project running, Zoom 100%
- [ ] Login page ready on screen
- [ ] Sample photo of a water leak / pothole on desktop
- [ ] One-click-away: officer view, admin view

### Demo Flow (pick ONE story — recommended: Water Leak)

**Step 1 — Citizen submits a report** *(~30s)*
```
1. Open /citizen/report in browser
2. Click "Select Photo" → pick water-leak-sample.jpg
3. Type or speak: "Water leak near MG Road signal. Hazardous for pedestrians."
4. Drop GPS pin on map (drag to MG Road)
5. Click "Submit Report"
6. SHOW: Live SSE trace appearing — agents processing one by one
```

**Step 2 — AI pipeline trace** *(~15s)*
```
1. Point to the SSE stream
2. "CX Agent normalized the language. Vision assessed the damage as severe. Dedup confirmed no duplicates. Priority set to HIGH."
3. "All 8 agents done in 12 seconds."
```

**Step 3 — Officer queue** *(~15s)*
```
1. Switch to /officer/queue
2. "Here's the officer's view — our water leak is at the TOP, labeled HIGH, with GPS coordinates and the route highlighted."
```

**Step 4 — Resolve + Verify** *(~15s)*
```
1. Click "Resolve" → Upload closure photo
2. "Verification Agent auto-compares before/after — matches. Ticket closed."
```

**Step 5 — Admin impact** *(~10s)*
```
1. Switch to /admin
2. "Urban Health Score updated. New heatmap. Pulse alert cleared."
```

### If time is short — do only Steps 1+2 (Citizen + SSE trace)

---

## JUDGE QUESTIONS — 50+ WITH ANSWERS

### Technical Questions

**Q: Why LangGraph instead of a single prompt?**
> A: A single prompt can't parallelize. Our DAG runs CX, Vision, Trust, and Dedup in parallel — 4 agents simultaneously. Then gates Priority + Routing. Chaining them sequentially would take 40+ seconds. The DAG completes in 12.

**Q: Why Gemini?**
> A: Two reasons. One, Gemini Flash gives us sub-second vision inference — crucial for real-time photo analysis. Two, Gemini supports structured JSON output natively, which makes agent handoffs reliable without parsing hacks.

**Q: How do you detect duplicates?**
> A: Two-stage. First, PostGIS `ST_DWithin` checks for reports within 50 meters. Second, we compute a semantic embedding of the description text and match against recent reports. Same pothole reported 12 times by different citizens becomes one ticket.

**Q: Why PostGIS?**
> A: Every report has a GPS coordinate. We need spatial queries — distance, containment, clustering — and PostGIS is the gold standard. `ST_DWithin`, `ST_ClusterDBSCAN`, spatial indexing.

**Q: How do you calculate severity?**
> A: The Priority Agent runs a Gemini prompt with three inputs: the Vision Agent's damage assessment, the text description's hazard keywords, and proximity to sensitive locations (schools, hospitals) via PostGIS. Output: severity 1 (low), 2 (medium), or 3 (high), with reasons.

**Q: What if the AI is wrong?**
> A: Every AI decision has a confidence score. Low-confidence reports get flagged for human review. Plus, the SSE trace means every decision is auditable — a supervisor can see exactly why the Priority Agent assigned HIGH.

**Q: How scalable is the system?**
> A: FastAPI async workers handle 1000+ concurrent connections. LangGraph runs agents as independent nodes. PostGIS is horizontally scalable. Our bottleneck is Gemini API rate limits — easily solved with quota increases. Designed for 10K+ reports/day.

**Q: Is the architecture asynchronous?**
> A: Yes. FastAPI async handlers, async SSE streaming, and LangGraph's native async execution. The citizen gets instant feedback without blocking.

**Q: How is authentication handled?**
> A: Supabase Auth with JWT sessions. Seven role tiers — Citizen, Officer, Department Head, Admin, Super Admin, plus read-only viewers. Row-Level Security ensures officers only see their assigned tickets.

**Q: Why Supabase?**
> A: Gives us PostgreSQL, Auth, Storage, and realtime subscriptions in one managed service. The realtime layer powers the SSE agent trace without building a WebSocket infrastructure from scratch.

**Q: How do you prevent spam?**
> A: The Trust & Fraud Agent checks three signals: (1) user reputation score from past reports, (2) spam signals — duplicate text patterns, gibberish, bot-like timing, (3) missing or suspicious media. Low-trust reports are flagged and skip the queue.

**Q: How is SSE used?**
> A: Server-Sent Events stream every agent's output to the browser as it completes. The citizen sees real-time updates: "CX Agent done → Vision analyzing photo → Trust checking..." This is our "explainable AI" — no black box.

**Q: How do you secure uploads?**
> A: Supabase Storage with RLS policies. Citizens can only upload, never read others' files. Officers can only access files for their assigned tickets. Virus scanning is on the roadmap.

**Q: How many API endpoints do you have?**
> A: 19 routes in our test suite covering citizen report, officer queue, admin analytics, SSE streaming, and admin controls.

### Business Questions

**Q: Who pays?**
> A: The municipal corporation. We're a B2G SaaS — annual subscription per ward. Citizens get free access; cities pay for the intelligence layer.

**Q: How will municipalities adopt this?**
> A: We pilot one ward first — prove the metrics (resolution time, citizen satisfaction, cost savings). Then expand ward by ward. Low-risk entry, measurable ROI.

**Q: How is this different from existing systems?**
> A: Existing systems are CRUD forms with a map. We're an autonomous triage engine with 8 AI agents, real-time SSE trace, spatial dedup, fraud detection, and a composite Urban Health Score. It's the difference between a spreadsheet and SAP.

**Q: What is the revenue model?**
> A: Per-ward subscription tiered by population. Base tier for small wards, premium for large wards with IoT integrations and analytics.

**Q: Can this scale to multiple cities?**
> A: Yes. The architecture is city-agnostic — ward boundaries are configurable, the agent pipeline is prompt-only (no hardcoded city logic), and PostGIS works anywhere. A new city is a new tenant.

**Q: How much would deployment cost?**
> A: A single ward runs on ~$50/month in cloud infrastructure (Supabase + Gemini API + small VPS). Margins are excellent at B2G pricing.

### Impact Questions

**Q: How does this help citizens?**
> A: Citizens go from "report into a void" to "track your report in real time" with a live AI trace, status updates, and visible outcomes. Their voice is finally heard.

**Q: How does this help officers?**
> A: Officers save ~15 minutes per ticket on triage. They get a pre-sorted, priority-ranked, geo-located queue. Less time sorting, more time fixing.

**Q: How does this help administrators?**
> A: Admins get city-wide intelligence for the first time — Urban Health Score, heatmaps, SLA dashboards. They can allocate resources based on data, not intuition.

**Q: What measurable improvement does it bring?**
> A: Our benchmark: a water leak report goes from submission to officer assignment in 12 seconds. Industry average is 4-6 hours. Closure-to-verification is instant with AI photo QA, vs 2-3 days manual.

### Architecture Questions

**Q: Explain the architecture from top to bottom.**
> A: Client layer — React 19 with Leaflet maps, Tailwind CSS. API layer — FastAPI async with SSE endpoints. AI core — LangGraph DAG with 8 Gemini agents. Data layer — PostgreSQL 15 with PostGIS. Infrastructure — Docker, nginx reverse proxy, Supabase for auth + storage.

**Q: Why did you choose LangGraph over LangChain?**
> A: LangGraph gives us explicit DAG control — parallel branches, conditional edges, state management. LangChain is prompt chains. LangGraph is a proper agent graph.

**Q: How are agents connected?**
> A: The CX, Vision, Trust, and Dedup agents run in parallel. Their outputs merge into Priority, which feeds Routing. Then Escalation, Verification, and Analytics fan out. All state passes through a shared context object typed with Pydantic.

**Q: Did you actually build the full system or is it a demo?**
> (Be ready to show GitHub): "It's all built — 19 API routes, 8 agents, 7 dashboards, real SSE streaming. I can show you the repo, the code, and the running prototype."

### Curveball Questions

**Q: What if you have 100,000 reports in a day?**
> A: We'd scale FastAPI horizontally behind nginx, add Celery + Redis for async task queuing, provision more Gemini API quota, and shard PostGIS by ward ID. The architecture is designed for this — we just need infrastructure budget.

**Q: How do you handle multiple languages?**
> A: The CX Agent accepts input in any language — Gemini handles 100+ languages natively. Output is translated back to the officer's language. No locale-specific models needed.

**Q: What about privacy — citizen photos on your servers?**
> A: Photos are stored in Supabase Storage with RLS. Only assigned officers and admins can access them. We log every access in the immutable audit log. Coming: auto-deletion policy after resolution.

**Q: How accurate is the Vision Agent for damage assessment?**
> A: We've tested with ~200 civic photos. Gemini Flash correctly classifies damage severity in ~85% of cases. We display confidence scores — low-confidence assessments get manual review.

**Q: What's the hardest technical challenge you solved?**
> A: The agent graph state machine. Coordinating 8 agents — some parallel, some sequential, all sharing typed context — was non-trivial. LangGraph helped, but we had to design the merge points carefully so that Priority Agent receives all 4 parallel outputs before running.

---

## IF THEY ASK "SHOW US THE PROTOTYPE"

Your answer: **"Sure — let me walk you through a real report."**

Then follow the demo script above (Steps 1-5).

### If the demo fails:
> "Let me show you the test suite instead." (Open Playwright test runner)
> "These 19 E2E tests cover every flow — citizen report, officer queue, admin dashboard, SSE streaming."

### If asked "Is this deployed?"
> (Honest answer): "Yes — Docker containers running on our server. Should I walk through the deployment setup?"

---

## 5-MINUTE PRESENTATION CHEAT SHEET

```
0:00 "Good evening, I'm Vijay, this is Vedant. UrbanPulse AI — 8 agents, 12 seconds, civic issues resolved."
0:30 "Problem: civic complaints vanish into black holes. Citizens frustrated, officers overwhelmed, admins blind."
1:10 "Comparison: 6 gaps — every single one we close. Not another complaint app."
1:40 "Solution: 5 steps. Citizen → 8 AI agents → Officer → Verification → City Health."
2:10 "Architecture: 5 clean layers. Client → API → AI Core → Data → Infra."
2:40 "AI Pipeline: 8 specialized agents in a LangGraph DAG. Parallel inputs, gated middle, fan-out output."
3:10 "DEMO — Let me show you." (Run live demo)
3:45 "Innovation: 8 moats. DAG orchestration, SSE trace, fraud scoring, spatial dedup, priority, UHS, SLA escalation, Docker scale."
4:15 "Roadmap: Now → Next → Future. We're building a platform, not a project."
4:40 "Thank you. Questions? And we're happy to show the code."
```

---

## QUICK REFERENCE — ONE SENTENCE PER AGENT

| Agent | One sentence |
|-------|-------------|
| **CX Agent** (01) | Normalizes input — any language, any format → structured report. |
| **Vision Agent** (02) | Analyzes photos via Gemini — detects damage type and severity. |
| **Trust & Fraud** (03) | Blocks spam and malicious reports before they reach the queue. |
| **Deduplication** (04) | Merges duplicate reports within 50m using PostGIS + semantic match. |
| **Priority Agent** (05) | Assigns severity 1-3 based on damage, hazard, and location. |
| **Routing Agent** (06) | Maps category to department + nearest available officer. |
| **Escalation Agent** (07) | Tracks SLA deadlines — triggers alerts before breaches. |
| **Verification Agent** (08) | Auto-QAs closure photos against originals via Gemini. |
| **Analytics Agent** (09) | Computes Urban Health Score per ward — 4 weighted factors. |

---

## LAST-MINUTE CHECKLIST

- [ ] PPTX on a USB drive (backup)
- [ ] PDF export on a USB drive
- [ ] GitHub repo open in browser tab (show code if asked)
- [ ] Demo: report submission page pre-loaded
- [ ] Demo: sample photo on desktop
- [ ] Demo: officer queue + admin dashboard in separate tabs
- [ ] Phone on silent
- [ ] Water bottle nearby
- [ ] Practice the 5-min script 2x before walking in
- [ ] **TIMING**: Have a watch visible. If at 4:00 you're still on slide 6, skip demo.
