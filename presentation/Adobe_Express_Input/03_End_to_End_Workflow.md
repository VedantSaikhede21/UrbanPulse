# End-to-End Workflow

## The Complete Citizen-to-Resolution Journey

```
[Citizen]                    [AI Pipeline]                    [Officer]                    [Admin]
    │                             │                              │                            │
    ├─ Open App ─────────────────►│                              │                            │
    │                             │                              │                            │
    ├─ Take Photo ───────────────►│                              │                            │
    ├─ Record Voice ────────────►│                              │                            │
    ├─ Describe Issue ──────────►│                              │                            │
    ├─ Drop Map Pin ────────────►│                              │                            │
    │                             │                              │                            │
    ├─ Submit ──────────────────►│                              │                            │
    │                             │                              │                            │
    │                      ╔══════╧══════╗                      │                            │
    │                      ║ LangGraph   ║                      │                            │
    │                      ║ Pipeline    ║                      │                            │
    │                      ╚══════╤══════╝                      │                            │
    │                             │                              │                            │
    │                      ┌──────┴──────┐                      │                            │
    │                      │ CX Agent    │                      │                            │
    │                      │ (normalize) │                      │                            │
    │                      └──────┬──────┘                      │                            │
    │                      ┌──────┴──────┐                      │                            │
    │                      │ Vision Agent│                      │                            │
    │                      │ (analyze)   │                      │                            │
    │                      └──────┬──────┘                      │                            │
    │                      ┌──────┴──────┐                      │                            │
    │                      │ Trust Agent │                      │                            │
    │                      │ (validate)  │                      │                            │
    │                      └──────┬──────┘                      │                            │
    │                      ┌──────┴──────┐                      │                            │
    │                      │ Dedup Agent │                      │                            │
    │                      │ (check)     │                      │                            │
    │                      └──────┬──────┘                      │                            │
    │                      ┌──────┴──────┐                      │                            │
    │                      │ Priority   │                      │                            │
    │                      │ Agent      │                      │                            │
    │                      └──────┬──────┘                      │                            │
    │                      ┌──────┴──────┐                      │                            │
    │                      │ Routing    │                      │                            │
    │                      │ Agent      │                      │                            │
    │                      └──────┬──────┘                      │                            │
    │                             │                              │                            │
    │                      ◄─── Live SSE Stream ───────────────►│                            │
    │                      │   (real-time agent trace)          │                            │
    │                             │                              │                            │
    ├─ Watch Live Trace ─────►    │                              │                            │
    │   (agents processing        │                              │                            │
    │    in real time)            │                              │                            │
    │                             │                              │                            │
    │                      ═══════╧═══════                      │                            │
    │                      ║ Ticket Created ║                   │                            │
    │                      ║ Assigned Dept  ║                   │                            │
    │                      ╚══════╤═══════                      │                            │
    │                             │                              │                            │
    │                             ├──► Officer Queue ──────────►│                            │
    │                             │    (filtered, prioritized)  │                            │
    │                             │                              │                            │
    │                             │                              ├─ Start Work ──────────────►│
    │                             │                              │    (status → in_progress)  │
    │                             │                              │                            │
    │                             │                              ├─ Upload Closure Photo ────►│
    │                             │                              │    (status → resolved)     │
    │                             │                              │                            │
    │                      ┌──────┴──────┐                      │                            │
    │                      │ Verification│◄──── Closure Photo ──┤                            │
    │                      │ Agent       │                      │                            │
    │                      └──────┬──────┘                      │                            │
    │                      ┌──────┴──────┐                      │                            │
    │                      │ Analytics  │                      │                            │
    │                      │ Agent      │                      │                            │
    │                      └──────┬──────┘                      │                            │
    │                             │                              │                            │
    │                      ═══════╧═══════                      │                            │
    │                      ║ Issue Closed ║                     │                            │
    │                      ╚══════════════╝                     │                            │
    │                             │                              │                            │
    ├─ Status Updated ───────────►│                              │                            │
    │                             │                              │                            │
    │                             │                              │                   ┌────────┴────────┐
    │                             │                              │                   │ City Analytics │
    │                             │                              │                   │ UHS Score ↑    │
    │                             │                              │                   │ Pulse Alerts   │
    │                             │                              │                   │ Heatmaps       │
    │                             │                              │                   └─────────────────┘
```

## Demo Timing (5 minutes)

| Time | Step | Who | Screen |
|------|------|-----|--------|
| 0:00 | Landing page + story setup | Vijay | Landing, UHS badge |
| 0:30 | Citizen reports water leak (photo + voice + map) | Vijay | ReportIssue wizard |
| 1:00 | AI pipeline — live SSE trace | Both | ProcessingPage, agents in real time |
| 1:45 | Officer queue — ticket appears prioritized | Vedant | OfficerQueue |
| 2:15 | Officer starts work + resolves with closure photo | Vedant | OfficerQueue → resolve flow |
| 2:45 | Admin dashboard — analytics + UHS update | Vijay | CityAnalytics, EscalationMonitor |
| 3:15 | Super Admin — agent monitoring + routing config | Vijay | AgentMonitoring, RoutingConfig |
| 3:45 | Public map + shared trace | Either | PublicMap, LiveAgentTrace |
| 4:15 | Wrap — tech stack, architecture, Q&A | Both | — |
