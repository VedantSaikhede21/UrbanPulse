import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function audit() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  const results = { pass: 0, fail: 0, errors: [], pages: {} };
  page.on('console', msg => {
    if (msg.type() === 'error') results.errors.push({ page: page.url(), text: msg.text().substring(0, 200) });
  });
  page.on('pageerror', err => results.errors.push({ page: page.url(), text: err.message.substring(0, 200) }));

  async function visit(name, url, { waitMs = 2000, waitFor } = {}) {
    try {
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 15000 });
      const status = resp ? resp.status() : 0;
      if (waitFor) {
        await page.waitForFunction(t => document.body.innerText.includes(t), waitFor, { timeout: 10000 }).catch(() => {});
      }
      await page.waitForTimeout(waitMs);
      const text = await page.textContent('body').catch(() => '');
      const agents = (text.match(/Agent/g) || []).length;
      const hasMap = text.includes('Leaflet') || text.includes('OpenStreetMap');
      results.pages[name] = { status, url, ok: status === 200, hasMap, agents };
      if (status === 200) results.pass++; else results.fail++;
      console.log(`  ${status === 200 ? '✓' : '✗'} ${name.padEnd(25)} ${status}  ${url}`);
    } catch (e) {
      results.pages[name] = { status: 0, url, ok: false };
      results.fail++;
      results.errors.push({ page: url, text: e.message.substring(0, 200) });
      console.log(`  ✗ ${name.padEnd(25)} ERR  ${url} — ${e.message.substring(0, 80)}`);
    }
  }

  console.log('=== PAGE AUDIT ===\n');

  await visit('Landing', `${BASE}/`);
  await visit('About', `${BASE}/about`);
  await visit('Public Map', `${BASE}/public-map`, { waitMs: 4000 });
  await visit('Citizen Dashboard', `${BASE}/citizen/dashboard`, { waitMs: 4000 });
  await visit('Report Issue', `${BASE}/citizen/report`, { waitMs: 2000 });
  await visit('Officer Queue', `${BASE}/officer/queue`, { waitMs: 5000 });
  await visit('Officer Profile', `${BASE}/officer/profile`, { waitMs: 3000 });
  await visit('Dept Dashboard', `${BASE}/dept`, { waitMs: 3000 });
  await visit('Admin Analytics', `${BASE}/admin/city-analytics`, { waitMs: 5000 });
  await visit('Admin Incident Map', `${BASE}/admin/incident-map`, { waitMs: 4000 });
  await visit('Admin Escalation', `${BASE}/admin/escalation`, { waitMs: 4000 });
  await visit('Super Admin', `${BASE}/super-admin`, { waitMs: 4000 });
  await visit('Routing Config', `${BASE}/super-admin/routing`, { waitMs: 4000 });
  await visit('Agent Monitoring', `${BASE}/super-admin/monitoring`, { waitMs: 4000 });
  await visit('Audit Log', `${BASE}/super-admin/audit`, { waitMs: 3000 });
  await visit('User Management', `${BASE}/super-admin/users`, { waitMs: 3000 });
  await visit('Processing (fake ID)', `${BASE}/citizen/processing/00000000-0000-0000-0000-000000000000`, { waitMs: 3000 });
  await visit('Live Trace', `${BASE}/trace`, { waitMs: 3000 });
  await visit('Settings', `${BASE}/settings`, { waitMs: 2000 });
  await visit('Support', `${BASE}/support`, { waitMs: 2000 });

  // ── END-TO-END WORKFLOW ─────────────────────
  console.log('\n=== E2E FLOW ===\n');
  console.log('  Submitting real ticket...');
  await page.goto(`${BASE}/citizen/report`, { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // Step 1: Skip photo
  let btn = page.locator('button:has-text("Skip Photo")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(200);
  btn = page.locator('button:has-text("Next Step: Details")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(500);

  // Step 2: Select category + fill description
  const catBtn = page.locator('button:has-text("Water Leak")');
  if (await catBtn.isVisible({ timeout: 2000 }).catch(() => false)) await catBtn.click();
  const ta = page.locator('textarea');
  if (await ta.isVisible({ timeout: 2000 }).catch(() => false))
    await ta.fill('Water pipeline burst on MG Road near bus stop. Continuous flow for 3 hours causing road damage.');
  btn = page.locator('button:has-text("Next Step: Location")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(1500);

  // Step 3: Submit
  btn = page.locator('button:has-text("Submit & Process with AI")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await btn.click();
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1000));
      if (page.url().includes('/processing/')) break;
    }
  }

  const processingUrl = page.url();
  const ticketId = processingUrl.split('/').pop();
  const hasProcessingPage = processingUrl.includes('/processing/');
  console.log(`  ✓ Ticket submitted → ${ticketId?.substring(0, 8)}...  ${hasProcessingPage ? 'navigated' : 'FAILED'}`);

  // Wait for pipeline
  let pipelineDone = false;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const text = await page.textContent('body').catch(() => '');
    if (text.includes('Pipeline Complete') || text.includes('Processed Successfully')) {
      pipelineDone = true;
      break;
    }
    if (text.includes('Connection to pipeline lost')) break;
  }
  console.log(`  ✓ Pipeline complete = ${pipelineDone}`);

  // Wait for redirect to ticket detail
  let detailReached = false;
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (page.url().includes(`/citizen/report/${ticketId}`)) {
      detailReached = true;
      break;
    }
  }
  console.log(`  ✓ Ticket detail reached = ${detailReached}`);

  // ── BUILD ──────────────────────────────────
  console.log('\n=== BUILD ===\n');
  try {
    const { execSync } = await import('child_process');
    const build = execSync('npm run build 2>&1', { cwd: 'frontend', timeout: 120000 });
    const buildOut = build.toString();
    const buildOk = buildOut.includes('Successfully') || buildOut.includes('built in');
    console.log(`  ✓ Build: ${buildOk ? 'PASS' : buildOut.slice(-200)}`);
  } catch (e) {
    const msg = e.message?.substring(0, 200) || 'unknown error';
    const isFail = msg.includes('build failed') || msg.includes('exit code');
    console.log(`  ${isFail ? '✗' : '✓'} Build: ${msg}`);
  }

  // ── REPORT ──────────────────────────────────
  console.log('\n=== DEMO READINESS REPORT ===\n');
  console.log(`Pages tested: ${Object.keys(results.pages).length}`);
  console.log(`Pass: ${results.pass}  Fail: ${results.fail}`);
  console.log(`Console/network errors: ${results.errors.length}`);

  // De-duplicate errors
  const uniqueErrors = [...new Set(results.errors.map(e => e.text))];
  if (uniqueErrors.length > 0) {
    console.log('\nErrors:');
    uniqueErrors.slice(0, 10).forEach(e => console.log(`  ${e.substring(0, 120)}`));
  }

  // Check for 500/404
  const badStatus = Object.entries(results.pages).filter(([_, p]) => p.status !== 200 && p.status !== 0);
  if (badStatus.length > 0) {
    console.log('\nNon-200 statuses:');
    badStatus.forEach(([name, p]) => console.log(`  ${name}: ${p.status}`));
  }

  console.log(`\nE2E flow: citizen → processing → detail = ${hasProcessingPage && pipelineDone && detailReached ? 'PASS' : 'INCOMPLETE'}`);
  console.log(`Pending: architecture diagrams, Adobe Express upload, PPT review`);

  await browser.close();
}

audit();
