import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

const OUT = '/media/vijay/VIP FILES/UrbanPulse/presentation';
const POLISHED = path.join(OUT, 'polished');
const PPTX_PATH = path.join(OUT, 'UrbanPulse_AI_Presentation_v1.pptx');

// ───── Design Tokens ─────
const C = {
  bg:        '0D0D0D',
  lime:      'C6F135',
  fg:        'F2F2F2',
  dim:       'A3ADBB',
  mute:      '6B7280',
  b2:        '161B22',
  border:    '2D2D2D',
  blue:      '3B82F6',
  amber:     'F59E0B',
  purple:    '8B5CF6',
  red:       'EF4444',
  cyan:      '22D3EE',
};
const W = 13.333;
const H = 7.5;

function hex6(c) { return c; }
function fillH(c, a) { return { color: c, transparency: Math.round((1 - a) * 100) }; }
function lineH(c, a, w) { return { color: c, width: w || 0.5, transparency: Math.round((1 - a) * 100) }; }
function hex(c, a=1) { return c; }

// ───── Helpers ─────
function bg(s, color=C.bg) {
  s.background = { fill: color };
}

function footerBar(s, label) {
  s.addShape('rect', { x: 0, y: 7.1, w: W, h: 0.01, fill: { color: C.border } });
  s.addText(label, { x: 0.7, y: 7.2, w: 12, h: 0.25, fontFace: 'JetBrains Mono', fontSize: 9, color: C.mute, letterSpacing: 0.16 });
}

function slideHeader(s, eyebrow, num, total) {
  s.addText(`◆ ${eyebrow}`, { x: 0.7, y: 0.45, w: 8, h: 0.3, fontFace: 'JetBrains Mono', fontSize: 9, color: C.mute, letterSpacing: 0.2 });
  s.addText(`${num} / ${total}`, { x: 12.3, y: 0.45, w: 0.8, h: 0.3, fontFace: 'Inter', fontSize: 10, color: C.mute, align: 'right' });
}

function serifTitle(s, text, limePart=null, y=1.05, size=48, w=12) {
  const opts = { x: 0.7, y, w, h: 1.2, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: size, color: C.fg, letterSpacing: -0.02, lineSpacingMultiple: 0.9 };
  if (limePart) {
    const idx = text.indexOf(limePart);
    const before = text.slice(0, idx);
    const after = text.slice(idx + limePart.length);
    s.addText([
      { text: before, options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: size, color: C.fg } },
      { text: limePart, options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: size, color: C.lime } },
      { text: after, options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: size, color: C.fg } },
    ], { x: 0.7, y, w, h: 1.2, letterSpacing: -0.02, lineSpacingMultiple: 0.9, align: 'left', valign: 'top' });
  } else {
    s.addText(text, opts);
  }
}

function subtitle(s, text, y=2.8, w=11) {
  s.addText(text, { x: 0.7, y, w, h: 0.8, fontFace: 'Inter', fontSize: 14, color: C.dim, lineSpacingMultiple: 1.4, align: 'left', valign: 'top' });
}

function card(s, x, y, w, h, fillColor=C.b2, borderColor=C.border) {
  s.addShape('roundRect', { x, y, w, h, fill: { color: fillColor }, line: { color: borderColor, width: 0.5 }, rectRadius: 6/72 });
}

function iconBox(s, x, y, size, bgColor, borderColor, iconChar) {
  s.addShape('roundRect', { x, y, w: size, h: size, fill: { color: bgColor }, line: { color: borderColor, width: 0.5 }, rectRadius: size*0.22 });
  s.addText(iconChar, { x, y, w: size, h: size, align: 'center', valign: 'middle', fontFace: 'Inter', fontSize: size*0.45, color: borderColor });
}

function chip(s, x, y, text, bg, border, color=C.fg, size=10) {
  s.addShape('roundRect', { x, y, w: text.length * size * 0.45 + 24/72, h: size*2.6/12, fill: { color: bg }, line: { color: border, width: 0.5 }, rectRadius: 3/72 });
  s.addText(text, { x, y, w: text.length * size * 0.45 + 24/72, h: size*2.6/12, fontFace: 'JetBrains Mono', fontSize: size, color, align: 'center', valign: 'middle' });
}

function pill(s, x, y, text, bg='1B2028', borderColor=C.border, dotColor=C.red) {
  s.addShape('roundRect', { x, y, w: text.length * 5 + 36/72, h: text.length > 20 ? 0.5 : 0.32, fill: { color: bg }, line: { color: borderColor, width: 0.5 }, rectRadius: 4/72 });
  s.addShape('oval', { x: x+0.1, y: y+0.1, w: 0.12, h: 0.12, fill: { color: dotColor } });
  s.addText(text, { x: x+0.28, y, w: text.length * 5 + 10/72, h: 0.32, fontFace: 'JetBrains Mono', fontSize: 8, color: C.dim, align: 'left', valign: 'middle' });
}

function gridOverlay(s) {
  for (let i = 0; i < 12; i++) {
    s.addShape('line', { x: 0, y: i * 0.625 + 0.2, w: W, h: 0, line: { color: 'FFFFFF', width: 0.2, dashType: 'dash' } });
  }
}

// ──── Generate ────
const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'WIDE', width: W, height: H });
pptx.layout = 'WIDE';
pptx.author = 'Vijay Barhate & Vedant Saikhede';
pptx.title = 'UrbanPulse AI — Agentic Urban Intelligence Platform';

// ════════════ SLIDE 1: COVER ════════════
(function() {
  const s = pptx.addSlide(); bg(s);
  s.addShape('rect', { x: 0, y: 0, w: W, h: H, fill: { color: '000000', transparency: 15 } });
  s.addShape('oval', { x: -1.5, y: 1.5, w: 6, h: 6, fill: { color: C.lime, transparency: 82 } });
  // brand lockup
  s.addShape('roundRect', { x: 0.7, y: 0.55, w: 0.4, h: 0.4, fill: { color: C.lime }, rectRadius: 0.08 });
  s.addText('⬡', { x: 0.7, y: 0.55, w: 0.4, h: 0.4, align: 'center', valign: 'middle', fontFace: 'Inter', fontSize: 18, color: C.bg });
  s.addText('UrbanPulse', { x: 1.2, y: 0.55, w: 3, h: 0.25, fontFace: 'Inter', fontSize: 16, color: C.fg, bold: true });
  s.addText('AI', { x: 2.7, y: 0.55, w: 0.5, h: 0.25, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 14, color: C.lime });
  s.addText('CIVIC · TRIAGE · INFRASTRUCTURE', { x: 1.2, y: 0.82, w: 3, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.mute });
  // hackathon pill
  pill(s, 10.5, 0.6, 'LENOVO LEAP · AICTE HACKATHON 2.0');
  // eyebrow
  s.addText('◆ AGENTIC URBAN INTELLIGENCE PLATFORM · 2026', { x: 0.7, y: 2.8, w: 8, h: 0.25, fontFace: 'JetBrains Mono', fontSize: 9, color: C.dim, letterSpacing: 0.2 });
  // title
  s.addText([
    { text: 'Urban', options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 72, color: C.fg } },
    { text: 'Pulse', options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 72, color: C.lime } },
    { text: ' AI', options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 72, color: C.fg } },
  ], { x: 0.7, y: 3.1, w: 12, h: 1.1, letterSpacing: -0.03, align: 'left', valign: 'top' });
  // divider
  s.addShape('rect', { x: 0.7, y: 5.35, w: 0.6, h: 0.02, fill: { color: C.lime } });
  // subtitle
  s.addText('AI-powered civic issue reporting, intelligent routing,\nautomated prioritization & real-time city analytics.', {
    x: 0.7, y: 5.55, w: 9, h: 0.6, fontFace: 'Inter', fontSize: 18, color: 'E5E7EB', lineSpacingMultiple: 1.2 });
  // stat card 1
  card(s, 9.0, 5.2, 1.8, 1.4, C.b2, hex(C.lime, 0.3));
  s.addText('AI AGENTS', { x: 9.15, y: 5.35, w: 1.5, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.2 });
  s.addText('8', { x: 9.15, y: 5.5, w: 1, h: 0.55, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 42, color: C.fg });
  s.addText('LangGraph DAG', { x: 9.15, y: 6.15, w: 1.5, h: 0.15, fontFace: 'Inter', fontSize: 9, color: C.dim });
  // stat card 2
  card(s, 10.95, 5.2, 2, 1.4, C.b2, C.border);
  s.addText('TRIAGE TIME', { x: 11.1, y: 5.35, w: 1.7, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.2 });
  s.addText('12', { x: 11.1, y: 5.5, w: 0.6, h: 0.55, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 42, color: C.fg });
  s.addText('s', { x: 11.55, y: 5.55, w: 0.3, h: 0.4, fontFace: 'Inter', fontSize: 18, color: C.dim });
  s.addText('Report → Officer', { x: 11.1, y: 6.15, w: 1.7, h: 0.15, fontFace: 'Inter', fontSize: 9, color: C.dim });
  // footer
  footerBar(s, '◆ VIJAY BARHATE  ·  VEDANT SAIKHEDE  ·  JULY 2026    SMART CITIES · PUBLIC SERVICES');
})();

// ════════════ SLIDE 2: PROBLEM ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '01 / PROBLEM STATEMENT', '02', '15');
  serifTitle(s, 'Civic complaints vanish into black holes.', 'into black holes.', 0.9, 46);
  subtitle(s, 'Every day, municipal corporations receive thousands of reports on potholes, water leaks, garbage, and streetlight failures — routed manually, prioritized by whoever shouts loudest, and resolved without accountability.', 2.7);

  const cards = [
    { x: 0.7, icon: '👤', bg: hex(C.blue,0.15), border: hex(C.blue,0.4), label: 'FOR CITIZENS', title: 'No channel.\nNo status. No trust.', desc: 'Phone calls, WhatsApp, in-person visits — reports enter a void with no acknowledgement or ETA.', labelColor: C.blue },
    { x: 3.75, icon: '🛡️', bg: hex(C.amber,0.15), border: hex(C.amber,0.4), label: 'FOR OFFICERS', title: 'Manual triage.\nNo priority.', desc: 'Every complaint arrives with equal urgency. Hours lost on triage that should be spent on repairs.', labelColor: C.amber },
    { x: 6.8, icon: '📊', bg: hex(C.purple,0.15), border: hex(C.purple,0.4), label: 'FOR ADMINS', title: 'Zero city-wide\nvisibility.', desc: 'No health score, no trending issues, no data-driven resource allocation. Only headlines.', labelColor: C.purple },
    { x: 9.85, icon: '⚠️', bg: hex(C.red,0.06), border: hex(C.red,0.3), label: 'EXISTING SYSTEMS', title: 'Glorified\nCRUD forms.', desc: 'FixMyStreet-style apps are complaint boxes — no AI, no routing, no analytics, no accountability.', labelColor: C.red },
  ];
  cards.forEach(c => {
    card(s, c.x, 4.2, 2.8, 2.4);
    s.addShape('roundRect', { x: c.x+0.2, y: 4.4, w: 0.35, h: 0.35, fill: { color: c.bg }, line: { color: c.border, width: 0.5 }, rectRadius: 0.06 });
    s.addText(c.icon, { x: c.x+0.2, y: 4.4, w: 0.35, h: 0.35, align: 'center', valign: 'middle', fontFace: 'Inter', fontSize: 16 });
    s.addText(c.label, { x: c.x+0.65, y: 4.4, w: 1.8, h: 0.2, fontFace: 'JetBrains Mono', fontSize: 7, color: c.labelColor, letterSpacing: 0.15 });
    s.addText(c.title, { x: c.x+0.2, y: 4.9, w: 2.4, h: 0.65, fontFace: 'Inter', fontSize: 16, color: C.fg, bold: true, lineSpacingMultiple: 1.1, valign: 'top' });
    s.addText(c.desc, { x: c.x+0.2, y: 5.6, w: 2.4, h: 0.8, fontFace: 'Inter', fontSize: 10, color: C.dim, valign: 'top', lineSpacingMultiple: 1.4 });
  });
  footerBar(s, 'URBANPULSE AI · PROBLEM SPACE — MUNICIPAL INFRASTRUCTURE REPORTING');
})();

// ════════════ SLIDE 3: COMPARISON ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '02 / MARKET POSITIONING', '03', '15');
  serifTitle(s, 'Not another complaint app. A triage platform.', 'triage platform.', 0.9, 42);
  // column headers
  card(s, 0.7, 3.0, 11.9, 0.45, '050505', C.border);
  s.addText('CAPABILITY', { x: 0.9, y: 3.05, w: 2, h: 0.35, fontFace: 'JetBrains Mono', fontSize: 8, color: C.mute, letterSpacing: 0.2, valign: 'middle' });
  card(s, 4.5, 3.0, 3.8, 0.45, '080808', C.border);
  s.addText('EXISTING SOLUTIONS', { x: 4.6, y: 3.02, w: 3.5, h: 0.18, fontFace: 'JetBrains Mono', fontSize: 7, color: C.mute, letterSpacing: 0.2, valign: 'middle' });
  s.addText('FixMyStreet · IChangeMyCity · WhatsApp bots', { x: 4.6, y: 3.2, w: 3.5, h: 0.18, fontFace: 'Inter', fontSize: 8, color: C.dim, valign: 'middle' });
  card(s, 8.45, 3.0, 4.15, 0.45, hex(C.lime,0.12), hex(C.lime,0.4));
  s.addText('◆ URBANPULSE AI', { x: 8.55, y: 3.02, w: 3.8, h: 0.18, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.2, valign: 'middle' });
  s.addText('Agentic triage & routing platform', { x: 8.55, y: 3.2, w: 3.8, h: 0.18, fontFace: 'Inter', fontSize: 8, color: C.fg, bold: true, valign: 'middle' });

  const rows = [
    ['Report routing',            '✕  Manual dispatcher',                                    '✓  AI routing agent · category → department rules'],
    ['Prioritization',            '✕  First-come, first-served',                              '✓  Severity scoring · category + location + text NLP'],
    ['Duplicate detection',       '✕  None — every submission a new ticket',                  '✓  PostGIS 50m radius + semantic embedding match'],
    ['Live transparency',         '✕  Black-box — no status updates',                         '✓  Real-time SSE agent trace visible to citizens'],
    ['Analytics & scoring',       '✕  Basic ticket counts',                                   '✓  Urban Health Score (0–100) · pulse alerts · UHS/ward'],
    ['AI architecture',           '✕  None — keyword filters at most',                        '✓  8-agent LangGraph DAG · Gemini vision + reasoning'],
  ];
  rows.forEach((r, i) => {
    const y = 3.6 + i * 0.48;
    s.addText(r[0], { x: 0.9, y, w: 3.5, h: 0.4, fontFace: 'Inter', fontSize: 12, color: C.fg, bold: true, valign: 'middle' });
    s.addText(r[1], { x: 4.6, y, w: 3.5, h: 0.4, fontFace: 'Inter', fontSize: 10, color: C.dim, valign: 'middle' });
    s.addText(r[2], { x: 8.55, y, w: 3.7, h: 0.4, fontFace: 'Inter', fontSize: 10, color: C.fg, valign: 'middle' });
    if (i < rows.length - 1) {
      s.addShape('rect', { x: 0.9, y: y + 0.42, w: 11.5, h: 0.005, fill: { color: C.border } });
    }
  });
  // bottom callout
  const cy = 6.5;
  card(s, 0.7, cy, 11.9, 0.5, hex(C.lime,0.06), hex(C.lime,0.25));
  s.addText([
    { text: '◆ THE SHIFT  ', options: { fontFace: 'JetBrains Mono', fontSize: 8, color: C.lime, letterSpacing: 0.2 } },
    { text: 'From a complaint box to an ', options: { fontFace: 'Inter', fontSize: 12, color: C.fg } },
    { text: 'autonomous triage engine', options: { fontFace: 'Inter', fontSize: 12, color: C.lime, bold: true } },
    { text: ' — the same jump CRMs made a decade ago.', options: { fontFace: 'Inter', fontSize: 12, color: C.fg } },
  ], { x: 0.9, y: cy, w: 11.5, h: 0.5, align: 'left', valign: 'middle' });
  footerBar(s, 'URBANPULSE AI · CATEGORY COMPARISON');
})();

// ════════════ SLIDE 4: SOLUTION ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '03 / SOLUTION OVERVIEW', '04', '15');
  serifTitle(s, 'One report. Eight agents. Zero black boxes.', 'Eight agents.', 0.9, 42);
  // 5 flow nodes
  const nodes = [
    { x: 0.7, color: C.blue, label: 'STEP 01', title: 'Citizen', desc: 'Photo · voice · GPS pin · text\n— any language' },
    { x: 3.1, color: C.lime, label: 'STEP 02 · ~12s', title: '8 AI Agents', desc: 'LangGraph DAG — verify,\ndedup, prioritize, route' },
    { x: 5.7, color: C.amber, label: 'STEP 03', title: 'Officer', desc: 'Filtered queue — resolve\nwith closure photo' },
    { x: 8.1, color: C.purple, label: 'STEP 04', title: 'Verification', desc: 'Auto-QA of closure photo\nvs. original' },
    { x: 10.4, color: C.lime, label: 'STEP 05', title: 'City Health ↑', desc: 'UHS updated · heatmaps\n· pulse alerts' },
  ];
  nodes.forEach((n, i) => {
    card(s, n.x, 3.1, 2.2, 2.0);
    s.addShape('roundRect', { x: n.x + 0.7, y: 3.3, w: 0.7, h: 0.55, fill: fillH(n.color, 0.2), line: lineH(n.color, 0.5, 0.5), rectRadius: 0.12 });
    s.addText(i+1, { x: n.x + 0.7, y: 3.3, w: 0.7, h: 0.55, align: 'center', valign: 'middle', fontFace: 'Inter', fontSize: 22, color: n.color });
    s.addText(n.label, { x: n.x + 0.15, y: 4.0, w: 2.0, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: n.color, letterSpacing: 0.15, align: 'center' });
    s.addText(n.title, { x: n.x + 0.15, y: 4.15, w: 2.0, h: 0.35, fontFace: 'Inter', fontSize: 15, color: C.fg, bold: true, align: 'center', valign: 'middle' });
    s.addText(n.desc, { x: n.x + 0.15, y: 4.5, w: 2.0, h: 0.5, fontFace: 'Inter', fontSize: 9, color: C.dim, align: 'center', valign: 'top', lineSpacingMultiple: 1.3 });
    // arrows between nodes
    if (i < nodes.length - 1) {
      s.addShape('line', { x: n.x + 2.2, y: 4.1, w: 0.7, h: 0, line: lineH(C.lime, 0.4, 1.2) });
      s.addShape('line', { x: n.x + 2.85, y: 4.05, w: 0.15, h: 0.1, line: lineH(C.lime, 0.5, 1.5) }); // arrow tip
    }
  });
  // 3 bottom KPI cards
  const kpis = [
    { x: 0.7, label: 'MULTI-MODAL INPUT', title: 'Photo · voice · GPS · text in any\nlanguage — CX agent normalizes it.' },
    { x: 4.8, label: 'ROLE-BASED DASHBOARDS', title: 'Citizen · Officer · Dept · Head · Admin\n· Super Admin — six curated views.' },
    { x: 8.9, label: '◆ LIVE SSE TRACE', title: 'Every AI decision streamed in real\ntime — no black boxes for anyone.' },
  ];
  kpis.forEach(k => {
    card(s, k.x, 5.5, 3.8, 1.2, C.b2, C.border);
    s.addText(k.label, { x: k.x+0.2, y: 5.6, w: 3.4, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.15 });
    s.addText(k.title, { x: k.x+0.2, y: 5.8, w: 3.4, h: 0.7, fontFace: 'Inter', fontSize: 13, color: C.fg, lineSpacingMultiple: 1.2, valign: 'top' });
  });
  footerBar(s, 'URBANPULSE AI · END-TO-END TRIAGE FLOW');
})();

// ════════════ SLIDE 5: ARCHITECTURE ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '04 / SYSTEM ARCHITECTURE', '05', '15');
  serifTitle(s, 'End-to-end. From citizen to resolution.', undefined, 0.9, 38);

  // Architecture flow — vertical left-to-right with layers
  const layers = [
    { label: '01 · CLIENT', color: C.blue, items: ['React 19 + TypeScript', 'Tailwind CSS', 'Leaflet Maps', 'SSE / EventSource', 'Vite'] },
    { label: '02 · API GATEWAY', color: C.lime, items: ['Python 3.11 · FastAPI', 'Uvicorn async workers', 'REST + SSE endpoints', 'Pydantic v2 validation'] },
    { label: '03 · AI CORE', color: C.cyan, items: ['LangGraph orchestration', 'Google Gemini vision + reasoning', '8 specialized agents', 'Semantic embeddings'] },
    { label: '04 · DATA', color: C.purple, items: ['PostgreSQL 15', 'PostGIS · ST_DWithin', 'Supabase Auth + Storage', 'Realtime subscriptions'] },
    { label: '05 · INFRA', color: C.amber, items: ['Docker · Compose', 'nginx reverse proxy', 'Gemini API', 'Twilio WhatsApp (roadmap)'] },
  ];

  // Draw vertical stack with connection arrows
  const startX = 1.0;
  const boxW = 11.0;
  const startY = 2.4;
  const rowH = 0.78;
  const arrowH = 0.2;

  layers.forEach((layer, i) => {
    const y = startY + i * (rowH + arrowH);
    // layer label
    s.addText(layer.label, { x: 0.5, y: y + 0.05, w: 1.3, h: 0.35, fontFace: 'JetBrains Mono', fontSize: 8, color: C.lime, letterSpacing: 0.1, valign: 'middle' });
    s.addText(layer.items[0], { x: 0.5, y: y + 0.35, w: 1.3, h: 0.35, fontFace: 'Inter', fontSize: 7, color: C.dim, valign: 'top', lineSpacingMultiple: 1.2 });
    // box
    card(s, startX, y, boxW, rowH, hex(layer.color, 0.08), hex(layer.color, 0.35));
    // chips
    layer.items.forEach((item, j) => {
      const cx = startX + 0.2 + j * 2.1;
      chip(s, cx, y + 0.15, item, hex(layer.color, 0.15), hex(layer.color, 0.5), i === 0 ? '93C5FD' : i === 1 ? 'E4F8A0' : i === 2 ? 'A5F3FC' : i === 3 ? 'C4B5FD' : 'FDE68A', 9);
    });
    // arrow
    if (i < layers.length - 1) {
      s.addShape('line', { x: 6.5, y: y + rowH, w: 0, h: arrowH, line: lineH(C.lime, 0.5, 1) });
      s.addText('↕', { x: 6.3, y: y + rowH - 0.1, w: 0.4, h: arrowH + 0.2, align: 'center', valign: 'middle', fontFace: 'Inter', fontSize: 10, color: C.lime });
    }
  });

  // right side: flow annotation
  s.addShape('roundRect', { x: 0.7, y: 6.55, w: 11.9, h: 0.4, fill: fillH(C.lime, 0.06), line: lineH(C.lime, 0.25, 0.5), rectRadius: 4/72 });
  const flowText = ['📱 Citizen Report', '→', '⚡ FastAPI', '→', '🧠 LangGraph DAG', '→', '🗄️ PostGIS', '→', '📊 Dashboards'];
  s.addText(flowText.join('  '), { x: 0.9, y: 6.55, w: 11.5, h: 0.4, align: 'center', valign: 'middle', fontFace: 'JetBrains Mono', fontSize: 11, color: C.dim });

  footerBar(s, 'URBANPULSE AI · LAYERED SYSTEM DIAGRAM');
})();

// ════════════ SLIDE 6: AI PIPELINE ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '05 / HERO SLIDE · LANGGRAPH DAG', '06', '15');
  serifTitle(s, 'Eight agents. One directed graph.', 'Eight agents.', 0.9, 38);
  subtitle(s, 'Independent nodes run in parallel; a Priority + Routing chain gates the middle; three finalization agents fan out. Every step streams its reasoning over Server-Sent Events.', 2.5, 10);
  // time pill
  pill(s, 10.5, 2.5, '~12s END-TO-END', hex(C.lime, 0.12), hex(C.lime, 0.4), C.lime);

  // INPUT box
  card(s, 0.7, 3.5, 1.6, 2.2, C.b2, C.border);
  s.addShape('rect', { x: 0.7, y: 3.5, w: 1.6, h: 2.2, line: { color: C.dim, width: 0.5, dashType: 'dash' } });
  s.addText('INPUT', { x: 0.85, y: 3.6, w: 1.3, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.mute, letterSpacing: 0.15 });
  s.addText('Citizen\nReport', { x: 0.85, y: 3.85, w: 1.3, h: 0.5, fontFace: 'Inter', fontSize: 13, color: C.fg, bold: true, lineSpacingMultiple: 1.1 });
  s.addText('· Photo\n· Voice note\n· Description\n· GPS pin', { x: 0.85, y: 4.35, w: 1.3, h: 1.1, fontFace: 'Inter', fontSize: 9, color: C.dim, lineSpacingMultiple: 1.3 });

  // Arrow from input
  s.addShape('line', { x: 2.3, y: 4.6, w: 0.5, h: 0, line: lineH(C.lime, 0.6, 1.2) });

  // label
  s.addText('▲ 4 · PARALLEL', { x: 2.9, y: 3.1, w: 2.5, h: 0.2, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.15 });

  // 4 parallel agents
  const agents1 = [
    { x: 2.9, y: 3.5, num: '01', name: 'CX Agent', desc: 'Normalize language,\ntranslate, detect intent', color: C.lime },
    { x: 2.9, y: 4.8, num: '02', name: 'Vision', desc: 'Gemini damage\nassessment from photo', color: C.lime },
    { x: 4.65, y: 3.5, num: '03', name: 'Trust & Fraud', desc: 'Detect spam signals\n+ reputation score', color: C.lime },
    { x: 4.65, y: 4.8, num: '04', name: 'Deduplication', desc: 'PostGIS 50m +\nsemantic embed match', color: C.cyan },
  ];
  agents1.forEach(a => {
    card(s, a.x, a.y, 1.6, 1.15, hex(a.color, 0.08), hex(a.color, 0.4));
    s.addText(a.num, { x: a.x+0.08, y: a.y+0.05, w: 0.3, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: a.color, letterSpacing: 0.1 });
    s.addText(a.name, { x: a.x+0.08, y: a.y+0.3, w: 1.4, h: 0.25, fontFace: 'Inter', fontSize: 11, color: C.fg, bold: true });
    s.addText(a.desc, { x: a.x+0.08, y: a.y+0.6, w: 1.4, h: 0.5, fontFace: 'Inter', fontSize: 8, color: C.dim, lineSpacingMultiple: 1.2 });
  });

  // arrow to middle
  s.addShape('line', { x: 6.25, y: 4.6, w: 0.5, h: 0, line: lineH(C.amber, 0.6, 1.2) });

  // middle: Priority + Routing
  s.addText('▲ 2 · GATED', { x: 6.9, y: 3.1, w: 2, h: 0.2, fontFace: 'JetBrains Mono', fontSize: 7, color: C.amber, letterSpacing: 0.15 });
  card(s, 6.9, 3.5, 1.6, 1.15, hex(C.amber, 0.12), hex(C.amber, 0.5));
  s.addText('05', { x: 6.98, y: 3.55, w: 0.3, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.amber });
  s.addText('Priority', { x: 6.98, y: 3.8, w: 1.4, h: 0.25, fontFace: 'Inter', fontSize: 11, color: C.fg, bold: true });
  s.addText('Severity 1–3 score\ntriage rank', { x: 6.98, y: 4.1, w: 1.4, h: 0.5, fontFace: 'Inter', fontSize: 8, color: C.dim, lineSpacingMultiple: 1.2 });

  card(s, 6.9, 4.8, 1.6, 1.15, hex(C.blue, 0.12), hex(C.blue, 0.5));
  s.addText('06', { x: 6.98, y: 4.85, w: 0.3, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.blue });
  s.addText('Routing', { x: 6.98, y: 5.1, w: 1.4, h: 0.25, fontFace: 'Inter', fontSize: 11, color: C.fg, bold: true });
  s.addText('Dept mapping +\nofficer assign', { x: 6.98, y: 5.4, w: 1.4, h: 0.5, fontFace: 'Inter', fontSize: 8, color: C.dim, lineSpacingMultiple: 1.2 });

  // arrow to fan-out
  s.addShape('line', { x: 8.7, y: 5.2, w: 0.5, h: 0, line: lineH(C.purple, 0.6, 1.2) });

  // fan-out label
  s.addText('▲ 3 · FINALIZATION', { x: 9.3, y: 3.1, w: 2.5, h: 0.2, fontFace: 'JetBrains Mono', fontSize: 7, color: C.purple, letterSpacing: 0.15 });

  // 3 finalization agents
  const agents2 = [
    { x: 9.3, y: 3.5, num: '07', name: 'Escalation', desc: 'SLA timers ·\nbreach alerts', color: C.purple },
    { x: 9.3, y: 4.8, num: '08', name: 'Verification', desc: 'Closure photo\nQA match', color: C.purple },
  ];
  agents2.forEach(a => {
    card(s, a.x, a.y, 1.5, 1.15, hex(a.color, 0.1), hex(a.color, 0.4));
    s.addText(a.num, { x: a.x+0.08, y: a.y+0.05, w: 0.3, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: a.color });
    s.addText(a.name, { x: a.x+0.08, y: a.y+0.3, w: 1.3, h: 0.25, fontFace: 'Inter', fontSize: 11, color: C.fg, bold: true });
    s.addText(a.desc, { x: a.x+0.08, y: a.y+0.6, w: 1.3, h: 0.5, fontFace: 'Inter', fontSize: 8, color: C.dim, lineSpacingMultiple: 1.2 });
  });

  // Agent 9: Analytics centered
  card(s, 11.1, 4.1, 1.5, 1.15, hex(C.lime, 0.12), hex(C.lime, 0.5));
  s.addText('09', { x: 11.18, y: 4.15, w: 0.3, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime });
  s.addText('Analytics', { x: 11.18, y: 4.4, w: 1.3, h: 0.25, fontFace: 'Inter', fontSize: 11, color: C.fg, bold: true });
  s.addText('UHS score ·\npulse alerts · trends', { x: 11.18, y: 4.7, w: 1.3, h: 0.5, fontFace: 'Inter', fontSize: 8, color: C.dim, lineSpacingMultiple: 1.2 });

  // OUTPUT box
  card(s, 12.8, 3.5, 1.2, 2.2, hex(C.lime, 0.14), hex(C.lime, 0.5));
  s.addText('OUTPUT', { x: 12.9, y: 3.6, w: 1.0, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.15, align: 'center' });
  s.addText('Assigned\nTicket', { x: 12.9, y: 3.85, w: 1.0, h: 0.5, fontFace: 'Inter', fontSize: 12, color: C.fg, bold: true, align: 'center', lineSpacingMultiple: 1.1 });
  s.addText('· Dept\n· Priority\n· SLA timer\n· UHS delta', { x: 12.9, y: 4.4, w: 1.0, h: 1.1, fontFace: 'Inter', fontSize: 9, color: C.dim, align: 'center', lineSpacingMultiple: 1.3 });

  // SSE strip at bottom
  card(s, 0.7, 6.3, 11.9, 0.65, '0F141C', hex(C.lime, 0.25));
  s.addText('◆ LIVE SSE STREAM  ·  agent trace visible to citizens', { x: 0.9, y: 6.3, w: 11, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.15 });
  s.addText([
    { text: '→ 00:02  ', options: { color: C.lime } }, { text: 'CX Agent: language=en, intent=infrastructure_report  |  ', options: { color: C.dim } },
    { text: '→ 00:04  ', options: { color: C.lime } }, { text: 'Vision: damage=severe, category=water_leak  |  ', options: { color: C.dim } },
    { text: '→ 00:06  ', options: { color: C.lime } }, { text: 'Dedup: 0 duplicates in 50m radius', options: { color: C.dim } },
  ], { x: 0.9, y: 6.45, w: 11, h: 0.4, fontFace: 'JetBrains Mono', fontSize: 7, color: C.dim, lineSpacingMultiple: 1.4 });
  s.addText([
    { text: '→ 00:08  ', options: { color: C.lime } }, { text: 'Priority: severity=3 (high)  |  ', options: { color: C.dim } },
    { text: '→ 00:10  ', options: { color: C.lime } }, { text: 'Routing: dept=Water · officer=28dca4a5  |  ', options: { color: C.dim } },
    { text: '→ 00:12  ', options: { color: C.lime } }, { text: 'Analytics: UHS Ward-1 → 74.5 (–2.0)', options: { color: C.dim } },
  ], { x: 0.9, y: 6.6, w: 11, h: 0.3, fontFace: 'JetBrains Mono', fontSize: 7, color: C.dim, lineSpacingMultiple: 1.4 });

  footerBar(s, 'URBANPULSE AI · 8-AGENT LANGGRAPH PIPELINE');
})();

// ════════════ SLIDE 7: CITIZEN ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '06 / CITIZEN EXPERIENCE', '07', '15');
  serifTitle(s, 'Report an issue in under a minute.', 'under a minute.', 0.9, 38);
  s.addText('No account needed. No forms. Photo, voice in any language, GPS pin — submitted once, tracked forever via live SSE trace + real-time status.', {
    x: 0.7, y: 2.7, w: 11.5, h: 0.5, fontFace: 'Inter', fontSize: 12, color: C.dim, lineSpacingMultiple: 1.4 });
  // screenshot
  const ss = path.join(POLISHED, '04_report_wizard.png');
  if (fs.existsSync(ss)) {
    card(s, 0.7, 3.4, 6.8, 4.0, C.b2, C.border);
    s.addImage({ path: ss, x: 0.8, y: 3.5, w: 6.6, h: 3.7 });
  }
  s.addShape('roundRect', { x: 0.85, y: 6.7, w: 1.8, h: 0.2, fill: fillH('0D0D0D', 0.85), line: lineH(C.lime, 0.4, 0.3), rectRadius: 3/72 });
  s.addText('◆ /citizen/report', { x: 0.95, y: 6.7, w: 1.6, h: 0.2, fontFace: 'JetBrains Mono', fontSize: 6, color: C.lime, letterSpacing: 0.12, valign: 'middle' });

  // 3-step flow on right
  const steps = [
    { num: '01', label: 'EVIDENCE', title: 'Snap a photo or record\na voice note', desc: 'Optional — the Vision Agent runs damage assessment;\nCX Agent transcribes and translates any language.' },
    { num: '02', label: 'DETAILS', title: 'Pick a category · describe\nbriefly', desc: 'Roads · Water Leak · Garbage · Streetlight · Signage.\nText is optional — voice + photo alone are enough.' },
    { num: '03', label: 'LOCATION', title: 'Drop a pin · submit & watch\nAI think', desc: 'Draggable GPS marker. Then a live SSE stream shows\n8 agents processing your report in real time.' },
  ];
  steps.forEach((st, i) => {
    const y = 3.4 + i * 1.35;
    card(s, 7.8, y, 5.3, 1.2);
    s.addText(st.num, { x: 8.0, y: y + 0.05, w: 0.5, h: 0.45, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 28, color: C.lime });
    s.addText(st.label, { x: 8.6, y: y + 0.05, w: 4.3, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.mute, letterSpacing: 0.15 });
    s.addText(st.title, { x: 8.6, y: y + 0.25, w: 4.3, h: 0.4, fontFace: 'Inter', fontSize: 14, color: C.fg, bold: true, lineSpacingMultiple: 1.1 });
    s.addText(st.desc, { x: 8.6, y: y + 0.65, w: 4.3, h: 0.45, fontFace: 'Inter', fontSize: 9, color: C.dim, lineSpacingMultiple: 1.3 });
  });
  footerBar(s, 'URBANPULSE AI · CITIZEN REPORT FLOW · /citizen/report');
})();

// ════════════ SLIDE 8: OFFICER ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '07 / OFFICER EXPERIENCE', '08', '15');
  serifTitle(s, 'Field officers act on triaged intelligence.', 'triaged intelligence.', 0.9, 38);
  s.addText('No more inbox chaos. Officers open the app to a pre-sorted queue — priority-ranked, categorized, geo-located, and pre-routed. One-click resolve with closure photo triggers automatic AI verification.', {
    x: 0.7, y: 2.7, w: 9, h: 0.5, fontFace: 'Inter', fontSize: 12, color: C.dim, lineSpacingMultiple: 1.4 });
  // stat box
  card(s, 10.2, 2.5, 2.8, 1.0, hex(C.lime, 0.08), hex(C.lime, 0.35));
  s.addText('TIME SAVED PER TICKET', { x: 10.4, y: 2.55, w: 2.4, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.15 });
  s.addText('~15', { x: 10.4, y: 2.7, w: 0.7, h: 0.5, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 36, color: C.fg });
  s.addText('min', { x: 10.95, y: 2.75, w: 0.5, h: 0.35, fontFace: 'Inter', fontSize: 14, color: C.dim });
  s.addText('vs. manual triage baseline', { x: 10.4, y: 3.2, w: 2.4, h: 0.15, fontFace: 'Inter', fontSize: 9, color: C.dim });

  // screenshot
  const ss = path.join(POLISHED, '05_officer_queue.png');
  if (fs.existsSync(ss)) {
    card(s, 0.7, 3.4, 7.5, 3.8, C.b2, C.border);
    s.addImage({ path: ss, x: 0.8, y: 3.5, w: 7.3, h: 3.5 });
  }
  s.addShape('roundRect', { x: 0.85, y: 6.7, w: 1.7, h: 0.2, fill: fillH('0D0D0D', 0.85), line: lineH(C.lime, 0.4, 0.3), rectRadius: 3/72 });
  s.addText('◆ /officer/queue', { x: 0.95, y: 6.7, w: 1.5, h: 0.2, fontFace: 'JetBrains Mono', fontSize: 6, color: C.lime, letterSpacing: 0.12, valign: 'middle' });

  // 3 workflow chips on right
  const chips = [
    { icon: '⚡', iconColor: C.red, label: '01 · PRIORITIZED', title: 'HIGH · MEDIUM · LOW badges\nauto-assigned', desc: 'Severity from Priority Agent · sorted top-of-queue', borderColor: C.border },
    { icon: '📍', iconColor: C.blue, label: '02 · GEO-LOCATED', title: 'GPS coords + one-tap\ndirections', desc: 'Every ticket carries lat/long + Agent Trace link', borderColor: C.border },
    { icon: '📷', iconColor: C.lime, label: '03 · CLOSURE PHOTO', title: 'Upload → Verification Agent\nauto-approves', desc: 'Gemini matches repair vs. original — no paper QA', borderColor: hex(C.lime, 0.4) },
  ];
  chips.forEach((ch, i) => {
    const y = 3.4 + i * 1.3;
    card(s, 8.5, y, 4.4, 1.1);
    s.addShape('roundRect', { x: 8.7, y: y + 0.1, w: 0.32, h: 0.32, fill: fillH(ch.iconColor, 0.15), line: lineH(ch.iconColor, 0.3, 0.3), rectRadius: 0.05 });
    s.addText(ch.icon, { x: 8.7, y: y + 0.1, w: 0.32, h: 0.32, align: 'center', valign: 'middle', fontFace: 'Inter', fontSize: 14 });
    s.addText(ch.label, { x: 9.1, y: y + 0.08, w: 3.5, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: ch.iconColor, letterSpacing: 0.15 });
    s.addText(ch.title, { x: 8.7, y: y + 0.35, w: 3.9, h: 0.4, fontFace: 'Inter', fontSize: 13, color: C.fg, bold: true, lineSpacingMultiple: 1.1 });
    s.addText(ch.desc, { x: 8.7, y: y + 0.75, w: 3.9, h: 0.25, fontFace: 'Inter', fontSize: 9, color: C.dim });
  });
  footerBar(s, 'URBANPULSE AI · FIELD OFFICER WORK QUEUE');
})();

// ════════════ SLIDE 9: ADMIN ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '08 / ADMIN INTELLIGENCE', '09', '15');
  serifTitle(s, 'City-wide intelligence, live.', 'live.', 0.9, 38);
  // main analytics screenshot
  const ss1 = path.join(POLISHED, '06_admin_analytics.png');
  if (fs.existsSync(ss1)) {
    card(s, 0.7, 2.6, 8.0, 4.7, C.b2, C.border);
    s.addImage({ path: ss1, x: 0.8, y: 2.7, w: 7.8, h: 4.4 });
  }
  // right column: UHS score
  card(s, 9.0, 2.6, 3.9, 1.5, hex(C.lime, 0.14), hex(C.lime, 0.4));
  s.addText('◆ URBAN HEALTH SCORE', { x: 9.2, y: 2.7, w: 3.5, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.15 });
  s.addText('80', { x: 9.2, y: 2.9, w: 1.2, h: 0.8, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 52, color: C.fg });
  s.addText('.3', { x: 10.2, y: 3.0, w: 0.5, h: 0.5, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 24, color: C.lime });
  s.addText('Composite 0–100 · city-wide', { x: 9.2, y: 3.75, w: 3.5, h: 0.15, fontFace: 'Inter', fontSize: 9, color: C.dim });
  // UHS weight breakdown
  s.addText('WEIGHTED FROM', { x: 11.5, y: 2.7, w: 2.2, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.mute, letterSpacing: 0.12 });
  const weights = ['40% resolution time', '30% incident density', '20% severity mix', '10% SLA compliance'];
  weights.forEach((w, i) => {
    s.addText(`${i===0?'●':'○'} ${w}`, { x: 11.5, y: 2.9 + i * 0.2, w: 2.2, h: 0.18, fontFace: 'Inter', fontSize: 8, color: C.dim });
  });
  // incident map
  const ss2 = path.join(POLISHED, '07_admin_incident_map.png');
  if (fs.existsSync(ss2)) {
    card(s, 9.0, 4.3, 3.9, 1.6, C.b2, C.border);
    s.addImage({ path: ss2, x: 9.1, y: 4.4, w: 3.7, h: 1.4 });
  }
  // escalation
  card(s, 9.0, 6.1, 3.9, 1.0, hex(C.red, 0.1), hex(C.red, 0.35));
  s.addText('◆ SLA ESCALATION MONITOR', { x: 9.2, y: 6.15, w: 3.5, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.red, letterSpacing: 0.15 });
  s.addText('5 breached  ·  1 at risk  ·  12 within SLA', { x: 9.2, y: 6.35, w: 3.5, h: 0.25, fontFace: 'Inter', fontSize: 13, color: C.fg, bold: true });
  s.addText('Auto-triggered by Escalation Agent · admin gets pulse alerts before public outrage.', { x: 9.2, y: 6.6, w: 3.5, h: 0.35, fontFace: 'Inter', fontSize: 9, color: C.dim, lineSpacingMultiple: 1.3 });
  footerBar(s, 'URBANPULSE AI · CITY ANALYTICS + ESCALATION + INCIDENT MAP');
})();

// ════════════ SLIDE 10: SUPER ADMIN ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '09 / SUPER ADMIN CONTROL PLANE', '10', '15');
  serifTitle(s, 'Full-stack oversight for system operators.', 'system operators.', 0.9, 38);
  // agent monitoring screenshot
  const ss1 = path.join(POLISHED, '11_agent_monitoring.png');
  if (fs.existsSync(ss1)) {
    card(s, 0.7, 2.6, 6.3, 3.8, C.b2, C.border);
    s.addImage({ path: ss1, x: 0.8, y: 2.7, w: 6.1, h: 3.5 });
  }
  // routing config screenshot
  const ss2 = path.join(POLISHED, '10_routing_config.png');
  if (fs.existsSync(ss2)) {
    card(s, 7.2, 2.6, 5.4, 3.8, C.b2, C.border);
    s.addImage({ path: ss2, x: 7.3, y: 2.7, w: 5.2, h: 3.5 });
  }
  // 4 bottom capability chips
  const caps = [
    { icon: '🔲', iconColor: C.lime, label: 'AGENT HEALTH', title: '8/8 agents online · latency, error rate, last-seen per node' },
    { icon: '🔀', iconColor: C.blue, label: 'ROUTING RULES', title: '8 categories → 6 departments · editable priority defaults' },
    { icon: '👥', iconColor: C.purple, label: 'USER MANAGEMENT', title: '7 roles · Supabase RLS · department assignment' },
    { icon: '📋', iconColor: C.red, label: 'AUDIT LOG · IMMUTABLE', title: 'Every admin action logged · JSONB detail · compliance-ready' },
  ];
  caps.forEach((cap, i) => {
    const x = 0.7 + i * 3.15;
    const y = 6.6;
    card(s, x, y, 3.0, 0.7);
    s.addText(cap.label, { x: x + 0.2, y: y + 0.05, w: 2.6, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: cap.iconColor, letterSpacing: 0.15 });
    s.addText(cap.title, { x: x + 0.2, y: y + 0.22, w: 2.6, h: 0.4, fontFace: 'Inter', fontSize: 9, color: C.fg, bold: true, lineSpacingMultiple: 1.2 });
  });
  footerBar(s, 'URBANPULSE AI · SUPER ADMIN CONTROL PLANE');
})();

// ════════════ SLIDE 11: WORKFLOW TIMELINE ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '10 / LIVE DEMO WORKFLOW', '11', '15');
  serifTitle(s, 'A water leak, from 8:15 AM to closure.', 'to closure.', 0.9, 38);
  s.addText('A single ticket traced through every role, every agent — the same demo we walk judges through.', {
    x: 0.7, y: 2.5, w: 11, h: 0.35, fontFace: 'Inter', fontSize: 12, color: C.dim });
  // timeline base line
  s.addShape('line', { x: 0.7, y: 4.3, w: 11.9, h: 0, line: lineH(C.lime, 0.5, 1.5) });
  // 6 timeline nodes
  const tl = [
    { x: 0.7, dotColor: C.blue, num: '01', label: 'T + 00:00', title: 'Citizen submits', desc: 'Photo + voice + GPS pin at MG Road.\nCategory: Water Leak.', above: true },
    { x: 2.9, dotColor: C.lime, num: '02', label: 'T + 00:12', title: 'AI pipeline done', desc: '8 agents complete. Severity: HIGH.\nRouted to Water Dept.', above: false },
    { x: 5.1, dotColor: C.amber, num: '03', label: 'T + 00:14', title: 'Officer notified', desc: 'Ticket appears atop nearest officer\'s\nqueue with 4h SLA.', above: true },
    { x: 7.3, dotColor: C.amber, num: '04', label: 'T + 02:30', title: 'Repair on site', desc: 'Officer starts work, uploads closure\nphoto of sealed pipe.', above: false },
    { x: 9.5, dotColor: C.purple, num: '05', label: 'T + 02:32', title: 'Auto-verified', desc: 'Verification Agent matches before/\nafter photos — ticket resolved.', above: true },
    { x: 11.7, dotColor: C.lime, num: '06', label: 'T + 02:33', title: 'UHS updated', desc: 'Analytics Agent recomputes Ward-1\nUHS · pulse alert cleared.', above: false },
  ];
  tl.forEach(t => {
    // dot
    s.addShape('oval', { x: t.x, y: 4.15, w: 0.3, h: 0.3, fill: { color: C.bg }, line: { color: t.dotColor, width: 2 } });
    s.addText(t.num, { x: t.x, y: 4.15, w: 0.3, h: 0.3, align: 'center', valign: 'middle', fontFace: 'Inter', fontSize: 10, color: t.dotColor, bold: true });
    // text
    const ty = t.above ? 2.9 : 4.6;
    s.addText(t.label, { x: t.x - 0.2, y: ty, w: 2, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: t.dotColor, letterSpacing: 0.12 });
    s.addText(t.title, { x: t.x - 0.2, y: ty + 0.17, w: 2.2, h: 0.3, fontFace: 'Inter', fontSize: 13, color: C.fg, bold: true, lineSpacingMultiple: 1.1 });
    s.addText(t.desc, { x: t.x - 0.2, y: ty + 0.5, w: 2.2, h: 0.5, fontFace: 'Inter', fontSize: 9, color: C.dim, lineSpacingMultiple: 1.3 });
  });
  // bottom: pipeline screenshot
  const ss = path.join(POLISHED, '03_processing_done.png');
  if (fs.existsSync(ss)) {
    card(s, 0.7, 6.2, 5.8, 0.75, C.b2, hex(C.lime, 0.35));
    s.addImage({ path: ss, x: 0.8, y: 6.25, w: 5.6, h: 0.65 });
  }
  // outcome pill
  card(s, 6.7, 6.2, 5.9, 0.75, hex(C.lime, 0.12), hex(C.lime, 0.4));
  s.addText('◆ TOTAL CITIZEN-TO-CLOSURE', { x: 6.9, y: 6.2, w: 5.5, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.15 });
  s.addText([
    { text: '~2h 33m  ', options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 20, color: C.lime } },
    { text: '— every step visible, every AI decision streamed, every stakeholder in the loop.', options: { fontFace: 'Inter', fontSize: 11, color: C.fg } },
  ], { x: 6.9, y: 6.4, w: 5.5, h: 0.45, align: 'left', valign: 'middle' });
  footerBar(s, 'URBANPULSE AI · SINGLE-TICKET JOURNEY · MG ROAD WATER LEAK');
})();

// ════════════ SLIDE 12: INNOVATION ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '11 / INNOVATION MOAT', '12', '15');
  serifTitle(s, 'Why judges should look twice.', 'judges', 0.9, 38);
  const innovations = [
    { num: '01', title: 'Multi-Agent DAG\norchestration', desc: 'LangGraph directed acyclic graph — 8 specialized agents run in parallel where independent, gated where sequential. Not a chained prompt.', color: C.lime },
    { num: '02', title: 'Live SSE agent trace', desc: 'Every agent\'s reasoning streamed to the browser via Server-Sent Events. Explainable AI you can watch — no black box for citizens or judges.', color: C.cyan },
    { num: '03', title: 'Trust & fraud scoring', desc: 'Reputation model + spam signals + missing-media checks catch bad-faith reports before they clog the queue.', color: C.blue },
    { num: '04', title: 'Spatial + semantic\ndedup', desc: 'PostGIS ST_DWithin (50m) + embedding similarity — the same pothole reported 12 times becomes one ticket.', color: C.purple },
    { num: '05', title: 'Explainable priority', desc: 'Severity score is not a black-box number — Priority Agent surfaces the reasons (proximity to school/hospital, hazard class, description NLP).', color: C.amber },
    { num: '06', title: 'Urban Health Score', desc: 'Composite 0–100 metric per ward — proprietary weighting of resolution time, density, severity, SLA compliance. Actionable, not vanity.', color: C.lime },
    { num: '07', title: 'SLA-first escalation', desc: 'Every ticket carries a severity-based deadline. Escalation Agent triggers pulse alerts before public outrage, not after.', color: C.cyan },
    { num: '08', title: 'Docker-first\nhorizontal scale', desc: 'Containerized FastAPI + async workers + PostGIS scale-out. Ready for 10K reports/day with Celery + Redis when growth demands.', color: C.blue },
  ];
  innovations.forEach((inn, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.7 + col * 3.15;
    const y = 2.5 + row * 2.4;
    card(s, x, y, 2.9, 2.1);
    s.addText(inn.num, { x: x + 0.2, y: y + 0.1, w: 0.5, h: 0.45, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 28, color: inn.color });
    s.addText(inn.title, { x: x + 0.2, y: y + 0.6, w: 2.5, h: 0.55, fontFace: 'Inter', fontSize: 14, color: C.fg, bold: true, lineSpacingMultiple: 1.1, valign: 'top' });
    s.addText(inn.desc, { x: x + 0.2, y: y + 1.2, w: 2.5, h: 0.8, fontFace: 'Inter', fontSize: 8, color: C.dim, lineSpacingMultiple: 1.35, valign: 'top' });
  });
  footerBar(s, 'URBANPULSE AI · TECHNICAL DIFFERENTIATION');
})();

// ════════════ SLIDE 13: FUTURE ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '12 / ROADMAP · FUTURE SCOPE', '13', '15');
  serifTitle(s, 'From ward-level triage to national digital twin.', 'national digital twin.', 0.9, 38);
  // 3 columns
  const cols = [
    {
      label: '◆ NOW · SHIPPED', desc: 'Foundations.', subtitle: 'Everything the demo just showed.',
      items: ['8-agent LangGraph pipeline', 'Role-based dashboards (7 personas)', 'Live SSE agent trace', 'PostGIS spatial dedup', 'Urban Health Score analytics', 'Docker-ready deployment'],
      color: C.lime, border: hex(C.lime, 0.4),
    },
    {
      label: '▶ NEXT · Q3/Q4 2026', desc: 'Sensors.', subtitle: 'Physical world feeds the agent pipeline directly.',
      items: ['IoT sensor ingestion (water, air, noise)', 'CCTV pothole & garbage detection', 'Drone closure-photo verification', 'Twilio WhatsApp report intake', 'React Native mobile officer app', 'Production auth & rate limiting'],
      color: C.blue, border: hex(C.blue, 0.35),
    },
    {
      label: '▶▶ FUTURE · 2027+', desc: 'Predict.', subtitle: 'The city stops reacting — it forecasts.',
      items: ['Predictive failure analytics', 'Flood & drainage forecasting', 'Traffic congestion optimization', 'City-scale digital twin', 'Fine-tuned municipal LLMs', 'National smart-city rollout'],
      color: C.purple, border: hex(C.purple, 0.35),
    },
  ];
  cols.forEach((col, i) => {
    const x = 0.7 + i * 4.2;
    card(s, x, 2.5, 3.9, 4.5, hex(col.color, 0.08), col.border);
    s.addText(col.label, { x: x + 0.2, y: 2.6, w: 3.5, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 8, color: col.color, letterSpacing: 0.15 });
    s.addText(col.desc, { x: x + 0.2, y: 2.75, w: 3.5, h: 0.5, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 32, color: C.fg });
    s.addText(col.subtitle, { x: x + 0.2, y: 3.25, w: 3.5, h: 0.25, fontFace: 'Inter', fontSize: 9, color: C.dim });
    col.items.forEach((item, j) => {
      const iy = 3.6 + j * 0.45;
      s.addShape('oval', { x: x + 0.2, y: iy + 0.1, w: 0.08, h: 0.08, fill: { color: col.color } });
      s.addText(item, { x: x + 0.4, y: iy, w: 3.3, h: 0.35, fontFace: 'Inter', fontSize: 11, color: C.fg, bold: true, valign: 'middle' });
    });
  });
  footerBar(s, 'URBANPULSE AI · THREE-HORIZON PRODUCT ROADMAP');
})();

// ════════════ SLIDE 14: TECH STACK ════════════
(function() {
  const s = pptx.addSlide(); bg(s); gridOverlay(s);
  slideHeader(s, '13 / TECHNOLOGY STACK', '14', '15');
  serifTitle(s, 'Built with what the best teams ship on.', 'best teams', 0.9, 38);
  const stacks = [
    { label: 'FRONTEND', title: 'React 19 · TypeScript', detail: '+ Tailwind CSS\n+ Vite build\n+ Framer Motion\n+ Leaflet maps', color: C.blue, border: hex(C.blue, 0.35) },
    { label: 'BACKEND', title: 'FastAPI · Python 3.11', detail: '+ async / SSE streaming\n+ Uvicorn workers\n+ Pydantic v2\n+ SQLAlchemy ORM', color: C.lime, border: hex(C.lime, 0.4) },
    { label: 'AI / ORCHESTRATION', title: 'LangGraph · Gemini', detail: '+ 8-agent DAG runtime\n+ Google Gemini API\n+ Structured prompts\n+ JSON-mode outputs', color: C.cyan, border: hex(C.cyan, 0.4) },
    { label: 'DATA', title: 'PostgreSQL · PostGIS', detail: '+ Supabase managed\n+ Realtime subscribe\n+ Supabase Storage\n+ Row-level security', color: C.purple, border: hex(C.purple, 0.4) },
    { label: 'AUTH · SECURITY', title: 'Supabase Auth', detail: '+ JWT sessions\n+ 7 role tiers\n+ RLS policies\n+ Immutable audit log', color: C.dim, border: C.border },
    { label: 'DEPLOYMENT', title: 'Docker · nginx', detail: '+ Docker Compose\n+ Multi-stage builds\n+ nginx reverse proxy\n+ Kubernetes-ready', color: C.amber, border: hex(C.amber, 0.35) },
    { label: 'MAPS · GEOSPATIAL', title: 'Leaflet · CARTO', detail: '+ Dark tile theme\n+ CircleMarker heatmap\n+ Draggable MapPicker\n+ OpenStreetMap', color: C.dim, border: C.border },
    { label: 'QUALITY · CI', title: 'Playwright · pytest', detail: '+ 19-route E2E suite\n+ Console-error gate\n+ pytest fixtures\n+ GitHub Actions', color: C.dim, border: C.border },
  ];
  stacks.forEach((st, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.7 + col * 3.15;
    const y = 2.5 + row * 2.5;
    card(s, x, y, 2.9, 2.2, hex(st.color, 0.08), st.border);
    s.addText(st.label, { x: x + 0.2, y: y + 0.15, w: 2.5, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: st.color, letterSpacing: 0.15 });
    s.addText(st.title, { x: x + 0.2, y: y + 0.5, w: 2.5, h: 0.35, fontFace: 'Inter', fontSize: 14, color: C.fg, bold: true });
    s.addText(st.detail, { x: x + 0.2, y: y + 0.95, w: 2.5, h: 1.0, fontFace: 'JetBrains Mono', fontSize: 9, color: C.dim, lineSpacingMultiple: 1.5, valign: 'top' });
  });
  footerBar(s, 'URBANPULSE AI · FULL TECHNOLOGY STACK');
})();

// ════════════ SLIDE 15: THANK YOU ════════════
(function() {
  const s = pptx.addSlide(); bg(s);
  s.addShape('rect', { x: 0, y: 0, w: W, h: H, fill: { color: '000000', transparency: 20 } });
  s.addShape('oval', { x: 4, y: 1.5, w: 5.5, h: 5.5, fill: { color: C.lime, transparency: 85 } });
  gridOverlay(s);
  // brand lockup
  s.addShape('roundRect', { x: 0.7, y: 0.55, w: 0.4, h: 0.4, fill: { color: C.lime }, rectRadius: 0.08 });
  s.addText('⬡', { x: 0.7, y: 0.55, w: 0.4, h: 0.4, align: 'center', valign: 'middle', fontFace: 'Inter', fontSize: 18, color: C.bg });
  s.addText('UrbanPulse', { x: 1.2, y: 0.55, w: 3, h: 0.25, fontFace: 'Inter', fontSize: 16, color: C.fg, bold: true });
  s.addText('AI', { x: 2.7, y: 0.55, w: 0.5, h: 0.25, fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 14, color: C.lime });
  pill(s, 10.5, 0.6, 'END OF DECK');
  // center content
  s.addText('◆ THANK YOU · Q&A', { x: 0, y: 2.8, w: W, h: 0.3, fontFace: 'JetBrains Mono', fontSize: 10, color: C.dim, letterSpacing: 0.2, align: 'center' });
  s.addText([
    { text: "Let's build\n", options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 64, color: C.fg } },
    { text: 'smarter cities.', options: { fontFace: 'Fraunces', fontStyle: 'italic', fontSize: 64, color: C.lime } },
  ], { x: 0, y: 3.2, w: W, h: 1.6, align: 'center', valign: 'middle', letterSpacing: -0.02, lineSpacingMultiple: 0.9 });
  // divider
  s.addShape('rect', { x: 6.4, y: 5.5, w: 0.6, h: 0.02, fill: { color: C.lime } });
  // 3 contact cards
  const contact = [
    { x: 1.5, label: 'TEAM', title: 'Vijay Barhate\nVedant Saikhede' },
    { x: 5.1, label: 'SUBMISSION', title: 'Lenovo LEAP · AICTE\nHackathon 2.0 · 2026', border: hex(C.lime, 0.35) },
    { x: 8.7, label: 'FOCUS AREA', title: 'Smart Cities\n& Public Services' },
  ];
  contact.forEach(c => {
    card(s, c.x, 5.8, 3.2, 0.85, C.b2, c.border || C.border);
    s.addText(c.label, { x: c.x + 0.2, y: 5.85, w: 2.8, h: 0.15, fontFace: 'JetBrains Mono', fontSize: 7, color: C.lime, letterSpacing: 0.15 });
    s.addText(c.title, { x: c.x + 0.2, y: 6.0, w: 2.8, h: 0.5, fontFace: 'Inter', fontSize: 13, color: C.fg, bold: true, lineSpacingMultiple: 1.2 });
  });
  // footer
  s.addShape('rect', { x: 0, y: 7.1, w: W, h: 0.01, fill: { color: C.border } });
  s.addText('QUESTIONS  ·  DEMO  ·  TECHNICAL DEEP-DIVE  ·  PARTNERSHIP', {
    x: 0, y: 7.2, w: W, h: 0.25, fontFace: 'JetBrains Mono', fontSize: 8, color: C.dim, align: 'center', letterSpacing: 0.2 });
})();

// ──── Save ────
await pptx.writeFile({ fileName: PPTX_PATH });
console.log(`✅ PPTX saved: ${PPTX_PATH}`);
