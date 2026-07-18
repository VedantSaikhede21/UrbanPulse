# Component Inventory

> Tracks every shared UI component — where it's used and its status.

---

## Shared UI Components

| Component | Used In (Pages) | Count | Status |
|-----------|----------------|-------|--------|
| MapPicker | ReportIssue, Heatmap (planned), PublicMap (planned) | 1 (3 planned) | ✅ Complete (15/15 QA) |
| FileUpload | ReportIssue, ReportDetail (planned), OfficerQueue (planned), Admin (planned) | 1 (5 planned) | ✅ Complete (30/30 QA) |
| StepIndicator | ReportIssue | 1 (3+ planned) | ✅ Complete (19/19 QA) |
| Toast | App.tsx (global provider) | Global | ✅ Complete (17/17 QA) |
| Skeleton | Any loading state | Reusable | ✅ Complete (17/17 QA) |
| ConfirmModal | Any confirm action | Reusable | ✅ Complete (23/23 QA) |
| ErrorBoundary | App.tsx, any page | Global | ✅ Complete (12/12 QA) |
| EmptyState | Any list/no-data state | Reusable | ✅ Complete (15/15 QA) |
| Badge (StatusBadge) | ReportIssue (future), OfficerQueue (future) | Reusable | ✅ Complete (pre-existing) |
| Button | Any action | Reusable | ✅ Complete (pre-existing) |
| Card | Any content block | Reusable | ✅ Complete (pre-existing) |

---

## Page Inventory

| Page | Route | Role | Status | Lines |
|------|-------|------|--------|-------|
| Landing | `/` | Public | ✅ Complete | 117 |
| About | `/about` | Public | ✅ Complete | 199 |
| PublicMap | `/public-map` | Public | ✅ Complete | 181 |
| CitizenLogin | `/citizen/login` | Citizen | ✅ Complete | 78 |
| CitizenDashboard | `/citizen/dashboard` | Citizen | ✅ Complete | 130 |
| ReportIssue | `/citizen/report` | Citizen | ✅ Complete | 230 |
| ReportDetail | `/citizen/report/:id` | Citizen | ✅ Complete | 145 |
| ProcessingPage | `/citizen/processing/:id` | Citizen | ✅ Complete | 85 |
| WardHealth | `/citizen/ward-health` | Citizen | ✅ Complete | 226 |
| Profile | `/citizen/profile` | Citizen | 🔲 Stub (auth-owned) | — |
| Notifications | `/citizen/notifications` | Citizen | 🔲 Stub (auth-owned) | — |
| Support | `/support` | Shared | ✅ Complete | 185 |
| Settings | `/settings` | Shared | 🔲 Stub (auth-owned) | — |
| LiveAgentTrace | `/trace` | Shared | ✅ Complete | 234 |
| StaffLogin | `/officer/login` | Staff | ✅ Complete | 132 |
| OfficerQueue | `/officer/queue` | Officer | ✅ Complete | 260 |
| OfficerProfile | `/officer/profile` | Officer | ✅ Complete | 174 |
| DeptDashboard | `/dept/dashboard` | Dept Head | ✅ Complete | 170 |
| DeptAnalytics | `/dept/analytics` | Dept Head | ✅ Complete | 283 |
| OfficerMgmt | `/dept/officers` | Dept Head | ✅ Complete | 143 |
| CityAnalytics | `/admin/analytics` | Admin | ✅ Complete | 292 |
| IncidentMap | `/admin/heatmap` | Admin | ✅ Complete | 140 |
| EscalationMonitor | `/admin/escalations` | Admin | ✅ Complete | 256 |
| AdminDashboard | `/super-admin/dashboard` | Super Admin | ✅ Complete | 198 |
| UserManagement | `/super-admin/users` | Super Admin | ✅ Complete | 184 |
| RoutingConfig | `/super-admin/routing` | Super Admin | ✅ Complete | 125 |
| AuditLog | `/super-admin/audit` | Super Admin | ✅ Complete | 144 |
| AgentMonitoring | `/super-admin/agents` | Super Admin | ✅ Complete | 190 |

---

## How to Update

After building or modifying a component:

1. Add it to the **Shared UI Components** table
2. List which pages consume it
3. Update the count
4. Set status: ✅ Complete / ⚠️ Needs Work / 🔲 Stub
