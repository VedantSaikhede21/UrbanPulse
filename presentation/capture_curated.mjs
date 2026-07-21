import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { execSync } from 'child_process';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = 'presentation/screenshots/';
mkdirSync(OUT, { recursive: true });

// ── UTILITY ─────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function capture(page, name, opts = {}) {
  const { waitMs = 2000, waitForText } = opts;
  if (waitForText) {
    try {
      await page.waitForFunction(t => document.body.innerText.includes(t), waitForText, { timeout: 15000 });
    } catch {}
  }
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: false });

  // Get text for reporting
  const text = await page.textContent('body').catch(() => '');
  const agents = (text.match(/🤖|🌐|👁️|🛡️|🔍|⚡|🗺️|⏰|✅|📊/g) || []).length;
  const agentNames = (text.match(/(CX Agent|Vision Agent|Trust & Fraud|Deduplication|Priority Agent|Routing Agent|Escalation Agent|Verification|Analytics Agent)/g) || []);
  const done = text.includes('Pipeline Complete');
  const hasMap = text.includes('Incident Map') || text.includes('Leaflet') || text.includes('OpenStreetMap');

  console.log(`  ${name}.png — ${agents} agents, ${agentNames.length} named, ${done ? 'DONE' : 'processing'}${hasMap ? ', map' : ''}`);
}

async function submitTicket(page) {
  await page.goto(`${BASE}/citizen/report`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1000);

  let btn = page.locator('button:has-text("Skip Photo")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(300);

  btn = page.locator('button:has-text("Next Step: Details")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(500);

  const catBtn = page.locator('button:has-text("Water Leak")');
  if (await catBtn.isVisible({ timeout: 2000 }).catch(() => false)) await catBtn.click();

  const ta = page.locator('textarea');
  if (await ta.isVisible({ timeout: 2000 }).catch(() => false))
    await ta.fill('Water pipeline burst on MG Road near bus stop. Continuous flow for 3 hours causing road damage and traffic disruption.');

  btn = page.locator('button:has-text("Next Step: Location")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(1500);

  btn = page.locator('button:has-text("Submit & Process with AI")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
    // Wait for navigation to processing page
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      if (page.url().includes('/processing/')) return page.url();
    }
  }
  return null;
}

// ── MAIN ────────────────────────────────────────────
async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('=== CURATED SCREENSHOT CAPTURE ===\n');

  // ── 1. LANDING ──────────────────────────────────
  console.log('[01] landing');
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '01_landing');

  // ── 2. PUBLIC MAP ───────────────────────────────
  console.log('[02] public_map');
  await page.goto(`${BASE}/public-map`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '02_public_map', { waitMs: 4000 });

  // ── 3. REPORT WIZARD (step 2 filled) ────────────
  console.log('[03] report_wizard');
  await page.goto(`${BASE}/citizen/report`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1000);

  let btn = page.locator('button:has-text("Skip Photo")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(300);
  btn = page.locator('button:has-text("Next Step: Details")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(500);
  const waterBtn = page.locator('button:has-text("Water Leak")');
  if (await waterBtn.isVisible({ timeout: 2000 }).catch(() => false)) await waterBtn.click();
  const ta = page.locator('textarea');
  if (await ta.isVisible({ timeout: 2000 }).catch(() => false))
    await ta.fill('Water pipeline burst on MG Road near bus stop. Continuous flow for 3 hours causing road damage.');
  await capture(page, '03_report_wizard');

  // ── 4. PROCESSING — LIVE (HERO) ─────────────────
  console.log('[04] processing LIVE');
  // move to step 3
  btn = page.locator('button:has-text("Next Step: Location")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(1500);
  btn = page.locator('button:has-text("Submit & Process with AI")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Click submit but IMMEDIATELY start polling the URL
    const submitPromise = btn.click();
    // Wait for URL to change to processing
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      if (page.url().includes('/processing/')) break;
    }
    // Wait just enough for first few agents to show
    await sleep(3000);
    await capture(page, '04_processing_live', { waitMs: 500 });
  }

  // ── 5. PROCESSING — DONE ────────────────────────
  console.log('[05] processing DONE');
  for (let i = 0; i < 30; i++) {
    await sleep(2000);
    const text = await page.textContent('body').catch(() => '');
    if (text.includes('Pipeline Complete') || text.includes('Processed Successfully')) break;
  }
  await capture(page, '05_processing_done', { waitMs: 1500 });

  // ── 6. CITIZEN DASHBOARD ─────────────────────────
  console.log('[06] citizen_dashboard');
  await page.goto(`${BASE}/citizen/dashboard`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '06_citizen_dashboard', { waitMs: 4000 });

  // ── 7. OFFICER QUEUE ─────────────────────────────
  console.log('[07] officer_queue');
  await page.goto(`${BASE}/officer/queue`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '07_officer_queue', { waitMs: 5000 });

  // ── 8. ADMIN ANALYTICS ──────────────────────────
  console.log('[08] admin_analytics');
  await page.goto(`${BASE}/admin/city-analytics`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '08_admin_analytics', { waitMs: 5000 });

  // ── 9. ADMIN INCIDENT MAP ───────────────────────
  console.log('[09] admin_incident_map');
  await page.goto(`${BASE}/admin/incident-map`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '09_admin_incident_map', { waitMs: 3000 });

  // ── 10. ADMIN ESCALATION ────────────────────────
  console.log('[10] admin_escalation');
  await page.goto(`${BASE}/admin/escalation`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '10_admin_escalation', { waitMs: 4000 });

  // ── 11. SUPER ADMIN ─────────────────────────────
  console.log('[11] super_admin');
  await page.goto(`${BASE}/super-admin`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '11_super_admin', { waitMs: 4000 });

  // ── 12. ROUTING CONFIG ──────────────────────────
  console.log('[12] routing_config');
  await page.goto(`${BASE}/super-admin/routing`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '12_routing_config', { waitMs: 3000 });

  // ── 13. AGENT MONITORING ────────────────────────
  console.log('[13] agent_monitoring');
  await page.goto(`${BASE}/super-admin/monitoring`, { waitUntil: 'load', timeout: 30000 });
  await capture(page, '13_agent_monitoring', { waitMs: 4000 });

  await browser.close();
  console.log('\n=== DONE ===');
}

main();
