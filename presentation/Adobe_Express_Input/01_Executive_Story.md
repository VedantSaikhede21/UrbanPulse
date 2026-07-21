# UrbanPulse AI — Executive Story

## The Hook (30-second pitch)

> A citizen spots a water main burst at 8:15 AM. They snap a photo, record a voice note, and drop a pin on the map. Within 12 seconds, 9 AI agents have verified the report, checked for duplicates, scored its priority, routed it to the correct department, and dispatched the nearest officer. The entire chain — from citizen to resolution — is visible to every stakeholder in real time.

## Why This Matters

Municipal complaints today vanish into black holes. Citizens call, email, or visit offices — and hear nothing back. Officers lack prioritization tools. Administrators lack data.

UrbanPulse replaces this with:

- **One-click reporting** with photo, voice, and map pin
- **9 AI agents** that verify, deduplicate, prioritize, route, and track every issue
- **Role-based dashboards** for citizens, officers, department heads, city administrators, and super admins
- **Live trace** showing every AI decision in real time via Server-Sent Events
- **Geospatial analytics** with heatmaps, UHS scoring, and SLA monitoring

## The Target Personas

| Persona | Pain | UrbanPulse Solution |
|---------|------|-------------------|
| Citizen | Complaints ignored, no status updates | Report with photo/voice/GPS + live processing trace + real-time status |
| Field Officer | No prioritization, scattered assignments | Filtered queue, resolve with closure photo, status tracking |
| Dept Head | No visibility into team workload | Officer performance metrics, department analytics, UHS scores |
| City Admin | No city-wide view of infrastructure health | Heatmaps, escalation monitor, pulse alerts, trending issues |
| Super Admin | No system-wide oversight | User mgmt, routing config, audit log, AI agent monitoring |

## The AI Pipeline

The 9-agent LangGraph pipeline processes every report through:

1. **CX Agent** — Language normalization and translation
2. **Vision Agent** — Photo analysis for damage assessment
3. **Trust & Fraud Agent** — Duplicate and spam detection
4. **Deduplication Agent** — Spatial+semantic near-duplicate matching
5. **Priority Agent** — Severity scoring (1-3) based on category, location, description
6. **Routing Agent** — Department assignment via configurable rules
7. **Escalation Agent** — SLA monitoring and escalation triggers
8. **Verification Agent** — Closure photo validation against original report
9. **Analytics Agent** — UHS computation, trend analysis, pulse alerts

## Key Differentiators

- **LangGraph orchestration** — Not a single LLM call; a directed acyclic graph of specialized agents
- **Live SSE trace** — Judges can watch agents process in real time (not just results)
- **Urban Health Score** — Composite metric (0-100) computed from resolution time, density, severity
- **Spatial deduplication** — PostGIS-based near-duplicate detection within 50m radius
- **Multi-role with demo selector** — Single app serves 7 personas without auth wall in demo mode
- **Dark, modern UI** — SaaS-grade design with Tailwind CSS, Leaflet maps, reactive dashboards

## The Bottom Line

UrbanPulse is not a chatbot. It is not a CRM. It is an **AI-powered civic infrastructure triage and routing platform** that turns citizen reports into a measurable, transparent, and accountable process — from pavement to resolution.
