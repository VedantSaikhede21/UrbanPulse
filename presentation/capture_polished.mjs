import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = 'presentation/polished/';
mkdirSync(OUT, { recursive: true });

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Inject CSS polish: consistent padding + a "presentation-ready" frame
// without breaking the live React tree.
async function polishPage(page) {
  await page.addStyleTag({
    content: `
      html { background: #0a0a0f !important; }
      body { 
        background: #0a0a0f !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      #root {
        max-width: 100% !important;
        padding: 0 !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        box-shadow: 0 8px 40px rgba(0,0,0,0.7) !important;
      }
    `
  });
  await page.waitForTimeout(200);
}

async function capture(page, name, path, opts = {}) {
  const { waitMs = 2000, waitFor } = opts;

  await page.goto(path, { waitUntil: 'load', timeout: 30000 });

  if (waitFor) {
    try {
      await page.waitForFunction(t => document.body.innerText.includes(t), waitFor, { timeout: 15000 });
    } catch {}
  }

  await page.waitForTimeout(waitMs);
  await page.addStyleTag({
    content: `
      html { background: #0a0a0f !important; }
      body { background: #0a0a0f !important; margin: 0 !important; padding: 0 !important; }
    `
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}${name}.png`, fullPage: false });
  const size = (await import('fs')).statSync(`${OUT}${name}.png`).size;
  console.log(`  ${name}.png  (${(size / 1024).toFixed(0)}KB)`);
}

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('=== POLISHED SCREENSHOTS ===\n');

  // 1. Landing
  console.log('01 landing');
  await capture(page, '01_landing', `${BASE}/`);

  // 2. Public Map
  console.log('02 public_map');
  await capture(page, '02_public_map', `${BASE}/public-map`, { waitMs: 4000 });

  // 3. Processing — need a ticket submission for live agent pipeline
  console.log('03 processing (submitting ticket...)');
  await page.goto(`${BASE}/citizen/report`, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  let btn = page.locator('button:has-text("Skip Photo")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(200);
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
    for (let i = 0; i < 15; i++) {
      await sleep(1000);
      if (page.url().includes('/processing/')) break;
    }
    // Wait for agents to accumulate
    await sleep(4000);
    await polishPage(page);
    await page.screenshot({ path: `${OUT}03_processing_live.png`, fullPage: false });
    const size1 = (await import('fs')).statSync(`${OUT}03_processing_live.png`).size;
    console.log(`  03_processing_live.png  (${(size1 / 1024).toFixed(0)}KB)`);

    // Wait for pipeline complete
    for (let i = 0; i < 25; i++) {
      await sleep(2000);
      const text = await page.textContent('body').catch(() => '');
      if (text.includes('Pipeline Complete')) break;
    }
    await polishPage(page);
    await page.screenshot({ path: `${OUT}03_processing_done.png`, fullPage: false });
    const size2 = (await import('fs')).statSync(`${OUT}03_processing_done.png`).size;
    console.log(`  03_processing_done.png  (${(size2 / 1024).toFixed(0)}KB)`);
  }

  // 4. Report Wizard (step 2 filled)
  console.log('04 report_wizard');
  await page.goto(`${BASE}/citizen/report`, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  btn = page.locator('button:has-text("Skip Photo")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(200);
  btn = page.locator('button:has-text("Next Step: Details")');
  if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) await btn.click();
  await page.waitForTimeout(500);
  const wb = page.locator('button:has-text("Water Leak")');
  if (await wb.isVisible({ timeout: 2000 }).catch(() => false)) await wb.click();
  const txt = page.locator('textarea');
  if (await txt.isVisible({ timeout: 2000 }).catch(() => false))
    await txt.fill('Water pipeline burst on MG Road near bus stop. Continuous flow for 3 hours causing road damage.');
  await polishPage(page);
  await page.screenshot({ path: `${OUT}04_report_wizard.png`, fullPage: false });
  console.log('  04_report_wizard.png');

  // 5. Officer Queue
  console.log('05 officer_queue');
  await capture(page, '05_officer_queue', `${BASE}/officer/queue`, { waitMs: 5000 });

  // 6. Admin Analytics
  console.log('06 admin_analytics');
  await capture(page, '06_admin_analytics', `${BASE}/admin/city-analytics`, { waitMs: 5000 });

  // 7. Admin Incident Map
  console.log('07 admin_incident_map');
  await capture(page, '07_admin_incident_map', `${BASE}/admin/incident-map`, { waitMs: 3000 });

  // 8. Admin Escalation
  console.log('08 admin_escalation');
  await capture(page, '08_admin_escalation', `${BASE}/admin/escalation`, { waitMs: 4000 });

  // 9. Super Admin
  console.log('09 super_admin');
  await capture(page, '09_super_admin', `${BASE}/super-admin`, { waitMs: 4000 });

  // 10. Routing Config
  console.log('10 routing_config');
  await capture(page, '10_routing_config', `${BASE}/super-admin/routing`, { waitMs: 3000 });

  // 11. Agent Monitoring
  console.log('11 agent_monitoring');
  await capture(page, '11_agent_monitoring', `${BASE}/super-admin/monitoring`, { waitMs: 4000 });

  await browser.close();
  console.log('\n=== DONE ===');
}

main();
