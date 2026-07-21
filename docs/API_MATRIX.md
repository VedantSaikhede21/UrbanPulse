# API Matrix

> Maps every backend endpoint to its frontend consumer(s), status, and owner.

---

| Method | Endpoint | Frontend Page(s) | Status | Owner | Notes |
|--------|----------|------------------|--------|-------|-------|
| GET | `/health` | — | ✅ Ready | Backend | Health check, used by deployment |
| POST | `/api/tickets` | ReportIssue | ✅ Ready | Backend | Creates ticket, triggers agent pipeline |
| GET | `/api/tickets` | CitizenDashboard, OfficerQueue | ✅ Ready | Backend | List tickets (filtered by role) |
| GET | `/api/tickets/{id}` | ReportDetail, OfficerDetail | ✅ Ready | Backend | Single ticket with full state |
| PATCH | `/api/tickets/{id}` | OfficerQueue | ✅ Ready | Backend | Status transitions |
| POST | `/api/tickets/{id}/resolve` | OfficerQueue | 🔲 Stub | Vijay | Resolution with closure photo |
| POST | `/api/tickets/{id}/process` | LiveAgentTrace | ⚠️ Ready | Backend | Trigger agent pipeline, returns SSE |
| GET | `/api/tickets/{id}/stream` | LiveAgentTrace | ⚠️ Ready | Backend | SSE stream for agent trace |
| POST | `/api/tickets/verify-resolution` | — | ⚠️ Ready | Backend | Verification graph call |
| GET | `/api/officers/queue` | OfficerQueue | ✅ Ready | Backend | Officer queue with filters |
| GET | `/api/officers/{id}` | OfficerProfile | 🔲 Stub | Vijay | Officer profile and stats |
| GET | `/api/analytics/city-pulse` | WardHealth, Navbar ticker | ✅ Ready | Backend | City UHS, category trends |
| GET | `/api/analytics/wards` | WardHealth | ✅ Ready | Backend | Per-ward UHS scores |
| GET | `/api/analytics/department/{id}` | DepartmentAnalytics | 🔲 Stub | Vijay | Department-level metrics |
| GET | `/api/analytics/overview` | AdminDashboard | 🔲 Stub | Vijay | System-wide aggregate metrics |
| GET | `/api/analytics/heatmap` | Heatmap | 🔲 Stub | Vijay | GeoJSON points for heatmap |
| GET | `/api/analytics/escalations` | EscalationMonitor | 🔲 Stub | Vijay | SLA breaches and escalations |
| GET | `/api/auth/me` | Settings, Profile | 🔲 Stub | Vedant | Current user profile |
| POST | `/api/auth/logout` | — | 🔲 Stub | Vedant | Session invalidation |

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Ready | Endpoint exists, tested, frontend just needs to call it |
| ⚠️ Ready | Endpoint exists but may need refinement |
| 🔲 Stub | Endpoint not yet created or returns mock data |
| ❌ Missing | Not yet identified or planned |

## Frontend-to-API Dependency Graph

```
Landing (static) → no API calls
ReportIssue → POST /api/tickets
ReportDetail → GET /api/tickets/{id}
CitizenDashboard → GET /api/tickets
OfficerQueue → GET /api/officers/queue, PATCH /api/tickets/{id}
OfficerProfile → GET /api/officers/{id}
LiveAgentTrace → POST /api/tickets/{id}/process, GET /api/tickets/{id}/stream
WardHealth → GET /api/analytics/city-pulse, GET /api/analytics/wards
AdminDashboard → GET /api/analytics/overview
Heatmap → GET /api/analytics/heatmap
EscalationMonitor → GET /api/analytics/escalations
DepartmentDashboard → GET /api/analytics/department/{id}
Settings → GET /api/auth/me
Profile → GET /api/auth/me
```

This matrix should be updated whenever a new endpoint is added or a stub is replaced.
