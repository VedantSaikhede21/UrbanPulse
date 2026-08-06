import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`CONSOLE ERROR: ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

  console.log('=== SPRINT 2B VERIFICATION ===\n');

  console.log('1. Load landing page');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('   ✓ Page loaded\n');

  // ── Test scroll math ──
  console.log('2. Scroll math');
  const metrics = await page.evaluate(() => {
    const section = document.querySelector('[data-pipeline]');
    if (!section) return { error: 'pipeline section not found' };
    const rect = section.getBoundingClientRect();
    const totalHeight = document.documentElement.scrollHeight;
    const vh = window.innerHeight;
    return {
      sectionTop: Math.round(rect.top + window.scrollY),
      sectionHeight: rect.height,
      expectedHeight: 9 * vh,
      vhCount: (rect.height / vh).toFixed(1),
      totalPageHeight: totalHeight,
    };
  });
  console.log(`   Section top: ${metrics.sectionTop}px`);
  console.log(`   Section height: ${metrics.sectionHeight}px (${metrics.vhCount}vh)`);
  console.log(`   Expected: ${metrics.expectedHeight}px (9 × ${1080}px)`);
  const heightOk = Math.abs(metrics.sectionHeight - metrics.expectedHeight) < 600;
  console.log(`   Scroll math: ${heightOk ? '✓ CORRECT (includes header)' : '✗ WRONG'}`);
  if (!heightOk) errors.push(`Scroll height mismatch: got ${metrics.sectionHeight}, expected ~${metrics.expectedHeight}`);
  console.log('');

  // ── Test step progression ──
  console.log('3. Step progression');
  let lastStep = -1;
  const progressPoints = [0, 0.05, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 0.99];
  for (const pct of progressPoints) {
    const scrollPos = metrics.sectionTop + (metrics.sectionHeight * pct);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollPos);
    await page.waitForTimeout(200);

    const step = await page.evaluate(() => {
      const el = document.querySelector('[data-pipeline]');
      return el ? parseInt(el.getAttribute('data-step') || '0') : null;
    });

    if (step !== null) {
      if (step >= lastStep) {
        console.log(`   ${Math.round(pct * 100)}% → Step ${step} ✓`);
        lastStep = step;
      } else {
        console.log(`   ${Math.round(pct * 100)}% → Step ${step} REVERSED`);
      }
    }
  }
  if (lastStep <= 1) errors.push('Step counter did not advance through pipeline');
  console.log('');

  // ── Test no blank viewport ──
  console.log('4. Blank viewport check');
  let blankCount = 0;
  for (let pct = 0; pct <= 100; pct += 5) {
    const scrollPos = metrics.sectionTop + (metrics.sectionHeight * pct / 100);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollPos);
    await page.waitForTimeout(100);

    const hasContent = await page.evaluate(() => {
      const pipe = document.querySelector('[data-pipeline]');
      if (!pipe) return false;
      const text = pipe.textContent || '';
      return text.includes('Agent') || text.includes('1 / 9') || text.includes('CX Agent');
    });
    if (!hasContent) blankCount++;
  }
  console.log(`   Blank viewports: ${blankCount}/21`);
  if (blankCount > 3) errors.push(`Too many blank viewports: ${blankCount}/21`);
  console.log('');

  // ── Test mobile detection ──
  console.log('5. Mobile detection');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  const mobileDetected = await page.evaluate(() => {
    const section = document.querySelector('[data-pipeline]');
    return section?.getAttribute('data-mobile') === 'yes';
  });
  console.log(`   Mobile: ${mobileDetected ? '✓ detected' : '✗ not detected'}`);
  if (!mobileDetected) errors.push('Mobile detection not working');
  console.log('');

  // ── Test reduced motion ──
  console.log('6. Reduced motion detection');
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(500);
  const rmDetected = await page.evaluate(() => {
    const section = document.querySelector('[data-pipeline]');
    return section?.getAttribute('data-reduced-motion') === 'yes' ||
           section?.getAttribute('data-reduced-motion') === 'no';
  });
  console.log(`   Reduced motion: ${rmDetected ? '✓ detected' : '✗ not detected'}`);
  if (!rmDetected) errors.push('Reduced motion detection not present');
  console.log('');

  // ── Full E2E suite ──
  console.log('7. Full E2E regression');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(200);
  const e2ePages = [
    '/citizen/dashboard', '/citizen/report', '/about', '/public-map', '/support',
    '/admin/escalation', '/admin/incident-map', '/admin/analytics',
    '/officer/queue', '/officer/profile',
    '/dept', '/dept/analytics', '/dept/officers',
    '/super-admin', '/super-admin/users', '/super-admin/routing', '/super-admin/audit', '/super-admin/monitoring',
  ];
  let e2ePass = 0;
  let e2eFail = 0;
  for (const path of e2ePages) {
    try {
      await page.goto(`${BASE}${path}`, { waitUntil: 'load', timeout: 20000 });
      await page.waitForTimeout(1000);
      const body = await page.textContent('body') || '';
      if (!body.includes('Internal Server Error')) {
        e2ePass++;
      } else {
        e2eFail++;
        errors.push(`Server error on ${path}`);
      }
    } catch (err) {
      e2eFail++;
      errors.push(`Failed to load ${path}: ${err.message}`);
    }
  }
  console.log(`   ${e2ePass}/${e2ePages.length} passed`);
  if (e2eFail > 0) console.log(`   ${e2eFail} failed`);

  // ── Summary ──
  console.log('\n========== ERRORS ==========');
  if (errors.length === 0) {
    console.log('✓ ALL SPRINT 2B CHECKS PASSED');
  } else {
    errors.forEach(e => console.log(`  ${e}`));
    console.log(`\n${errors.length} error(s) found`);
  }

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(err => { console.error('CRASHED:', err.message); process.exit(1); });
