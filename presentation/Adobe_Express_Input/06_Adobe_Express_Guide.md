# Adobe Express Presentation Guide

## Configuration

| Setting | Value |
|---------|-------|
| Tool | Adobe Express Premium — Presentation Generator |
| Slide count | 15 |
| Duration | 5-7 minutes |
| Theme | Dark, modern startup |
| Accent colors | #84CC16 (brand-lime), #3B82F6 (accent-blue), #1E293B (background) |
| Font | System sans-serif (Inter), Serif for headings |
| Tone | Professional, technical, confident |
| Visual style | Minimal, large typography, card-based layouts, full-bleed screenshots |

## Upload These Documents

Upload these files from the `presentation/` directory to Adobe Express:

1. `01_Executive_Story.md`
2. `02_Problem_and_Solution.md`
3. `03_End_to_End_Workflow.md`
4. `04_Demo_Script.md`
5. `05_Judge_QA.md`

Also upload these from `docs/`:
- `SYSTEM_OVERVIEW.md`
- `ARCHITECTURE_DECISIONS.md`
- `COMPONENT_INVENTORY.md`

## Slide-by-Slide Blueprint

### Slide 1 — Title (30s)

**Headline:** UrbanPulse AI
**Subheadline:** AI-Powered Civic Infrastructure Triage & Routing
**Footer:** Hackathon Presentation • [Team Names]

**Design:** Full-bleed dark gradient (#0F172A → #1E293B), brand-lime accent line. Centered text. Small "Live City UHS: 78.4/100" badge in top-right.

**Speaker note:** "UrbanPulse AI — an intelligent platform that transforms how cities handle infrastructure complaints."

---

### Slide 2 — The Problem (45s)

**Headline:** Civic Complaints Are Broken
**Bullets:**
- Citizens: No tracking, no status, no channel
- Officers: No prioritization, manual triage
- Administrators: No city-wide visibility, no data
- Existing apps: Glorified CRUD forms with no AI

**Design:** Split layout — left text, right icon grid (4 large icons with labels: Citizen / Officer / Admin / System)

**Visual:** Full-page screenshot of a typical municipal complaint office (or a photo of a pothole/water leak)

**Speaker note:** "Every day, thousands of civic issues go unreported or unresolved because citizens don't have a channel and officers don't have a system. Existing solutions like FixMyStreet are just complaint boxes — they don't process, prioritize, or route intelligently."

---

### Slide 3 — The Solution (30s)

**Headline:** UrbanPulse AI
**Subheadline:** AI-Powered Triage & Routing Platform

**Key stat:** "12 seconds — from report submission to officer dispatch"

**Design:** Center-aligned. Three-column card layout:
- Card 1: 📸 Multi-modal Reporting (Photo, Voice, GPS, Text)
- Card 2: 🤖 9 AI Agents (LangGraph Pipeline)
- Card 3: 📊 Role-based Dashboards (6 roles)

**Speaker note:** "UrbanPulse replaces the black hole with an intelligent pipeline. A citizen reports an issue, 9 AI agents process it in 12 seconds, and it reaches the right officer automatically."

---

### Slide 4 — The AI Pipeline (60s) ⭐ Hero Slide

**Headline:** 9 Specialized AI Agents
**Diagram:** LangGraph DAG flow showing all 9 agents with directional arrows:

```
CX → Trust → Priority → Routing → Escalation
Vision → Dedup        Verification
                      Analytics
```

**Timeline:** "12 seconds for 9 agents"

**Design:** Full-width diagram. Each agent is a card with icon + name + one-line description. Color gradient from brand-lime (first) to accent-blue (last). Arrows show DAG dependencies.

**Speaker note:** "This is what makes UrbanPulse different. Not one AI — nine specialized agents, each with a focused job. They run as a directed acyclic graph, so independent agents execute in parallel. And here's the key: every agent streams its reasoning live to the user."

---

### Slide 5 — Live SSE Trace (30s)

**Headline:** See AI Think in Real Time
**Visual:** Screenshot of ProcessingPage showing agent steps appearing in real time (agent name, action, reasoning)

**Design:** Full-bleed screenshot on right, text on left. Highlight the streaming nature with an arrow or "LIVE" badge.

**Speaker note:** "When you submit a report, you don't just wait for a result — you watch 9 agents process your issue in real time via Server-Sent Events. This transparency builds trust and shows the intelligence behind every decision."

---

### Slide 6 — Citizen Workflow (30s)

**Headline:** Citizen: Report in Seconds
**Screenshots (3):** Step 1 (photo upload), Step 2 (category + description + voice), Step 3 (MapPicker)

**Design:** Horizontal 3-column screenshot layout with arrow connectors. Labels below each: "1. Evidence" → "2. Details" → "3. Location"

**Speaker note:** "A citizen can report an issue in under a minute: photo or video, voice recording in any language, text description, and a precise map pin. No account needed."

---

### Slide 7 — Officer Workflow (30s)

**Headline:** Officer: Resolve with Confidence

**Screenshots (2):** OfficerQueue (filtered list), Resolve dialog (closure photo upload)

**Design:** Side-by-side. Left: queue screenshot. Right: resolution screenshot.

**Speaker note:** "Officers get a filtered, prioritized queue. They start work with one click and submit closure photos for AI verification. The entire history is tracked."

---

### Slide 8 — Admin Analytics (30s)

**Headline:** Admin: City-Wide Intelligence

**Screenshots (3):** CityAnalytics (UHS + pulse alerts), EscalationMonitor (SLA), IncidentMap (heatmap)

**Design:** Three screenshots in a row with labels. Overlay key metrics.

**Speaker note:** "Administrators get real-time city-wide analytics: Urban Health Score, SLA monitoring, pulse alerts, and a geospatial incident map."

---

### Slide 9 — Super Admin (30s)

**Headline:** Super Admin: Full Control

**Screenshots (2):** AgentMonitoring console, RoutingConfig page

**Design:** Two-column screenshot layout.

**Speaker note:** "Super admins monitor all 9 AI agents, configure routing rules by category, view audit logs, and manage users."

---

### Slide 10 — System Architecture (45s)

**Headline:** Architecture
**Diagram:** Full system architecture

```
[React SPA] ←→ [FastAPI] ←→ [LangGraph Agents] ←→ [Gemini API]
     ↕                    ↕
  [nginx]            [PostgreSQL/Supabase]
     ↕
  [Browser]
```

**Design:** Clean architecture diagram. Each box is a colored card. Arrows show data flow. Layer labels on the left.

**Speaker note:** "The frontend is a React SPA served by nginx. It communicates with the FastAPI backend via REST and SSE. The LangGraph pipeline orchestrates 9 AI agents using Gemini. All data persists in PostgreSQL with PostGIS for spatial queries."

---

### Slide 11 — Tech Stack (30s)

**Headline:** Technology Stack

**Columns (2-column card grid):**

| Frontend | Backend |
|----------|---------|
| React 19 | Python 3.11 |
| TypeScript | FastAPI |
| Tailwind CSS | LangGraph |
| Leaflet | Gemini API |
| Vite | PostgreSQL |
| Framer Motion | Supabase |
| Playwright (QA) | Docker |

**Design:** Two-column card layout. Each tech is a badge/chip. Brand-lime accent on frontend, accent-blue on backend.

**Speaker note:** "Modern, performant stack. React + TypeScript on the frontend, FastAPI + LangGraph on the backend, PostgreSQL with PostGIS for spatial data, all containerized with Docker."

---

### Slide 12 — Demo (30s)

**Headline:** Live Demo
**Visual:** Large screenshot or animated GIF showing the SSE agent trace

**Design:** Minimal. Screenshot takes 80% of the slide. Small text: "Let's walk through it live."

**Speaker note:** "Now let me show you how this works in practice."

(Transition to live demo)

---

### Slide 13 — Future Roadmap (30s)

**Headline:** Roadmap

**Timeline (3 columns):**

| Now | Next | Future |
|-----|------|--------|
| ✅ Core pipeline | 🔄 Twilio notifications | 🌐 Multi-city deployment |
| ✅ 9 AI agents | 🔄 Mobile app | 🏗 Auto-scaling pipeline |
| ✅ Role dashboards | 🔄 Production auth | 📱 Native mobile apps |
| ✅ Docker ready | 🔄 Rate limiting | 🧠 Fine-tuned models |

**Design:** Three-column timeline with clear "Now / Next / Future" headers.

**Speaker note:** "The core platform is complete. Next: WhatsApp notifications, a React Native mobile app, and production auth. Future: horizontal scaling, fine-tuned models, and multi-city deployment."

---

### Slide 14 — Challenges & Learnings (30s)

**Headline:** What We Learned

**Bullets:**
- LangGraph makes multi-agent orchestration practical and debuggable
- SSE + async FastAPI is a powerful combination for live AI streaming
- Auth should be implemented in Sprint 1, not Sprint 3
- AI-assisted development accelerates but requires disciplined QA

**Design:** Text-focused. Clean list with checkmarks.

**Speaker note:** "Building UrbanPulse taught us that LangGraph enables real multi-agent AI workflows, SSE streaming is incredibly effective for demo transparency, and early auth implementation prevents late-stage integration headaches."

---

### Slide 15 — Thank You + Q&A (remaining time)

**Headline:** Thank You
**Subheadline:** UrbanPulse AI

**Three columns:**
- Demo: [link]
- GitHub: [link]
- Contact: [email]

**Design:** Minimal, centered. Team names. QR code for GitHub repo if possible.

**Speaker note:** "We'd love to answer your questions."

---

## Screenshots to Capture

| # | Page | Route | What to Show |
|---|------|-------|-------------|
| 1 | Landing | `/` | Hero section with UHS badge |
| 2 | Report Issue — Step 1 | `/citizen/report` | File upload, skip button |
| 3 | Report Issue — Step 2 | `/citizen/report` | Category selection, voice recorder, description |
| 4 | Report Issue — Step 3 | `/citizen/report` | MapPicker with draggable marker |
| 5 | Processing Page | `/citizen/processing/:id` | Live SSE agents in real time |
| 6 | Citizen Dashboard | `/citizen/dashboard` | Report list with statuses |
| 7 | Officer Queue | `/officer/queue` | Filtered, prioritized ticket list |
| 8 | Officer Resolve | `/officer/queue` | Closure photo dialog |
| 9 | Admin Analytics | `/admin/city-analytics` | Pulse alerts, UHS, trending issues |
| 10 | Escalation Monitor | `/admin/escalation` | SLA table |
| 11 | Incident Map | `/admin/incident-map` | CircleMarker heatmap |
| 12 | Agent Monitoring | `/super-admin/monitoring` | 9 agent status cards |
| 13 | Routing Config | `/super-admin/routing` | Category-department mapping |
| 14 | Public Map | `/public-map` | Public-facing incident view |
| 15 | About | `/about` | Feature list |
