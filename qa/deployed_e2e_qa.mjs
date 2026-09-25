/* End-to-end check of the deployed split: Vercel frontend (browser) calling
 * the Railway backend cross-origin. This is where a CORS misconfiguration
 * shows up — a plain curl cannot see it, because the browser sends the Origin
 * header and the server is the one that decides.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const SITE = process.env.SITE_URL || 'https://urban-pulse-eight.vercel.app';
const OUT = '.playwright-mcp/verify';

const PASS = [], FAIL = [];
const check = (n, c, d = '') => { (c ? PASS : FAIL).push(n); console.log(`  ${c ? 'PASS' : 'FAIL'}  ${n}${c ? '' : '  -> ' + d}`); };

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const corsErrors = [];
const failedApi = [];
page.on('console', m => {
  const t = m.text();
  if (m.type() === 'error') {
    if (/CORS|Access-Control-Allow-Origin/i.test(t)) corsErrors.push(t);
    if (/Failed to load resource/i.test(t)) failedApi.push(t);
  }
});
page.on('pageerror', e => corsErrors.push('pageerror: ' + e.message));

fs.mkdirSync(OUT, { recursive: true });

// Track the actual API responses the page makes.
const apiResponses = [];
page.on('response', async r => {
  const u = r.url();
  if (u.includes('/api/')) {
    let body = '';
    try { body = (await r.text()).slice(0, 120); } catch {}
    apiResponses.push({ url: u.replace(SITE, ''), status: r.status(), body });
  }
});

await page.goto(`${SITE}/public-map`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3000);

const text = await page.evaluate(() => document.body.innerText);
await page.screenshot({ path: `${OUT}/deployed-public-map.png`, fullPage: true });

console.log('\n--- API calls the deployed page actually made ---');
for (const r of apiResponses) console.log(`  ${r.status}  ${r.url}`);

check('no CORS rejection in console', corsErrors.length === 0, corsErrors.slice(0, 2).join(' | '));
const okTickets = apiResponses.find(r => r.url.includes('/api/tickets/near') && r.status === 200);
check('public tickets API reachable from the browser (CORS ok)', !!okTickets,
      apiResponses.filter(r => r.url.includes('/near')).map(r => `${r.status}`).join(','));
const okWards = apiResponses.find(r => r.url.includes('/api/analytics/wards') && r.status === 200);
check('wards API reachable from the browser', !!okWards, 'no 2xx on /api/analytics/wards');
check('map page rendered real ward names', /Kharghar|Vashi|Taloja|Nerul|Karanjade/i.test(text), 'no ward names in body');

await browser.close();
console.log(`\n===== DEPLOYED E2E: ${PASS.length} passed, ${FAIL.length} failed =====`);
if (FAIL.length) process.exitCode = 1;
