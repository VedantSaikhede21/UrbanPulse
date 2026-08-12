# Architecture Decision Records

> UrbanPulse AI — key technical decisions with rationale

---

## ADR-001: FastAPI over Django

**Status:** Accepted
**Date:** Pre-existing (project inception)

**Context:** Needed an async-native Python backend for real-time LLM agent streaming (SSE) and lightweight deployment.

**Decision:** Use FastAPI + Pydantic v2.

**Alternatives considered:**
- **Django + DRF:** Heavy for this scope, sync ORM makes SSE awkward, more boilerplate.
- **Flask:** Too minimal, no native async, no built-in validation.
- **Node.js/Express:** Would split the stack (Python needed for LangChain ecosystem).

**Consequences:**
- ✅ Async SSE streaming for agent trace works natively.
- ✅ Pydantic v2 for config + request validation in one place.
- ✅ LangGraph Python SDK integrates directly.
- ⚠️ No built-in admin panel (would need FastAPI Admin or custom).

---

## ADR-002: Supabase over Firebase

**Status:** Accepted
**Date:** Pre-existing (project inception)

**Context:** Needed auth, PostgreSQL database with PostGIS, and file storage — all from one provider.

**Decision:** Use Supabase.

**Alternatives considered:**
- **Firebase:** Firestore (no PostGIS), vendor lock-in, JavaScript-centric.
- **AWS Amplify:** Overkill for hackathon, complex setup.
- **Self-hosted PostgreSQL + Auth0:** More control but more ops work.

**Consequences:**
- ✅ PostgreSQL + PostGIS for spatial queries (ward boundaries, nearby tickets).
- ✅ Supabase Auth with Google OAuth + email/password + phone OTP.
- ✅ Supabase Storage for media attachments.
- ✅ Row Level Security (RLS) for multi-tenant data isolation.
- ⚠️ RLS policies must be written and maintained (can be bypassed in dev).

---

## ADR-003: LangGraph over CrewAI / Custom DAG

**Status:** Accepted
**Date:** Pre-existing (project inception)

**Context:** 9-step triage pipeline with streaming, state passing between agents, and branching logic.

**Decision:** Use LangGraph StateGraph.

**Alternatives considered:**
- **CrewAI:** Higher-level but less control over state flow and streaming.
- **Custom DAG with asyncio:** More work, no built-in state management.
- **LangChain LCEL:** Better for linear chains, awkward for branching graphs.

**Consequences:**
- ✅ State schema (`TicketState`) flows through all 8 agents cleanly.
- ✅ Built-in `.stream()` for SSE output to frontend.
- ✅ Easy to add/remove agents (just add nodes + edges).
- ⚠️ LangGraph is fast-moving API (breaking changes between versions).
- ⚠️ Debugging graph runs requires reading trace logs.

---

## ADR-004: Gemini 2.5 Flash over GPT-4o / Claude

**Status:** Accepted
**Date:** Pre-existing (project inception)

**Context:** Need vision (image analysis), text classification, and cost-effective inference for MVP scale.

**Decision:** Use Gemini 2.5 Flash via `google-genai` SDK.

**Alternatives considered:**
- **GPT-4o:** More expensive, no meaningful quality advantage for this use case.
- **Claude 3.5 Sonnet:** Excellent but higher cost, no built-in vision on cheaper tier.
- **Local LLM:** Not practical for hackathon (GPU requirements).

**Consequences:**
- ✅ Cost-effective: Gemini 2.5 Flash is ~$0.15/1M input tokens.
- ✅ Vision API for before/after photo verification.
- ✅ Free tier available for development.
- ⚠️ Requires internet access (no offline fallback).
- ⚠️ Falls back to rule-based classification when unavailable.

---

## ADR-005: React + Vite over Next.js / CRA

**Status:** Accepted
**Date:** Pre-existing (project inception)

**Context:** Client-rendered dashboard app with no SSR requirements. Need fast dev iteration.

**Decision:** Use React 18 + Vite 5 + TypeScript.

**Alternatives considered:**
- **Next.js:** SSR/SSG overkill for this use case (all pages are authenticated dashboards).
- **Create React App:** Slower dev server, end of life.
- **Remix:** Good but adds routing complexity.

**Consequences:**
- ✅ Fast HMR with Vite (< 1s reload).
- ✅ Simple deployment (static build + nginx).
- ✅ Vite proxy for `/api` to backend during development.
- ⚠️ No SSR (acceptable — this is an app, not a content site).

---

## ADR-006: Tailwind CSS over styled-components / CSS Modules

**Status:** Accepted
**Date:** Pre-existing (project inception)

**Context:** Need rapid UI development with consistent dark theme across all role views.

**Decision:** Use Tailwind CSS v3 with custom dark theme configuration.

**Alternatives considered:**
- **styled-components:** Runtime CSS-in-JS, slower, more boilerplate.
- **CSS Modules:** More files to manage, no design-system constraints.
- **MUI/Chakra:** Heavy component libraries, harder to customize.

**Consequences:**
- ✅ Rapid prototyping with utility classes.
- ✅ Consistent design through custom config (brand-lime, panel-bg, etc.).
- ✅ Easy to maintain dark theme throughout.
- ⚠️ JSX can get verbose with long utility class lists.

---

## ADR-007: Leaflet over Google Maps / Mapbox

**Status:** Accepted
**Date:** Proposed for map integration (not yet implemented)

**Context:** Need map picker for report location and heatmap for admin view. Must be free for hackathon.

**Decision:** Use Leaflet with OpenStreetMap tiles.

**Alternatives considered:**
- **Google Maps:** Requires API key, complex billing, usage limits.
- **Mapbox:** Generous free tier but still requires token setup.
- **Azure Maps:** Overkill, requires Azure subscription.

**Consequences:**
- ✅ Free, no API key needed for OSM tiles.
- ✅ Lightweight (no iframe, just JS library).
- ✅ Good enough for hackathon demo.
- ⚠️ OSM tiles are less polished than Google/Mapbox.

---

## ADR-008: SSE over WebSocket for Agent Trace

**Status:** Accepted
**Date:** Pre-existing (project inception)

**Context:** Need to stream agent pipeline progress to frontend in real time.

**Decision:** Use Server-Sent Events (SSE).

**Alternatives considered:**
- **WebSocket:** Bidirectional (not needed), more complex infrastructure.
- **Polling:** Wasteful, not real-time.
- **WebRTC:** Overkill.

**Consequences:**
- ✅ Simple implementation (`StreamingResponse` in FastAPI).
- ✅ Works through proxies (no upgrade handshake).
- ✅ Automatic reconnection in browsers.
- ⚠️ Unidirectional only (fine for this use case).

---

## ADR-009: Graphify for Knowledge Graph

**Status:** Accepted
**Date:** 2026-07-17

**Context:** Need to understand codebase structure, dependencies, and community boundaries for planning.

**Decision:** Use Graphify on the repository.

**Alternatives considered:**
- **dependency-cruiser:** JS-only, no Python support.
- **pydeps:** Python-only, no cross-language analysis.
- **Manual mapping:** Too slow for iterative development.

**Consequences:**
- ✅ AST-level extraction across Python + TypeScript.
- ✅ Community detection (found 32 communities in codebase).
- ✅ Cross-language relationship detection.
- ✅ Graph persisted for incremental updates.
- ⚠️ Token cost for semantic extraction with non-code files.
