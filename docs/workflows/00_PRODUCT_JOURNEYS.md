# Product Journeys — Master Map

> **Purpose:** Map every persona's end-to-end journey through UrbanPulse, identifying screens, emotional states, system interactions, and friction points. Each journey answers: *What does this person think, feel, and need at every step?*

**Design Constitution Reference:** Every screen must answer exactly one user question. If a section doesn't advance the storyboard, remove it.

---

## Persona Overview

| # | Persona | Tagline | Key Question | Core Journey |
|---|---------|---------|-------------|--------------|
| 1 | **Citizen** | "I want my city fixed" | *Is anyone listening?* | Report → Track → Trust |
| 2 | **Officer** | "I need to do my job efficiently" | *What matters most right now?* | Queue → Resolve → Verify |
| 3 | **Dept Head** | "Is my team effective?" | *Are we keeping up?* | Monitor → Assign → Improve |
| 4 | **Admin** | "What's happening in our city?" | *Where are the hot spots?* | Analyze → Escalate → Plan |
| 5 | **Super Admin** | "Is the system healthy?" | *Is everything running?* | Monitor → Configure → Audit |

---

## Journey 1: Citizen — *"I want my city fixed"*

### Emotional Arc
```
Confused → Curious → Empowered → Anxious → Reassured → Confident
```

### Step-by-Step Journey

| Step | Screen | User Question | Emotion | System Interaction |
|------|--------|--------------|---------|-------------------|
| 1.1 | Landing (`/`) | "What is this?" | 😕 Confused | Static page load |
| 1.2 | Landing (hero) | "Can this help my city?" | 🤔 Curious | Scroll-triggered animations |
| 1.3 | Landing (pipeline viz) | "How does it work?" | 🧠 Learning | Scroll reveals agent trace visualization |
| 1.4 | Landing (CTA) | "Should I try it?" | ✨ Intrigued | — |
| 1.5 | Citizen Login (`/auth/citizen-login`) | "How do I sign up?" | 🤷 Uncertain | Phone OTP sent via Supabase Auth |
| 1.6 | Post-Login (`/auth/post-login`) | "Where am I?" | 😕 Disoriented | Role routing to dashboard |
| 1.7 | Citizen Dashboard (`/citizen/dashboard`) | "What's going on in my area?" | 👀 Engaged | Fetch: ticket list, ward health, recent activity |
| 1.8 | Report Issue (`/citizen/report` — Step 1) | "What kind of issue?" | 🎯 Focused | Category selection |
| 1.9 | Report Issue (Step 2) | "Where exactly?" | 📍 Precise | Location picker (Leaflet), description input |
| 1.10 | Report Issue (Step 3) | "Can I show them?" | 📸 Prepared | Photo upload, voice note recording |
| 1.11 | Processing (`/citizen/processing/:ticketId`) | "Is it working?" | 😟 Anxious | SSE stream — watches 9-agent pipeline in real time |
| 1.12 | Live Agent Trace (`/trace/:ticketId`) | "What is the AI thinking?" | 🤔 Fascinated | Each agent's reasoning displayed as JSON cards |
| 1.13 | Report Detail (`/citizen/report/:id`) | "What's happening with my report?" | 😌 Reassured | Ticket status, assigned officer, SLA countdown |
| 1.14 | Notifications (`/citizen/notifications`) | "What changed?" | 🔔 Alerted | Real-time status updates |
| 1.15 | Ward Health (`/citizen/ward-health`) | "How's my neighborhood doing?" | 📊 Informed | UHS scores, category breakdowns, trends |

### Friction Points

| Step | Friction | Severity | Mitigation |
|------|----------|----------|------------|
| 1.5 | Phone OTP requires network — friction on first use | Medium | Add email-based fallback or social login |
| 1.7 | Dashboard has no personalized welcome for first-time users | Low | Add empty state with guided "Report your first issue" CTA |
| 1.9 | Location picker may fail on mobile without GPS permissions | High | Detect permission state, show clear error with manual pin fallback |
| 1.11 | SSE stream may be overwhelming — too much technical detail | Medium | Add "Simplified" toggle: human-readable vs raw agent JSON |
| 1.13 | No way to comment or reply to officer questions on a ticket | High | Missing feature — citizen cannot provide follow-up info |

### Key Metrics
- **Time to first report:** Time from landing to successful submission
- **Abandonment rate:** Users who start report but don't submit
- **Trace engagement:** % of users who watch the agent trace
- **Return rate:** % of users who submit >1 report within 30 days

---

## Journey 2: Officer — *"I need to do my job efficiently"*

### Emotional Arc
```
Overwhelmed → Focused → Capable → Satisfied → Recognized
```

### Step-by-Step Journey

| Step | Screen | User Question | Emotion | System Interaction |
|------|--------|--------------|---------|-------------------|
| 2.1 | Staff Login (`/auth/staff-login`) | "Am I in the right place?" | 😐 Neutral | Email/password auth |
| 2.2 | Officer Queue (`/officer/queue`) | "What needs my attention?" | 🎯 Focused | Polling GET /queue — priority-sorted tickets |
| 2.3 | Queue (filtered) | "Which tickets are most urgent?" | 🧐 Analytical | Filter by status (unclaimed/claimed/resolved), priority sort |
| 2.4 | Queue (ticket detail) | "What's this issue about?" | 📖 Reading | Expanded ticket card with description, photos, location |
| 2.5 | Queue (claim action) | "Should I take this?" | 🤔 Deciding | POST /claim — assigns ticket to officer |
| 2.6 | Queue (working state) | "How do I fix this?" | 💪 Capable | Ticket moves to "claimed" tab; officer goes on-site |
| 2.7 | Queue (resolve action) | "Is it done?" | ✅ Confident | Before/after photo upload, resolution notes |
| 2.8 | Officer Profile (`/officer/profile`) | "How am I performing?" | 📊 Reflective | Personal stats: resolved count, avg resolution time, rating |

### Friction Points

| Step | Friction | Severity | Mitigation |
|------|----------|----------|------------|
| 2.2 | Polling-based queue = stale data between intervals | Medium | Add WebSocket subscription for real-time queue updates |
| 2.5 | No auto-assignment — officers must manually claim | Medium | Add "auto-claim highest priority unclaimed" toggle |
| 2.7 | Before/after photo upload requires being at location twice | High | Allow in-field photo upload via mobile browser; add offline draft support |
| 2.7 | No structured resolution form — officer types free text | Low | Add guided resolution template per issue category |
| 2.8 | No peer comparison or leaderboard | Low | Add anonymized team efficiency metrics |

### Key Metrics
- **Claim rate:** % of eligible tickets claimed within SLA window
- **Resolution time:** Average time from claim to resolution
- **Verification pass rate:** % of resolutions verified on first check
- **Queue idle time:** Time tickets sit unclaimed

---

## Journey 3: Department Head — *"Is my team effective?"*

### Emotional Arc
```
Uncertain → Informed → In Control → Strategic
```

### Step-by-Step Journey

| Step | Screen | User Question | Emotion | System Interaction |
|------|--------|--------------|---------|-------------------|
| 3.1 | Staff Login (`/auth/staff-login`) | — | 😐 Neutral | Email/password auth |
| 3.2 | Dept Dashboard (`/dept/inbox`) | "What's my department's status?" | 👀 Overview | Department ticket summary, SLA compliance, workload |
| 3.3 | Dept Analytics (`/dept/analytics`) | "Are we improving?" | 📊 Analytical | Trend charts: resolution time, volume, categories |
| 3.4 | Officer Management (`/dept/officers`) | "Who's performing and who needs help?" | 👥 Managerial | Officer list with stats, workload balancing |
| 3.5 | Officer Queue (shared access via `/officer/queue`) | "What are my officers seeing?" | 🔍 Oversight | Same queue view as officers |

### Friction Points

| Step | Friction | Severity | Mitigation |
|------|----------|----------|------------|
| 3.3 | No exportable reports for stakeholder meetings | High | Add CSV/PDF export to analytics |
| 3.4 | Cannot reassign tickets between officers | High | Add manual reassignment capability |
| 3.4 | No shift planning or scheduling | Medium | Out of scope for v1 |
| 3.5 | Dept head sees ALL officers' queue — too noisy | Medium | Add filter by individual officer |

### Key Metrics
- **SLA compliance rate:** % of tickets resolved within SLA window
- **Team utilization:** Active claims per officer vs capacity
- **Category distribution:** Which issue types dominate workload
- **Trend direction:** Week-over-week resolution time change

---

## Journey 4: Admin (City-Wide) — *"What's happening in our city?"*

### Emotional Arc
```
Curious → Insightful → Decisive → Proactive
```

### Step-by-Step Journey

| Step | Screen | User Question | Emotion | System Interaction |
|------|--------|--------------|---------|-------------------|
| 4.1 | Staff Login | — | 😐 Neutral | Email/password auth |
| 4.2 | City Analytics (`/admin/city-analytics`) | "Where are the hot spots?" | 🧐 Analytical | City-wide UHS map, category trends, department comparison |
| 4.3 | Incident Map (`/admin/incident-map`) | "Where exactly are issues clustering?" | 🗺️ Geographic | Leaflet heatmap with ward boundaries, cluster markers |
| 4.4 | Escalation Monitor (`/admin/escalation`) | "What's about to break?" | ⚠️ Alert | Tickets approaching or past SLA, sorted by urgency |

### Friction Points

| Step | Friction | Severity | Mitigation |
|------|----------|----------|------------|
| 4.2 | No predictive analytics (where will issues cluster next?) | Medium | Future feature — time-series forecasting |
| 4.3 | No exportable heatmap for planning presentations | Low | Add screenshot/image export |
| 4.4 | No way to intervene directly on escalation | High | Add "force reassign" or "notify dept head" action on escalation items |
| 4.4 | No escalation notification preferences | Medium | Add configurable alert thresholds and channels |

### Key Metrics
- **Hot spot density:** Tickets per km² by ward
- **Escalation rate:** % of tickets that breach SLA
- **Department parity:** Variance in resolution time across departments
- **Peak period detection:** Time-of-day/week patterns in volume

---

## Journey 5: Super Admin — *"Is the system healthy?"*

### Emotional Arc
```
Skeptical → Confident → In Control → Trusting
```

### Step-by-Step Journey

| Step | Screen | User Question | Emotion | System Interaction |
|------|--------|--------------|---------|-------------------|
| 5.1 | Staff Login | — | 😐 Neutral | Email/password auth |
| 5.2 | Admin Dashboard (`/super-admin/dashboard`) | "Is everything running?" | 👀 Overview | System health summary, pending issues, user counts |
| 5.3 | User Management (`/super-admin/users`) | "Who's on the platform?" | 👥 Administrative | User list with roles, status, filters |
| 5.4 | Routing Config (`/super-admin/routing`) | "Are tickets going to the right place?" | ⚙️ Configuring | Department→category mapping rules, agent routing logic |
| 5.5 | Audit Log (`/super-admin/audit`) | "What changed and who did it?" | 🔍 Investigating | Immutable audit trail of all system actions |
| 5.6 | Agent Monitoring (`/super-admin/monitoring`) | "Are the AI agents working correctly?" | 🤖 Technical | Agent pipeline health, latency, error rates, fallback count |

### Friction Points

| Step | Friction | Severity | Mitigation |
|------|----------|----------|------------|
| 5.2 | No real-time system health indicators (DB connection, Gemini API status) | High | Add live health check widgets |
| 5.4 | Routing config is too technical — needs category BREAD view | Medium | Simplify to Browse-Read-Edit-Add-Delete UX per routing rule |
| 5.5 | Audit log has no search or filtering | High | Add date range, action type, and user filters |
| 5.6 | No alerting when agents fail or degrade | High | Add email/Slack notification on agent failure threshold |
| 5.6 | No historical agent performance trends | Medium | Add latency/accuracy trend graphs over time |

### Key Metrics
- **System uptime:** API availability over trailing 24h
- **Agent success rate:** % of pipeline runs completing without fallback
- **Agent latency:** P50/P95/P99 agent processing times
- **Fallback rate:** % of tickets classified by rule-engine fallback vs Gemini

---

## Cross-Cutting Journey: Emergency Command

> **Note:** Emergency Command routes exist in `App.tsx` (`/emergency/*`), but no page files were found in the frontend source. These are likely planned or stubbed.

| Route | Status | Notes |
|-------|--------|-------|
| `/emergency/dashboard` | ⬜ Not implemented | No page file found |
| `/emergency/active-incidents` | ⬜ Not implemented | No page file found |
| `/emergency/resources` | ⬜ Not implemented | No page file found |
| `/emergency/communications` | ⬜ Not implemented | No page file found |
| `/emergency/settings` | ⬜ Not implemented | No page file found |
| `/emergency/notifications` | ⬜ Not implemented | No page file found |

---

## Cross-Cutting Journey: Live Agent Trace

The Live Agent Trace (`/trace/:ticketId`) is a shared component available to ALL roles. It streams each agent's reasoning from the LangGraph pipeline via SSE.

| Step | What the user sees | User Question | Emotion |
|------|-------------------|--------------|---------|
| 1 | "Analyzing your report..." with spinning indicator | "Is it working?" | 😟 Anxious |
| 2 | CX Agent card appears with extracted summary | "Did it understand me?" | 🤔 Hopeful |
| 3 | Vision Agent card — photo classification | "Did the AI see what I saw?" | 😲 Surprised |
| 4 | Trust Agent card — credibility score | "Does it trust me?" | 😐 Neutral |
| 5 | Dedup Agent card — spatial match result | "Has someone else reported this?" | 🤷 Curious |
| 6 | Priority Agent card — urgency tier | "Is this considered important?" | 😌 Reassured/😟 Worried |
| 7 | Routing Agent card — assigned department | "Who's getting this?" | 🧐 Interested |
| 8 | Escalation Agent card — SLA window | "How long will it take?" | 😌 Informed |
| 9 | Analytics Agent card — UHS impact | "How does this affect my ward?" | 📊 Informed |
| 10 | "Complete" with ticket ID | "What's next?" | ✅ Done |

**Design Insight:** The trace is UrbanPulse's "wow" moment. It transforms a black-box complaint system into transparent, trust-building theater. Protect this experience.

---

## Page-to-Persona Matrix

| Page | Citizen | Officer | Dept Head | Admin | Super Admin |
|------|---------|---------|-----------|-------|-------------|
| Landing (`/`) | ✅ Entry | ⬜ | ⬜ | ⬜ | ⬜ |
| About (`/about`) | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Public Map (`/public-map`) | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Citizen Login | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Staff Login | ⬜ | ✅ | ✅ | ✅ | ✅ |
| Staff Register | ⬜ | ✅ | ✅ | ✅ | ✅ |
| Post Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| Citizen Dashboard | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Report Issue | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Report Detail | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Processing Page | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Ward Health | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Citizen Profile | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Citizen Notifications | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Officer Queue | ⬜ | ✅ | ✅ | ✅ | ⬜ |
| Officer Profile | ⬜ | ✅ | ✅ | ✅ | ⬜ |
| Dept Dashboard | ⬜ | ⬜ | ✅ | ✅ | ⬜ |
| Dept Analytics | ⬜ | ⬜ | ✅ | ✅ | ⬜ |
| Officer Management | ⬜ | ⬜ | ✅ | ✅ | ⬜ |
| City Analytics | ⬜ | ⬜ | ⬜ | ✅ | ✅ |
| Incident Map | ⬜ | ⬜ | ⬜ | ✅ | ✅ |
| Escalation Monitor | ⬜ | ⬜ | ⬜ | ✅ | ✅ |
| Super Admin Dashboard | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| User Management | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| Routing Config | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| Audit Log | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| Agent Monitoring | ⬜ | ⬜ | ⬜ | ⬜ | ✅ |
| Live Agent Trace | ✅ Shared across all roles | | | | |
| Settings | ✅ Shared | | | | |
| Support | ✅ Shared | | | | |
| Landing Page | ✅ | ⬜ | ⬜ | ⬜ | ⬜ |
| Emergency* (all routes) | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

*\*Emergency routes are registered in the router but have no page files — not implemented.*

---

## Key Design Insights

1. **The Live Agent Trace is the emotional centerpiece.** It converts anxiety into fascination and builds trust through transparency. Every other feature supports this moment.

2. **Citizen journey has the most screens (15+)** but the officer journey is the operational bottleneck — the system's credibility rests on officers claiming and resolving tickets quickly.

3. **Admin and Super Admin roles overlap significantly** on analytics and escalation views. Consider whether the role distinction is meaningful enough to justify separate views vs role-gated access to the same screens.

4. **Emergency Command is entirely unimplemented** despite having routes registered. This is a significant gap if emergency response is in scope.

5. **No cross-persona communication channels exist.** Citizens cannot comment on tickets. Officers cannot message citizens. Dept heads cannot reassign. These missing edges create workflow dead ends.

---

## Next

→ `01_CITIZEN_JOURNEY.md` — Deep dive: every citizen screen with wireframes, state machines, and acceptance criteria
→ `02_OFFICER_JOURNEY.md` — Deep dive: officer workbench with queue mechanics and resolution flow
→ `WORKFLOW_AUDIT.md` — System-wide scoring against completeness, consistency, and usability criteria