# Graph Report - UrbanPulse  (2026-08-21)

## Corpus Check
- 230 files · ~275,814 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1209 nodes · 2328 edges · 115 communities (85 shown, 30 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 244 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Backend Core
- Auth & API Layer
- AI Agent Pipeline & Docs
- Auth UI
- Citizen & Officer UI
- Settings & Public Pages
- Identity Tests
- LangGraph Agent Graph
- Officer Tests
- WhatsApp Webhook Tests
- Dashboards
- TypeScript Config
- Landing Page Research
- Ticket Tests
- Geocoding Service
- Geocoding Classification Tests
- Incident Map & Processing
- Dept Dashboard & Officer Mgmt
- Audit Tests
- Pipeline Auth Tests
- PPTX Generation
- Geocoding Service Tests
- File Upload
- Frontend Dev Dependencies
- Analytics Tests
- Frontend Dependencies
- App Shell & Notifications
- Agent Monitoring & Officer Profile
- Landing Page & Pipeline UI
- Map Picker & Geolocation
- Presentation Icons
- Twilio Signature Tests
- City Pulse & Urban Health
- Twilio Service
- Twilio Message Tests
- Brand Colors
- Motion & Animation
- Docs & Decisions
- Escalation Monitor
- Health Checks
- Twilio Webhook Parse Tests
- Card Components
- Error Boundary
- TS Config Node
- Playwright QA
- Geocoding Classification Tests
- City Analytics
- Frontend Package Config
- Validation Utils
- Docker Brand Kit
- Presentation Assets
- Twilio Media Tests
- Pipeline Claims
- Department Analytics
- Presentation Capture
- LangGraph Brand Icons
- Alembic Migration
- Frontend Scripts
- Step Indicator
- Role Icons
- Database Brand Kit
- Presentation Curated
- Visual QA
- Alembic Baseline
- Alembic Secure Tables
- Demo Audit
- Review Captures
- Landing Narrative
- Twilio Signature Validation
- Run Migrations
- Docker Compose Services
- Frontend Design
- Analytics/Database/Docker Icons
- Citizen Icon
- Full Pipeline QA
- Map Picker QA
- Backend Entrypoint
- Contributing Docs
- React Router
- React Types
- TypeScript ESLint
- Camera/Security Icons
- Map Pin/Routing Icons
- Notion Snapshot
- Pitch Snapshot
- Superhuman Snapshot
- Any Type
- Officer Queue Definition
- Public Vite
- Adobe Executive Story
- Adobe Problem/Solution
- Adobe Workflow
- Adobe Judge QA
- Adobe Nine Agent
- Adobe Express Guide
- Architecture Diagrams
- Session
- Ticket

## God Nodes (most connected - your core abstractions)
1. `useDocumentTitle()` - 61 edges
2. `apiFetch()` - 43 edges
3. `Ticket` - 33 edges
4. `TwilioService` - 31 edges
5. `useBreadcrumbs()` - 31 edges
6. `AuthUser` - 22 edges
7. `TicketState` - 18 edges
8. `compilerOptions` - 18 edges
9. `Officer` - 17 edges
10. `GeocodingService` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Geocoding Service (Nominatim)` --semantically_similar_to--> `Deduplication Agent`  [INFERRED] [semantically similar]
  IMPLEMENTATION_PLAN_WHATSAPP.md → presentation/all_content.txt
- `Nine-Agent LangGraph Pipeline Claim` --semantically_similar_to--> `Historical Nine-Agent Pipeline Claim`  [INFERRED] [semantically similar]
  presentation/Adobe_Express_Input/01_Executive_Story.md → docs/RELEASE_TRUTH_MATRIX.md
- `Nine-Agent Pipeline Claim` --semantically_similar_to--> `Historical Nine-Agent Pipeline Claim`  [INFERRED] [semantically similar]
  presentation/Adobe_Express_Input/04_Demo_Script.md → docs/RELEASE_TRUTH_MATRIX.md
- `Live SSE Trace` --implements--> `FastAPI`  [INFERRED]
  presentation/all_content.txt → requirements.txt
- `UrbanPulse Brand Icon (pulse logo mark)` --semantically_similar_to--> `UrbanPulse App Icon (pulse logo mark)`  [INFERRED] [semantically similar]
  presentation/brand_kit/urbanpulse-icon.svg → frontend/public/urbanpulse-icon.svg

## Import Cycles
- 3-file cycle: `backend/app/services/__init__.py -> backend/app/services/pipeline.py -> backend/app/services/tickets.py -> backend/app/services/__init__.py`

## Hyperedges (group relationships)
- **Triage Agent Pipeline** — cx_agent, vision_agent, trust_fraud_agent, dedup_agent, priority_agent, routing_agent, escalation_agent, analytics_agent, project_status_agent_pipeline [EXTRACTED 1.00]
- **WhatsApp Ingestion Flow** — implementation_plan_whatsapp_webhook, implementation_plan_whatsapp_twilio_service, implementation_plan_whatsapp_geocoding, project_status_agent_pipeline [EXTRACTED 1.00]
- **Verified Eight-Agent LangGraph Pipeline** — docs_demo_script_eight_agent_pipeline, docs_release_truth_matrix_eight_agent_pipeline [EXTRACTED 0.95]
- **Superseded Nine-Agent Pipeline Drafts** — presentation_adobe_express_input_01_executive_story_nine_agent_pipeline, presentation_adobe_express_input_05_judge_qa_nine_agent_pipeline, presentation_adobe_express_input_04_demo_script_nine_agent_pipeline [INFERRED 0.85]
- **Officer Queue Definition (reported+assigned+in_progress)** — docs_api_matrix_officer_queue_definition [EXTRACTED 0.95]
- **9-Agent LangGraph Processing Pipeline** — cx_agent, vision_agent, trust_fraud_agent, dedup_agent, priority_agent, routing_agent, escalation_agent, verification_agent, analytics_agent [EXTRACTED 1.00]
- **Hackathon Presentation Asset Suite** — presentation_screenshot_map, asset_index, brand_kit, presentation_hackathon_prep [EXTRACTED 1.00]
- **Landing Page CX Research Program** — landing_cx_research, civic_tech_benchmarks, research_landing_cx_arc_snapshot, research_landing_cx_framer_snapshot [EXTRACTED 1.00]
- **Competitor landing page snapshot set** — research_landing_cx_linear_snapshot_doc, research_landing_cx_notion_snapshot_doc, research_landing_cx_pitch_snapshot_doc, research_landing_cx_stripe_snapshot_doc, research_landing_cx_superhuman_snapshot_doc, research_landing_cx_vercel_snapshot_doc [EXTRACTED 1.00]
- **Landing hero research-to-spec iteration** — research_landing_hero_summary_doc, research_landing_hero_v2_adversarial_review_doc, research_landing_hero_v2_bucketing_doc, research_landing_hero_v2_deep_research_doc, research_landing_hero_v2_hero_v3_spec_doc [INFERRED 0.85]
- **Civic complaint transparency as differentiator** — research_landing_hero_v2_bucketing_core_promise, research_landing_narrative_v1_concepts_tuesday_morning, research_why_nine_specialists_v1_concepts_one_vs_nine [INFERRED 0.75]
- **UrbanPulse Brand Kit Icon Set** — presentation_brand_kit_admin, presentation_brand_kit_ai_agent, presentation_brand_kit_analytics, presentation_brand_kit_camera, presentation_brand_kit_citizen, presentation_brand_kit_color_swatches, presentation_brand_kit_database, presentation_brand_kit_docker, presentation_brand_kit_langgraph, presentation_brand_kit_map_pin, presentation_brand_kit_mic, presentation_brand_kit_officer, presentation_brand_kit_routing, presentation_brand_kit_security, presentation_brand_kit_settings, presentation_brand_kit_super_admin, presentation_brand_kit_urbanpulse_icon, presentation_brand_kit_urbanpulse_logo [INFERRED 0.95]
- **Presentation Icon Set** — presentation_icons_admin, presentation_icons_ai_agent, presentation_icons_analytics, presentation_icons_camera, presentation_icons_citizen, presentation_icons_database, presentation_icons_docker, presentation_icons_langgraph, presentation_icons_map_pin, presentation_icons_mic, presentation_icons_officer, presentation_icons_routing, presentation_icons_security, presentation_icons_settings, presentation_icons_super_admin [INFERRED 0.85]
- **Person Icon Components** — presentation_brand_kit_citizen_svg_head, presentation_brand_kit_citizen_svg_body [EXTRACTED 1.00]
- **Brand Primary Colors** — presentation_brand_kit_color_swatches_brand_lime, presentation_brand_kit_color_swatches_brand_dim [INFERRED 0.85]
- **Panel UI Colors** — presentation_brand_kit_color_swatches_panel_bg, presentation_brand_kit_color_swatches_panel_border [INFERRED 0.85]
- **Ticket Status Colors** — presentation_brand_kit_color_swatches_status_new, presentation_brand_kit_color_swatches_status_in_progress, presentation_brand_kit_color_swatches_status_resolved, presentation_brand_kit_color_swatches_status_verified, presentation_brand_kit_color_swatches_status_escalated [INFERRED 0.85]
- **Database Icon Visual Composition** — presentation_brand_kit_database_ellipse_top, presentation_brand_kit_database_curved_sides [EXTRACTED 1.00]
- **Docker Logo Visual Composition** — presentation_brand_kit_docker_whale_tail, presentation_brand_kit_docker_water_line, presentation_brand_kit_docker_container_stacks, presentation_brand_kit_docker_container_box [EXTRACTED 1.00]
- **Triangular Graph Structure** — presentation_brand_kit_langgraph_node_top_left, presentation_brand_kit_langgraph_node_top_right, presentation_brand_kit_langgraph_node_bottom [EXTRACTED 1.00]

## Communities (115 total, 30 thin omitted)

### Community 0 - "Backend Core"
Cohesion: 0.06
Nodes (69): Settings, AuditLog, Citizen, Officer, Ticket, Ward, seed_db(), city_pulse() (+61 more)

### Community 1 - "Auth & API Layer"
Cohesion: 0.06
Nodes (58): AuthUser, get_current_user(), get_optional_user(), _get_or_create_citizen(), Session, Like get_current_user, but anonymous callers (no Authorization header) resolve…, Idempotently link an authenticated Supabase Auth user to a Citizen row.…, Resolve an authenticated user from a Bearer token. Returns None when no… (+50 more)

### Community 2 - "AI Agent Pipeline & Docs"
Cohesion: 0.05
Nodes (52): AI Operating Contract, Analytics Agent, Civic-Tech Landing Benchmarks, Project Rules (CLAUDE.md), CX Agent, Deduplication Agent, Brand-Lime Accent, Civic Gravity Principle (+44 more)

### Community 3 - "Auth UI"
Cohesion: 0.07
Nodes (31): CitizenLogin, PostLogin, StaffLogin, StaffRegister, homeForRole(), Props, RoleGuard(), RoleLayout() (+23 more)

### Community 4 - "Citizen & Officer UI"
Cohesion: 0.10
Nodes (29): OfficerQueue, ReportDetail, ReportIssue, bgColors, borderColors, iconColors, icons, ToastContext (+21 more)

### Community 5 - "Settings & Public Pages"
Cohesion: 0.09
Nodes (26): About, AuditLog, Settings, Support, UserManagement, BreadcrumbItem, Breadcrumbs(), BreadcrumbsProps (+18 more)

### Community 6 - "Identity Tests"
Cohesion: 0.14
Nodes (29): _alice_ticket_id(), _auth_headers(), cleanup(), client(), db_engine(), _mint_token(), fixture, Authorization and identity-ownership tests for the authenticated citizen flow.… (+21 more)

### Community 7 - "LangGraph Agent Graph"
Cohesion: 0.17
Nodes (28): analytics_agent(), _analytics_resolve(), _analytics_triage(), _ask_gemini(), _ask_gemini_with_audio(), _ask_gemini_with_images(), _build_triage_graph(), _build_verification_graph() (+20 more)

### Community 8 - "Officer Tests"
Cohesion: 0.22
Nodes (26): _admin_token(), _auth_headers(), _citizen_token(), cleanup(), client(), _create_officer(), _create_ticket(), created_officer_ids() (+18 more)

### Community 9 - "WhatsApp Webhook Tests"
Cohesion: 0.14
Nodes (19): cleanup(), client(), db_engine(), _make_test_phone(), _make_webhook_request(), asyncio, fixture, Integration tests for WhatsApp webhook endpoint. (+11 more)

### Community 10 - "Dashboards"
Cohesion: 0.10
Nodes (22): AdminDashboard, CitizenDashboard, Profile, Badge(), BadgeProps, BadgeValue, BadgeVariant, priorityColorMap (+14 more)

### Community 11 - "TypeScript Config"
Cohesion: 0.08
Nodes (24): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+16 more)

### Community 12 - "Landing Page Research"
Cohesion: 0.11
Nodes (25): AI agents as product surface, Linear landing page accessibility snapshot, Product-as-hero, Credibility metrics in hero, Stripe landing page accessibility snapshot, Agentic infrastructure positioning, Vercel landing page accessibility snapshot, Hard credibility metric in hero (+17 more)

### Community 13 - "Ticket Tests"
Cohesion: 0.18
Nodes (19): _auth_headers(), cleanup(), client(), _create_ticket(), db_engine(), _ExplodingSession, _mint_token(), fixture (+11 more)

### Community 14 - "Geocoding Service"
Cohesion: 0.11
Nodes (10): GeocodingService, AsyncClient, Calculate final confidence score combining Nominatim importance + class/type…, Geocode a text query to coordinates. Args: query: Address, landmark, or place…, Service for geocoding text addresses/landmarks via Nominatim., Check if geocoding confidence meets threshold., Return confidence boost based on OSM class/type. Returns value 0.0-0.5 added to…, fixture (+2 more)

### Community 15 - "Geocoding Classification Tests"
Cohesion: 0.13
Nodes (12): asyncio, Place type (city) - typically high importance (capped at 1.0)., Tests for the enhanced confidence calculation using OSM class/type signals., Leisure/park should get high confidence boost (0.4) even with moderate…, Water/lake should get high confidence boost., Railway station should get high confidence boost., Place/suburb should get medium confidence boost (0.2)., Highway/primary (road) should get no boost - low confidence. (+4 more)

### Community 16 - "Incident Map & Processing"
Cohesion: 0.12
Nodes (15): IncidentMap, LiveAgentTrace, ProcessingPage, useDocumentTitle(), IncidentMap(), STATUS_COLORS, STATUS_RADIUS, StaffRegister() (+7 more)

### Community 17 - "Dept Dashboard & Officer Mgmt"
Cohesion: 0.13
Nodes (16): DepartmentDashboard, OfficerManagement, RoutingConfig, EmptyState(), EmptyStateProps, Officer, DepartmentDashboard(), OPEN_STATUSES (+8 more)

### Community 18 - "Audit Tests"
Cohesion: 0.21
Nodes (18): _audit_rows(), _auth_headers(), cleanup(), client(), _create_ticket(), db_engine(), _mint_token(), fixture (+10 more)

### Community 19 - "Pipeline Auth Tests"
Cohesion: 0.24
Nodes (18): _auth_headers(), citizens(), cleanup(), client(), _consume_stream(), _create_ticket(), db_engine(), _mint_token() (+10 more)

### Community 20 - "PPTX Generation"
Cohesion: 0.11
Nodes (4): C, POLISHED, pptx, PPTX_PATH

### Community 21 - "Geocoding Service Tests"
Cohesion: 0.11
Nodes (10): Network timeout should return None, not raise., HTTP error should return None, not raise., Empty or whitespace query should return None immediately., Geocode should call Nominatim with correct parameters., is_confident should correctly compare against threshold., Tests for GeocodingService class., Geocoding a highway (road) returns low confidence - no class/type boost., Geocoding a place/suburb gets medium boost (0.2) and IS confident with… (+2 more)

### Community 22 - "File Upload"
Cohesion: 0.18
Nodes (16): FileCard(), FileData, FileUpload(), FileUploadError, FileUploadProps, UploadState, ACCEPT_AUDIO, ACCEPT_IMAGES (+8 more)

### Community 23 - "Frontend Dev Dependencies"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react-dom, typescript, @typescript-eslint/parser (+9 more)

### Community 24 - "Analytics Tests"
Cohesion: 0.19
Nodes (16): _auth_headers(), cleanup(), client(), _create_ticket(), db_engine(), _mint_token(), _pulse_alerts(), fixture (+8 more)

### Community 25 - "Frontend Dependencies"
Cohesion: 0.12
Nodes (17): framer-motion, dependencies, framer-motion, leaflet, lucide-react, react, react-dom, react-leaflet (+9 more)

### Community 26 - "App Shell & Notifications"
Cohesion: 0.17
Nodes (11): App(), Notifications, PublicMap, WardHealth, PublicLayout(), PublicLayoutProps, Notification, Notifications() (+3 more)

### Community 27 - "Agent Monitoring & Officer Profile"
Cohesion: 0.14
Nodes (10): AgentMonitoring, OfficerProfile, SkeletonCard(), SkeletonProps, OfficerProfile(), UserInfo, AgentInfo, AgentMonitoring() (+2 more)

### Community 28 - "Landing Page & Pipeline UI"
Cohesion: 0.15
Nodes (11): Landing, PipelineSection(), timeline, allStages, beforeStages, checkPath, formatDate(), HeroSection() (+3 more)

### Community 29 - "Map Picker & Geolocation"
Cohesion: 0.18
Nodes (11): CUSTOM_MARKER, DEFAULT_CENTER, LocationData, MapPicker(), MapPickerProps, GeolocationState, useGeolocation(), cacheKey() (+3 more)

### Community 30 - "Presentation Icons"
Cohesion: 1.00
Nodes (15): Admin Icon, AI Agent Icon, Analytics Icon, Camera Icon, Citizen Icon, Database Icon, Docker Icon, LangGraph Icon (+7 more)

### Community 31 - "Twilio Signature Tests"
Cohesion: 0.14
Nodes (8): Dev mode bypass should work when ENV=development AND TWILIO_AUTH_TOKEN is unset., Dev mode bypass should NOT apply when ENV != development even without token., Tests for validate_signature method., Dev mode bypass should NOT apply when ENV=development but TWILIO_AUTH_TOKEN is…, A correctly computed signature should validate., A tampered form parameter should fail validation., Missing X-Twilio-Signature header should fail validation., TestValidateSignature

### Community 32 - "City Pulse & Urban Health"
Cohesion: 0.30
Nodes (10): CityPulse, Ward, avgUhs(), uhsColor(), uhsLabel(), uhsTextColor(), WardHealth(), PublicMap() (+2 more)

### Community 33 - "Twilio Service"
Cohesion: 0.15
Nodes (7): Any, AsyncClient, Send an outbound WhatsApp message via Twilio API. Args: to: Recipient in format…, Parse Twilio WhatsApp webhook form data into structured format. Returns dict…, Service for Twilio WhatsApp API interactions., Download media from Twilio's temporary URL and rehost to local /uploads.…, TwilioService

### Community 34 - "Twilio Message Tests"
Cohesion: 0.19
Nodes (8): asyncio, HTTP error on media download should return None., Tests for send_whatsapp_message method., Successful message send should return True., API failure should return False, not raise., Missing credentials should return False, not raise., Empty account_sid should return False., TestSendWhatsAppMessage

### Community 35 - "Brand Colors"
Cohesion: 0.23
Nodes (13): UrbanPulse App Icon (pulse logo mark), UrbanPulse Color Swatches Brand Asset, Brand Dim #a3c726, Brand Lime #C6F135, Panel BG #121212, Panel Border #262626, Status Escalated #ef4444, Status In Progress #f59e0b (+5 more)

### Community 36 - "Motion & Animation"
Cohesion: 0.15
Nodes (12): expressiveTransition, fadeIn, fadeInUp, fastTransition, normalTransition, pageTransition, pressScale, scaleIn (+4 more)

### Community 37 - "Docs & Decisions"
Cohesion: 0.25
Nodes (11): API Matrix, ADR-004: RLS Deny-All for alembic_version, Alembic Migration 002 Secure Internal Tables, RLS Deny-All on alembic_version, spatial_ref_sys Documented False Positive, Decision Ledger, Demo Operator Runbook, Judge Demo Script (+3 more)

### Community 38 - "Escalation Monitor"
Cohesion: 0.27
Nodes (10): EscalationMonitor, Ticket, BreachInfo, breachPct(), computeBreaches(), EscalationMonitor(), OPEN_STATUSES, priorityBadgeValue() (+2 more)

### Community 39 - "Health Checks"
Cohesion: 0.31
Nodes (8): health_check(), get, Session, Readiness probe used by Docker healthchecks. 503 while the database is…, readiness_check(), HealthResponse, BaseModel, ReadinessResponse

### Community 40 - "Twilio Webhook Parse Tests"
Cohesion: 0.20
Nodes (6): Tests for parse_webhook method., Parse a text-only WhatsApp message., Parse a message with WhatsApp location pin., Parse a message with multiple media attachments., Parse should handle missing or malformed lat/lng gracefully., TestParseWebhook

### Community 42 - "Error Boundary"
Cohesion: 0.22
Nodes (3): ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState

### Community 43 - "TS Config Node"
Cohesion: 0.22
Nodes (8): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include, vite.config.ts

### Community 44 - "Playwright QA"
Cohesion: 0.22
Nodes (8): playwright, dependencies, playwright, description, name, private, type, version

### Community 45 - "Geocoding Classification Tests"
Cohesion: 0.25
Nodes (5): Tests for Geocoding service: confident match, low confidence, zero results,…, Tests to understand how OSM class/type affects confidence interpretation., Amenity type (shop, restaurant) gets no boost even with high importance., Building type gets high boost (0.4)., TestGeocodingClassification

### Community 46 - "City Analytics"
Cohesion: 0.29
Nodes (7): CityAnalytics, CityAnalytics(), CityPulseData, OPEN_STATUSES, RESOLVED_STATUSES, STATUS_LABELS, uhsColor()

### Community 47 - "Frontend Package Config"
Cohesion: 0.29
Nodes (6): allowScripts, esbuild@0.21.5, name, private, type, version

### Community 48 - "Validation Utils"
Cohesion: 0.33
Nodes (5): FieldRules, validateField(), validateForm(), ValidationResult, validators

### Community 49 - "Docker Brand Kit"
Cohesion: 0.38
Nodes (7): Container Box Rectangle, Container Stack Lines, Design System: Minimal Line Icon, Docker Logo Icon, Theme-Adaptable Stroke Color, Water / Body Horizontal Line, Whale Tail / Spout Element

### Community 50 - "Presentation Assets"
Cohesion: 0.33
Nodes (6): Admin City Analytics, Presentation Asset Index, UrbanPulse Brand Kit, Officer Queue, Screenshot Map, Citizen Report Wizard

### Community 51 - "Twilio Media Tests"
Cohesion: 0.33
Nodes (4): Tests for download_media method., Successful media download should write file and return local path., Failed media download should return None, not raise., TestDownloadMedia

### Community 52 - "Pipeline Claims"
Cohesion: 0.33
Nodes (6): Eight-Agent LangGraph Pipeline, Verified Eight-Agent Primary Pipeline, Historical Nine-Agent Pipeline Claim, Separate Verification Agent, Nine-Agent LangGraph Pipeline Claim, Nine-Agent Pipeline Claim

### Community 53 - "Department Analytics"
Cohesion: 0.40
Nodes (5): DepartmentAnalytics, DepartmentAnalytics(), SEVERITY_LABELS, STATUS_LABELS, uhsColor()

### Community 54 - "Presentation Capture"
Cohesion: 0.53
Nodes (4): capture(), main(), polishPage(), sleep()

### Community 55 - "LangGraph Brand Icons"
Cohesion: 0.53
Nodes (6): AI Agent Icon, LangGraph Graph Workflow Icon, Bottom Node, Top-Left Node, Top-Right Node, Microphone / Voice Input Icon

### Community 56 - "Alembic Migration"
Cohesion: 0.60
Nodes (4): _column_exists(), downgrade(), Idempotence guard: the live DB was created from the ORM model (seed.py…, upgrade()

### Community 57 - "Frontend Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 58 - "Step Indicator"
Cohesion: 0.50
Nodes (4): getStates(), StepIndicator(), StepIndicatorProps, StepState

### Community 59 - "Role Icons"
Cohesion: 0.40
Nodes (5): Admin Role Icon (building), Citizen Role Icon (person), Officer / Law Enforcement Role Icon, Settings / Gear Icon, Super Admin / Star Badge Icon

### Community 60 - "Database Brand Kit"
Cohesion: 0.40
Nodes (5): Brand Kit Asset, Curved Sides (Cylinder Body), Cylinder Shape, Database Icon, Top Ellipse (Cylinder Top)

### Community 61 - "Presentation Curated"
Cohesion: 0.70
Nodes (4): capture(), main(), sleep(), submitTicket()

### Community 62 - "Visual QA"
Cohesion: 0.50
Nodes (4): main(), measurePage(), SCROLL_STEPS, VIEWPORTS

### Community 66 - "Review Captures"
Cohesion: 0.50
Nodes (3): manifest, manifestPath, server

### Community 67 - "Landing Narrative"
Cohesion: 0.67
Nodes (4): Problem section narrative concepts, A Tuesday Morning narrative concept, Landing page narrative research, Information-to-emotion principle

### Community 71 - "Docker Compose Services"
Cohesion: 0.67
Nodes (3): Backend Service, Local PostGIS Database Service, Frontend Service

### Community 72 - "Frontend Design"
Cohesion: 0.67
Nodes (3): Frontend Linear Design System Analysis, Dark-Canvas Surface Ladder Design System, index.html Entry Shell

### Community 73 - "Analytics/Database/Docker Icons"
Cohesion: 0.67
Nodes (3): Analytics / Chart Bars Icon, Database / Storage Icon, Docker Container Icon

### Community 74 - "Citizen Icon"
Cohesion: 1.00
Nodes (3): Citizen Icon SVG, Body Path, Head Circle

## Knowledge Gaps
- **254 isolated node(s):** `AuthContext`, `supabaseUrl`, `supabaseAnonKey`, `composite`, `skipLibCheck` (+249 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `FastAPI` connect `Backend Core` to `Auth & API Layer`, `AI Agent Pipeline & Docs`, `Health Checks`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `LangGraph DAG Agent Pipeline` connect `AI Agent Pipeline & Docs` to `Backend Core`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `GeocodingService` connect `Geocoding Service` to `Backend Core`, `Geocoding Service Tests`, `Geocoding Classification Tests`, `Geocoding Classification Tests`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 18 inferred relationships involving `Ticket` (e.g. with `routing_agent()` and `officer_queue()`) actually correct?**
  _`Ticket` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `TwilioService` (e.g. with `TestDownloadMedia` and `TestParseWebhook`) actually correct?**
  _`TwilioService` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AuthContext`, `supabaseUrl`, `supabaseAnonKey` to the rest of the system?**
  _254 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend Core` be split into smaller, more focused modules?**
  _Cohesion score 0.05643513789581205 - nodes in this community are weakly interconnected._