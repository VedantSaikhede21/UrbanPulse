# Screenshot Map — Slide to Screenshot Reference

| # | File | Route | Slide | Caption | Purpose |
|---|------|-------|-------|---------|---------|
| 1 | `01_landing.png` | `/` | Slide 1 (Title) | Hero section with UHS badge | Establishes brand, shows live health score |
| 2 | `02_about.png` | `/about` | Slide 2 (Problem) | Feature list showing platform scope | Reinforces breadth of solution |
| 3 | `03_public_map.png` | `/public-map` | Slide 11 (Features) | Public-facing incident view | Shows transparency + geospatial capability |
| 4 | `04_citizen_login.png` | `/auth/citizen-login` | Slide 2 (Problem) | Auth page with cityscape | Visual transition to solution |
| 5 | `05_citizen_dashboard.png` | `/citizen/dashboard` | Slide 6 (Citizen) | Report list with live statuses | Shows citizen gets tracking |
| 6 | `06_report_step1.png` | `/citizen/report` | Slide 6 (Citizen) | File upload, skip button | Shows multi-modal evidence step |
| 7 | `07_report_step2.png` | `/citizen/report` | Slide 6 (Citizen) | Category selected, description, voice | Shows category + voice recording |
| 8 | `08_report_step3.png` | `/citizen/report` | Slide 6 (Citizen) | MapPicker with draggable marker | Shows GPS pin placement |
| 9 | `09_processing.png` | `/citizen/processing/:id` | Slide 5 (Live Trace) | Agent pipeline waiting for SSE | Fallback view for live trace slide |
| 10 | `10_report_detail.png` | `/citizen/report/:id` | Slide 6 (Citizen) | Full ticket detail with agent trace | Shows complete audit trail |
| 11 | `11_citizen_profile.png` | `/citizen/profile` | Slide 6 (Citizen) | User profile and preferences | Shows personalization |
| 12 | `12_ward_health.png` | `/citizen/ward-health` | Slide 11 (Features) | Ward-level health breakdown | Shows granular analytics |
| 13 | `13_officer_queue.png` | `/officer/queue` | Slide 7 (Officer) | Filtered, prioritized ticket list | Shows officer gets triaged queue |
| 14 | `14_officer_profile.png` | `/officer/profile` | Slide 7 (Officer) | Officer stats and metrics | Shows performance tracking |
| 15 | `15_dept_dashboard.png` | `/dept` | Slide 11 (Features) | Department head overview | Shows multi-role depth |
| 16 | `16_dept_analytics.png` | `/dept/analytics` | Slide 11 (Features) | Department-level analytics | Shows role-specific data views |
| 17 | `17_officer_mgmt.png` | `/dept/officers` | Slide 11 (Features) | Officer directory with metrics | Shows team management |
| 18 | `18_admin_analytics.png` | `/admin/city-analytics` | Slide 8 (Admin) | Pulse alerts, UHS, trending issues | Shows city-wide intelligence |
| 19 | `19_admin_escalation.png` | `/admin/escalation` | Slide 8 (Admin) | SLA monitoring table | Shows SLA compliance tracking |
| 20 | `20_admin_incident_map.png` | `/admin/incident-map` | Slide 8 (Admin) | CircleMarker geospatial heatmap | Shows geospatial incident view |
| 21 | `21_super_admin.png` | `/super-admin` | Slide 9 (Super Admin) | Super admin dashboard overview | Shows system-wide oversight |
| 22 | `22_user_management.png` | `/super-admin/users` | Slide 9 (Super Admin) | User directory | Shows auth/user management |
| 23 | `23_routing_config.png` | `/super-admin/routing` | Slide 9 (Super Admin) | Category-department mapping | Shows configurable routing engine |
| 24 | `24_audit_log.png` | `/super-admin/audit` | Slide 9 (Super Admin) | Action audit trail | Shows security/compliance |
| 25 | `25_agent_monitoring.png` | `/super-admin/monitoring` | Slide 9 (Super Admin) | 9 agent status cards | Shows AI pipeline health |
| 26 | `26_support.png` | `/support` | Slide 11 (Features) | FAQ and help center | Shows documentation |
| 27 | `27_live_trace.png` | `/trace` | Slide 5 (Live Trace) | Shared processing trace | Shows shareable trace links |
| 28 | `28_settings.png` | `/settings` | Slide 11 (Features) | App configuration | Shows customization |

## Screenshot Recommendations for Adobe Express

### Priority screenshots (must include in PPT):

| Priority | Screenshots | Slide |
|----------|-------------|-------|
| ⭐⭐⭐ | `07_report_step2`, `08_report_step3`, `13_officer_queue` | Citizen + Officer workflow |
| ⭐⭐⭐ | `20_admin_incident_map`, `18_admin_analytics` | Admin intelligence |
| ⭐⭐ | `25_agent_monitoring`, `19_admin_escalation` | AI + SLA depth |
| ⭐⭐ | `09_processing`, `27_live_trace` | Live SSE trace (hero feature) |
| ⭐ | `01_landing`, `04_citizen_login` | Brand and visual quality |

### Screenshot guidelines for Adobe:

- All screenshots are 1920x1080 at 2x Retina (3840x2160 effective)
- Dark theme throughout
- No browser chrome, no dev tools, no loading states
- Consistent top/bottom padding — crop to content area before inserting into slides
- For best results: overlay screenshots on dark backgrounds with a subtle border-radius
