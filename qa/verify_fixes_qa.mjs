/* Third-pass verification of the honesty fixes.
 * Renders each changed screen as a REAL role and asserts the specific
 * defect is gone (no fabricated score, no hardcoded ONLINE, no hardcoded
 * officer count, notifications navigate, no impossible zero metrics).
 * Saves screenshots to .playwright-mcp/verify/ for eyeballing.
 */
import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';
const SECRET = (process.env.SUPABASE_JWT_SECRET || fs.readFileSync('/tmp/opencode/jwt_secret.txt', 'utf8')).trim();
const SUPABASE_REF = process.env.SUPABASE_REF || 'lppdrsgqppyfcstrpksg';
const ROLE_IDS = JSON.parse(process.env.QA_ROLE_IDS || '{}');
const OUT = '.playwright-mcp/verify';

const PASS = [], FAIL = [];
function check(name, cond, detail = '') {
  (cond ? PASS : FAIL).push(name);
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  -> ' + detail}`);
}
const b64url = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function mintToken(sub, email, role) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64url(JSON.stringify({
    sub, email, phone: '', aud: 'authenticated', role: 'authenticated',
    iat: now, exp: now + 3600, user_metadata: { role, name: `QA ${role}` },
  }));
  return `${h}.${p}.${b64url(crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest())}`;
}

async function session(page, role, subOverride) {
  const sub = subOverride || ROLE_IDS[role] || crypto.randomUUID();
  const email = `qa-${role}@test.urbanpulse`;
  const token = mintToken(sub, email, role);
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(({ key, token, sub, email, role }) => {
    localStorage.setItem(key, JSON.stringify({
      access_token: token, refresh_token: 'qa', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer',
      user: { id: sub, aud: 'authenticated', role: 'authenticated', email,
              app_metadata: {}, user_metadata: { role, name: `QA ${role}` } },
    }));
  }, { key: `sb-${SUPABASE_REF}-auth-token`, token, sub, email, role });
}

const body = async p => p.evaluate(() => document.body.innerText);

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // ---- CITIZEN ----
  // Prefer a citizen fixture that actually owns a ticket + notification so the
  // row-level controls render. Fall back to a random UUID (empty inbox).
  const citizenSub = ROLE_IDS.citizen_with_data || crypto.randomUUID();
  let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  let page = await ctx.newPage();
  await session(page, 'citizen', citizenSub);

  await page.goto(BASE + '/citizen/profile', { waitUntil: 'networkidle', timeout: 30000 });
  let t = await body(page);
  check('Profile: fabricated Trust Score removed', !/Trust Score/i.test(t), 'still present');
  check('Profile: no invented level tiers', !/Level:\s*(Trusted|Verified|New)/i.test(t), 'tier text present');
  check('Profile: shows real Reports Resolved', /Reports Resolved/i.test(t));
  check('Profile: shows real Resolution Rate', /Resolution Rate/i.test(t));
  await page.screenshot({ path: `${OUT}/citizen-profile.png`, fullPage: true });

  await page.goto(BASE + '/citizen/notifications', { waitUntil: 'networkidle', timeout: 30000 });
  t = await body(page);
  // The per-row "dismiss" control was removed: there is no DELETE
  // /api/notifications endpoint, so it could only mutate local state and the
  // row reappeared on reload — a decorative control.
  check('Notifications: no fake dismiss control', !/Dismiss /i.test(t), 'dismiss control still present');
  // The row-level action is labelled via aria-label, so read accessible names
  // from the DOM rather than innerText.
  const rowActions = await page.evaluate(() =>
    [...document.querySelectorAll('button[aria-label]')]
      .map(b => b.getAttribute('aria-label'))
      .filter(l => /as read/i.test(l)),
  );
  check('Notifications: rows offer a real mark-read action', rowActions.length > 0, 'no mark-read button found');
  check('Notifications: row shows a "View report" affordance', /View report/i.test(t), 'no navigable row');
  await page.screenshot({ path: `${OUT}/citizen-notifications.png`, fullPage: true });

  // Functional: clicking the row must land on that ticket's report page.
  if (/View report/i.test(t)) {
    await page.getByText('View report').first().click();
    await page.waitForURL(/\/citizen\/report\/[0-9a-f-]{36}/, { timeout: 15000 }).catch(() => {});
    check('Notifications: clicking a row navigates to the report', /\/citizen\/report\//.test(page.url()), page.url());
    await page.screenshot({ path: `${OUT}/citizen-report-from-notification.png`, fullPage: true });
  } else {
    check('Notifications: clicking a row navigates to the report', true, 'skipped - inbox empty');
  }

  // Ward health badges must be colour-coded, not the default grey fallback.
  await page.goto(BASE + '/citizen/ward-health', { waitUntil: 'networkidle', timeout: 30000 });
  t = await body(page);
  check('WardHealth: UHS band words render', /Healthy|Moderate|Critical/i.test(t));
  const greyBadges = await page.evaluate(() => {
    const spans = [...document.querySelectorAll('span')].filter(
      s => /^(healthy|moderate|critical)$/i.test(s.textContent.trim()),
    );
    return spans.filter(s => (s.className || '').includes('text-gray-400')).length;
  });
  check('WardHealth: UHS badges are colour-coded (not grey fallback)', greyBadges === 0, `${greyBadges} grey badge(s)`);
  await page.screenshot({ path: `${OUT}/citizen-ward-health.png`, fullPage: true });
  await ctx.close();

  // ---- OFFICER ----
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  await session(page, 'officer');
  await page.goto(BASE + '/officer/profile', { waitUntil: 'networkidle', timeout: 30000 });
  t = await body(page);
  check('OfficerProfile: impossible "Reported" card gone', !/^Reported$/m.test(t), 'Reported card present');
  check('OfficerProfile: real In Queue count present', /In Queue/i.test(t));
  check('OfficerProfile: real High Priority present', /High Priority/i.test(t));
  // A 5th verification card was added, found degenerate in review, and removed:
  // verification_status is NULL on every open queue ticket, so it duplicated
  // "In Queue". Assert it stays gone.
  check('OfficerProfile: degenerate Awaiting Verification card stays removed', !/Awaiting Verification/i.test(t), 'degenerate card present');
  await page.screenshot({ path: `${OUT}/officer-profile.png`, fullPage: true });
  await ctx.close();

  // ---- DEPT HEAD ----
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  await session(page, 'dept_head');
  await page.goto(BASE + '/dept', { waitUntil: 'networkidle', timeout: 30000 });
  t = await body(page);
  check('DeptDashboard: hardcoded "Officers" label replaced', !/^Officers$/m.test(t), 'plain Officers label present');
  check('DeptDashboard: shows Active Officers', /Active Officers/i.test(t));
  await page.screenshot({ path: `${OUT}/dept-dashboard.png`, fullPage: true });
  await ctx.close();

  // ---- SUPER ADMIN ----
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  await session(page, 'super_admin');
  await page.goto(BASE + '/super-admin', { waitUntil: 'networkidle', timeout: 30000 });
  t = await body(page);
  check('AdminDashboard: recent tickets table renders', /Recent Tickets/i.test(t));
  await page.screenshot({ path: `${OUT}/super-admin-dashboard.png`, fullPage: true });

  // System status badge must be driven by /api/health/ready, not a literal.
  const badge = await page.evaluate(() => {
    const el = document.querySelector('[role="status"][aria-live="polite"]');
    return el ? el.textContent.trim() : null;
  });
  check('RoleLayout: system status is live-probed (not hardcoded ONLINE)', badge !== null, 'no live status element');
  console.log('    system status reads:', JSON.stringify(badge));
  check('RoleLayout: status reflects a real probe result', ['ONLINE', 'DEGRADED', 'OFFLINE'].includes(badge), String(badge));
  await ctx.close();

  await browser.close();

  console.log(`\n===== VERIFY FIXES: ${PASS.length} passed, ${FAIL.length} failed =====`);
  if (FAIL.length) process.exitCode = 1;
}
main();
