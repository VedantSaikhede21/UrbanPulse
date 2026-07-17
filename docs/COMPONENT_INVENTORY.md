# Component Inventory

> Tracks every shared UI component — where it's used and its status.

---

## Shared UI Components

| Component | Used In (Pages) | Count | Status |
|-----------|----------------|-------|--------|
| MapPicker | ReportIssue, Heatmap (planned), PublicMap (planned) | 1 (3 planned) | ✅ Complete (QA passed) |

---

## Page Inventory

| Page | Route | Role | Status | Lines |
|------|-------|------|--------|-------|
| Landing | `/` | Public | ✅ Complete | 117 |
| About | `/about` | Public | 🔲 Stub | — |
| PublicMap | `/public-map` | Public | 🔲 Stub | — |
| CitizenLogin | `/citizen/login` | Citizen | ✅ Complete | 78 |
| CitizenDashboard | `/citizen/dashboard` | Citizen | ⚠️ Needs work | 194 |
| ReportIssue | `/citizen/report` | Citizen | ⚠️ Needs work — MapPicker integrated | 365 |
| ReportDetail | `/citizen/report/:id` | Citizen | ⚠️ Needs work | 185 |
| WardHealth | `/citizen/ward-health` | Citizen | 🔲 Stub | — |
| Profile | `/citizen/profile` | Citizen | 🔲 Stub | — |
| Notifications | `/citizen/notifications` | Citizen | 🔲 Stub | — |
| Support | `/support` | Shared | 🔲 Stub | — |
| Settings | `/settings` | Shared | 🔲 Stub | — |
| LiveAgentTrace | `/trace` | Shared | ✅ Mostly done | 234 |
| StaffLogin | `/officer/login` | Staff | ✅ Complete | 132 |
| OfficerQueue | `/officer/queue` | Officer | ✅ Mostly done | 248 |
| OfficerProfile | `/officer/profile` | Officer | 🔲 Stub | — |
| DeptDashboard | `/dept/dashboard` | Dept Head | 🔲 Stub | — |
| DeptAnalytics | `/dept/analytics` | Dept Head | 🔲 Stub | — |
| OfficerMgmt | `/dept/officers` | Dept Head | 🔲 Stub | — |
| CityAnalytics | `/admin/analytics` | Admin | 🔲 Stub | — |
| Heatmap | `/admin/heatmap` | Admin | 🔲 Stub | — |
| EscalationMonitor | `/admin/escalations` | Admin | 🔲 Stub | — |
| AdminDashboard | `/super-admin/dashboard` | Super Admin | 🔲 Stub | — |
| UserManagement | `/super-admin/users` | Super Admin | 🔲 Stub | — |
| RoutingConfig | `/super-admin/routing` | Super Admin | 🔲 Stub | — |
| AuditLog | `/super-admin/audit` | Super Admin | 🔲 Stub | — |
| AgentMonitoring | `/super-admin/agents` | Super Admin | 🔲 Stub | — |

---

## How to Update

After building or modifying a component:

1. Add it to the **Shared UI Components** table
2. List which pages consume it
3. Update the count
4. Set status: ✅ Complete / ⚠️ Needs Work / 🔲 Stub
