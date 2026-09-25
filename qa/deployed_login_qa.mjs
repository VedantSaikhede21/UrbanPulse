/* Verifies email+password sign-in on the DEPLOYED site for every role.
 *
 * This is the path a demo depends on, so it is tested as a user would do it:
 * real browser, real Supabase session, real redirect into the role dashboard.
 * A passing Supabase token is not enough — the app still has to store the
 * session, resolve the role, and route to the right home.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const SITE = process.env.SITE_URL || 'https://urban-pulse-eight.vercel.app';
const CREDS = '.env.qa-users';
const OUT = '.playwright-mcp/verify';

if (!fs.existsSync(CREDS)) {
  console.error(`missing ${CREDS} — run: node qa/seed_demo_users.mjs`);
  process.exit(2);
}

const creds = fs.readFileSync(CREDS, 'utf8')
  .split('\n')
  .filter(l => l.includes('='))
  .map(l => {
    const [email, password] = l.split('=');
    return { email: email.trim(), password: password.trim() };
  });

const EXPECT_HOME = {
  'resident@urbanpulse.demo': '/citizen',
  'officer@urbanpulse.demo': '/officer',
  'dept@urbanpulse.demo': '/dept',
  'admin@urbanpulse.demo': '/admin',
  'superadmin@urbanpulse.demo': '/super-admin',
};

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
let pass = 0, fail = 0;
const check = (n, c, d = '') => {
  if (c) pass++; else fail++;
  console.log(`  ${c ? 'PASS' : 'FAIL'}  ${n}${c ? '' : '  -> ' + d}`);
};

for (const { email, password } of creds) {
  const expected = EXPECT_HOME[email];
  if (!expected) continue;
  console.log(`\n--- ${email} ---`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  const isStaff = !email.startsWith('resident@');
  const path = isStaff ? '/auth/staff-login' : '/auth/citizen-login';
  await page.goto(`${SITE}${path}`, { waitUntil: 'networkidle', timeout: 60000 });

  const sel = {
    email: isStaff ? '#staff-email' : '#citizen-email',
    password: isStaff ? '#staff-password' : '#citizen-password',
    submit: isStaff ? 'button[type="submit"]' : '#citizen-login-btn',
  };
  const hasForm = await page.locator(sel.email).count();
  if (!hasForm) { check(`${email}: email field present`, false, 'not found'); await ctx.close(); continue; }
  check(`${email}: email field present`, true);

  await page.fill(sel.email, email);
  await page.fill(sel.password, password);
  await page.click(sel.submit);

  let landed = expected;
  try {
    await page.waitForURL(u => u.pathname.startsWith(expected), { timeout: 30000 });
  } catch { landed = new URL(page.url()).pathname; }

  check(`${email}: lands in ${expected}`, landed.startsWith(expected), `got ${landed}`);

  const body = await page.evaluate(() => document.body.innerText);
  check(`${email}: dashboard actually rendered`, body.length > 200, `only ${body.length} chars`);
  check(`${email}: no page errors`, errs.length === 0, errs.slice(0, 1).join(''));

  const shot = `${OUT}/login-${email.split('@')[0]}.png`;
  await page.screenshot({ path: shot, fullPage: true });
  await ctx.close();
}

await browser.close();
console.log(`\n===== DEPLOYED EMAIL LOGIN: ${pass} passed, ${fail} failed =====`);
if (fail) process.exitCode = 1;
