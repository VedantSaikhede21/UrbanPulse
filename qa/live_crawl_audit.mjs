/* Full live-site crawl: every route, every role, real browser.
 *
 * Walks each account through every page it is allowed to see and records
 * console errors, uncaught exceptions, failed (4xx/5xx) network responses and
 * blank renderings. A page that returns HTTP 200 but renders nothing is the
 * failure mode that a status-code check misses, so the DOM is inspected too.
 *
 * Usage:  node qa/live_crawl_audit.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const SITE = process.env.SITE_URL || 'https://urban-pulse-eight.vercel.app';
const CREDS = '.env.qa-users';
const OUT = '.playwright-mcp/live-audit';
const SHOTS = process.env.SHOTS === '1';

const PUBLIC = [
  '/', '/about', '/public-map', '/support', '/settings',
  '/auth/citizen-login', '/auth/staff-login', '/auth/staff-register',
  '/auth/forgot-password', '/this-route-does-not-exist',
];

const BY_ROLE = {
  citizen: ['/citizen', '/citizen/report', '/citizen/ward-health', '/citizen/profile', '/citizen/notifications'],
  officer: ['/officer', '/officer/profile'],
  dept_head: ['/dept', '/dept/analytics', '/dept/officers'],
  admin: ['/admin/city-analytics', '/admin/escalation', '/admin/ward'],
  super_admin: ['/super-admin', '/super-admin/users', '/super-admin/routing',
                '/super-admin/audit', '/super-admin/monitoring'],
};

const creds = {};
if (fs.existsSync(CREDS)) {
  for (const line of fs.readFileSync(CREDS, 'utf8').split('\n')) {
    const m = line.match(/^([\w.@+-]+)=(.+)$/);
    if (m) creds[m[1]] = m[2];
  }
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });

const findings = [];
const note = (scope, route, kind, detail) => {
  findings.push({ scope, route, kind, detail });
  console.log(`  ISSUE [${kind}] ${route}  ${detail}`);
};

/* Attaches collectors to a page and returns the current tally. */
function watch(page) {
  const t = { console: [], pageerror: [], http: [] };
  page.on('console', m => {
    if (m.type() === 'error') t.console.push(m.text().slice(0, 300));
  });
  page.on('pageerror', e => t.pageerror.push(e.message.slice(0, 300)));
  page.on('response', r => {
    if (r.status() >= 400) t.http.push(`${r.status()} ${r.url().replace(SITE, '').slice(0, 120)}`);
  });
  return t;
}

/* Third-party noise we cannot fix from this repo. */
const IGNORE = [
  /sentry/i, /google\.com\/analytics/i, /googletagmanager/i,
  /favicon/i, /apple-touch-icon/i,
];

const ignored = list => list.filter(x => !IGNORE.some(re => re.test(x)));

let visited = 0;

/* ---------- public, anonymous ---------- */
console.log('\n=== PUBLIC (anonymous) ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const t = watch(page);
  for (const route of PUBLIC) {
    t.console.length = t.pageerror.length = t.http.length = 0;
    try {
      await page.goto(`${SITE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
      note('public', route, 'nav-failed', e.message.slice(0, 120));
      continue;
    }
    visited++;
    await page.waitForTimeout(700);
    const info = await page.evaluate(() => {
      const imgs = [...document.images];
      return {
        text: document.body.innerText.replace(/\s+/g, ' ').trim().length,
        brokenImgs: imgs.filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc.slice(0, 100)),
        blank: document.body.innerText.trim().length < 40,
      };
    });
    if (info.blank) note('public', route, 'blank', 'body text < 40 chars');
    if (info.text < 200) note('public', route, 'thin', `${info.text} chars`);
    if (info.brokenImgs.length) note('public', route, 'broken-img', info.brokenImgs.join(', '));
    for (const c of ignored(t.console)) note('public', route, 'console', c);
    for (const p of t.pageerror) note('public', route, 'pageerror', p);
    for (const h of ignored(t.http)) note('public', route, 'http', h);
    if (SHOTS) await page.screenshot({ path: `${OUT}/pub${route.replace(/\//g, '_')}.png`, fullPage: true });
  }
  await ctx.close();
}

/* ---------- authenticated, per role ---------- */
for (const [role, routes] of Object.entries(BY_ROLE)) {
  const email = Object.keys(creds).find(e => e.startsWith(`${role.replace('_', '')}@`) ||
    (role === 'citizen' && e.startsWith('resident@')) ||
    (role === 'dept_head' && e.startsWith('dept@')) ||
    (role === 'super_admin' && e.startsWith('superadmin@')));
  if (!email) { console.log(`\n=== ${role}: NO CREDENTIALS, skipped ===`); continue; }
  console.log(`\n=== ${role} (${email}) ===`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const t = watch(page);

  const loginPath = role === 'citizen' ? '/auth/citizen-login' : '/auth/staff-login';
  await page.goto(`${SITE}${loginPath}`, { waitUntil: 'networkidle', timeout: 45000 });
  const isCitizen = role === 'citizen';
  await page.fill(isCitizen ? '#citizen-email' : '#staff-email', email);
  await page.fill(isCitizen ? '#citizen-password' : '#staff-password', creds[email]);
  await page.click(isCitizen ? '#citizen-login-btn' : 'button[type="submit"]');
  try {
    await page.waitForURL(u => !u.pathname.startsWith('/auth'), { timeout: 30000 });
  } catch {
    note(role, 'LOGIN', 'failed', `stuck at ${new URL(page.url()).pathname}`);
    await ctx.close();
    continue;
  }

  for (const route of routes) {
    t.console.length = t.pageerror.length = t.http.length = 0;
    try {
      await page.goto(`${SITE}${route}`, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) {
      note(role, route, 'nav-failed', e.message.slice(0, 120));
      continue;
    }
    visited++;
    await page.waitForTimeout(900);
    const info = await page.evaluate(() => {
      const imgs = [...document.images];
      const main = document.querySelector('main') || document.body;
      return {
        text: main.innerText.replace(/\s+/g, ' ').trim().length,
        brokenImgs: imgs.filter(i => i.complete && i.naturalWidth === 0 && i.currentSrc).map(i => i.currentSrc.slice(0, 100)),
        blank: main.innerText.trim().length < 40,
        hasNaN: /NaN|undefined|\[object Object\]|Infinity%/.test(main.innerText),
        path: location.pathname,
      };
    });
    // A RoleGuard redirect is correct behaviour, not a defect.
    const redirected = info.path !== route;
    if (info.blank) note(role, route, 'blank', 'main text < 40 chars');
    if (info.text < 200) note(role, route, 'thin', `${info.text} chars${redirected ? ` (redirected to ${info.path})` : ''}`);
    if (info.hasNaN) note(role, route, 'bad-text', 'NaN/undefined/[object Object] rendered');
    if (info.brokenImgs.length) note(role, route, 'broken-img', info.brokenImgs.join(', '));
    for (const c of ignored(t.console)) note(role, route, 'console', c);
    for (const p of t.pageerror) note(role, route, 'pageerror', p);
    for (const h of ignored(t.http)) note(role, route, 'http', h);
    if (SHOTS) await page.screenshot({ path: `${OUT}/${role}${route.replace(/\//g, '_')}.png`, fullPage: true });
  }
  await ctx.close();
}

await browser.close();

const byKind = {};
for (const f of findings) byKind[f.kind] = (byKind[f.kind] || 0) + 1;
console.log(`\n===== LIVE CRAWL: ${visited} pages visited, ${findings.length} issues =====`);
for (const [k, n] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
if (findings.length) {
  console.log('\n--- detail ---');
  for (const f of findings) console.log(`  [${f.kind}] ${f.scope}${f.route}: ${f.detail}`);
}
if (findings.length) process.exitCode = 1;
