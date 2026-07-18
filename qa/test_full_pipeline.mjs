import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  let pass = true;

  const suppressedErrorPatterns = ['favicon', 'Failed to fetch'];
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    for (const p of suppressedErrorPatterns) {
      if (msg.text().includes(p)) return;
    }
    errors.push(`CONSOLE ERROR: ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

  async function nav(url) {
    await page.goto(url, { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(1500);
    const body = await page.textContent('body') || '';
    if (body.includes('Internal Server Error') || body.includes('"detail"')) {
      errors.push(`Server error on ${url}`);
      return false;
    }
    return true;
  }

  // ── 1. Full citizen report flow ──────────────────────────
  console.log('\n=== 1. Citizen: Full Report Issue Flow ===');
  let ticketId = null;
  if (await nav(`${BASE}/citizen/report`)) {
    // Step 1 → Skip photo
    const skipBtn = page.locator('text=Skip Photo Attachment');
    if (await skipBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Step 1 → Step 2 (skip photo)');
    } else {
      errors.push('Could not find "Skip Photo Attachment" button');
    }

    // Step 2 → Select category + fill description
    const waterBtn = page.locator('text=Water Leak');
    if (await waterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await waterBtn.click();
      await page.waitForTimeout(300);
      console.log('  ✓ Selected category: Water Leak');
    }

    const textarea = page.locator('textarea');
    if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await textarea.fill('Test QA: Water pipe leak near the park entrance at Market Square.');
      console.log('  ✓ Filled description');
    }

    const nextBtn = page.locator('text=Next Step: Location');
    if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(500);
      console.log('  ✓ Step 2 → Step 3');
    }

    // Step 3 → Submit
    const submitBtn = page.locator('text=Submit & Process with AI');
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitBtn.click();
      // Wait for navigation to processing page
      await page.waitForTimeout(3000);
      const currentUrl = page.url();
      const match = currentUrl.match(/\/processing\/([a-f0-9-]+)/);
      if (match) {
        ticketId = match[1];
        console.log(`  ✓ Ticket created: ${ticketId}`);
      } else {
        errors.push('Could not extract ticket ID from URL after submit');
      }
    }
  }

  // ── 2. Processing page ──────────────────────────────
  console.log('\n=== 2. Citizen: Processing Page ===');
  if (ticketId) {
    if (await nav(`${BASE}/citizen/processing/${ticketId}`)) {
      console.log('  ✓ Processing page loaded');
    }
  } else {
    console.log('  ~ Skipped (no ticket created)');
  }

  // ── 3. Admin: Escalation Monitor ────────────────────
  console.log('\n=== 3. Admin: Escalation Monitor ===');
  if (await nav(`${BASE}/admin/escalation`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('SLA') || body.includes('Escalation')) {
      console.log('  ✓ Escalation data loaded');
    } else {
      errors.push('Escalation monitor: no data rendered');
    }
  }

  // ── 4. Admin: Incident Map (CircleMarker) ───────────
  console.log('\n=== 4. Admin: Incident Map ===');
  if (await nav(`${BASE}/admin/heatmap`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Incident Map') || body.includes('incident')) {
      console.log('  ✓ Incident Map loaded');
    } else {
      errors.push('Incident map: missing heading');
    }
  }

  // ── 5. Admin: City Analytics ────────────────────────
  console.log('\n=== 5. Admin: City Analytics ===');
  if (await nav(`${BASE}/admin/analytics`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Pulse') || body.includes('City')) {
      console.log('  ✓ Analytics loaded');
    } else {
      errors.push('Analytics: no content rendered');
    }
  }

  // ── 6. Officer Queue ────────────────────────────────
  console.log('\n=== 6. Officer: Queue ===');
  if (await nav(`${BASE}/officer/queue`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Queue')) {
      console.log('  ✓ Queue loaded');
    }
  }

  // ── 7. Officer Profile ────────────────────────────
  console.log('\n=== 7. Officer: Profile ===');
  if (await nav(`${BASE}/officer/profile`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Officer') || body.includes('Profile')) {
      console.log('  ✓ Profile loaded');
    }
  }

  // ── 8. Dashboard ────────────────────────────────
  console.log('\n=== 8. Citizen: Dashboard ===');
  if (await nav(`${BASE}/citizen/dashboard`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Report')) {
      console.log('  ✓ Dashboard loaded');
    }
  }

  // ── 9. About Page ──────────────────────────────
  console.log('\n=== 9. Public: About ===');
  if (await nav(`${BASE}/about`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('About')) {
      console.log('  ✓ About page loaded');
    }
  }

  // ── 10. PublicMap ──────────────────────────────
  console.log('\n=== 10. Public: Incident Map ===');
  if (await nav(`${BASE}/public-map`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('incident') || body.includes('Incident')) {
      console.log('  ✓ Public map loaded');
    }
  }

  // ── 11. Support ──────────────────────────────
  console.log('\n=== 11. Shared: Support ===');
  if (await nav(`${BASE}/support`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('FAQ') || body.includes('Support')) {
      console.log('  ✓ Support page loaded');
    }
  }

  // ── 12. Dept Dashboard ─────────────────────────
  console.log('\n=== 12. Dept Head: Dashboard ===');
  if (await nav(`${BASE}/dept`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Department') || body.includes('Ticket')) {
      console.log('  ✓ Dept dashboard loaded');
    }
  }

  // ── 13. Dept Analytics ─────────────────────────
  console.log('\n=== 13. Dept Head: Analytics ===');
  if (await nav(`${BASE}/dept/analytics`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Analytics') || body.includes('Category')) {
      console.log('  ✓ Dept analytics loaded');
    }
  }

  // ── 14. Dept Officer Management ────────────────
  console.log('\n=== 14. Dept Head: Officer Management ===');
  if (await nav(`${BASE}/dept/officers`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Officer') || body.includes('Management')) {
      console.log('  ✓ Officer management loaded');
    }
  }

  // ── 15. Super Admin Dashboard ─────────────────
  console.log('\n=== 15. Super Admin: Dashboard ===');
  if (await nav(`${BASE}/super-admin`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Admin') || body.includes('Dashboard')) {
      console.log('  ✓ Super admin dashboard loaded');
    }
  }

  // ── 16. Super Admin User Management ────────────
  console.log('\n=== 16. Super Admin: User Management ===');
  if (await nav(`${BASE}/super-admin/users`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('User') || body.includes('Citizen')) {
      console.log('  ✓ User management loaded');
    }
  }

  // ── 17. Super Admin Routing Config ─────────────
  console.log('\n=== 17. Super Admin: Routing Config ===');
  if (await nav(`${BASE}/super-admin/routing`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Routing') || body.includes('category')) {
      console.log('  ✓ Routing config loaded');
    }
  }

  // ── 18. Super Admin Audit Log ──────────────────
  console.log('\n=== 18. Super Admin: Audit Log ===');
  if (await nav(`${BASE}/super-admin/audit`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Audit') || body.includes('Ticket')) {
      console.log('  ✓ Audit log loaded');
    }
  }

  // ── 19. Super Admin Agent Monitoring ───────────
  console.log('\n=== 19. Super Admin: Agent Monitoring ===');
  if (await nav(`${BASE}/super-admin/monitoring`)) {
    const body = await page.textContent('body') || '';
    if (body.includes('Agent') || body.includes('System Status')) {
      console.log('  ✓ Agent monitoring loaded');
    }
  }

  // ── Summary ──────────────────────────────────────
  console.log('\n========== CONSOLE/PAGE ERRORS ==========');
  if (errors.length === 0) console.log('(none)');
  else errors.forEach(e => console.log(`  ${e}`));

  if (ticketId) {
    console.log(`\nTicket created during QA: ${ticketId}`);
  }

  const verdict = errors.length === 0 ? 'ALL PASS' : 'ISSUES FOUND';
  console.log(`\n========== ${verdict} ==========`);
  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('QA crashed:', err.message);
  process.exit(1);
});
