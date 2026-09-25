/* Targeted regression checks for defects found in the round-2 verification.
 * Each check maps to a concrete bug that was fixed.
 */
import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';
const SECRET = (process.env.SUPABASE_JWT_SECRET || fs.readFileSync('/tmp/opencode/jwt_secret.txt', 'utf8')).trim();
const SUPABASE_REF = 'lppdrsgqppyfcstrpksg';

const PASS = [], FAIL = [];
const check = (n, c, d = '') => { (c ? PASS : FAIL).push(n); console.log(`  ${c ? 'PASS' : 'FAIL'}  ${n}${c ? '' : '  ' + d}`); };

function b64url(b) { return Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function mint(sub, email, role) {
  const now = Math.floor(Date.now() / 1000);
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64url(JSON.stringify({ sub, email, phone: '', aud: 'authenticated', role: 'authenticated', iat: now, exp: now + 3600, user_metadata: { role, name: `QA ${role}` } }));
  return `${h}.${p}.${b64url(crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest())}`;
}
async function inject(page, role, sub) {
  const email = `${role}.regress@urbanpulse`;
  const token = mint(sub, email, role);
  await page.evaluate(({ key, token, sub, email, role }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem(key, JSON.stringify({
      access_token: token, refresh_token: 'r', expires_in: 3600, expires_at: expiresAt, token_type: 'bearer',
      user: { id: sub, aud: 'authenticated', role: 'authenticated', email, app_metadata: {}, user_metadata: { role, name: 'QA' } },
    }));
  }, { key: `sb-${SUPABASE_REF}-auth-token`, token, sub, email, role });
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ---- R1: Landing must have exactly ONE footer (PublicLayout owns it) ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1500);
    const n = await page.locator('footer').count();
    check('R1: landing renders exactly one footer', n === 1, `found ${n}`);
    const h = await page.locator('footer').first().boundingBox();
    check('R1: footer is the slim PublicLayout one', !!h && h.height < 120, h ? `${h.height}px` : 'none');
    await page.close();
  }

  // ---- R2: an unknown URL must NOT dump a guest into the auth sidebar ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + '/totally-unknown-url-xyz', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1200);
    const body = await page.locator('body').innerText();
    check('R2: unknown URL stays anonymous (no Guest Mode shell)', !/Guest Mode/.test(body));
    check('R2: unknown URL uses the public header', (await page.locator('nav[aria-label="Main"]').count()) > 0);
    check('R2: 404 explains itself', /does not exist/i.test(body));
    await page.close();
  }

  // ---- R3: ReportDetail timeline — exactly one active stage, and the RIGHT
  //          one. Driven with stubbed ticket payloads so every status is
  //          covered deterministically without needing real DB rows.
  {
    const EXPECT = {
      reported: 'Report received',
      assigned: 'Officer assigned',
      in_progress: 'Work in progress',
      resolved: 'Fix submitted',
    };
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await inject(page, 'citizen', '00000000-0000-4000-8000-0000000000aa');

    for (const [status, expected] of Object.entries(EXPECT)) {
      const id = `11111111-1111-4111-8111-11111111111${Object.keys(EXPECT).indexOf(status)}`;
      await page.route('**/api/tickets/**', route => {
        const url = route.request().url();
        if (url.includes('/api/tickets/') && !url.includes('near')) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id, category: 'Roads & Potholes', severity: 'medium', description: 'Test',
              status, priority_score: 2, latitude: 19.033, longitude: 73.0298,
              created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
              expected_resolution_at: new Date(Date.now() + 86400000).toISOString(),
            }),
          });
        }
        return route.continue();
      });
      await page.goto(`${BASE}/citizen/report/${id}`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1200);
      const active = await page.locator('h4:has-text("happening now")').allInnerTexts();
      check(`R3: ${status} -> exactly one active stage`, active.length === 1, `active=${JSON.stringify(active)}`);
      check(`R3: ${status} -> active stage is "${expected}"`,
        active.length === 1 && active[0].includes(expected), `active=${JSON.stringify(active)}`);
      const nodeState = await page.evaluate(() => {
        const h = [...document.querySelectorAll('h4')].find(x => x.textContent?.includes('happening now'));
        if (!h) return 'no-active';
        const node = h.closest('.relative')?.querySelector('svg[class*="check"]');
        return node ? 'checkmark' : 'no-checkmark';
      });
      check(`R3: ${status} -> active stage has no checkmark`, nodeState === 'no-checkmark', nodeState);
      await page.unroute('**/api/tickets/**');
    }
    await page.close();
  }

  // ---- R4: OfficerQueue — no static "Polling" text; live label OR a human
  //          permission message (a synthetic officer with no queue record gets
  //          403, which must NOT be reported as a connection error).
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await inject(page, 'officer', '00000000-0000-4000-8000-0000000000bb');
    await page.goto(BASE + '/officer', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    check('R4: no developer-facing "Polling every" text', !/Polling every/i.test(body));
    check('R4: no raw status code in the error copy', !/\((40[0-9]|50[0-9])\)/.test(body), body.match(/\([0-9]{3}\)/)?.[0] || '');
    check('R4: no "Connection Error" mislabel', !/Connection Error/i.test(body));

    const hasQueue = /updated/i.test(body);
    if (hasQueue) {
      check('R4: live freshness label present', true);
      await page.waitForTimeout(4000);
      const later = await page.locator('body').innerText();
      check('R4: freshness label advances past "just now"',
        /updated \d+s ago|updated \d+m ago/.test(later), later.match(/Updated[^\n]*/)?.[0] || 'no match');
    } else {
      check('R4: queue-less officer gets a human explanation, not an error dump',
        /no queue assigned to you yet/i.test(body), body.slice(0, 200));
    }
    await page.close();
  }

  // ---- R5: per-ticket closure isolation ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await inject(page, 'officer', '00000000-0000-4000-8000-0000000000cc');
    await page.goto(BASE + '/officer', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(3000);
    const inputs = page.locator('input[type="url"][aria-label^="Closure photo link"]');
    const count = await inputs.count();
    if (count >= 2) {
      await inputs.nth(0).fill('https://example.com/a.jpg');
      await inputs.nth(1).focus();
      const v1 = await inputs.nth(0).inputValue();
      const v2 = await inputs.nth(1).inputValue();
      check('R5: closure field is per-ticket (A keeps its value)', v1 === 'https://example.com/a.jpg', v1);
      check('R5: closure field is per-ticket (B is empty)', v2 === '', v2);
    } else {
      console.log(`  INFO  only ${count} resolvable ticket(s) in queue; skipping isolation test`);
    }
    await page.close();
  }

  await browser.close();
  console.log(`\n==== REGRESSION: ${PASS.length} passed, ${FAIL.length} failed`);
  if (FAIL.length) { console.log('\nFailures:'); FAIL.forEach(f => console.log('  -', f)); process.exit(1); }
}

main().catch(e => { console.error(e); process.exit(1); });
