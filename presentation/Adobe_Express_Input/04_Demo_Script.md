# Demo Script — 5-Minute Presentation

## Setup (Before Demo)

- Frontend running on `localhost:3000`
- Backend running on `localhost:8000`
- Browser open to `http://localhost:3000`
- Backend terminal visible (or split screen)
- No prior state needed (anonymous mode handles auth)

---

## Act 1: The Hook (0:00–0:45) — Vijay

**Vijay says:**
> "Every day, thousands of civic issues go unreported or unresolved because citizens don't have a channel and officers don't have a system. UrbanPulse AI fixes that. Let me show you how."

**Action:** Click the demo role selector (top-right), choose "Citizen."

**Screen shows:** Landing page with Live City UHS badge, navigation to /citizen dashboard

**Key point to emphasize:**
- "This is a single platform serving citizens, officers, department heads, and administrators."
- "The UHS badge — Urban Health Score — is computed live by our analytics agent."

---

## Act 2: Citizen Reports an Issue (0:45–1:45) — Vijay

**Vijay says:**
> "Imagine you're a citizen who spots a water pipeline burst."

**Action:** Navigate to /citizen/report

**Step 1 — Evidence:** Click "Skip Photo Attachment" (or upload a sample image if available)

**Step 2 — Details:**
- Select category: "Water Leak"
- Type description: "Water pipeline burst near the bus stop on MG Road. Continuous flow for 3 hours."
- Show voice recorder: "You can also record a voice note in any language — our CX agent normalizes it."

**Step 3 — Location:**
- Show the MapPicker with draggable marker
- Click "Submit & Process with AI"

**Key point:**
- "Notice: photo, voice, map pin, and description — all in one form."
- "No login required for demo."

---

## Act 3: AI Pipeline — The Hero Moment (1:45–3:00) — Both

**Vijay says:**
> "This is where UrbanPulse is different from any other civic platform. Watch."

**Action:** ProcessingPage opens. Live SSE stream begins.

**Screen shows:** Agent steps appearing in real time:

| Time | Agent | Action |
|------|-------|--------|
| 0:00 | CX Agent | Normalizing description, detecting language |
| 0:02 | Vision Agent | Analyzing uploaded photo for damage assessment |
| 0:04 | Trust & Fraud Agent | Validating report authenticity, checking for spam |
| 0:06 | Deduplication Agent | Spatial check (50m radius) for existing reports |
| 0:08 | Priority Agent | Scoring severity based on category, location, text |
| 0:10 | Routing Agent | Assigning to Water Department / Municipal Corporation |
| 0:12 | Escalation Agent | Setting SLA timer (4h for severity 3) |
| 0:14 | Verification Agent | Queued for closure photo matching |
| 0:16 | Analytics Agent | Updating UHS, generating pulse alert |

**Vedant says:**
> "What you're seeing is live — each agent's reasoning streamed via Server-Sent Events. The entire pipeline runs in about 12 seconds."

**If there's a delay:** "The agents are making actual LLM calls to Gemini. In production, caching would make this near-instant."

---

## Act 4: Officer Resolution (3:00–4:00) — Vedant

**Vedant says:**
> "Now let's see the officer side. I'll switch to the Officer role."

**Action:** Click demo role selector, choose "Officer." Navigate to /officer/queue.

**Screen shows:** Officer queue with the newly created ticket listed, showing category, severity, location.

**Vedant says:**
> "The queue is filtered, prioritized by severity. Officers see exactly what needs their attention first."

**Action:** Click "Use Sample & Resolve" on the ticket.

**Screen shows:** Resolution submission with sample closure photo URL, success toast appears.

**Vedant says:**
> "Closure photos enable our Verification Agent to match the repair against the original report — automatic quality assurance."

---

## Act 5: Admin Analytics + Wrap (4:00–5:00) — Vijay

**Vijay says:**
> "Now let's switch to the Admin view and see the city-wide picture."

**Action:** Click demo role selector, choose "Admin." Navigate to /admin/city-analytics.

**Screen shows:** City analytics with pulse alerts, trending issues, Urban Health Score charts.

**Action:** Navigate to /admin/escalation — show SLA monitor. Navigate to /admin/incident-map — show geospatial view.

**Vijay says:**
> "Administrators get real-time visibility into every aspect of urban health — from individual tickets to city-wide trends."

**Action:** Navigate to /super-admin/monitoring — show agent monitoring console.

**Vijay says:**
> "And super admins can monitor all 9 AI agents, configure routing rules, and audit every action."

---

## Fallback Plans

### If Processing Page Shows No Agents
- "The pipeline is processing. Let me show you the result."
- Navigate to /citizen/dashboard to show the ticket appeared
- Navigate to /officer/queue to show it routed

### If Backend Is Down
- "Let me restart it."
- `curl localhost:8000/health` to verify
- Refresh page

### If Supabase Auth Fails
- "We're running in demo mode with anonymous auth enabled."
- The app works without any login

### If Map Tiles Don't Load
- "Maps require internet for tile servers. The markers and data are still functional."
- Describe the data that would be visible

### If SSE Stream Disconnects
- "The agents completed processing. Let's check the result."
- Navigate to citizen dashboard to confirm

---

## Transition to Q&A (5:00+)

**Vijay says:**
> "That's UrbanPulse AI. A citizen reports an issue, AI processes it in seconds, an officer resolves it, and administrators see the full picture — all on one platform. We'd love to answer your questions."
