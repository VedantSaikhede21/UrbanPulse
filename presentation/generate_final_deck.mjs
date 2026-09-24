import PptxGenJS from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = __dirname;
const PPTX_PATH = path.join(OUT_DIR, 'UrbanPulse_Final_Judges_Deck.pptx');

// ───── Design tokens (dark glass, lime accent) ─────
const C = {
  bg:     '0D0D0D',
  panel:  '161B22',
  panel2: '1B2230',
  border: '2D2D2D',
  lime:   'C6F135',
  fg:     'F2F2F2',
  dim:    'A3ADBB',
  mute:   '6B7280',
  blue:   '3B82F6',
  amber:  'F59E0B',
  purple: '8B5CF6',
  red:    'EF4444',
  cyan:   '22D3EE',
  green:  '34D399',
};
const F = { serif: 'Fraunces', sans: 'Inter', mono: 'JetBrains Mono' };
const W = 13.333;
const H = 7.5;

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'WIDE', width: W, height: H });
pptx.layout = 'WIDE';
pptx.author = 'UrbanPulse AI';
pptx.title = 'UrbanPulse AI — Final Judges Deck';
pptx.subject = 'Verified prototype · hackathon final presentation';

let slideNum = 0;
const TOTAL = 15;

// ───── Helpers ─────
function newSlide() {
  slideNum += 1;
  const s = pptx.addSlide();
  s.background = { color: C.bg };
  return s;
}

function header(s, eyebrow, title, limePart = null) {
  s.addText(`◆ ${eyebrow}`, {
    x: 0.7, y: 0.42, w: 9, h: 0.3, fontFace: F.mono, fontSize: 9,
    color: C.mute, charSpacing: 2,
  });
  s.addText(`${slideNum} / ${TOTAL}`, {
    x: 11.9, y: 0.42, w: 0.8, h: 0.3, fontFace: F.sans, fontSize: 10,
    color: C.mute, align: 'right',
  });
  const runs = [];
  if (limePart && title.includes(limePart)) {
    const idx = title.indexOf(limePart);
    if (idx > 0) runs.push({ text: title.slice(0, idx), options: { color: C.fg } });
    runs.push({ text: limePart, options: { color: C.lime } });
    if (idx + limePart.length < title.length)
      runs.push({ text: title.slice(idx + limePart.length), options: { color: C.fg } });
  } else {
    runs.push({ text: title, options: { color: C.fg } });
  }
  s.addText(runs, {
    x: 0.7, y: 0.78, w: 12, h: 0.85, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 30, color: C.fg, charSpacing: -0.5, valign: 'top',
  });
  s.addShape('rect', { x: 0.7, y: 1.62, w: 12, h: 0.012, fill: { color: C.border } });
}

function footer(s, label) {
  s.addShape('rect', { x: 0, y: 7.12, w: W, h: 0.01, fill: { color: C.border } });
  s.addText(label, {
    x: 0.7, y: 7.2, w: 12, h: 0.25, fontFace: F.mono, fontSize: 8.5,
    color: C.mute, charSpacing: 1,
  });
}

function panel(s, x, y, w, h, fill = C.panel) {
  s.addShape('roundRect', {
    x, y, w, h, rectRadius: 0.06, fill: { color: fill },
    line: { color: C.border, width: 0.75 },
  });
}

function chip(s, x, y, w, text, color = C.lime) {
  s.addShape('roundRect', {
    x, y, w, h: 0.34, rectRadius: 0.17, fill: { color, transparency: 87 },
    line: { color, width: 0.75 },
  });
  s.addText(text, {
    x, y: y - 0.02, w, h: 0.38, fontFace: F.mono, fontSize: 9,
    color, align: 'center', valign: 'middle', charSpacing: 1,
  });
}

function notes(s, text) {
  s.addNotes(text);
}

// ══════════════════════════════════════════════════════════════
// 1 · TITLE
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  s.addShape('rect', { x: 0, y: 0, w: W, h: 0.09, fill: { color: C.lime } });
  s.addText('◆ HACKATHON FINAL · VERIFIED PROTOTYPE · 8-AGENT LANGGRAPH PIPELINE', {
    x: 0.9, y: 1.15, w: 11.5, h: 0.35, fontFace: F.mono, fontSize: 11,
    color: C.mute, charSpacing: 2,
  });
  s.addText([
    { text: 'UrbanPulse', options: { color: C.fg } },
    { text: ' AI', options: { color: C.lime } },
  ], {
    x: 0.9, y: 1.6, w: 11.5, h: 1.5, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 72, charSpacing: -1, valign: 'top',
  });
  s.addText('One complaint. Eight agents. A visible resolution.', {
    x: 0.9, y: 3.15, w: 11.5, h: 0.6, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 30, color: C.lime, valign: 'top',
  });
  s.addText('A citizen spots a pothole. Today that report enters a black hole. UrbanPulse turns one complaint into a visible, AI-routed, verifiable resolution — streamed live, step by step.', {
    x: 0.9, y: 3.95, w: 10.5, h: 1.1, fontFace: F.sans, fontSize: 15,
    color: C.dim, lineSpacingMultiple: 1.35, valign: 'top',
  });
  s.addText('CITIZEN SIGNAL  →  AI PIPELINE  →  OFFICER ACTION  →  VERIFICATION  →  CITY INTELLIGENCE', {
    x: 0.9, y: 5.35, w: 11.5, h: 0.4, fontFace: F.mono, fontSize: 11,
    color: C.cyan, charSpacing: 1.5,
  });
  footer(s, 'URBANPULSE AI · FINAL JUDGES DECK · BASELINE frontend 63b4538 / backend 806dc7a');
  notes(s, 'Open with the one-liner. Emphasise: everything shown today is a working prototype — real auth, real database, real 8-agent pipeline. No mockups.');
}

// ══════════════════════════════════════════════════════════════
// 2 · PROBLEM
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'THE PROBLEM', 'Today, a complaint enters a black hole.');
  const cols = [
    { t: 'CITIZEN', c: C.blue, lines: ['Files a complaint — hears nothing back', 'No status, no reason, no closure', 'No proof the fix ever happened'] },
    { t: 'OFFICER', c: C.amber, lines: ['Unprioritised pile of reports', 'No urgency signal, no duplicate detection', 'No way to prove a fix was done'] },
    { t: 'CITY', c: C.red, lines: ['No ward-level health visibility', 'Escalations happen by accident', 'Complaint data never becomes intelligence'] },
  ];
  cols.forEach((col, i) => {
    const x = 0.7 + i * 4.15;
    panel(s, x, 2.0, 3.85, 4.3);
    s.addText(col.t, {
      x: x + 0.3, y: 2.25, w: 3.25, h: 0.4, fontFace: F.mono, fontSize: 12,
      color: col.c, charSpacing: 2,
    });
    s.addShape('rect', { x: x + 0.3, y: 2.7, w: 0.6, h: 0.03, fill: { color: col.c } });
    s.addText(col.lines.map((l) => ({ text: `—  ${l}`, options: { breakLine: true } })), {
      x: x + 0.3, y: 2.95, w: 3.3, h: 3.0, fontFace: F.sans, fontSize: 13,
      color: C.dim, lineSpacingMultiple: 1.45, valign: 'top',
    });
  });
  s.addText('The complaint itself is the city\u2019s most valuable signal — and it is being thrown away.', {
    x: 0.7, y: 6.5, w: 12, h: 0.45, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 17, color: C.fg, align: 'center',
  });
  footer(s, 'PROBLEM · GROUNDED IN THE DEMO STACK — NOT A MARKETING CLAIM');
  notes(s, 'Keep it to 30 seconds. The three panels map exactly to what the demo shows: citizen dashboard, officer queue, public ward map.');
}

// ══════════════════════════════════════════════════════════════
// 3 · SOLUTION
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'THE SOLUTION', 'One complaint → visible, AI-routed, verifiable resolution.');
  const steps = [
    { t: '1 · REPORT', c: C.blue, d: '3-step form: evidence, details, location. Map pin required — the form tells you if you miss it.' },
    { t: '2 · AI PIPELINE', c: C.lime, d: '8 agents triage live via SSE — classify, verify, dedupe, prioritise, route, escalate, score.' },
    { t: '3 · OFFICER ACTION', c: C.amber, d: 'Priority-sorted queue. Start work. Resolve with a closure photo.' },
    { t: '4 · VERIFICATION', c: C.purple, d: 'Verification Agent compares before/after — verified or needs review.' },
    { t: '5 · CLOSED LOOP', c: C.cyan, d: 'Citizen notified at every status change. Ward health score updates in real time.' },
  ];
  steps.forEach((st, i) => {
    const x = 0.7 + i * 2.47;
    panel(s, x, 2.0, 2.27, 4.1);
    s.addText(st.t, {
      x: x + 0.2, y: 2.25, w: 1.9, h: 0.7, fontFace: F.mono, fontSize: 10.5,
      color: st.c, charSpacing: 1, valign: 'top',
    });
    s.addText(st.d, {
      x: x + 0.2, y: 3.05, w: 1.9, h: 2.9, fontFace: F.sans, fontSize: 11,
      color: C.dim, lineSpacingMultiple: 1.35, valign: 'top',
    });
    if (i < steps.length - 1) {
      s.addText('→', {
        x: x + 2.27, y: 3.6, w: 0.2, h: 0.5, fontFace: F.sans, fontSize: 20,
        color: C.mute, align: 'center',
      });
    }
  });
  s.addText('Every step is visible to the citizen. Every decision has a reason. Every override is auditable.', {
    x: 0.7, y: 6.35, w: 12, h: 0.45, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 17, color: C.lime, align: 'center',
  });
  footer(s, 'SOLUTION · ALL FIVE STEPS ARE IN THE LIVE DEMO');
  notes(s, 'Walk the five panels left to right. This is the story arc of the 5-minute demo.');
}

// ══════════════════════════════════════════════════════════════
// 4 · WHY AGENTIC AI
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'WHY AI / AGENTIC ARCHITECTURE', 'Eight specialised agents, one pipeline — no black box.');
  const rows = [
    { t: 'One decision per agent', c: C.lime, d: 'Vision, fraud, dedup, priority, routing, escalation, analytics — each agent owns one decision instead of one monolithic classifier.' },
    { t: 'Explainable by construction', c: C.cyan, d: 'Every agent step is streamed live to the citizen; every priority score carries a written reason.' },
    { t: 'Spatial + temporal intelligence', c: C.blue, d: 'PostGIS 100-metre geo-radius duplicate detection and SLA-driven escalation are native to the pipeline.' },
    { t: 'Graceful degradation', c: C.amber, d: 'Gemini 2.5 Flash powers classification; a rule-based fallback completes the pipeline if the model API is unavailable.' },
  ];
  rows.forEach((r, i) => {
    const y = 2.0 + i * 1.22;
    panel(s, 0.7, y, 12, 1.05);
    s.addText(r.t, {
      x: 1.0, y: y + 0.12, w: 3.4, h: 0.8, fontFace: F.mono, fontSize: 12,
      color: r.c, charSpacing: 0.5, valign: 'middle',
    });
    s.addText(r.d, {
      x: 4.6, y: y + 0.12, w: 7.8, h: 0.8, fontFace: F.sans, fontSize: 12.5,
      color: C.dim, valign: 'middle', lineSpacingMultiple: 1.25,
    });
  });
  s.addText('Why not a single classifier? Because a judge should be able to ask "why" — and the answer is streamed live, agent by agent.', {
    x: 0.7, y: 6.35, w: 12, h: 0.45, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 16, color: C.fg, align: 'center',
  });
  footer(s, 'WHY AGENTIC · VERIFIED: 8-AGENT SEQUENTIAL DAG IN backend/app/agents/graph.py');
  notes(s, 'This is the "why AI" slide. The key phrase: explainable by construction — the pipeline streams its own reasoning.');
}

// ══════════════════════════════════════════════════════════════
// 5 · THE 8 AGENTS
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'THE PIPELINE', '8 primary agents — in stream order', '8 primary agents');
  const agents = [
    ['CX', 'Normalises the report into a clean record', C.blue],
    ['Vision', 'Classifies category & severity — from the photo when present', C.cyan],
    ['Trust & Fraud', 'Checks reporter reputation — spam is held for review', C.red],
    ['Dedup', 'Searches a 100 m geo-radius — duplicates merge', C.purple],
    ['Priority', 'Scores urgency 1–3 with a written reason', C.amber],
    ['Routing', 'Assigns the right department & least-loaded officer', C.lime],
    ['Escalation', 'Starts the SLA countdown — unresolved tickets escalate', C.red],
    ['Analytics', 'Updates the ward\u2019s Urban Health Score in real time', C.green],
  ];
  agents.forEach((a, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.7 + col * 3.1;
    const y = 2.0 + row * 1.55;
    panel(s, x, y, 2.9, 1.35);
    s.addText(`${String(i + 1).padStart(2, '0')}`, {
      x: x + 0.15, y: y + 0.08, w: 0.5, h: 0.3, fontFace: F.mono, fontSize: 9,
      color: C.mute,
    });
    s.addText(a[0], {
      x: x + 0.15, y: y + 0.32, w: 2.6, h: 0.35, fontFace: F.mono, fontSize: 12,
      color: a[2], charSpacing: 0.5,
    });
    s.addText(a[1], {
      x: x + 0.15, y: y + 0.68, w: 2.6, h: 0.6, fontFace: F.sans, fontSize: 9.5,
      color: C.dim, lineSpacingMultiple: 1.15, valign: 'top',
    });
  });
  panel(s, 0.7, 5.35, 12, 1.15, C.panel2);
  s.addText('+ SEPARATE VERIFICATION AGENT', {
    x: 1.0, y: 5.5, w: 4.2, h: 0.35, fontFace: F.mono, fontSize: 11,
    color: C.purple, charSpacing: 1,
  });
  s.addText('Not the ninth primary agent — a 2-agent resolution graph (verification → analytics) runs when an officer resolves a ticket with a closure photo: before/after comparison decides verified vs. needs review.', {
    x: 1.0, y: 5.85, w: 11.4, h: 0.6, fontFace: F.sans, fontSize: 11.5,
    color: C.dim, lineSpacingMultiple: 1.25, valign: 'top',
  });
  footer(s, 'AGENTS · 8 PRIMARY + SEPARATE VERIFICATION AGENT — NEVER SAY "9 AGENTS"');
  notes(s, 'Narrate the stream order as the demo runs. Explicitly call out: the Verification Agent is separate — 8 primary agents, not 9.');
}

// ══════════════════════════════════════════════════════════════
// 6 · ARCHITECTURE FLOW
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'ARCHITECTURE', 'From citizen signal to city intelligence');
  const boxes = [
    { t: 'CITIZEN', d: 'React + Vite\n3-step report form', c: C.blue, x: 0.7 },
    { t: 'FASTAPI', d: '18 routes · JWT guard\nPydantic v2', c: C.cyan, x: 2.85 },
    { t: 'LANGGRAPH', d: '8-agent triage DAG\nstreamed via SSE', c: C.lime, x: 5.0 },
    { t: 'SUPABASE', d: 'PostgreSQL + PostGIS\nAuth · Storage', c: C.purple, x: 7.15 },
    { t: 'OFFICER', d: 'Priority queue\nresolve w/ photo', c: C.amber, x: 9.3 },
    { t: 'VERIFY', d: 'Verification Agent\nbefore/after', c: C.red, x: 11.45 },
  ];
  boxes.forEach((b) => {
    panel(s, b.x, 2.1, 1.85, 1.5);
    s.addText(b.t, {
      x: b.x + 0.1, y: 2.22, w: 1.65, h: 0.35, fontFace: F.mono, fontSize: 10.5,
      color: b.c, align: 'center', charSpacing: 0.5,
    });
    s.addText(b.d, {
      x: b.x + 0.1, y: 2.6, w: 1.65, h: 0.9, fontFace: F.sans, fontSize: 8.5,
      color: C.dim, align: 'center', lineSpacingMultiple: 1.2, valign: 'top',
    });
  });
  for (let i = 0; i < boxes.length - 1; i++) {
    s.addText('→', {
      x: boxes[i].x + 1.85, y: 2.55, w: 0.3, h: 0.5, fontFace: F.sans,
      fontSize: 16, color: C.mute, align: 'center',
    });
  }
  s.addText('THE LIVE LOOP', {
    x: 0.7, y: 3.95, w: 12, h: 0.35, fontFace: F.mono, fontSize: 11,
    color: C.lime, charSpacing: 2,
  });
  const loop = [
    { t: 'POST /api/tickets', d: 'Citizen submits — ticket created, pipeline triggered', c: C.blue },
    { t: 'GET /api/tickets/{id}/process', d: 'SSE stream: 8 agent steps pushed live to the browser', c: C.lime },
    { t: 'PATCH /api/tickets/{id}/status', d: 'Officer: Start Work → in progress (staff-only)', c: C.amber },
    { t: 'POST /api/tickets/{id}/resolve', d: 'Closure photo → Verification Agent → verified / needs review', c: C.purple },
    { t: 'GET /api/notifications', d: 'Citizen notified at every status change', c: C.cyan },
    { t: 'GET /api/analytics/wards · city-pulse', d: 'Ward UHS + pulse alerts update as tickets move', c: C.green },
  ];
  loop.forEach((l, i) => {
    const y = 4.4 + i * 0.42;
    s.addText(`${l.t}`, {
      x: 0.9, y, w: 4.6, h: 0.35, fontFace: F.mono, fontSize: 9.5,
      color: l.c, valign: 'middle',
    });
    s.addText(l.d, {
      x: 5.7, y, w: 6.9, h: 0.35, fontFace: F.sans, fontSize: 10.5,
      color: C.dim, valign: 'middle',
    });
  });
  footer(s, 'ARCHITECTURE · ALL 18 ROUTES VERIFIED — SEE docs/API_MATRIX.md');
  notes(s, 'Top row: the data path. Bottom: the six API calls the demo actually makes. All verified in the API matrix.');
}

// ══════════════════════════════════════════════════════════════
// 7 · LIVE DEMO — 5 MINUTES
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'LIVE DEMO', '5 minutes — the verified journey');
  const rows = [
    ['0:00', 'Landing', '“A citizen spots a pothole. Today that report enters a black hole.”'],
    ['0:20', 'Google login (real Supabase auth)', '“Real authentication — every ticket is scoped to its citizen.”'],
    ['0:45', 'New report: skip photo → Water Leak → pin map → Submit', '“Three steps: evidence, details, location. The pin is required.”'],
    ['1:15', '8-agent SSE stream on /citizen/processing', 'Narrate each agent as it appears.'],
    ['2:15', '“AI Pipeline Complete” + real status', '“Eight agents, one pipeline, streamed live — no black box.”'],
    ['2:30', 'Report detail: timeline + priority reason', '“Priority score with a written reason.”'],
    ['3:00', 'Officer: queue → Start Work → Use Sample & Resolve', '“Closure photo triggers the Verification Agent.”'],
    ['4:00', 'Citizen notifications + dashboard', '“Notified at every status change — not just ‘ticket created’.”'],
    ['4:30', '/public-map as guest', '“Ward health scores and pulse alerts, no sign-up.”'],
    ['5:00', 'Close', '“Every decision streamed, every step visible, every override auditable.”'],
  ];
  const tableRows = rows.map((r, i) => [
    { text: r[0], options: { fontFace: F.mono, fontSize: 10, color: C.lime, align: 'center', valign: 'middle' } },
    { text: r[1], options: { fontFace: F.sans, fontSize: 10.5, color: C.fg, valign: 'middle' } },
    { text: r[2], options: { fontFace: F.sans, fontSize: 10, color: C.dim, valign: 'middle' } },
  ]);
  s.addTable(tableRows, {
    x: 0.7, y: 1.95, w: 12, colW: [1.1, 4.6, 6.3], rowH: 0.44,
    border: { type: 'solid', color: C.border, pt: 0.5 },
    fill: { color: C.panel }, margin: 0.08,
  });
  s.addText('Emergency route (2 min, no login): /public-map → /citizen/processing/7ab1d063… → /trace. Full script: docs/DEMO_SCRIPT.md', {
    x: 0.7, y: 6.55, w: 12, h: 0.4, fontFace: F.mono, fontSize: 9.5,
    color: C.mute, charSpacing: 0.5,
  });
  footer(s, 'DEMO · EVERY STEP VERIFIED ON THE LIVE STACK — SEE docs/DEMO_OPERATOR_RUNBOOK.md');
  notes(s, 'This is the rehearsal spine. Practice the timed run at least twice before the hackathon.');
}

// ══════════════════════════════════════════════════════════════
// 8 · CITIZEN & OFFICER LOOP
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'THE CLOSED LOOP', 'Citizen signal in — verified resolution out');
  const left = [
    { t: 'CITIZEN', c: C.blue, lines: ['3-step report with required map pin', 'Live SSE trace while the pipeline runs', 'Real status + priority reason', 'Notifications at every status change'] },
  ];
  const right = [
    { t: 'OFFICER', c: C.amber, lines: ['Priority-sorted queue (20 open in demo)', 'Start Work → in progress', 'Resolve with closure photo', 'Verification Agent: verified / needs review'] },
  ];
  [left, right].forEach((col, ci) => {
    const x = 0.7 + ci * 6.15;
    panel(s, x, 2.0, 5.85, 3.6);
    s.addText(col[0].t, {
      x: x + 0.3, y: 2.2, w: 5.2, h: 0.4, fontFace: F.mono, fontSize: 13,
      color: col[0].c, charSpacing: 2,
    });
    s.addText(col[0].lines.map((l) => ({ text: `—  ${l}`, options: { breakLine: true } })), {
      x: x + 0.3, y: 2.75, w: 5.3, h: 2.7, fontFace: F.sans, fontSize: 12.5,
      color: C.dim, lineSpacingMultiple: 1.4, valign: 'top',
    });
  });
  s.addText('↔', {
    x: 6.35, y: 3.3, w: 0.6, h: 0.8, fontFace: F.sans, fontSize: 30,
    color: C.lime, align: 'center',
  });
  s.addText('The loop closes: officer action is verified, the citizen is told, and the ward score moves.', {
    x: 0.7, y: 5.85, w: 12, h: 0.45, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 17, color: C.fg, align: 'center',
  });
  s.addText('Demo evidence: citizen dashboard shows 3 tickets; officer queue shows 20 open (reported + assigned + in_progress).', {
    x: 0.7, y: 6.4, w: 12, h: 0.4, fontFace: F.mono, fontSize: 9.5,
    color: C.mute, align: 'center',
  });
  footer(s, 'CLOSED LOOP · VERIFIED: docs/REHEARSAL_CHECKLIST.md STEPS 7–9');
  notes(s, 'The differentiator: this is not a ticket box — it is a closed verification loop with citizen visibility at every step.');
}

// ══════════════════════════════════════════════════════════════
// 9 · CITY INTELLIGENCE
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'CITY INTELLIGENCE', 'The Urban Health Score — wards that listen', 'Urban Health Score');
  const stats = [
    { v: '71.3', l: 'City Avg UHS', c: C.lime },
    { v: '3', l: 'wards scored', c: C.cyan },
    { v: '1', l: 'critical ward', c: C.red },
    { v: 'PULSE', l: 'alert on the public map', c: C.amber },
  ];
  stats.forEach((st, i) => {
    const x = 0.7 + i * 3.1;
    panel(s, x, 2.0, 2.9, 1.9);
    s.addText(st.v, {
      x: x + 0.2, y: 2.15, w: 2.5, h: 0.9, fontFace: F.serif, fontStyle: 'italic',
      fontSize: 40, color: st.c, align: 'center', valign: 'middle',
    });
    s.addText(st.l, {
      x: x + 0.2, y: 3.15, w: 2.5, h: 0.6, fontFace: F.mono, fontSize: 10,
      color: C.dim, align: 'center', charSpacing: 1, valign: 'top',
    });
  });
  s.addText('How it works', {
    x: 0.7, y: 4.2, w: 12, h: 0.35, fontFace: F.mono, fontSize: 11,
    color: C.lime, charSpacing: 2,
  });
  const how = [
    'The Analytics Agent updates each ward\u2019s score as tickets move through the pipeline.',
    'Ward scores, category trends and pulse alerts are served by /api/analytics/wards and /api/analytics/city-pulse.',
    'The public map renders the same aggregates — guest access, no sign-up required.',
  ];
  s.addText(how.map((l) => ({ text: `—  ${l}`, options: { breakLine: true } })), {
    x: 0.9, y: 4.65, w: 11.5, h: 1.6, fontFace: F.sans, fontSize: 13,
    color: C.dim, lineSpacingMultiple: 1.45, valign: 'top',
  });
  s.addText('Demo: /public-map as a guest — City Avg UHS 71.3, 3 wards, 1 critical, pulse alert. All real aggregates.', {
    x: 0.7, y: 6.45, w: 12, h: 0.4, fontFace: F.mono, fontSize: 9.5,
    color: C.mute, align: 'center',
  });
  footer(s, 'CITY INTELLIGENCE · VALUES VERIFIED ON THE LIVE PUBLIC MAP');
  notes(s, 'This is the "city intelligence" payoff slide. The numbers are exactly what the public map shows — do not add more.');
}

// ══════════════════════════════════════════════════════════════
// 10 · TECHNICAL STACK
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'TECHNICAL STACK', 'Built with the stack a real city would run');
  const cols = [
    { t: 'FRONTEND', c: C.blue, items: ['React 18 + Vite + TypeScript', 'Tailwind CSS · framer-motion', 'Leaflet maps · lucide-react', '27 pages · 7 role groups'] },
    { t: 'BACKEND', c: C.lime, items: ['FastAPI + Uvicorn', 'Pydantic v2 validation', 'LangGraph agent pipeline', 'SSE streaming · JWT guard', '18 routes · Alembic 002'] },
    { t: 'DATA & AUTH', c: C.purple, items: ['Supabase Cloud', 'PostgreSQL + PostGIS', 'Auth: Google OAuth / JWT', 'Storage: media uploads'] },
    { t: 'AI & INFRA', c: C.amber, items: ['Gemini 2.5 Flash', 'Rule-based fallback', 'Docker Compose · nginx', 'Health + readiness probes'] },
  ];
  cols.forEach((col, i) => {
    const x = 0.7 + i * 3.1;
    panel(s, x, 2.0, 2.9, 4.3);
    s.addText(col.t, {
      x: x + 0.25, y: 2.2, w: 2.4, h: 0.4, fontFace: F.mono, fontSize: 12,
      color: col.c, charSpacing: 1.5,
    });
    s.addShape('rect', { x: x + 0.25, y: 2.65, w: 0.6, h: 0.03, fill: { color: col.c } });
    s.addText(col.items.map((l) => ({ text: `—  ${l}`, options: { breakLine: true } })), {
      x: x + 0.25, y: 2.9, w: 2.45, h: 3.2, fontFace: F.sans, fontSize: 11.5,
      color: C.dim, lineSpacingMultiple: 1.4, valign: 'top',
    });
  });
  s.addText('Both containers run (healthy) on the demo stack — /api/health reports database, graphs, Supabase, Gemini and Twilio flags.', {
    x: 0.7, y: 6.5, w: 12, h: 0.4, fontFace: F.mono, fontSize: 9.5,
    color: C.mute, align: 'center',
  });
  footer(s, 'STACK · AS BUILT — NO UNVERIFIED COMPONENTS');
  notes(s, 'If asked "why Supabase": real auth + PostGIS in one managed service — right-sized for a hackathon prototype that behaves like production.');
}

// ══════════════════════════════════════════════════════════════
// 11 · SECURITY & AUTH
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'SECURITY & AUTH', 'Real authentication — no demo shortcuts');
  const rows = [
    { t: 'REAL AUTH', c: C.lime, d: 'Supabase Auth with Google login; JWT verified on every protected route. No dev bypass in the production build.' },
    { t: 'OWNERSHIP', c: C.cyan, d: 'GET /api/tickets/{id} returns 404 for another citizen\u2019s ticket; notifications are citizen-scoped.' },
    { t: 'STAFF-ONLY', c: C.amber, d: 'Status changes and resolution require a staff token (403 for citizens); officer queue is staff-only.' },
    { t: 'PUBLIC BY DESIGN', c: C.blue, d: '/public-map (guest ward health), /citizen/processing/<uuid> (shareable SSE trace — UUID-gated, no PII), /trace (dev console).' },
    { t: 'DEV-GATED', c: C.purple, d: '/api/demo/seed and ticket DELETE return 403 outside development.' },
    { t: 'NO SECRETS', c: C.red, d: 'Credentials live in environment configuration — nothing in the repository.' },
  ];
  rows.forEach((r, i) => {
    const y = 2.0 + i * 0.78;
    panel(s, 0.7, y, 12, 0.66);
    s.addText(r.t, {
      x: 1.0, y: y + 0.1, w: 2.6, h: 0.45, fontFace: F.mono, fontSize: 10.5,
      color: r.c, charSpacing: 0.5, valign: 'middle',
    });
    s.addText(r.d, {
      x: 3.8, y: y + 0.1, w: 8.6, h: 0.45, fontFace: F.sans, fontSize: 11,
      color: C.dim, valign: 'middle',
    });
  });
  s.addText('The SSE processing route is public by design — EventSource cannot send headers. It requires a ticket UUID and exposes no citizen PII; hardening is deferred post-hackathon.', {
    x: 0.7, y: 6.55, w: 12, h: 0.4, fontFace: F.mono, fontSize: 9,
    color: C.mute, align: 'center',
  });
  footer(s, 'SECURITY · VERIFIED: 17/17 IDENTITY TESTS · docs/RELEASE_TRUTH_MATRIX.md');
  notes(s, 'Anticipate the SSE question — answer it exactly as written: public by design, UUID-gated, no PII, hardening deferred.');
}

// ══════════════════════════════════════════════════════════════
// 12 · VERIFIED PROTOTYPE FACTS
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'PROTOTYPE FACTS', 'Measured, not claimed');
  const facts = [
    ['8', 'primary agents in the triage pipeline'],
    ['+1', 'separate Verification Agent (2-agent resolution graph)'],
    ['18', 'API routes (verified decorator scan)'],
    ['100 m', 'PostGIS dedup geo-radius'],
    ['22', 'demo tickets in the database'],
    ['20', 'officer-queue tickets = reported + assigned + in_progress'],
    ['3', 'citizen demo tickets (reported / in_progress / verified)'],
    ['71.3', 'City Avg UHS · 3 wards · 1 critical · pulse alert'],
    ['17/17', 'identity tests passing'],
    ['002', 'Alembic migration head'],
  ];
  const tableRows = facts.map((f) => [
    { text: f[0], options: { fontFace: F.mono, fontSize: 14, color: C.lime, align: 'center', valign: 'middle', bold: true } },
    { text: f[1], options: { fontFace: F.sans, fontSize: 11.5, color: C.dim, valign: 'middle' } },
  ]);
  s.addTable(tableRows, {
    x: 0.7, y: 1.95, w: 12, colW: [2.2, 9.8], rowH: 0.42,
    border: { type: 'solid', color: C.border, pt: 0.5 },
    fill: { color: C.panel }, margin: 0.08,
  });
  s.addText('Not measured: pipeline latency, resolution rates, user counts — we do not quote numbers that are not on screen.', {
    x: 0.7, y: 6.55, w: 12, h: 0.4, fontFace: F.mono, fontSize: 9.5,
    color: C.mute, align: 'center',
  });
  footer(s, 'FACTS · EVERY VALUE VERIFIED ON THE LIVE STACK — docs/RELEASE_TRUTH_MATRIX.md');
  notes(s, 'If a judge asks for a number, read it from this slide. If it is not here, say "we did not measure that".');
}

// ══════════════════════════════════════════════════════════════
// 13 · DIFFERENTIATION
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'DIFFERENTIATION', 'Not a complaint app — a city system');
  const diffs = [
    { t: '01 · LIVE MULTI-AGENT PIPELINE', c: C.lime, d: 'Not a ticket box. 8 specialised agents (vision, fraud, dedup, priority, routing, escalation, analytics) run in a LangGraph DAG and stream every step to the citizen via SSE.' },
    { t: '02 · SPATIAL INTELLIGENCE', c: C.cyan, d: 'PostGIS geo-radius duplicate detection and ward-level Urban Health Score that updates as tickets move — the complaint becomes a city-health signal.' },
    { t: '03 · CLOSED VERIFICATION LOOP', c: C.purple, d: 'Officer closure photos are checked by a Verification Agent (before/after), and the citizen is notified at every status change — not just "ticket created".' },
  ];
  diffs.forEach((d, i) => {
    const y = 2.0 + i * 1.5;
    panel(s, 0.7, y, 12, 1.32);
    s.addText(d.t, {
      x: 1.0, y: y + 0.14, w: 5.2, h: 0.4, fontFace: F.mono, fontSize: 12.5,
      color: d.c, charSpacing: 0.5,
    });
    s.addText(d.d, {
      x: 1.0, y: y + 0.55, w: 11.4, h: 0.7, fontFace: F.sans, fontSize: 12,
      color: C.dim, lineSpacingMultiple: 1.3, valign: 'top',
    });
  });
  s.addText('Every one of these is visible in the 5-minute demo — not a slide promise.', {
    x: 0.7, y: 6.6, w: 12, h: 0.4, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 16, color: C.fg, align: 'center',
  });
  footer(s, 'DIFFERENTIATION · ALL THREE DEMONSTRATED LIVE');
  notes(s, 'The three differentiators map to demo moments: SSE stream, dedup + UHS, verification + notifications.');
}

// ══════════════════════════════════════════════════════════════
// 14 · IMPACT & SCALE VISION (FUTURE)
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  header(s, 'IMPACT & SCALE', 'Where this prototype goes next');
  s.addShape('roundRect', {
    x: 0.7, y: 1.85, w: 12, h: 0.5, rectRadius: 0.08,
    fill: { color: C.amber, transparency: 87 }, line: { color: C.amber, width: 1 },
  });
  s.addText('FUTURE VISION — NOT BUILT, NOT CLAIMED. ROADMAP DIRECTION ONLY.', {
    x: 0.7, y: 1.93, w: 12, h: 0.35, fontFace: F.mono, fontSize: 11,
    color: C.amber, align: 'center', charSpacing: 2,
  });
  const items = [
    { t: 'SCALE', c: C.lime, d: 'Multi-city deployment with per-city ward models and regional escalation networks.' },
    { t: 'PREDICT', c: C.cyan, d: 'UHS time-series to forecast ward-level infrastructure failure before complaints spike.' },
    { t: 'PARTICIPATE', c: C.blue, d: 'Verified-resolution reputation and community verification of closures.' },
    { t: 'OPEN DATA', c: C.purple, d: 'Anonymised city-health API for researchers and civic startups.' },
  ];
  items.forEach((it, i) => {
    const x = 0.7 + i * 3.1;
    panel(s, x, 2.6, 2.9, 2.6);
    s.addText(it.t, {
      x: x + 0.2, y: 2.8, w: 2.5, h: 0.4, fontFace: F.mono, fontSize: 12,
      color: it.c, charSpacing: 1.5,
    });
    s.addText(it.d, {
      x: x + 0.2, y: 3.3, w: 2.5, h: 1.8, fontFace: F.sans, fontSize: 11,
      color: C.dim, lineSpacingMultiple: 1.35, valign: 'top',
    });
  });
  s.addText('Post-hackathon hardening backlog (deferred, documented): rate limiting · upload MIME validation · background job queue for SSE · structured logging · gated /docs.', {
    x: 0.7, y: 5.5, w: 12, h: 0.8, fontFace: F.sans, fontSize: 11.5,
    color: C.mute, lineSpacingMultiple: 1.3, align: 'center',
  });
  footer(s, 'VISION · CLEARLY MARKED AS FUTURE — NEVER PRESENT AS BUILT');
  notes(s, 'Say the words "future vision" out loud. Judges respect scope honesty — this slide is why.');
}

// ══════════════════════════════════════════════════════════════
// 15 · FINAL ASK / CLOSING
// ══════════════════════════════════════════════════════════════
{
  const s = newSlide();
  s.addShape('rect', { x: 0, y: 7.41, w: W, h: 0.09, fill: { color: C.lime } });
  s.addText('◆ CLOSING', {
    x: 0.9, y: 1.1, w: 11.5, h: 0.35, fontFace: F.mono, fontSize: 11,
    color: C.mute, charSpacing: 2,
  });
  s.addText('A city that listens —', {
    x: 0.9, y: 1.55, w: 11.5, h: 0.9, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 44, color: C.fg, valign: 'top',
  });
  s.addText('and answers back.', {
    x: 0.9, y: 2.45, w: 11.5, h: 0.9, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 44, color: C.lime, valign: 'top',
  });
  s.addText('Eight agents triage every complaint live. Officers act on a priority-sorted queue. Verification closes the loop. The ward\u2019s health score moves in real time.', {
    x: 0.9, y: 3.6, w: 10.8, h: 1.2, fontFace: F.sans, fontSize: 15,
    color: C.dim, lineSpacingMultiple: 1.4, valign: 'top',
  });
  s.addText('THE ASK', {
    x: 0.9, y: 5.0, w: 11.5, h: 0.35, fontFace: F.mono, fontSize: 11,
    color: C.cyan, charSpacing: 2,
  });
  s.addText('“We\u2019d love to pilot UrbanPulse with a municipal ward — and turn today\u2019s demo into a city\u2019s first visible resolution.”', {
    x: 0.9, y: 5.4, w: 11.5, h: 0.9, fontFace: F.serif, fontStyle: 'italic',
    fontSize: 20, color: C.fg, lineSpacingMultiple: 1.25, valign: 'top',
  });
  s.addText('URBANPULSE AI · VERIFIED PROTOTYPE · frontend 63b4538 / backend 806dc7a · docs/DEMO_SCRIPT.md', {
    x: 0.9, y: 6.6, w: 11.5, h: 0.35, fontFace: F.mono, fontSize: 9.5,
    color: C.mute, charSpacing: 1,
  });
  footer(s, 'THANK YOU — QUESTIONS?');
  notes(s, 'End on the ask. Then: "Every decision streamed, every step visible, every override auditable."');
}

// ───── Write ─────
await pptx.writeFile({ fileName: PPTX_PATH });
console.log(`Deck written: ${PPTX_PATH}`);