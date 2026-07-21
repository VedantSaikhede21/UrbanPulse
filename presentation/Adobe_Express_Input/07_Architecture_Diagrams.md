# Architecture Diagrams — Specifications

## Diagram 1: System Architecture (For Slide 10)

**Style:** Clean, layered architecture with clear data flow arrows. Dark background.

**Layers (top to bottom):**

```
┌─────────────────────────────────────────────────────┐
│  CLIENT LAYER                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Browser  │  │  Mobile  │  │  WhatsApp Bot    │   │
│  │ (React)  │  │ (Future) │  │ (Integration)    │   │
│  └─────┬────┘  └──────────┘  └──────────────────┘   │
└────────┼────────────────────────────────────────────┘
         │ HTTPS / SSE
┌────────┼────────────────────────────────────────────┐
│  ┌─────┴────┐                                       │
│  │  nginx   │  (static files + reverse proxy)       │
│  └─────┬────┘                                       │
│        │                                             │
│  ┌─────┴──────────────────┐                          │
│  │     FastAPI Server      │  PORT 8000              │
│  │  ┌──────────────────┐  │                          │
│  │  │ REST Endpoints   │  │  /api/*                 │
│  │  └────────┬─────────┘  │                          │
│  │  ┌────────┴─────────┐  │                          │
│  │  │ SSE Streams      │  │  /api/tickets/:id/process│
│  │  └────────┬─────────┘  │                          │
│  │  ┌────────┴─────────┐  │                          │
│  │  │ LangGraph DAG    │  │  9 Agent Pipeline        │
│  │  │  ┌───┬──┬──┬──┐  │  │                          │
│  │  │  │CX │Vi│Tr│De│  │  │  Parallel: CX+Vision    │
│  │  │  └─┬─┴─┴─┴─┴─┘  │  │  +Trust+Dedup           │
│  │  │  ┌─┴──────────┐  │  │                          │
│  │  │  │ Priority   │  │  │  Depends on above 4      │
│  │  │  └─────┬──────┘  │  │                          │
│  │  │  ┌─────┴──────┐  │  │                          │
│  │  │  │ Routing    │  │  │  Depends on Priority     │
│  │  │  └─────┬──────┘  │  │                          │
│  │  │  ┌──┬──┴──┬──┐   │  │                          │
│  │  │  │Es│Ve│An│  │   │  │  Parallel: Escalation+  │
│  │  │  └──┴──┴──┘   │  │     Verification+Analytics │
│  │  └────────┬─────────┘  │                          │
│  └───────────┼────────────┘                          │
│              │                                        │
│  ┌───────────┴────────────┐                          │
│  │   PostgreSQL/Supabase   │                          │
│  │  ┌──────────────────┐  │                          │
│  │  │ PostGIS (spatial)│  │  ST_DWithin, ST_Distance │
│  │  ├──────────────────┤  │                          │
│  │  │ Tickets          │  │  Reports + statuses      │
│  │  ├──────────────────┤  │                          │
│  │  │ Users            │  │  Auth + roles            │
│  │  ├──────────────────┤  │                          │
│  │  │ Uploads          │  │  Media files             │
│  │  └──────────────────┘  │                          │
│  └────────────────────────┘                          │
│                                                       │
│  ┌──────────────────────────────────────┐             │
│  │  External APIs                       │             │
│  │  ┌────────────┐  ┌───────────────┐   │             │
│  │  │ Gemini API │  │ Twilio (fut.) │   │             │
│  │  └────────────┘  └───────────────┘   │             │
│  └──────────────────────────────────────┘             │
└───────────────────────────────────────────────────────┘
```

**Color scheme:**
- Client Layer: #6366F1 (indigo)
- nginx: #22D3EE (cyan)
- FastAPI: #84CC16 (brand-lime)
- LangGraph agents: gradient from #84CC16 → #22D3EE → #3B82F6
- PostgreSQL: #3B82F6 (blue)
- External APIs: #F59E0B (amber)

---

## Diagram 2: AI Agent DAG (For Slide 4)

**Style:** Flowchart with card-based nodes. Dark background with colored agent cards.

**Layout (directed acyclic graph):**

```
                  ┌──────────────────────────────┐
                  │     INPUT: Citizen Report     │
                  │  (photo + voice + description │
                  │        + GPS location)        │
                  └──────────────┬───────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
   ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
   │   CX Agent     │  │  Vision Agent  │  │ Trust & Fraud  │
   │  Normalize     │  │  Damage        │  │  Agent         │
   │  Translate     │  │  Assessment    │  │  Validate      │
   │  Detect Lang   │  │  Severity from │  │  Detect Spam   │
   └────────┬───────┘  │  Image         │  └────────┬───────┘
            │          └────────┬───────┘           │
            └──────────────────┼────────────────────┘
                               │
                               ▼
                    ┌────────────────┐
                    │ Deduplication  │
                    │  Agent         │
                    │  Spatial(50m)  │
                    │  Semantic      │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Priority Agent │
                    │  Severity 1-3  │
                    │  Priority Score│
                    │  Triage        │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Routing Agent  │
                    │  Dept Mapping  │
                    │  Officer Match │
                    │  Assignment    │
                    └────────┬───────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
   ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
   │  Escalation    │ │  Verification  │ │  Analytics     │
   │  Agent         │ │  Agent         │ │  Agent         │
   │  SLA Timer     │ │  Closure Match │ │  UHS Update    │
   │  Thresholds    │ │  QA Check      │ │  Pulse Alert   │
   └────────────────┘ └────────────────┘ └────────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │     OUTPUT: Processed Ticket  │
                  │  (assigned, prioritized, with │
                  │   SLA + verification queue)   │
                  └──────────────────────────────┘
```

**Color legend:**
- Input/Output: #475569 (slate-600)
- Parallel agents (CX, Vision, Trust): #84CC16 (lime)
- Dedup: #22D3EE (cyan)
- Priority: #F59E0B (amber)
- Routing: #3B82F6 (blue)
- Final agents (Escalation, Verification, Analytics): #6366F1 (indigo)

**Time annotation:** "~12 seconds total"

---

## Diagram 3: Database Schema (Simplified)

**Style:** Entity-relationship diagram showing key tables and relationships.

```
┌─────────────────┐       ┌──────────────────┐
│     tickets      │       │     users        │
├─────────────────┤       ├──────────────────┤
│ id (UUID PK)    │───────│ id (UUID PK)     │
│ user_id (FK)    │       │ email            │
│ category        │       │ role             │
│ description     │       │ name             │
│ severity (1-3)  │       │ department       │
│ status          │       │ created_at       │
│ latitude        │       └──────────────────┘
│ longitude       │
│ geom (PostGIS)  │       ┌──────────────────┐
│ priority_score  │       │   uploads        │
│ original_media  │───────│ id (UUID PK)     │
│ voice_note_url  │       │ ticket_id (FK)   │
│ closure_media   │       │ filename         │
│ created_at      │       │ filepath         │
│ resolved_at     │       │ mimetype         │
│ assigned_to     │       │ created_at       │
│ routing_dept    │       └──────────────────┘
│ sla_deadline    │
│ verification    │       ┌──────────────────┐
│ uhs_impact      │       │  routing_rules   │
└─────────────────┘       ├──────────────────┤
                          │ id (UUID PK)     │
┌─────────────────┐       │ category         │
│  agent_logs     │       │ department       │
├─────────────────┤       │ priority         │
│ id (UUID PK)    │       │ is_active        │
│ ticket_id (FK)  │       └──────────────────┘
│ agent_name      │
│ action          │       ┌──────────────────┐
│ reasoning       │       │  audit_log       │
│ status          │       ├──────────────────┤
│ node            │       │ id (UUID PK)     │
│ result (JSONB)  │       │ action           │
│ created_at      │       │ user_id          │
└─────────────────┘       │ details (JSONB)  │
                          │ created_at       │
                          └──────────────────┘
```

---

## Diagram 4: Role-Based Access

**Style:** Tree diagram showing role hierarchy and accessible routes.

```
                    ┌──────────────┐
                    │  Public      │
                    │  Landing     │
                    │  About       │
                    │  Public Map  │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  Auth        │
                    │  Login       │
                    │  Register    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────┴──────┐  ┌─┴────────┐  ┌┴──────────┐
       │  Citizen    │  │ Officer  │  │ Dept Head │
       │  Report     │  │ Queue    │  │ Dashboard │
       │  Dashboard  │  │ Profile  │  │ Analytics │
       │  Processing │  │ Resolve  │  │ Officers  │
       │  Profile    │  └──────────┘  └───────────┘
       └─────────────┘
              │
       ┌──────┴──────┐
       │   Admin     │
       │  Analytics  │
       │  Incidents  │
       │  Escalation │
       └──────┬──────┘
              │
       ┌──────┴────────┐
       │  Super Admin  │
       │  Users        │
       │  Routing      │
       │  Audit        │
       │  Agents       │
       └───────────────┘
```

---

## Diagram 5: Deployment Architecture

**Style:** Docker container diagram showing service orchestration.

```
┌─────────────────────────────────────────────────────┐
│                  Docker Host                          │
│                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │  Frontend Container  │  │  Backend Container   │  │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │  │
│  │  │  nginx          │  │  │  │ FastAPI +     │  │  │
│  │  │  Serves static │  │  │  │ LangGraph     │  │  │
│  │  │  SPA fallback  │  │  │  │ Uvicorn       │  │  │
│  │  │  Proxy /api/*  │  │  │  │ Workers: 4    │  │  │
│  │  └────────────────┘  │  │  └────────────────┘  │  │
│  │  Port: 80            │  │  Port: 8000           │  │
│  └──────────────────────┘  └──────────────────────┘  │
│                                                       │
│  ┌──────────────────────────────────────────────┐    │
│  │  External Dependencies                        │    │
│  │  ┌────────────────┐  ┌────────────────────┐   │    │
│  │  │ PostgreSQL     │  │  Gemini API        │   │    │
│  │  │ (optional:     │  │  (external,        │   │    │
│  │  │  can use       │  │   requires         │   │    │
│  │  │  Supabase)     │  │   API key)         │   │    │
│  │  └────────────────┘  └────────────────────┘   │    │
│  └──────────────────────────────────────────────┘    │
│                                                       │
└─────────────────────────────────────────────────────┘

Network: urbanpulse-network (bridge)
Volumes: postgres_data, uploads
```

---

## Diagram 6: Data Flow for a Single Report

**Style:** Swimlane diagram showing data movement across layers.

```
Citizen         Frontend        Backend          LangGraph      Database      Gemini
  │                │               │                │              │            │
  │───Submit──────►│               │                │              │            │
  │   (photo+      │               │                │              │            │
  │    voice+desc  │───POST /api──►│                │              │            │
  │    +gps)       │               │                │              │            │
  │                │               │───store ticket─►│              │            │
  │                │               │◄───ticket ID───│              │            │
  │                │               │                │              │            │
  │                │◄───SSE stream│                │              │            │
  │                │    connect   │                │              │            │
  │                │               │───invoke DAG──►│              │            │
  │                │               │                │───CX call───►│─────────►│
  │                │               │                │◄──response──│◄─────────│
  │                │               │                │───Vision────►│─────────►│
  │                │◄───SSE: CX───│◄───SSE: CX────│◄──response──│◄─────────│
  │◄──SSE: CX─────│               │                │───Trust─────►│─────────►│
  │                │               │                │◄──response──│◄─────────│
  │                │◄───SSE: Vis──│◄───SSE: Vis───│───Dedup─────►│─────────►│
  │                │               │                │◄──response──│◄─────────│
  │                │               │                │───Priority──►│─────────►│
  │◄──SSE: Agents─│◄───SSE: each─│◄───SSE: each──│◄──response──│◄─────────│
  │   live         │    agent      │     agent      │───Routing───►│─────────►│
  │                │               │                │◄──response──│◄─────────│
  │                │               │───finalize────►│───store────►│          │
  │                │◄───redirect──│◄───────────────│              │          │
  │                │  /processing │                │              │          │
  │◄─Success───────│               │                │              │          │
```

---

## Tools to Create These Diagrams

| Tool | Why | Notes |
|------|-----|-------|
| **Excalidraw** | Hand-drawn aesthetic, free, export PNG | Good for architecture and DAG diagrams |
| **Draw.io** | Clean technical diagrams, integrates with Google Drive | For database schema and deployment |
| **Mermaid** | Code-driven diagrams, integrates with markdown | Good for simple flow charts |
| **Adobe Express** | Professional graphics, built-in shapes | For final polished versions |
| **Figma** | Premium quality, but steeper learning curve | If you have design experience |

**Recommendation for hackathon:** Use Excalidraw for quick, great-looking architecture diagrams. The hand-drawn aesthetic actually works well for presentations — it signals "we understand the architecture" without needing pixel-perfect alignment.
