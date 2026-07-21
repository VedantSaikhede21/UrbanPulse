# Problem & Solution

## The Problem

Municipal infrastructure reporting is broken across India and developing nations.

### For Citizens
- No single channel for reporting potholes, water leaks, garbage, or streetlight failures
- Complaints made via phone, WhatsApp, or in-person visits have no tracking mechanism
- No status updates — citizens never know if their issue was seen, assigned, or resolved
- Language barriers — most platforms support English only

### For Municipal Officers
- No prioritization — all complaints appear equally urgent
- Manual triage consumes hours that could be spent on actual repairs
- No way to verify resolution quality — closure is纸质-based

### For Administrators
- Zero city-wide visibility into infrastructure health
- No data-driven decision support for resource allocation
- SLA violations go undetected until public escalation

### For Smart City Initiatives
- Existing systems are siloed — reporting, routing, resolution, and analytics live in separate tools
- No AI integration despite the availability of LLMs and computer vision
- No standard metric for urban health

---

## The Solution: UrbanPulse AI

UrbanPulse is an end-to-end AI-powered civic infrastructure triage and routing platform.

### What It Does

```
Citizen Report (Photo + Voice + GPS)
        ↓
  9 AI Agents (LangGraph DAG)
        ↓
  Officer Dispatch
        ↓
  Resolution + Closure Photo
        ↓
  Verification + Analytics
```

### Key Capabilities

| Capability | Detail |
|-----------|--------|
| **Multi-modal reporting** | Photo upload, voice recording, map pin, text description |
| **AI processing pipeline** | 9 specialized agents in a LangGraph directed acyclic graph |
| **Live trace** | Real-time SSE stream showing each agent's reasoning |
| **Role-based dashboards** | 7 personas: citizen, officer, dept_head, admin, super_admin, public, auth |
| **Geospatial analytics** | Leaflet heatmaps, CircleMarker incident maps, ward health scoring |
| **Urban Health Score** | Composite 0-100 metric from resolution time, density, severity |
| **Routing engine** | Configurable category-to-department rules |
| **SLA monitoring** | Automatic escalation alerts for breached service levels |
| **Deduplication** | Spatial (50m PostGIS) + semantic near-duplicate detection |
| **Dark UI** | Premium SaaS-grade design system |

### Architecture at a Glance

```
Frontend (React + TypeScript + Tailwind)
    ↕ HTTP/SSE
Backend (FastAPI + Python)
    ↕
LangGraph AI Pipeline (9 Agents)
    ↕
Database (PostgreSQL / Supabase)
    ↕
External APIs (Gemini Vision, Twilio WhatsApp)
```

### Why This Wins

- **Not a chatbot** — It's a full-stack triage platform with AI at the core
- **Not another CRUD app** — Live agent streaming makes the demo unforgettable
- **Not a toy** — Real geospatial queries, real auth (Supabase), real async pipelines
- **Judge-friendly** — Multi-role walkthrough shows breadth; SSE trace shows depth
