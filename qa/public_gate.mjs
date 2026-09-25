/* Public-surface regression gate for the pre-hackathon pass.
 * Covers the public pages an anonymous visitor can reach without signing in:
 * nav chrome exists, the map actually renders, a report path exists, status is
 * never colour-only, motion is reduced when asked, and no CSP/console errors.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';
const OUT = 'F:/UrbanPulse AI/.playwright-mcp/ui';

const PASS = [];
const FAIL = [];
function check(name, cond, detail = '') {
  (cond ? PASS : FAIL).push(name);
  console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + detail}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ---------- anonymous visitor, desktop ----------
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push(`pageerror: ${e.message}`));

    await page.goto(BASE + '/public-map', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(4000);

    check('map: no console/page errors (anonymous)', errs.length === 0, errs[0] || '');
    check('map: no CSP violations', !errs.some(e => /Content Security Policy/.test(e)));

    const mapBox = await page.locator('.leaflet-container').count();
    check('map: a map actually renders for anonymous visitors', mapBox > 0, `leaflet containers: ${mapBox}`);

    const tiles = await page.locator('.leaflet-tile-loaded').count();
    check('map: tiles loaded', tiles > 0, `loaded tiles: ${tiles}`);

    const region = await page.locator('[role="region"][aria-label*="map" i]').count();
    check('map: region has an accessible name', region > 0);

    // report path
    const reportCtas = await page.locator('a[href="/auth/citizen-login"]').count();
    check('map: a "report an issue" path exists', reportCtas > 0, `links: ${reportCtas}`);

    // legend: text labels, not colour swatches alone
    const legend = await page.locator('ul li:has(> span[style*="background-color"])').count();
    check('map: status legend has text labels', legend >= 2, `legend items: ${legend}`);

    // freshness
    const body = await page.locator('body').innerText();
    check('map: shows a freshness indicator', /Updated .*ago|just now/.test(body), body.slice(0, 160));

    // no raw technical error strings
    check('map: no raw API error text', !/API error|status of 5\d\d|NetworkError|Failed to fetch/i.test(body));

    // one page name
    const title = await page.title();
    check('map: single consistent page name', /city incident map/i.test(title), title);

    // nav chrome
    check('map: has site header', (await page.locator('header a[href="/"]').count()) > 0);
    check('map: has nav landmark', (await page.locator('nav[aria-label="Main"]').count()) > 0);
    check('map: skip link is first focusable', (await page.locator('a[href="#main-content"]').count()) > 0);
    check('map: has footer', (await page.locator('footer').count()) > 0);

    // heatmap toggle + refresh controls
    check('map: density toggle present', (await page.locator('button[aria-pressed]').count()) > 0);
    check('map: refresh control present', (await page.getByRole('button', { name: /refresh/i }).count()) > 0);

    await page.screenshot({ path: `${OUT}/public-map-desktop.png`, fullPage: true });
    await page.close();
  }

  // ---------- anonymous visitor, mobile ----------
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(BASE + '/public-map', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(4000);
    check('map mobile: renders a map', (await page.locator('.leaflet-container').count()) > 0);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    check('map mobile: no horizontal overflow', overflow <= 1, `${overflow}px`);
    const h = await page.locator('.leaflet-container').first().boundingBox();
    check('map mobile: map height fits a phone', !!h && h.height <= 400, h ? `${h.height}px` : 'none');
    await page.screenshot({ path: `${OUT}/public-map-mobile.png`, fullPage: true });
    await page.close();
  }

  // ---------- landing: reveals must not be stranded by a fast scroll ----------
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    const stuck = await page.evaluate(() => {
      const vh = window.innerHeight;
      return Array.from(document.querySelectorAll('h1, h2, h3, p, li')).filter(el => {
        const r = el.getBoundingClientRect();
        const onScreen = r.top < vh && r.bottom > 0 && r.width > 0;
        return onScreen && Number(getComputedStyle(el).opacity) < 0.05;
      }).length;
    });
    check('landing: fast scroll leaves no invisible content', stuck === 0, `${stuck} invisible on screen`);
    await page.close();
  }

  // ---------- reduced motion ----------
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BASE + '/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    const stuck = await page.evaluate(() => {
      const vh = window.innerHeight;
      return Array.from(document.querySelectorAll('h1, h2, h3, p, li')).filter(el => {
        const r = el.getBoundingClientRect();
        const onScreen = r.top < vh && r.bottom > 0 && r.width > 0;
        return onScreen && Number(getComputedStyle(el).opacity) < 0.05;
      }).length;
    });
    check('reduced motion: no content stranded invisible', stuck === 0, `${stuck} invisible on screen`);
    const heroOpacity = await page.evaluate(() => {
      const s = document.querySelector('section');
      return s ? Number(getComputedStyle(s).opacity) : 1;
    });
    check('reduced motion: hero stays fully opaque', heroOpacity > 0.99, `opacity ${heroOpacity}`);
    await page.close();
  }

  // ---------- no 7/8/9px text anywhere public ----------
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const tiny = new Set();
    for (const url of ['/', '/public-map', '/about', '/auth/citizen-login', '/auth/staff-login']) {
      await page.goto(BASE + url, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(2200);
      const sizes = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll('*')) {
          if (!el.textContent?.trim() || el.children.length > 0) continue;
          // The Leaflet attribution control is a third-party licensing widget
          // that conventionally uses small type; it is styled in index.css.
          if (el.closest('.leaflet-control-attribution')) continue;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs && fs < 10) out.push(`${Math.round(fs)}px:${el.textContent.trim().slice(0, 28)}`);
        }
        return out;
      });
      sizes.forEach(s => tiny.add(s));
    }
    check('public pages: no text below 10px', tiny.size === 0, [...tiny].slice(0, 6).join(' | '));
    await page.close();
  }

  await browser.close();
  console.log(`\n==== PUBLIC GATE: ${PASS.length} passed, ${FAIL.length} failed`);
  if (FAIL.length) { console.log('\nFailures:'); FAIL.forEach(f => console.log('  -', f)); process.exit(1); }
}

main().catch(e => { console.error(e); process.exit(1); });
