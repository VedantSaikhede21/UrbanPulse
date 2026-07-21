# Judge Q&A — 50 Likely Questions with Answers

## Category 1: Architecture & Technical Decisions

### Q1: Why LangGraph instead of a single LLM call?
**Answer:** A single LLM call can't do structured multi-step reasoning with branching logic. LangGraph gives us a directed acyclic graph where each agent handles one concern — vision, trust, routing — and can fail independently without crashing the pipeline. It also makes the live SSE trace possible: we stream each node's output as it executes.

### Q2: Why FastAPI over Django/Flask?
**Answer:** FastAPI gives us native async for SSE streaming, automatic OpenAPI docs, Pydantic validation, and significantly better performance under concurrent loads. For an AI pipeline that makes multiple LLM calls per request, async concurrency is critical.

### Q3: Why React over Next.js?
**Answer:** This is a single-page dashboard app with heavy client-side state (maps, SSE streams, real-time queues). Next.js's SSR advantages don't apply here. React + Vite gives us faster builds, simpler deployment (static files via nginx), and the same component model.

### Q4: Why Supabase?
**Answer:** Supabase gives us PostgreSQL + real-time subscriptions + built-in auth + storage in one managed service. For a hackathon, this eliminates the need to wire up Firebase, S3, and a separate auth provider.

### Q5: Why not WhatsApp bot?
**Answer:** WhatsApp limits you to text + images with no structured workflow. UrbanPulse needs map pins, voice recording, multi-step forms, role-based dashboards, and real-time agent traces — none of which fit a chat interface.

### Q6: How is this different from a CRUD app?
**Answer:** Every report goes through 9 AI agents before it reaches an officer. The agents verify, deduplicate, prioritize, route, and set SLA thresholds — all autonomously. The SSE live trace makes this visible in real time.

### Q7: Why PostgreSQL for spatial data instead of MongoDB?
**Answer:** PostGIS gives us production-grade spatial queries (ST_DWithin for 50m dedup, ST_Distance for nearest-neighbor) with ACID compliance. MongoDB's geospatial is adequate but lacks the advanced spatial SQL we need.

### Q8: How does the SSE pipeline handle concurrent users?
**Answer:** FastAPI's async event loop handles SSE connections efficiently — each connection is a lightweight coroutine, not a thread. PostgreSQL connection pooling (via SQLAlchemy + PGBouncer-ready) prevents database exhaustion.

### Q9: Why Leaflet instead of Mapbox/Google Maps?
**Answer:** Leaflet is free, open-source, and works with any tile provider (we use CARTO dark tiles). Mapbox and Google Maps require API keys and have usage limits. For a hackathon demo, Leaflet + OpenStreetMap tiles are the right choice.

### Q10: How did you handle the async agent pipeline?
**Answer:** LangGraph's `async` mode lets each agent run as a concurrent task. Agents that don't depend on each other (e.g., Vision and CX) can run in parallel. The DAG structure ensures routing happens only after priority is scored.

---

## Category 2: AI & Machine Learning

### Q11: What model are the agents using?
**Answer:** The agents use Google Gemini (via API) for vision analysis and text reasoning. Each agent has a specialized system prompt that constrains its output to a structured JSON format.

### Q12: How accurate is the Vision Agent?
**Answer:** For damage assessment (potholes, leaks, cracks), Gemini Vision achieves approximately 85-90% accuracy on clear images. We mitigate errors by having the Trust & Fraud Agent cross-reference the vision assessment with the text description.

### Q13: How does deduplication work?
**Answer:** Two layers. First, spatial: PostGIS `ST_DWithin` checks for reports within 50m of the same category. Second, semantic: the Deduplication Agent compares descriptions using embedding similarity. If both layers trigger, the new report is flagged as a duplicate and merged.

### Q14: How do you prevent fake/spam reports?
**Answer:** The Trust & Fraud Agent analyzes the report for spam signals: generic descriptions, impossible locations, duplicate phrasing, and missing media for high-severity claims. Flagged reports go to manual review instead of automatic routing.

### Q15: What training data did you use?
**Answer:** We're using zero-shot LLM capabilities — no fine-tuning. The agents use structured prompt engineering with few-shot examples. For production, we'd fine-tune on historical municipal data.

### Q16: How do you compute Urban Health Score?
**Answer:** UHS is a weighted composite: 40% average resolution time, 30% incident density (per capita), 20% severity distribution, 10% SLA compliance rate. Updated after every closed ticket. Range: 0 (critical) to 100 (optimal).

### Q17: What happens when Gemini API is down?
**Answer:** The pipeline degrades gracefully. Agents that can't reach Gemini fall back to rule-based logic — e.g., priority scoring by category alone instead of full NLP analysis. The report is still created and routed.

### Q18: Why not fine-tune a smaller model?
**Answer:** For a hackathon MVP, Gemini's zero-shot capabilities are sufficient. Fine-tuning would require a labeled dataset of municipal reports, which we'd collect in production.

### Q19: Can the agents handle multiple languages?
**Answer:** The CX Agent normalizes input language and translates non-English descriptions. Currently supports English, Hindi, and code-mixed Hinglish via Gemini's multilingual capabilities.

### Q20: How long does the full pipeline take?
**Answer:** ~12 seconds for 9 agents with Gemini API calls. With response caching and parallel execution optimization, we target <3 seconds in production.

---

## Category 3: Product & Design

### Q21: Who is the target user?
**Answer:** Three primary users: citizens who need to report issues, municipal officers who resolve them, and city administrators who need data for decision-making.

### Q22: How is this better than existing apps like FixMyStreet or IChangeMyCity?
**Answer:** Those apps are glorified CRUD forms — report, track, done. UrbanPulse adds AI-powered verification, automatic routing, geospatial deduplication, real-time agent traces, SLA monitoring, composite health scoring, and role-based analytics. It's a triage platform, not a complaint box.

### Q23: How would a city adopt this?
**Answer:** Package as Docker containers, deploy on municipal infrastructure or cloud. Onboard departments via the routing config UI. Citizens access via URL — no installation needed. Integration with existing systems via REST API.

### Q24: What about privacy?
**Answer:** Citizen reports include location data, which is essential for civic services. We store only what's needed for resolution. Supabase RLS policies restrict access. No personal data is shared between roles without authorization.

### Q25: What about accessibility?
**Answer:** Voice recording enables illiterate or low-literacy users to report issues. The UI has ARIA labels, role-based navigation, and keyboard support. Dark mode reduces eye strain.

### Q26: How do citizens track their report?
**Answer:** Dashboard shows all submitted reports with live status. Each report has a detail view with full processing trace. Shared trace links can be sent via WhatsApp or message.

### Q27: Can officers use this on mobile in the field?
**Answer:** The frontend is fully responsive — works on mobile browsers. Officers can view queue, start work, and upload closure photos from their phone camera.

### Q28: What if a citizen reports the same issue twice?
**Answer:** The Deduplication Agent catches spatial near-duplicates and merges them. The citizen sees the original report's status instead of creating a duplicate.

### Q29: How does the demo role selector work?
**Answer:** In development mode, a dropdown in the sidebar lets you switch between all 7 roles instantly. This lets us demo the entire platform without managing real auth sessions. In production, each user sees only their authorized role.

### Q30: What's the most impressive thing to demo?
**Answer:** The SSE live trace during AI processing. Watching 9 agents make decisions in real time is the clearest demonstration that this isn't just another form — it's an AI platform.

---

## Category 4: Business & Impact

### Q31: What's the business model?
**Answer:** SaaS subscription to municipal corporations. Tiered by city population and number of departments. Free tier for smaller municipalities. Premium tier for advanced analytics, custom routing, and priority support.

### Q32: How will you measure success?
**Answer:** Reduction in average resolution time, increase in citizen satisfaction score, % of issues resolved within SLA, UHS improvement quarter-over-quarter.

### Q33: What's the TAM?
**Answer:** India has ~4,000 municipal corporations and urban local bodies. At an average of ₹5L/year per municipality, that's a ₹200Cr annual market. Plus smart city missions in Southeast Asia and Africa.

### Q34: How do you compete with WhatsApp-based solutions?
**Answer:** WhatsApp is a communication channel, not a triage platform. We can actually integrate WhatsApp as an input channel while keeping our AI pipeline as the engine. Think "WhatsApp for input, UrbanPulse for processing."

### Q35: What's the biggest risk?
**Answer:** Adoption by municipal corporations requires bureaucratic buy-in. Our strategy: start with one ward, prove ROI with UHS improvement data, then expand.

### Q36: How long until this is production-ready?
**Answer:** The core pipeline and UI are done. Production readiness requires: auth hardening, load testing, rate limiting, monitoring dashboards, incident response runbooks, and SLA-backed support. Estimated 4-6 weeks of engineering.

### Q37: What's the cost per report?
**Answer:** ~₹0.50 per report at current Gemini API pricing (9 agent calls per report). With caching and batching, target <₹0.10 in production.

### Q38: How do you handle scale — 10,000 reports/day?
**Answer:** FastAPI async handles concurrent requests. PostgreSQL with proper indexing handles spatial queries at this scale. The LangGraph pipeline can be horizontally scaled with a task queue (Celery/RabbitMQ) for production.

### Q39: Who owns the data?
**Answer:** The municipal corporation owns all report data. UrbanPulse provides the platform and analytics. No data is used for training without explicit consent.

### Q40: What's the deployment model?
**Answer:** Docker containers deployed on the city's infrastructure or cloud of choice. Docker Compose for small deployments, Kubernetes for large-scale. We've prepared Dockerfiles for both backend and frontend.

---

## Category 5: Technical Deep-Dive

### Q41: Explain the LangGraph DAG structure.
**Answer:** The graph has 9 nodes connected in a directed acyclic graph. Nodes 1-4 (CX, Vision, Trust, Dedup) run in parallel after receiving the report. Node 5 (Priority) depends on their outputs. Node 6 (Routing) depends on Priority. Nodes 7-9 (Escalation, Verification, Analytics) run after routing, also in parallel.

### Q42: How do you handle SSE reconnection?
**Answer:** The EventSource API auto-reconnects with exponential backoff. On reconnection, the backend replays any missed events from an in-memory buffer. If the buffer is exhausted, the client shows a "connection restored" banner.

### Q43: How is the UHS updated?
**Answer:** Each ticket resolution triggers the Analytics Agent, which recalculates the UHS by querying the last 30 days of ticket data. The computation is incremental — only the affected ward's score is recalculated, not the entire city.

### Q44: How does file upload work?
**Answer:** Images are uploaded to a local `/uploads` directory via multipart form. The Vision Agent reads the file path. In production, we'd use S3-compatible storage with signed URLs.

### Q45: How does role-based routing work?
**Answer:** The frontend uses a `RoleGuard` component that checks auth state and allowed roles. The RoleLayout component renders role-specific navigation. The backend checks roles via middleware on protected endpoints. In demo mode, auth is bypassed with a super_admin fallback.

### Q46: What's the testing strategy?
**Answer:** Playwright E2E tests cover all 19 routes and the full citizen→officer workflow. The QA pipeline runs automatically and verifies no console errors, no server errors, and correct page content.

### Q47: How is the project organized?
**Answer:** `backend/` — FastAPI app with LangGraph pipeline, routes, models, and agents. `frontend/` — React SPA with lazy-loaded pages, role-based layout, and reusable components. `qa/` — Playwright E2E tests. `docs/` — Engineering standards, component inventory, API matrix, changelog.

### Q48: How did you handle the hackathon time constraint?
**Answer:** We used AI-assisted development with clear ownership boundaries (Vedant = auth, Vijay = everything else). The autonomous workflow enforced: research → implement → build → QA → fix → regression check, with no skipped steps.

### Q49: What would you add with more time?
**Answer:** Real-time push notifications (Twilio WhatsApp), officer mobile app (React Native), auto-scaling agent pipeline (Celery + Redis), production auth (Supabase proper), multi-language support, and offline-first reporting capability.

### Q50: What's one thing you'd do differently?
**Answer:** Set up Supabase auth end-to-end earlier in the process. The auth merge late in development caused QA regressions that took time to resolve. For the next project, auth gets implemented in Sprint 1, not Sprint 3.
