# API Matrix

> Maps every backend endpoint to its frontend consumer(s), status, and owner.
> Reconciled against release baseline `806dc7a` (backend) — 18 routes verified
> in `backend/app/main.py`. Endpoints not listed here do not exist.

---

| Method | Endpoint | Frontend Page(s) | Status | Owner | Notes |
|--------|----------|------------------|--------|-------|-------|
| GET | `/api/health` | — | ✅ Ready | Backend | Health check, used by deployment |
| GET | `/api/health/ready` | — | ✅ Ready | Backend | Readiness probe (503 while DB unreachable) |
| POST | `/api/demo/seed` | — | ✅ Ready | Backend | Dev-only re-seed (403 outside development) |
| POST | `/api/upload` | ReportIssue | ✅ Ready | Backend | Authenticated file upload (photo/voice) |
| GET | `/api/me` | OfficerProfile, Settings | ✅ Ready | Backend | Current user identity (JWT) |
| GET | `/api/notifications` | Notifications | ✅ Ready | Backend | Citizen-scoped status notifications |
| POST | `/api/tickets` | ReportIssue | ✅ Ready | Backend | Creates ticket, triggers agent pipeline |
| GET | `/api/tickets` | CitizenDashboard, OfficerQueue, PublicMap, CityAnalytics, EscalationMonitor, IncidentMap, Profile, DepartmentDashboard, DepartmentAnalytics, OfficerManagement, AdminDashboard, AuditLog, UserManagement | ✅ Ready | Backend | List tickets (role-filtered) |
| GET | `/api/tickets/near` | — | ✅ Ready | Backend | Public spatial query (PostGIS radius) |
| GET | `/api/tickets/{id}` | ReportDetail | ✅ Ready | Backend | Single ticket (citizen ownership enforced) |
| PATCH | `/api/tickets/{id}/status` | OfficerQueue | ✅ Ready | Backend | Status transitions (staff only, 403 for citizens) |
| POST | `/api/tickets/{id}/resolve` | OfficerQueue | ✅ Ready | Backend | Resolution with closure photo + Verification Agent |
| DELETE | `/api/tickets/{id}` | — | ✅ Ready | Backend | Dev-gated delete (403 outside development) |
| GET | `/api/tickets/{id}/process` | ProcessingPage, LiveAgentTrace | ✅ Ready | Backend | 8-agent SSE pipeline stream |
| GET | `/api/trace/{id}` | — | ⚠️ Stub | Backend | Returns empty steps; use `/process` for live SSE |
| GET | `/api/officers/queue` | OfficerQueue, OfficerProfile, AdminDashboard | ✅ Ready | Backend | Officer queue (staff only, 403 for citizens) |
| GET | `/api/analytics/wards` | WardHealth, PublicMap, RoleLayout, DepartmentAnalytics | ✅ Ready | Backend | Per-ward UHS scores |
| GET | `/api/analytics/city-pulse` | WardHealth, PublicMap, CityAnalytics, AgentMonitoring | ✅ Ready | Backend | City UHS, category trends, pulse alerts |

---

## Legend

| Status | Meaning |
|--------|---------|
| ✅ Ready | Endpoint exists and is used by the release build |
| ⚠️ Stub | Endpoint exists but returns placeholder data |
| 🔲 Stub | Endpoint not yet created or returns mock data |
| ❌ Missing | Not yet identified or planned |

## Frontend-to-API Dependency Graph

```
Landing (static) → no API calls
ReportIssue → POST /api/tickets, POST /api/upload
ProcessingPage → GET /api/tickets/{id}/process (SSE)
ReportDetail → GET /api/tickets/{id}
CitizenDashboard → GET /api/tickets
Notifications → GET /api/notifications
OfficerQueue → GET /api/officers/queue, PATCH /api/tickets/{id}/status, POST /api/tickets/{id}/resolve
OfficerProfile → GET /api/me, GET /api/officers/queue
PublicMap → GET /api/tickets, GET /api/analytics/wards, GET /api/analytics/city-pulse
WardHealth → GET /api/analytics/wards, GET /api/analytics/city-pulse
LiveAgentTrace → GET /api/tickets/{id}/process (SSE)
CityAnalytics → GET /api/tickets, GET /api/analytics/city-pulse
EscalationMonitor → GET /api/tickets
IncidentMap → GET /api/tickets
DepartmentDashboard → GET /api/tickets
DepartmentAnalytics → GET /api/tickets, GET /api/analytics/wards
OfficerManagement → GET /api/tickets
AdminDashboard → GET /api/tickets, GET /api/officers/queue
AgentMonitoring → GET /api/analytics/city-pulse
AuditLog → GET /api/tickets
UserManagement → GET /api/tickets
Settings → GET /api/me
```

This matrix should be updated whenever a new endpoint is added or a stub is replaced.