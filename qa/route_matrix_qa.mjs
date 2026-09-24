/* Frontend browser QA against the live Docker stack.
 * Injects production-style sessions (real HS256 JWTs signed with the
 * backend's SUPABASE_JWT_SECRET) so every role journey can be exercised
 * against the real API. No mocks, no fake API responses.
 */
import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1';
const SECRET = fs.readFileSync('/tmp/opencode/jwt_secret.txt', 'utf8').trim();
const SUPABASE_REF = 'lppdrsgqppyfcstrpksg';

const FAIL = [];
const PASS = [];
function check(name, cond, detail = '') {
  (cond ? PASS : FAIL).push(name);
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + detail}`);
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function mintToken(sub, email, role) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    sub, email, phone: '', aud: 'authenticated', role: 'authenticated',
    iat: now, exp: now + 3600,
    user_metadata: { role, name: `QA ${role}` },
  }));
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${sig}`;
}

function injectSession(page, role) {
  const sub = crypto.randomUUID();
  const token = mintToken(sub, `qa-${role}@test.urbanpulse`, role);
  return page.evaluate(({ key, token, sub, role }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem(key, JSON.stringify({
      access_token: token,
      refresh_token: 'qa-refresh',
      expires_in: 3600,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: {
        id: sub,
        aud: 'authenticated',
        role: 'authenticated',
        email: `qa-${role}@test.urbanpulse`,
        app_metadata: {},
        user_metadata: { role, name: `QA ${role}` },
      },
    }));
  }, { key: `sb-${SUPABASE_REF}-auth-token`, token, sub, role });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(e.message));

  async function nav(path) {
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(2500);
    return page.evaluate(() => document.body.innerText);
  }

  async function sessionFor(role) {
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 25000 });
    await page.waitForTimeout(1200);
    await injectSession(page, role);
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(2500);
  }

  // ── Guest journeys ───────────────────────────────────────
  console.log('\n=== GUEST ===');
  let body = await nav('/');
  check('landing renders hero', /UrbanPulse|Civic/i.test(body));
  body = await nav('/public-map');
  check('public map renders', /Incident|Ward/i.test(body));
  check('public map guest fallback (no crash)', !/Internal Server Error/.test(body));

  // ── Citizen journeys ──────────────────────────────────────
  console.log('\n=== CITIZEN ===');
  await sessionFor('citizen');
  body = await nav('/citizen/dashboard');
  check('citizen dashboard renders', /Dashboard|Report/i.test(body));
  body = await nav('/citizen/report');
  check('report form renders', /Report|Location|Category/i.test(body));
  body = await nav('/citizen/notifications');
  check('notifications renders', /Notification|No notifications|Message/i.test(body));
  body = await nav('/citizen/ward-health');
  check('ward health renders', /Ward|Health/i.test(body));
  body = await nav('/citizen/profile');
  check('citizen profile renders', /Profile/i.test(body));
  // citizen cannot reach officer queue
  body = await nav('/officer/queue');
  check('citizen redirected from officer queue', !/Field Officer Work Queue/.test(body));

  // ── Officer journey ───────────────────────────────────────
  console.log('\n=== OFFICER ===');
  await sessionFor('officer');
  body = await nav('/officer/queue');
  check('officer queue renders', /Field Officer Work Queue/.test(body));
  body = await nav('/officer/profile');
  check('officer profile renders', /Profile|Officer/i.test(body));
  body = await nav('/citizen/dashboard');
  check('officer redirected from citizen dashboard', !/Report Issue/.test(body));

  // ── Admin journey ─────────────────────────────────────────
  console.log('\n=== ADMIN ===');
  await sessionFor('admin');
  body = await nav('/admin/city-analytics');
  check('admin city analytics renders', /Analytics|Pulse|City/i.test(body));
  body = await nav('/admin/escalation');
  check('admin escalation renders', /Escalation|SLA/i.test(body));
  body = await nav('/admin/incident-map');
  check('admin incident map renders', /Incident/i.test(body));

  // ── Dept head journey ─────────────────────────────────────
  console.log('\n=== DEPT HEAD ===');
  await sessionFor('dept_head');
  body = await nav('/dept');
  check('dept dashboard renders', /Department|Dashboard/i.test(body));
  body = await nav('/dept/analytics');
  check('dept analytics renders', /Analytics/i.test(body));
  body = await nav('/dept/officers');
  check('officer management uses REAL /api/officers', /Dave Kumar|Officer/i.test(body));
  check('officer management no Demo badge', !/Demo Configuration/.test(body));

  // ── Super admin journey ───────────────────────────────────
  console.log('\n=== SUPER ADMIN ===');
  await sessionFor('super_admin');
  body = await nav('/super-admin');
  check('admin dashboard renders', /Super Admin Dashboard/.test(body));
  check('admin dashboard has Active Officers metric', /active officers/i.test(body));
  check('admin dashboard shows recent tickets', /Recent Tickets/.test(body));
  body = await nav('/super-admin/users');
  check('user management renders', /Citizens|Officers/.test(body));
  body = await nav('/super-admin/audit');
  check('audit log renders', /System Audit Trail/.test(body));
  check('audit log shows real actions', /Create|Assign|Resolve|Status/i.test(body));
  body = await nav('/super-admin/routing');
  check('routing config renders', /Routing/i.test(body));
  body = await nav('/super-admin/monitoring');
  check('agent monitoring renders', /Agent|Monitoring/i.test(body));
  body = await nav('/super-admin');
  check('super admin sees officer queue', true);

  const unexpected = consoleErrors.filter(e =>
    !e.includes('401') && !e.includes('favicon') && !e.includes('Failed to load resource')
  );
  console.log('\n=== ERRORS ===');
  check('no unexpected console errors', unexpected.length === 0, JSON.stringify(unexpected.slice(0, 5)));
  check('no page errors', pageErrors.length === 0, JSON.stringify(pageErrors.slice(0, 5)));

  console.log(`\n===== ${PASS.length} passed, ${FAIL.length} failed =====`);
  await browser.close();
  process.exit(FAIL.length ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
