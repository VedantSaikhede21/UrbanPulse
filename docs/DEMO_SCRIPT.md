# Demo Script

> 5-minute walkthrough of UrbanPulse AI for judges

---

## 00:00 — Landing Page

- Show city name, hero section, "Report an Issue" CTA
- Quick stats: City UHS ticker, recent reports
- Mention: "UrbanPulse is an AI-powered civic issue reporting platform"

## 00:30 — Citizen Reports a Pothole

- Click "Report Issue" → multi-step form
- **Step 1:** Select "Pothole" category (show category icons)
- **Step 2:** Pin location on map (drag pin, show GPS coordinates)
- **Step 3:** Upload photo (drag & drop, show preview)
- **Step 4:** AI preview modal shows estimated data
- **Step 5:** Submit

## 01:00 — AI Agent Pipeline

- Redirect to Live Agent Trace page
- SSE stream shows 9 agents processing in real time:
  1. CX Agent — analyzes issue
  2. Vision Agent — photo analysis
  3. Trust Agent — fraud check
  4. Dedup Agent — duplicate detection
  5. Priority Agent — urgency scoring
  6. Route Agent — assigns to department
  7. Escalation Agent — SLA monitoring
  8. Verification Agent — pending verification
  9. Analytics Agent — metrics update
- Final card: assigned ticket details

## 01:30 — Report Detail Page

- Show full ticket detail with status timeline
- All fields visible: category, location, photo, description, priority badge

## 02:00 — Officer Flow

- Switch to Officer view (role toggle)
- Officer Queue: shows all assigned tickets sorted by priority
- Filter by status (assigned / in_progress / resolved)
- Click a ticket → see detail
- "Start Work" → status changes to in_progress
- Resolve: add closure photo, submit

## 03:00 — Analytics & Dashboards

- **City Pulse:** Ward Health scores with color-coded bars
- **City UHS ticker:** live overall score
- **Admin Heatmap:** ticket density on map (if implemented)
- **Category trends:** most reported issues this week

## 04:00 — Live Agent Trace (Bonus)

- Run pipeline again on a different ticket
- Show timing per agent step
- Show auto-scroll as steps arrive

## 04:30 — Tech Stack Highlights

- "Built with: FastAPI + LangGraph (9-agent pipeline), React + Vite, Supabase (PostgreSQL + PostGIS + Auth), Gemini 2.5 Flash, Leaflet maps"
- Mention ADRs, risks register, project docs

## 05:00 — Wrap

- Q&A
- Point to docs/ for architecture details

---

## Backup Plan (if demo fails)

- **No internet:** Show local screenshots / recorded video
- **Gemini down:** Agent pipeline falls back to rule-based classification
- **Supabase down:** Frontend still renders, show static mock data
- **Auth broken:** `DEV_ALLOW_ANONYMOUS=true` bypass
