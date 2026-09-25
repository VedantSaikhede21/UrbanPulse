/* Shell regression across every authenticated role.
 * The navbar rework (sticky header, role-aware brand link, identity chip,
 * logout) lives in the shared RoleLayout, so it must hold for all five roles
 * and for each role's own landing route.
 */
import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';
const OUT = process.env.OUT_DIR || 'F:/UrbanPulse AI/.playwright-mcp/ui';
const SECRET = (
  process.env.SUPABASE_JWT_SECRET || fs.readFileSync('/tmp/opencode/jwt_secret.txt', 'utf8')
).trim();
const SUPABASE_REF = process.env.SUPABASE_REF || 'lppdrsgqppyfcstrpksg';

const PASS = [];
const FAIL = [];
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
    iat: now, exp: now + 3600, user_metadata: { role, name: `QA ${role}` },
  }));
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${sig}`;
}

const ROLES = [
  { role: 'citizen', home: '/citizen', label: 'Citizen' },
  { role: 'officer', home: '/officer', label: 'Field Officer' },
  { role: 'dept_head', home: '/dept', label: 'Dept Head' },
  { role: 'admin', home: '/admin/city-analytics', label: 'City Admin' },
  { role: 'super_admin', home: '/super-admin', label: 'Super Admin' },
];

// Console noise we deliberately ignore: this harness mints tokens for users that
// do not exist in the local DB, so role-scoped /api/* calls answer 401/403. That
// is a fixture limitation, not a UI regression — route_matrix_qa.mjs covers
// real provisioned role rows.
const EXPECTED_API_NOISE = /Failed to load resource.*(401|403)/;

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];
  const pageErrors = [];

  for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    for (const { role, home, label } of ROLES) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      page.on('console', m => {
        if (m.type() === 'error' && !EXPECTED_API_NOISE.test(m.text())) {
          consoleErrors.push(`[${vp.name}/${role}] ${m.text()}`);
        }
      });
      page.on('pageerror', e => pageErrors.push(`[${vp.name}/${role}] ${e.message}`));

      const tag = `${vp.name}-${role}`;
      const email = `${role.replace('_', '')}.shell@urbanpulse`;
      const avatar = email.slice(0, 2).toUpperCase();
      const sub = `00000000-0000-4000-8000-00000000${(role.length + vp.name.length).toString().padStart(4, '0')}`;
      const token = mintToken(sub, email, role);

      await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(({ key, token, sub, email, role }) => {
        const expiresAt = Math.floor(Date.now() / 1000) + 3600;
        localStorage.setItem(key, JSON.stringify({
          access_token: token, refresh_token: 'qa-refresh', expires_in: 3600,
          expires_at: expiresAt, token_type: 'bearer',
          user: {
            id: sub, aud: 'authenticated', role: 'authenticated', email,
            app_metadata: {}, user_metadata: { role, name: `QA ${role}` },
          },
        }));
      }, { key: `sb-${SUPABASE_REF}-auth-token`, token, sub, email, role });

      await page.goto(BASE + home, { waitUntil: 'load', timeout: 30000 });
      await page.waitForSelector('header', { timeout: 20000 });
      await page.waitForTimeout(1600);

      // Landed on the role's own home (no guard bounce-back)
      check(`${tag}: reached ${home}`, new URL(page.url()).pathname === home, page.url());

      const header = page.locator('header').first();
      const box = await header.boundingBox();
      check(`${tag}: header 64px`, !!box && Math.abs(box.height - 64) < 2, box ? `h=${box.height}` : 'none');

      const text = await header.innerText();
      check(`${tag}: email in header`, text.includes(email), text.replace(/\s+/g, ' ').slice(0, 100));
      check(`${tag}: role label "${label}"`, new RegExp(label.split(' ')[0], 'i').test(text));
      check(`${tag}: avatar initials "${avatar}"`, text.includes(avatar), text.replace(/\s+/g, ' ').slice(0, 100));

      const signout = page.getByTestId('header-signout-btn');
      check(`${tag}: logout present + visible`, (await signout.count()) > 0 && await signout.first().isVisible());

      // Brand link must target this role's home
      const brandHref = await page
        .locator(vp.width < 768 ? 'header a[href]' : 'aside a[href]')
        .filter({ has: page.locator('div', { hasText: /^U$/ }) })
        .first()
        .getAttribute('href')
        .catch(() => null);
      const expectedHref = { citizen: '/citizen', officer: '/officer', dept_head: '/dept', admin: '/admin/city-analytics', super_admin: '/super-admin' }[role];
      check(`${tag}: brand link -> ${expectedHref}`, brandHref === expectedHref, `got ${brandHref}`);

      // Identity and logout must not overlap or overflow
      const overlap = await page.evaluate(() => {
        const h = document.querySelector('header');
        if (!h) return 'no header';
        const box = h.getBoundingClientRect();
        const kids = Array.from(h.querySelectorAll('*')).filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && (r.left < box.left - 1 || r.right > box.right + 1);
        });
        return kids.length;
      });
      check(`${tag}: nothing overflows header`, overlap === 0, `${overlap} overflowing nodes`);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      check(`${tag}: no horizontal overflow`, overflow <= 1, `${overflow}px`);

      await page.screenshot({ path: `${OUT}/role-${role}-${vp.name}.png`, fullPage: false });
      await page.close();
    }
  }

  await browser.close();
  console.log(`\n==== ROLE SHELL: ${PASS.length} passed, ${FAIL.length} failed`);
  if (pageErrors.length) { console.log('\nPage errors:'); pageErrors.forEach(e => console.log('  -', e)); }
  if (consoleErrors.length) { console.log('\nConsole errors:'); consoleErrors.forEach(e => console.log('  -', e)); }
  if (FAIL.length) { console.log('\nFailures:'); FAIL.forEach(f => console.log('  -', f)); process.exit(1); }
}

main().catch(e => { console.error(e); process.exit(1); });
