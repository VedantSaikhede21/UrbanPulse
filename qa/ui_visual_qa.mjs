/* Visual + responsive QA for the pre-hackathon UI/UX pass.
 * Injects a real HS256 citizen session (same technique as route_matrix_qa.mjs)
 * and captures desktop / tablet / mobile screenshots of the authenticated
 * shell and the citizen dashboard, asserting the navigation, identity and
 * logout affordances the task requires.
 */
import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';
const OUT = process.env.OUT_DIR || 'F:/UrbanPulse AI/.playwright-mcp/ui';
const SECRET = (
  process.env.SUPABASE_JWT_SECRET || fs.readFileSync('/tmp/opencode/jwt_secret.txt', 'utf8')
).trim();
const SUPABASE_REF = process.env.SUPABASE_REF || 'lppdrsgqppyfcstrpksg';
const ROLE = process.env.QA_ROLE || 'citizen';
const SUB = process.env.QA_SUB || '00000000-0000-4000-8000-00000000c17a';

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

async function injectSession(page) {
  const email = 'citizen.ui-qa@urbanpulse';
  const token = mintToken(SUB, email, ROLE);
  return page.evaluate(({ key, token, sub, email, role }) => {
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    localStorage.setItem(key, JSON.stringify({
      access_token: token, refresh_token: 'qa-refresh', expires_in: 3600,
      expires_at: expiresAt, token_type: 'bearer',
      user: {
        id: sub, aud: 'authenticated', role: 'authenticated', email,
        app_metadata: {}, user_metadata: { role, name: 'Ravi Kumar' },
      },
    }));
  }, { key: `sb-${SUPABASE_REF}-auth-token`, token, sub: SUB, email, role: ROLE });
}

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];
  const pageErrors = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`[${vp.name}] ${m.text()}`); });
    page.on('pageerror', e => pageErrors.push(`[${vp.name}] ${e.message}`));

    console.log(`\n== ${vp.name} (${vp.width}x${vp.height})`);

    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await injectSession(page);

    await page.goto(BASE + '/citizen', { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('main', { timeout: 20000 });
    await page.waitForTimeout(1800);

    // --- Task requirement: header is visible without scrolling on every page
    const headerBox = await page.locator('header').first().boundingBox();
    check(`${vp.name}: sticky header rendered`, !!headerBox, 'no header box');
    if (headerBox) {
      check(
        `${vp.name}: header inside viewport`,
        headerBox.y >= -1 && headerBox.y < vp.height,
        `y=${headerBox.y}`
      );
      check(`${vp.name}: header is 64px tall`, Math.abs(headerBox.height - 64) < 2, `h=${headerBox.height}`);
    }

    // --- Task requirement: user identity + logout reachable
    const signout = page.getByTestId('header-signout-btn');
    check(`${vp.name}: logout button present`, await signout.count() > 0);
    if (await signout.count() > 0) {
      check(`${vp.name}: logout visible`, await signout.first().isVisible());
    }
    const emailText = await page.locator('header').first().innerText();
    check(
      `${vp.name}: user email visible in header`,
      /citizen\.ui-qa@urbanpulse/.test(emailText),
      `header text = ${emailText.replace(/\s+/g, ' ').slice(0, 120)}`
    );
    check(`${vp.name}: role label visible in header`, /Citizen/i.test(emailText));

    // --- Task requirement: brand mark is a role-aware home link
    const brand = page.locator('header a[href="/citizen"]').first();
    const brandCount = await brand.count();
    if (vp.width < 768) {
      check(`${vp.name}: mobile brand link present`, brandCount > 0);
    } else {
      const sideBrand = await page.locator('aside a[href="/citizen"]').count();
      check(`${vp.name}: role-aware brand link present`, sideBrand > 0);
    }

    // --- Task requirement: quick actions obvious
    const quick = page.locator('section[aria-label="Quick actions"] a');
    check(`${vp.name}: 3 quick actions`, (await quick.count()) === 3, `count=${await quick.count()}`);
    const firstQuick = await quick.first().innerText().catch(() => '');
    check(`${vp.name}: quick action 1 is report`, /report an issue/i.test(firstQuick), firstQuick);

    // --- Task requirement: onboarding / status tracking surfaces
    check(`${vp.name}: metrics present`, (await page.locator('section[aria-label="Report totals"]').count()) > 0);
    const reports = page.locator('section[aria-label="Your reports"]');
    check(`${vp.name}: reports section present`, (await reports.count()) > 0);

    await page.screenshot({
      path: path.join(OUT, `citizen-dashboard-${vp.name}.png`),
      fullPage: true,
    });

    // --- scroll down: header must stay put
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(400);
    const afterScroll = await page.locator('header').first().boundingBox();
    if (afterScroll) {
      check(
        `${vp.name}: header stays visible after scroll`,
        afterScroll.y >= -1 && afterScroll.y < vp.height,
        `y=${afterScroll.y}`
      );
    }

    // --- no horizontal overflow
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    check(`${vp.name}: no horizontal overflow`, overflow <= 1, `overflow=${overflow}px`);

    // --- deep page keeps the same shell
    await page.goto(BASE + '/citizen/notifications', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1200);
    const deepHeader = await page.locator('header').first().boundingBox();
    check(`${vp.name}: header on nested page`, !!deepHeader && deepHeader.y < vp.height);
    await page.screenshot({ path: path.join(OUT, `citizen-notifications-${vp.name}.png`) });

    // --- mobile drawer must expose identity + logout too
    if (vp.width < 768) {
      await page.goto(BASE + '/citizen', { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1200);
      await page.getByLabel('Open navigation menu').click();
      await page.waitForTimeout(500);
      const drawer = page.locator('aside[aria-label="Main navigation"]').last();
      const drawerText = await drawer.innerText();
      check(`${vp.name}: drawer shows email`, /citizen\.ui-qa@urbanpulse/.test(drawerText));
      check(`${vp.name}: drawer has Sign Out`, /sign out/i.test(drawerText));
      await page.screenshot({ path: path.join(OUT, `citizen-drawer-${vp.name}.png`) });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      // The desktop sidebar is always in the DOM (CSS-hidden below md), so
      // assert on the drawer's own close affordance disappearing instead.
      const closeBtn = page.getByLabel('Close navigation menu');
      check(`${vp.name}: Escape closes drawer`, (await closeBtn.count()) === 0);
    }

    await page.close();
  }

  // --- auth pages at mobile width
  for (const [label, url] of [
    ['citizen-login', '/auth/citizen-login'],
    ['staff-login', '/auth/staff-login'],
    ['staff-register', '/auth/staff-register'],
    ['forgot-password', '/auth/forgot-password'],
  ]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`[${label}] ${m.text()}`); });
    page.on('pageerror', e => pageErrors.push(`[${label}] ${e.message}`));
    await page.goto(BASE + url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(700);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    check(`auth ${label}: no horizontal overflow at 390px`, overflow <= 1, `overflow=${overflow}px`);
    await page.screenshot({ path: path.join(OUT, `auth-${label}-mobile.png`), fullPage: true });
    await page.close();
  }

  // --- 404 route must explain itself instead of silently redirecting
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', e => pageErrors.push(`[404] ${e.message}`));
    await page.goto(BASE + '/definitely-not-a-real-page', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(900);
    const body = await page.locator('body').innerText();
    check('404: stays on the bad URL', page.url().includes('/definitely-not-a-real-page'), page.url());
    check('404: explains the problem', /does not exist/i.test(body));
    check('404: offers a way out', /were you looking for/i.test(body));
    await page.screenshot({ path: path.join(OUT, 'not-found-desktop.png'), fullPage: true });
    await page.close();
  }

  // --- reduced motion: page transition must still render and settle
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    page.on('pageerror', e => pageErrors.push(`[reduced-motion] ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(`[reduced-motion] ${m.text()}`); });
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(800);
    check('reduced motion: landing still renders', (await page.locator('h1').count()) > 0);
    // Only in-viewport nodes matter: below-the-fold `whileInView` reveals are
    // meant to sit at opacity 0 until scrolled to.
    const stuck = await page.evaluate(() => {
      const h = window.innerHeight;
      return Array.from(document.querySelectorAll('h1, h2, p, a, button')).filter(el => {
        const r = el.getBoundingClientRect();
        const onScreen = r.top < h && r.bottom > 0 && r.width > 0;
        return onScreen && Number(getComputedStyle(el).opacity) < 0.05;
      }).length;
    });
    check('reduced motion: nothing visible stuck at opacity 0', stuck === 0, `${stuck} invisible on screen`);
    await page.screenshot({ path: path.join(OUT, 'landing-reduced-motion.png') });
    await page.close();
  }

  await browser.close();

  console.log(`\n==== RESULT: ${PASS.length} passed, ${FAIL.length} failed`);
  if (pageErrors.length) {
    console.log('\nPage errors:');
    for (const e of pageErrors) console.log('  -', e);
  }
  if (consoleErrors.length) {
    console.log('\nConsole errors:');
    for (const e of consoleErrors) console.log('  -', e);
  }
  if (FAIL.length) {
    console.log('\nFailures:');
    for (const f of FAIL) console.log('  -', f);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
