# UrbanPulse AI — Presentation Asset Index

---

## 📸 Screenshots

### Curated (13) — `presentation/screenshots/`
Freshly captured with 0 console errors, live agent pipeline data.

| # | File | Route | Slide | Why Included |
|---|------|-------|-------|-------------|
| 1 | `01_landing.png` | `/` | Title | Hero section, UHS badge, brand identity |
| 2 | `02_public_map.png` | `/public-map` | Features | Public transparency + geospatial |
| 3 | `03_report_wizard.png` | `/citizen/report` | Citizen | Category selection, description input |
| 4 | `04_processing_live.png` | `/processing/:id` | **Live Trace** | **HERO SHOT** — 4 agents running with traces |
| 5 | `05_processing_done.png` | `/processing/:id` | Live Trace | 8-agent pipeline complete, success state |
| 6 | `06_citizen_dashboard.png` | `/citizen/dashboard` | Citizen | Ticket list with live statuses |
| 7 | `07_officer_queue.png` | `/officer/queue` | Officer | Prioritized filtered queue |
| 8 | `08_admin_analytics.png` | `/admin/city-analytics` | Admin | UHS, trending issues, pulse alerts |
| 9 | `09_admin_incident_map.png` | `/admin/incident-map` | Admin | CircleMarker geospatial heatmap |
| 10 | `10_admin_escalation.png` | `/admin/escalation` | Admin | SLA compliance table |
| 11 | `11_super_admin.png` | `/super-admin` | Super Admin | System-wide oversight dashboard |
| 12 | `12_routing_config.png` | `/super-admin/routing` | Super Admin | Category-department mapping engine |
| 13 | `13_agent_monitoring.png` | `/super-admin/monitoring` | Super Admin | 9 agent status cards with metrics |

### Polished (12) — `presentation/polished/`
Same as curated but with dark background frame, consistent quality.

| # | File | Notes |
|---|------|-------|
| 1 | `01_landing.png` | Dark frame applied |
| 2 | `02_public_map.png` | Map rendered, dark frame |
| 3 | `03_processing_live.png` | **HERO** — agents running live |
| 4 | `03_processing_done.png` | Pipeline complete state |
| 5 | `04_report_wizard.png` | Filled wizard, dark frame |
| 6 | `05_officer_queue.png` | Dark frame |
| 7 | `06_admin_analytics.png` | Dark frame |
| 8 | `07_admin_incident_map.png` | Map rendered, dark frame |
| 9 | `08_admin_escalation.png` | Dark frame |
| 10 | `09_super_admin.png` | Dark frame |
| 11 | `10_routing_config.png` | Dark frame |
| 12 | `11_agent_monitoring.png` | Dark frame |

### Removed (not included in PPT)
- Login/Auth page (not impressive)
- Profile pages (personalization, not demo-relevant)
- Settings (utility, not feature)
- Support/FAQ (utility)
- About page (not needed in slides)
- Report detail (covered by processing done state)
- User management (admin utility)
- Audit log (utility, not feature)

---

## 🎨 Brand Assets — `presentation/brand_kit/`

| File | Usage |
|------|-------|
| `branding.md` | Full brand reference (colors, fonts, design principles) |
| `urbanpulse-logo.svg` | Full logo with wordmark (for slide headers/footers) |
| `urbanpulse-icon.svg` | Icon only (favicon, small placements) |
| `color-swatches.svg` | Visual color reference for design tools |
| `citizen.svg` | Person icon (citizen persona) |
| `officer.svg` | Shield with badge (officer persona) |
| `admin.svg` | Building (admin persona) |
| `super-admin.svg` | Star (super admin persona) |
| `ai-agent.svg` | Brain with sparks (AI pipeline) |
| `map-pin.svg` | Location pin (geospatial) |
| `analytics.svg` | Bar chart (analytics views) |
| `routing.svg` | Flow/route (routing engine) |
| `security.svg` | Shield (trust & security) |
| `settings.svg` | Gear (configuration) |
| `camera.svg` | Camera (evidence capture) |
| `mic.svg` | Microphone (voice notes) |
| `database.svg` | Cylinder (data layer) |
| `langgraph.svg` | Connected nodes (LangGraph DAG) |
| `docker.svg` | Container (deployment) |

---

## 📄 Presentation Documents — `presentation/`

| File | Content | Best For |
|------|---------|----------|
| `01_Executive_Story.md` | Hook, 4 personas, AI pipeline summary, differentiators | Pitch/opening slides |
| `02_Problem_and_Solution.md` | Broken civic system → UrbanPulse fix | Problem slides |
| `03_End_to_End_Workflow.md` | Full citizen→AI→officer→admin flow | Architecture/walkthrough |
| `04_Demo_Script.md` | 5-act script with exact words, actions, fallbacks | Demo rehearsal |
| `05_Judge_QA.md` | 50 likely questions with answers (5 categories) | Judge prep |
| `06_Adobe_Express_Guide.md` | 15-slide blueprint with design specs | **Primary slide builder** |
| `07_Architecture_Diagrams.md` | 6 diagram specs | Architect/eng slides |
| `SCREENSHOT_MAP.md` | Slide-to-screenshot cross-reference | Asset selection |
| `capture_curated.mjs` | Playwright script (13 curated screenshots) | Re-capture if needed |
| `capture_polished.mjs` | Playwright script (12 polished screenshots) | Re-capture if needed |

---

## 🗺️ Architecture Diagrams (planned — need drawing)

| Diagram | Spec File | Suggested Tool |
|---------|-----------|---------------|
| System Architecture | `07_Architecture_Diagrams.md` §1 | Draw.io / Excalidraw |
| LangGraph DAG | `07_Architecture_Diagrams.md` §2 | Draw.io / Excalidraw |
| Database Schema | `07_Architecture_Diagrams.md` §3 | Draw.io / Excalidraw |
| RBAC Flow | `07_Architecture_Diagrams.md` §4 | Draw.io / Excalidraw |
| Deployment | `07_Architecture_Diagrams.md` §5 | Draw.io / Excalidraw |
| Data Flow | `07_Architecture_Diagrams.md` §6 | Draw.io / Excalidraw |

---

## 📋 Suggested Slide-to-Asset Mapping

| Slide | Content | Key Assets |
|-------|---------|-----------|
| 1 | Title + Team | `urbanpulse-logo.svg`, `01_landing.png` |
| 2 | Problem | — |
| 3 | Solution Intro | `urbanpulse-logo.svg` |
| 4 | Architecture | System Architecture diagram |
| 5 | AI Pipeline | LangGraph DAG diagram |
| 6 | Citizen Flow | `03_report_wizard.png`, `04_processing_live.png`, `05_processing_done.png`, `06_citizen_dashboard.png` |
| 7 | Officer Workflow | `07_officer_queue.png` |
| 8 | Admin Intelligence | `08_admin_analytics.png`, `09_admin_incident_map.png`, `10_admin_escalation.png` |
| 9 | Super Admin | `11_super_admin.png`, `12_routing_config.png`, `13_agent_monitoring.png` |
| 10 | Live Trace | `04_processing_live.png` (hero) |
| 11 | Features/Map | `02_public_map.png` |
| 12-13 | Business value | — |
| 14 | Team + Thank You | `urbanpulse-icon.svg` |
| 15 | Q&A | — |
