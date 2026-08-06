# Citizen Blueprint

```
BP-001 | v1 RC1 | AI Complaint Resolution Platform
Author: Product Design | Status: Frozen | Scope: v1
```

*This blueprint describes the v1 citizen experience of UrbanPulse: an AI-powered complaint resolution platform. It is deliberately scoped to what v1 delivers. The sections below describe the product as it exists for a citizen submitting, tracking, and resolving civic complaints — not the full city intelligence vision, which belongs in future blueprints.*

---

## 0. Product Scope Alignment

UrbanPulse v1 is a **complaint resolution platform**, not a general-purpose city intelligence dashboard.

### What v1 Is

- A way for citizens to **report civic issues** (potholes, streetlight outages, garbage build-up, water leaks, etc.)
- An **AI triage pipeline** that classifies, deduplicates, prioritises, and routes each report to the right department
- A **tracking system** that lets citizens see what happened to their report — from submission through resolution
- A **trust loop** where the citizen sees their report acknowledged, acted on, and closed with evidence

### What v1 Is Not

- Not a city-wide data exploration platform
- Not a predictive analytics tool
- Not a cross-domain insight engine (crime + traffic + air quality in one view)
- Not a civic participation bridge (voting, consultations, council meetings)

### Why This Matters

Every section below answers one question: **"How should a citizen experience reporting a civic issue and seeing it resolved?"** If a paragraph does not serve that purpose, it does not belong in this blueprint. The 5-year city intelligence vision is preserved in the Evolution section and in future blueprints — but the emotional contract with the citizen begins with complaint resolution done well.

---

## 1. Product Name & Tagline

**UrbanPulse**

*Report it. Track it. Trust it.*

The tagline shifts from "see your city" (passive observation) to "report, track, trust" (active participation). The citizen does not just watch — they participate, they know their report is being handled, and they trust the system because they see it working.

---

## 2. One-Liner

UrbanPulse turns civic complaint reporting from a black box into a transparent, trusted process — so every citizen who reports a pothole, a broken streetlight, or a garbage pile can see exactly what happened, why, and when it will be fixed.

---

## 3. Target Audience

**Primary: The Frustrated Complainant**

- Urban residents who have reported issues before — to a WhatsApp group, a councillor's number, a helpline — and got no response
- Age 25–55, owns a smartphone, active in neighbourhood WhatsApp or Facebook groups
- Would rather spend 30 seconds filing a report than 30 minutes chasing it across departments

*Key question they ask: "Is anyone even listening?"*

**Secondary: The Community Connector**

- Active in Resident Welfare Associations (RWAs), neighbourhood watches, local civic groups
- Receives complaints from neighbours verbally and passes them to the corporation or municipality
- Needs a credible tool to submit, track, and prove that issues are being addressed

*Key question they ask: "How do I prove this was reported?"*

**Tertiary: The First-Time Reporter**

- Saw a pothole, took a photo, heard about UrbanPulse from a friend
- Has never filed a formal civic complaint before
- Has low trust in the system — expects their report to disappear into a void

*Key question they ask: "Will this actually do anything?"*

---

## 4. Core Problem

When a citizen reports a civic issue today, their report enters a black box.

- **No acknowledgment** — Did the report reach anyone? Was it received? No one knows.
- **No visibility** — Which department handles this? Is it being looked at? The citizen waits in the dark.
- **No timeline** — When will it be fixed? Today? This week? Next month? Silence.
- **No accountability** — Who is responsible for resolving this? The citizen has no one to follow up with.
- **No closure** — Did anyone even come? Was it fixed? The citizen walks past the same pothole for weeks.

The result: citizens stop reporting. Trust erodes. The civic feedback loop — the most basic mechanism of urban governance — breaks entirely.

---

## 5. How They Solve It Today (Status Quo)

- **Phone calls to the municipal office** — Busy lines, transferred between departments, no record of the conversation.
- **WhatsApp groups** — A photo sent to a group with 200 neighbours. It gets lost in 50 "Good morning" messages. The admin promises to "look into it."
- **Councillor WhatsApp / phone** — The local councillor is the human router. They forward it to someone who may or may not act. No tracking.
- **Twitter / X tags** — Public shaming as a resolution mechanism. It works sometimes, but only for viral complaints.
- **Helpline apps / IVRS** — Outdated interfaces, long menus, no confirmation, no photo upload, no tracking.
- **In-person visit to the ward office** — High effort. Requires time, transport, and the willingness to wait in a queue.

---

## 6. Why Those Solutions Fail

| Solution | Failure |
|---|---|
| Phone calls to municipal office | No record. No proof the call happened. No way to escalate. |
| WhatsApp groups | Signal-to-noise ratio is terrible. Complaints are mixed with greetings, forwards, and spam. No structured intake. |
| Councillor intermediation | Depends entirely on one person's memory and willingness. No system-level accountability. |
| Twitter / X tags | Only works for high-engagement posts. The quiet majority of complaints go unheard. |
| Helpline apps / IVRS | Friction-heavy. Long menus, no photos, no confirmation, no follow-up. |
| In-person visit | Requires time, money, and mobility. Excludes the very people who need civic services most. |

The common thread: **every solution depends on a human intermediary.** If the person in the middle is busy, forgets, or doesn't care, the complaint dies. The citizen has no direct channel to the system that serves them.

---

## 7. Our Value Proposition

UrbanPulse gives the citizen a direct, transparent channel into municipal complaint resolution.

**We turn "Did anyone see my report?" into "Your report is in progress. Here's the plan."**

Every report on UrbanPulse answers three questions automatically:
1. Is my report received and logged? — Yes, and here's your reference ID.
2. What's happening with it? — Here's the AI pipeline trace, the assigned department, and the priority.
3. When will it be resolved? — Here's the SLA window and live status updates.

Not through emails, phone calls, or chasing people — through a single, always-updated view the citizen can check in 10 seconds.

---

## 8. Product Personality

UrbanPulse speaks like a **competent, kind civic partner** — not a government portal, not a chatbot, and certainly not a hype-driven AI startup.

| Trait | What It Means | What It Avoids |
|---|---|---|
| **Competent** | The system works. Reports go through. Responses are fast. Citizens trust the outcome. | Buggy flows, vague statuses, silent failures. |
| **Transparent** | Every step of the pipeline is visible. The citizen sees what the AI agents decided and why. | Black-box processing that hides reasoning. |
| **Reassuring** | The system acknowledges, updates, and closes the loop. The citizen never wonders "did they get it?" | Silence, ambiguity, "we'll look into it." |
| **Respectful** | The citizen's time and effort are valued. Forms are short. Responses are clear. No jargon. | Long forms, department-speak, runaround. |
| **Human-centred** | Design treats every report as someone's real problem — a streetlight that affects safety, a pothole that damaged a vehicle. | Treating complaints as "tickets" in a queue without acknowledging the human behind them. |
| **Honest** | If resolution will take 7 days, the system says 7 days. No false optimism. If data is uncertain, it says so. | Over-promising, timeline inflation, certainty where none exists. |

UrbanPulse's personality is the opposite of "delightful" in the consumer-app sense. Its delight comes from **reliability**. The most delightful thing the product can do is work correctly, communicate clearly, and close the loop. Every moment of relief — "Oh, they actually fixed it" — is a personality win.

---

## 9. Language System

Language on UrbanPulse is not a copywriting choice; it is a trust infrastructure. Every word either builds trust or erodes it.

### Core Principles

| Principle | Why |
|---|---|
| **Active voice** | "We received your report" not "Your report has been received." Agency matters. |
| **Plain language** | "Picked up for review" not "Ingested into triage pipeline." The citizen does not need to learn our system. |
| **Specificity** | "Being reviewed by the Roads Department" not "Under process." Vague language is the language of delay. |
| **Honest timelines** | "Expected resolution: 3 working days" not "Will be resolved shortly." Precision sets correct expectations. |
| **No bureaucracy** | Never "Please find attached..." or "Kindly revert." The system speaks like a person, not a letter. |

### Voice Anchors

| Context | Sound Like |
|---|---|
| Report confirmed | "We received your report. Reference ID: UR-2471. We'll update you when the review is complete." |
| Processing update | "Raj from Roads Department is reviewing your report." |
| Resolution | "Your report is marked resolved. Here's the closure photo." |
| Delay | "This is taking longer than expected. The department is experiencing high volume. Your new expected resolution date is [date]." |
| Error | "Something went wrong while submitting your photo. Your draft is saved. Try again?" |

### Tone Scale

| Situation | Tone |
|---|---|
| Normal updates | Neutral, informative, warm |
| Delay / issue | Apologetic and specific — "Sorry, this is taking longer. Here's why and when to expect an update." |
| Resolution | Gratitude-forward — "Your report helped improve your neighbourhood. Thank you." |
| Error / system failure | Human and direct — no excuses, no blame, just a fix. |

### What We Never Say

- "Your call is important to us" — The most meaningless phrase in civic tech. We prove importance through action, not words.
- "Kindly" — No institution-speak.
- "As per" — No justification chains. "We prioritised this report because it affects a school zone" not "As per priority matrix guidelines..."
- "Do the needful" — Banned. It is the linguistic equivalent of a black hole.

---

## 10. The Four Moments That Build Trust

The citizen's journey from frustration to trust is not one moment — it is four distinct moments, each earned through a different mechanism. Missing any one breaks the chain.

### Moment 1 — See: "Oh, it's actually working"

**Trigger:** The citizen submits their first report and, instead of a generic "thank you" screen, sees a live AI trace stream in real time.

The CX Agent extracts their description. The Vision Agent analyses their photo and confirms the category. The Dedup Agent checks for nearby duplicates. The Priority Agent assigns severity. The Routing Agent sends it to a department.

They watch it happen. Not a loading spinner. Not a ticket number. A live stream of reasoning that proves the system is not a black box.

**Why it builds trust:** The citizen expected silence. Instead, they saw the machine think. The gap between expectation and reality is where trust begins.

### Moment 2 — Why: "Oh, I understand why"

**Trigger:** The citizen receives a routing or priority decision and can see the reasoning behind it.

"Your report was classified as high priority because it is in a school zone and has been reported by 3 other residents in the last 48 hours." The citizen does not just know *what* happened — they know *why* it happened.

This applies to every decision: why a report was routed to Water over Electrical, why it was prioritised over another, why it was escalated. The reasoning is always visible, always in plain language, and always specific.

**Why it builds trust:** Transparency about *why* transforms a system from an opaque authority into a collaborative partner. The citizen can agree, disagree, or learn. In every case, they are included.

### Moment 3 — They Fixed It: "Oh, they actually fixed it"

**Trigger:** The resolution notification arrives with a closure photo — timestamped, geo-anchored, showing the fixed issue.

The citizen taps the notification. The screen shows their original photo side by side with the officer's closure photo. The streetlight is on. The pothole is filled. The timeline shows the entire journey from submission to resolution.

This is the first moment the citizen experiences the system delivering on its promise. It is not a status update. It is proof.

**Why it builds trust:** The citizen did not have to chase, call, or escalate. The system held itself accountable. Relief transforms into the belief that this system is different.

### Moment 4 — I Trust This: "Oh, I can rely on this"

**Trigger:** A few weeks later, the citizen encounters another issue and opens UrbanPulse without hesitation. They no longer wonder whether reporting is worth it.

This moment is not designed as a single interaction. It is the cumulative effect of Moments 1–3 repeating successfully. The citizen has seen the system work, understood its reasoning, and witnessed closure with evidence. When they reach for the app automatically, trust has become habit.

**Why it builds trust:** Trust is not a decision. It is a conclusion the citizen reaches after enough data points confirm the system works. This moment cannot be manufactured — it must be earned by every interaction leading up to it.

These four moments form a ladder. Each one must exist for the next to be possible. Every design decision in this blueprint serves at least one of them.

---

## 11. Core Loop

```
Report → Track → See → Trust → Recommend → Report again
```

1. **Report** — The citizen submits an issue in under 60 seconds: photo, location, short description. Done.
2. **Track** — The citizen sees the AI pipeline process their report in real time. Each agent's reasoning is visible.
3. **See** — The citizen receives updates: assigned to a department, in progress, resolved. Each update has evidence.
4. **Trust** — The resolution arrives with proof. The loop closes. The citizen's confidence in the system increases.
5. **Recommend** — Trusted citizens become organic advocates. Sharing a report or inviting a neighbour is a natural extension of a positive experience, not a growth hack. Viral loops emerge from reliability, not incentives.
6. **Repeat** — Trust enables the next report. The citizen now believes reporting is worthwhile.

The loop is not about retention. It is about rebuilding the civic feedback loop one resolved complaint at a time.

---

## 12. Key Features

- **One-Tap Report** — Select category, snap a photo or upload from gallery, pin location, add optional text. Under 60 seconds. No account required for submission (only for tracking).

- **Live Agent Trace (SSE)** — After submission, the citizen sees the AI pipeline process their report in real time. Each agent's name, decision, and reasoning are displayed as a scrolling stream. Turns a black box into a transparent process.

- **Personal Report Feed** — Every report the citizen has submitted appears in a chronological feed. Each card shows status, department, priority, and time since submission. One tap opens the full detail view.

- **Status Timeline** — Each report has a granular status: Received → Reviewed → Analysed → Routed → Department Notified → In Progress → Resolved → Verified. Each transition carries a timestamp and, where relevant, a human name or department.

- **Resolution Evidence** — When the officer marks a report as resolved, the closure photo and notes are visible to the citizen. They can verify that the issue was actually fixed.

- **SLA Visibility** — Every report shows its expected resolution window based on priority tier. The citizen sees the SLA countdown. If the SLA is breached, the escalation is visible.

- **Repeat Report Detection** — If another citizen reported the same issue (detected by geo-radius deduplication), the citizen is informed: "This issue was already reported. You can follow its progress instead of reporting again."

- **Urban Health Score (UHS) Impact** — The citizen can see their ward's UHS change when an issue is reported (dip) and resolved (recovery). Connects individual action to neighbourhood-level outcomes.

- **Officer Name & Department** — When a report is routed, the citizen sees which department has it and, when assigned, the officer's name. Transforms an abstract system into a human chain of responsibility.

---

## 13. Emotional Journey Map

Derived from the Storyboard (`docs/design/16_STORYBOARD.md`), mapped to the complaint resolution journey.

### Act I — Reporting (0–2 minutes)

| Phase | Emotion | What the citizen thinks |
|---|---|---|
| Discovery | Frustration | "This streetlight has been broken for weeks." |
| Decision | Cautious hope | "Let me try this UrbanPulse thing." |
| Submission | Expectation | "I took the photo. I pinned the location. Now what?" |
| Pipeline trace | Surprise | "Wait, I can see it thinking? It analysed my photo? It classified it?" |

**Make-or-break moment.** If the citizen submits and sees silence — a loading spinner, a "thank you" screen with no next step — they relapse into cynicism. The live trace is the antidote.

### Act II — Waiting (minutes to days)

| Phase | Emotion | What the citizen thinks |
|---|---|---|
| Acknowledgment | Relief | "It was received by the Electrical Department. Someone has it." |
| Status update | Patience | "In progress. Expected resolution in 24 hours. OK, I can wait." |
| SLA approaching | Mild concern | "It's been 20 hours. Let me check." |
| SLA breach | Frustration | "It's past the resolution window. What's happening?" |
| Escalation trigger | Validation | "The system escalated it automatically. Someone is being held accountable." |

**The waiting period is where trust is earned or lost.** Regular status updates — even if the status hasn't changed — are critical. "Still in progress. Your expected resolution is tomorrow" is vastly better than silence.

### Act III — Resolution (the closure moment)

| Phase | Emotion | What the citizen thinks |
|---|---|---|
| Resolution notification | Relief | "It's marked resolved. Let me see the photo." |
| Evidence review | Trust-building | "They actually fixed it. The photo matches my location." |
| Acknowledge | Satisfaction | "I reported this and it got fixed. It worked." |
| Tell someone | Advocacy | "You should use UrbanPulse. I reported that streetlight on my street and it was fixed in two days." |

### Act IV — Long-term trust (weeks to months)

| Phase | Emotion | What the citizen thinks |
|---|---|---|
| Second report | Confidence | "I know how this works. It's faster than calling the helpline." |
| Ward UHS check | Ownership | "Our ward score went up. My reports helped." |
| Recommend to neighbour | Community trust | "Use UrbanPulse. It actually works." |
| Systemic trust | Belonging | "My city listens. My report mattered." |

---

## 14. Trust & Credibility Mechanisms

**Without trust, UrbanPulse is another civic app that doesn't work. With trust, it becomes infrastructure.**

- **Agent transparency** — Every AI decision is surfaced in the live trace. The citizen sees what each agent decided and why. No hidden reasoning.
- **Human fallback visibility** — When AI confidence is low, the citizen sees that a human review was triggered. The system does not pretend to be more capable than it is.
- **Officer accountability** — Reports show the officer's name and department when assigned. A human name replaces the void.
- **SLA honesty** — Resolution timelines are realistic, not optimistic. If an SLA is breached, the system acknowledges it and shows the escalation.
- **Evidence at closure** — Resolutions include a timestamped closure photo. The citizen does not have to trust a status change — they can verify it.
- **Reference ID permanence** — Every report has a permanent reference ID. The citizen can cite it in any future communication.
- **No report suppression** — Reports are never silently dropped or reclassified without visibility. If a report is out of scope, the system explains why and, where possible, suggests the correct channel.

---

## 15. Delight Moments (Micro-joys)

These are not features. They are fleeting moments of unexpected positive feeling that distinguish UrbanPulse from every other complaint system.

- **The "I can see it thinking" moment** — Watching the AI agents process your report in real time. It is mesmerizing. It proves the system is not a black box.
- **The "they actually fixed it" moment** — The notification arrives with a closure photo. The pothole is filled. The streetlight is on. Relief as delight.
- **The "it's already been reported" moment** — You open the app to report a garbage pile and the system tells you your neighbour already reported it, and it's in progress. You are not late — the system was already on it.
- **The ward score bump** — Seeing your ward's UHS increase after a resolution. Your single report contributed to the neighbourhood's health.
- **The officer name reveal** — "Raj from Roads is reviewing your report." A stranger becomes a person. The system has a human face.
- **The before/after slider** — Seeing the submitted photo next to the closure photo. The difference is the story.
- **The "still true" indicator** — You revisit a past report and see "No further issues reported at this location. Still resolved." Confirmation as comfort.

---

## 16. Anti Goals

These are outcomes UrbanPulse v1 deliberately does **not** pursue. Pursuing any of them would compromise the v1 focus on complaint resolution.

| Anti-Goal | Why We Avoid It |
|---|---|
| **Viral growth** | We do not optimize for shares, referrals, or social reach. A resolved complaint that no one shares is a success. |
| **Daily active users** | We do not want citizens to open UrbanPulse every day. That would mean something is broken every day. Success is fewer reports because fewer issues exist. |
| **Engagement metrics** | Time-in-app, session depth, page views — these are meaningless for complaint resolution. A citizen who submits and closes the app in 30 seconds had a perfect experience. |
| **Sentiment analysis / mood tracking** | We do not ask citizens how they feel. Their report is the signal. |
| **Gamification** | No badges, leaderboards, streaks, or points for reporting. Reporting an issue is not a game. Gamification incentivises frivolous reports. |
| **Predictive civic insights** | "Based on your area, you might face water shortages next month" — v1 does not predict. It reports and resolves. Prediction adds complexity without proven trust. |
| **Cross-domain connections** | "Potholes in your area correlate with lower air quality" — v1 does not connect domains. It routes each complaint to the right department. |
| **Citizen-to-citizen communication** | No messaging, no community boards, no "connect with neighbours who reported similar issues." Social features dilute focus. |
| **Real-time alerts for non-urgent issues** | Not every report needs a push notification. The citizen chooses their notification thresholds. |

---

## 17. Product Non-Negotiables

These are commitments UrbanPulse never breaks — not for speed, not for cost, not for any stakeholder request. If a feature, decision, or roadmapping move violates any of these, the answer is no.

| Non-Negotiable | What It Means | Violation Example |
|---|---|---|
| **AI transparency is never optional** | Every AI decision that affects the citizen's report must be visible in plain language. No hidden reasoning, no black-box processing, no "AI handled this" without showing what it decided. | A routing decision made by the Priority or Routing Agent but shown to the citizen as only "Routed to department" without the reasoning. |
| **The citizen always has a human fallback** | If AI cannot classify, route, or resolve a report with high confidence, a human must be in the loop. The citizen is never trapped in an AI-only dead end. | A misclassified report with no way for the citizen to correct it or reach a human reviewer. |
| **Closure is never assumed, always proven** | A report is not resolved until the citizen has seen evidence — a closure photo, a timestamp, an explanation. Status changes without evidence are interim updates, not resolutions. | Marking a report "resolved" without a closure photo or verifiable evidence visible to the citizen. |
| **SLA honesty over optimism** | Resolution timelines are based on actual department capacity, not aspirational targets. If a window cannot be met, the system communicates the new estimate proactively. No false promises. | Showing "Expected resolution: 24 hours" when the department's average is 72 hours, in order to appear responsive. |
| **Citizen data is the citizen's data** | Location, report history, and personal information belong to the citizen. They are never sold, shared with third parties, or used for purposes the citizen did not explicitly consent to. | Using anonymised report data for commercial analysis without opt-in consent. |
| **The report is the unit of value, not the user** | Every metric, every design decision, every feature is measured against whether it improves the report-to-resolution journey. User engagement metrics (DAU, time-in-app) do not drive product decisions. | Adding a social feed or notification spam to increase daily active users at the expense of report resolution focus. |
| **Silence is a product failure** | Any period where the citizen has submitted a report and receives no update for more than 24 hours is treated as a bug to be fixed, not a normal state. | A report sitting in "Received" status for 3 days with no intermediate update. |

These are not guidelines. They are boundaries. Any feature, partnership, or business decision that crosses them does not belong in UrbanPulse.

---

## 18. Competitive Landscape

| Type | Examples | What they do | What they miss |
|---|---|---|---|
| Civic issue reporting apps | FixMyStreet, SeeClickFix, IChangeMyCity | Allow citizens to report issues with geo-tagging | No AI pipeline transparency. No live trace. Reports enter a black box after submission. |
| Municipal helpline apps | Various city-specific apps | Phone-based or form-based complaint submission | Outdated UX, no photo support, no live tracking, no closure evidence. |
| WhatsApp-based reporting | RWA groups, councillor chats | Fast, low-friction, conversational | No structure, no tracking, no accountability. Depends entirely on the human admin. |
| Social media reporting | Twitter/X tags, Facebook group posts | Public visibility can pressure resolution | Only works for viral posts. No privacy. No systematic tracking. |
| CRM / ticketing systems (internal) | Zendesk, Freshdesk, municipal CRM | Track tickets internally | Citizen has no visibility. No real-time trace. No closure evidence visible to the reporter. |

---

## 19. Differentiation

UrbanPulse occupies a space no existing product fills: **the intersection of AI transparency, civic accountability, and citizen trust.**

| Dimension | Others | UrbanPulse |
|---|---|---|
| After submission | Black box — report disappears | Live AI agent trace — citizen sees the pipeline |
| Status updates | Passive — citizen must check | Active — push notifications on state changes |
| Resolution evidence | None or phone call | Photo evidence visible to the citizen |
| AI reasoning | Hidden or absent | Surfaces agent decisions in plain language |
| SLA | None or vague | Explicit timeline with escalation on breach |
| Human accountability | Anonymous system | Named officer and department visible |
| Trust model | "Trust us, we're working on it" | "See for yourself — here's what's happening" |

> **Why governments buy UrbanPulse:** Existing civic CRM platforms (SeeClickFix, FixMyStreet, Motorola CityIQ) treat the citizen as a data source — submit and wait. UrbanPulse is the first system that closes the loop with **visible AI reasoning**, **photo-verified resolution evidence**, and **SLA-backed accountability**. Governments buy it not because it is cheaper (it is) but because it reduces complaint escalation, improves citizen satisfaction scores, and provides auditable proof that every report was handled. When a mayor can say "show me the closure photo for every pothole this month" and get it in 30 seconds, the system sells itself.

---

## 20. Key Metrics

### North Star Metric

**Report-to-resolution trust score**: The percentage of citizens who, after their first report is resolved, submit a second report within 60 days.

This captures the entire loop: the report worked → the citizen trusts it → they use it again. A rising trust score means the system is earning its place in the citizen's civic life.

### Input Metrics

| Metric | Why it matters |
|---|---|
| Submission completion rate | % of citizens who start a report and finish it. Measures form friction. |
| First-trace engagement | % of citizens who watch the live trace for ≥5 seconds after submission. Measures whether transparency lands. |
| SLA attainment rate | % of reports resolved within their priority window. Measures system responsiveness. |
| Resolution verification rate | % of resolved reports where the citizen views the closure evidence. Measures whether closure matters to them. |
| Second-report rate | % of citizens who submit a second report within 60 days of their first resolution. Our North Star input. |
| Report-before-follow-up rate | % of citizens who submit a report without needing to follow up via another channel. Measures completeness of the loop. |

### Guardrail Metrics

- **Duplicate report rate** — % of new reports matched to existing open reports within the same category and geo-radius. A high rate (>40%) may indicate visible-but-unresolved issues, not spam.
- **Escalation rate** — % of reports that breach their SLA. Rising trend indicates systemic capacity issues.
- **Citizen satisfaction after resolution** — Sampled micro-survey after resolution: "Was your issue resolved satisfactorily?" Target >85% positive.
- **Silent-drop rate** — % of reports that never reach a department (stuck in triage, rejected, or lost). Target: near zero.

---

## 21. User Exit Points & How We Win Them Back

| Exit Point | Why They Leave | How We Win Them Back |
|---|---|---|
| Before submitting first report | "Will this just disappear like every other app?" | Show the live agent trace *before* they submit — let them see a demo report being processed. Prove the pipeline exists before asking for their report. |
| After submission, before first update | "OK, I submitted. Now nothing." | Immediate acknowledgment with reference ID and expected SLA. Follow up within 1 hour with "Your report was reviewed by [Department]." |
| On a slow resolution | "It's been 3 days and nothing." | Proactive SLA-remaining update at 50% and 75% of window. If breached, automatic escalation notification. |
| On a rejected or out-of-scope report | "They said it's not their department. Why didn't the system know?" | Show the routing reasoning. "Our AI classified this as a water issue and sent it to the Water Department. If that's incorrect, you can reclassify it here." |
| After resolution | "It's fixed. I'm done." | Show the ward UHS change. "Your report helped improve your neighbourhood's health score. Here's what's happening in your area now." |
| After a bad experience | "They marked it resolved but nothing changed." | "Dispute resolution" flow — the citizen can flag a false resolution. The report re-enters the queue with a priority bump. |

---

## 22. Edge Cases & Failure States

| Edge Case | How We Handle It |
|---|---|
| Citizen reports outside municipal jurisdiction | Show a clear message: "This location is outside the service area. Here's the relevant authority." Provide the correct channel if known. |
| Photo is unclear or unrelated | The Vision Agent flags low-confidence classifications. Route to human review with the citizen notified: "Our AI could not clearly identify the issue from this photo. A human reviewer will check it." |
| Citizen reports the same issue repeatedly | Detect duplicate within geo-radius and category. Show: "This issue was already reported. You can follow progress here." Do not create a new ticket. |
| Officer marks resolved but citizen disagrees | "Dispute resolution" button visible for 7 days after closure. Triggers re-verification by a different officer or supervisor. |
| Citizen loses their reference ID | Provide a lookup by phone number (authenticated). All their reports are in their feed. |
| AI misclassifies the category | The Routing Agent's decision is visible. The citizen can suggest a correction. The correction is logged for model improvement. |
| Department does not respond within SLA | Automatic escalation to department head. Citizen receives a notification: "The resolution window has passed. Your report has been escalated." |
| Network failure during submission | Save the draft locally (photo + description). On reconnection, resume submission automatically. Show "Draft saved. Tap to retry." |
| Citizen submits false or spam report | Trust Agent flags based on frequency (10+ reports in 24h) and content pattern. Flagged reports are routed to a human moderator, not automatically rejected. |
| Service area has no active officers | Route report to the department queue and show: "Your report is queued. An officer will pick it up when available." Status: "Awaiting assignment." |

---

## 23. Accessibility & Inclusion

- **Cognitive accessibility**: Every status and instruction passes the "explain it to a neighbour" test. No assumed domain knowledge of municipal departments.
- **Language justice**: The product works in the languages citizens actually speak. Machine translation is visible as such. Human translation for high-touch content (SLA notifications, resolution summaries).
- **Visual accessibility**: Report status communicates through icon + text + colour, never through colour alone. All timestamps and statuses work in greyscale.
- **Device inclusion**: The product works on low-end Android devices and slow connections (2G/3G). Photo uploads are compressed. The report form loads first, images second.
- **Literacy inclusion**: The report flow uses icons and photo as primary input. Text description is optional. Status updates use visual indicators (checkmarks, clocks, progress bars) alongside text.
- **Photo-based reporting**: A citizen who cannot describe the issue in words can still report it effectively — the photo and location pin are sufficient. The Vision Agent classifies the issue from the image.
- **Trust inclusion**: Build for the citizen who has reason to distrust institutions. Agent transparency, SLA honesty, dispute resolution — these are not features, they are foundations.

---

## 24. Design Principles Applied

The following principles from `docs/design/19_PRODUCT_PRINCIPLES.md` govern every decision in this blueprint:

| Principle | How It Manifests Here |
|---|---|
| **Prove it or delete it** | Every status message and feature must justify its existence. If a pipeline step does not change citizen understanding, it is removed from the trace. |
| **A door, not a funnel** | The citizen enters through their report. There is no prescribed path — they submit, track, and resolve on their terms. |
| **Truth over polish** | The live agent trace shows raw AI reasoning, not a polished summary. Honesty about routing decisions builds more trust than a beautiful "in progress" badge. |
| **Mobile-first is people-first** | The primary citizen device is a phone. The report form, the trace, the status feed — all designed for a 5-inch screen first. |
| **Systems thinking** | Every report is connected to a ward, a department, a UHS impact, and a city-wide pattern. The citizen sees their single report in systemic context. |
| **Radical simplicity** | The first-time reporter must submit in under 60 seconds. Every additional field is a tax on the citizen. |
| **Privacy as a feature, not a compliance checkbox** | Citizens never trade privacy for service. Location is pinned by the citizen, not auto-tracked. Reports are visible only to the citizen and the assigned department. |
| **Bias is a design problem** | AI classification, prioritisation, and routing carry bias. We surface the reasoning, accept corrections, and log misclassifications for improvement. |
| **Low floor, high ceiling** | The first report takes 60 seconds. The hundredth report still benefits from deeper detail — officer names, SLA analytics, ward-level impact. |
| **Joy is infrastructure** | Delight is not a layer. It is built into how resolution feels — the relief of "they actually fixed it" is designed, not accidental. |

---

## 25. Evolution

**Phase 1 — Complaint Resolution (v1)**

The citizen reports an issue, sees it triaged by AI agents, tracks it through resolution, and verifies closure with evidence.

*Does one thing well: makes complaint reporting transparent and trustworthy.*

**Phase 2 — Topic Portfolios**

The citizen can follow cross-cutting topics — "safety on my commute" connects road repair, streetlight, and incident reports in a single view. Understanding deepens from one-off resolution to ongoing awareness.

*Connects domains without adding complexity.*

**Phase 3 — Civic Participation Bridge**

The citizen can act on their understanding — not just report issues, but participate in consultations, view ward-level development plans, and engage with civic decision-making. Action is invitation, not obligation.

*Understanding without action is incomplete. Action without understanding is dangerous.*

**Phase 4 — City Intelligence**

UrbanPulse reflects citizen observation back to the city. Anonymised, aggregated patterns of what citizens are reporting become a data source for municipal decision-makers — but only when citizens opt in. The data is not raw complaints; it is synthesised intelligence — trend maps, service demand forecasts, resource allocation recommendations — that helps city leaders make informed decisions without compromising individual privacy.

*The city listens to its people. The people see the city listening.*

Each phase is gated on trust, not technology. We do not move to Phase 2 until Phase 1 earns genuine trust from citizens. We do not move to Phase 4 until citizens explicitly ask for it.

---

## 26. Will Not Build

- **Real-time alerts for every status change** — Not every transition needs a notification. Batch updates reduce notification fatigue. Citizens choose their notification preferences.
- **Citizen score or ranking** — No gamification of civic participation. No leaderboards. No badges for reporting the most issues.
- **Predictive enforcement or policing** — We show what is being reported, not what we predict will happen. Prediction in this domain erodes trust and enables misuse.
- **Individual incident investigation** — "A crime happened at this address" is not our product. We route complaints to municipal departments, not to law enforcement.
- **Chatbots that pretend to be human** — If AI assists in communication, it is disclosed. No deception about the nature of interaction.
- **Ad-supported model** — No advertising. No sponsored content. Trust is the product. Selling attention destroys trust.
- **Social feed or community timeline** — No algorithmic feed designed to maximise engagement. Reports are the citizen's personal history, not a public scroll.
- **Unverified citizen reports as authoritative data** — Citizen observations are valuable but must be clearly distinguished from officer-verified resolutions. No mixing.
- **Developer API for third parties in Phase 1** — The citizen experience comes first. Opening complaint data to third parties before the citizen trusts the system repeats the original problem.
- **Cross-city benchmarking** — "Your ward is worse than neighbouring ward X." Comparison creates competition, not trust. v1 keeps the focus on the citizen's own neighbourhood.

---

## 27. Delight

Delight in UrbanPulse v1 is not confetti, animations, or congratulations screens. It is the feeling of the civic system finally working.

- **The resolution notification** — A push message that says "Your report was resolved. Tap to see the evidence." The moment of relief.
- **The before-and-after** — Side by side: the citizen's photo of the broken streetlight and the officer's photo of it fixed. The difference is the story.
- **The ward score week** — "Your ward's Urban Health Score improved 3 points this week. Resolved reports contributed +2 points."
- **The unexpected acknowledgment** — A mid-cycle update that says "The Electrical Department confirmed they have the parts. They expect to complete the repair by [date]." Information the citizen did not ask for but appreciates.
- **The anniversary of a resolved report** — "One year ago, you reported a pothole on MG Road. It was resolved in 2 days. Your ward has had 0 repeat reports at that location since." Perspective as delight.
- **Silence as signal** — Sometimes the best update is that nothing needs updating. "Your area has had no new complaints this week. Stability is good news."

These are not features to build. They are qualities to protect. As UrbanPulse grows beyond v1, every addition must be tested against whether it increases or decreases the feeling that the system works *for the citizen*.

---

## 28. Success Story

*Priya lives in Koramangala, Bangalore. The streetlight outside her apartment has been broken for three weeks.*

**Monday, 7:14 PM**

Priya takes a photo of the dark streetlight on her way back from the metro. Her neighbour mentioned an app called UrbanPulse. She opens it, snaps a photo, drops a pin, and taps "Submit." The whole thing takes 45 seconds.

She expects silence. She has reported things before — to the WhatsApp group, to the councillor's assistant, to the helpline number she found on a dusty website. Nothing ever came of it.

Instead, her screen starts updating. She sees:

> **CX Agent** received your report and extracted the details.
> **Vision Agent** analysed your photo — classified as Streetlight / Electrical.
> **Trust Agent** verified your report — no duplicates found in your area.
> **Priority Agent** assigned priority: Medium (standard streetlight outage).
> **Routing Agent** — assigned to Electrical Department, Koramangala Zone.

She watches, surprised. It is like seeing the inside of a machine she assumed was empty.

The screen settles on:

> **Report UR-2471 — Received by Electrical Department.**
> Expected resolution: 72 hours.
> Your report officer: Not yet assigned. You will be notified.

**Tuesday, 2:03 PM**

Her phone buzzes.

> **Update:** A field worker from the Electrical Department has been assigned to your report. Expected site visit: Wednesday.

**Wednesday, 11:45 AM**

Another buzz.

> **Update:** The streetlight at your location has been inspected. Parts required. New expected resolution: Friday.

**Thursday, 4:30 PM**

> **Update:** Repairs completed. Tap to view closure evidence.

She taps. There is a photo — the same streetlight, now lit, timestamped. Her submitted photo is shown side by side.

She feels something she did not expect: relief, yes, but also the quiet satisfaction of a system that worked. She did not call anyone. She did not chase anyone. She did not have to prove that she had reported it. The system held itself accountable.

She forwards the closure photo to her building's WhatsApp group with one line:

*"This app actually works."*

**Three months later**

Priya has reported three more issues — a garbage pile near the bus stop, a broken footpath tile, a water leak on 4th Cross. Each one was resolved. Each one updated her without her asking.

When her neighbour mentions a pothole on the next street, Priya says:

*"Download UrbanPulse. Take a photo. That's it."*

She is not a civic activist. She is not a power user. She is just a resident who found a system that treated her report as if it mattered — because it did.

---

*This blueprint describes v1. It is deliberately scoped. Every section answers the question: "How should a citizen experience reporting a civic issue and seeing it resolved?" Future blueprints will describe the expanded vision. This one stays grounded in the loop that must work perfectly before anything else can be built on top of it.*