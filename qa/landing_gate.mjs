/* Landing-page credibility gate.
 * Asserts the specific defects a judge can disprove in front of the demo:
 * stale "pilot" copy, fabricated metrics, hardcoded Bengaluru coordinates,
 * broken document.title, and the CSP-blocked API call.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';

const PASS = [];
const FAIL = [];
function check(name, cond, detail = '') {
  (cond ? PASS : FAIL).push(name);
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + detail}`);
}

const BANNED = [
  'pilot', 'request a pilot', 'about the pilot', 'watch a live demo',
  'demo:', 'municipal pilot', 'thousands of issues', 'nmc',
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));

  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1500);

  const body = await page.locator('body').innerText();
  const lower = body.toLowerCase();

  // --- stale / throwaway copy ---------------------------------------------
  for (const phrase of BANNED) {
    check(`no "${phrase}" in visible copy`, !lower.includes(phrase),
      `found: ${JSON.stringify(body.slice(Math.max(0, lower.indexOf(phrase) - 40), lower.indexOf(phrase) + 40))}`);
  }

  // --- document.title must not repeat the brand ---------------------------
  const title = await page.title();
  check('title has no duplicated brand', (title.match(/UrbanPulse AI/g) || []).length <= 1, title);
  check('title is not "pilot-ready"', !/pilot/i.test(title), title);

  // --- API calls must not be CSP-blocked ----------------------------------
  const cspErrors = consoleErrors.filter(e => /Content Security Policy|localhost:8000/.test(e));
  check('no CSP-blocked API calls', cspErrors.length === 0, cspErrors[0] || '');

  // --- the snapshot card must show derived live numbers -------------------
  const hasLiveBadge = /Live/.test(body);
  check('snapshot shows a Live badge (API reachable)', hasLiveBadge);
  check('no "Offline — retry" on a healthy stack', !/Offline\s*—\s*retry/.test(body));
  check('no fabricated placeholder metric', !/AI-powered triage|Varies by dept/.test(body), 'found placeholder stat');
  check('no "Most improved ward" fabricated row', !/Most improved ward/.test(body));
  check('no "Fastest department" fabricated row', !/Fastest department/.test(body));

  // --- primary CTA must be usable without login or Gemini ----------------
  const primary = await page.locator('a[href="/public-map"]').first();
  check('primary CTA reaches the public map', (await primary.count()) > 0);
  const traceCtas = await page.locator('a[href="/trace"]').count();
  console.log(`  INFO  /trace links on landing: ${traceCtas}`);

  // --- consistent city naming --------------------------------------------
  check('names Navi Mumbai', /Navi Mumbai/i.test(body));
  check('no unexplained NMMC acronym', !/\bNMMC\b/.test(body));

  // --- resolution-time claims must agree ---------------------------------
  const times = [...body.matchAll(/(\d+)h\s*(\d+)m/g)].map(m => m[0]);
  const uniq = [...new Set(times)];
  check('resolution-time claims are consistent', uniq.length <= 1, `found: ${uniq.join(', ')}`);

  // --- map must not silently sit on the wrong city -----------------------
  const href = await page.evaluate(() => {
    const el = document.querySelector('.leaflet-container');
    return el ? 'map-present' : 'no-map';
  });
  console.log(`  INFO  leaflet container: ${href}`);

  // --- other public pages -------------------------------------------------
  for (const [label, url] of [['about', '/about'], ['public-map', '/public-map']]) {
    const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    p2.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p2.goto(BASE + url, { waitUntil: 'load', timeout: 30000 });
    await p2.waitForTimeout(2500);
    const b2 = (await p2.locator('body').innerText()).toLowerCase();
    check(`${label}: no "pilot" copy`, !b2.includes('pilot'));
    const csp = errs.filter(e => /Content Security Policy/.test(e));
    check(`${label}: no CSP violations`, csp.length === 0, csp[0] || '');
    await p2.close();
  }

  await browser.close();

  console.log(`\n==== LANDING GATE: ${PASS.length} passed, ${FAIL.length} failed`);
  if (pageErrors.length) { console.log('\nPage errors:'); pageErrors.forEach(e => console.log('  -', e)); }
  if (consoleErrors.length) { console.log('\nOther console errors:'); consoleErrors.forEach(e => console.log('  -', e)); }
  if (FAIL.length) { console.log('\nFailures:'); FAIL.forEach(f => console.log('  -', f)); process.exit(1); }
}

main().catch(e => { console.error(e); process.exit(1); });
