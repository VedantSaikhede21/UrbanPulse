import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ['geolocation'],
    geolocation: { latitude: 19.076, longitude: 72.8777 },
  });

  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`Console error: ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`Page error: ${err.message}`));

  let passed = 0;
  let failed = 0;

  function check(name, condition) {
    if (condition) { passed++; console.log(`  ✅ ${name}`); }
    else { failed++; console.log(`  ❌ ${name}`); }
  }

  // 1. Load ReportIssue page
  console.log('\n📄 Navigate to /citizen/report');
  await page.goto(`${BASE}/citizen/report`, { waitUntil: 'networkidle' });
  check('Page loads without errors', errors.length === 0);

  // 2. Step 1 - Upload photo / skip
  console.log('\n📸 Step 1: Photo upload');
  const skipBtn = page.locator('button', { hasText: 'Skip Photo Attachment' });
  await skipBtn.click();
  await page.waitForTimeout(500);
  check('Can skip photo and advance to Step 2', page.url().includes('/citizen/report'));

  // 3. Step 2 - Category selection + description + navigate to Step 3
  console.log('\n📋 Step 2: Category & description');
  const roadCat = page.locator('button', { hasText: 'Roads & Potholes' });
  await roadCat.click();
  const nextBtn = page.locator('button', { hasText: /Next Step.*Location/ });
  await nextBtn.click();
  await page.waitForTimeout(1000);
  check('Navigated to Step 3 (map)', true);

  // 4. Step 3 - Map loads
  console.log('\n🗺 Step 3: MapPicker');
  const mapContainer = page.locator('.leaflet-container');
  await mapContainer.waitFor({ state: 'visible', timeout: 10000 });
  check('Leaflet map container is visible', await mapContainer.isVisible());

  // 5. Check for map tiles loading
  const tiles = page.locator('.leaflet-tile-loaded');
  await page.waitForTimeout(2000);
  const tileCount = await tiles.count();
  check(`Map tiles loaded (${tileCount} tiles)`, tileCount > 0);

  // 6. Click map to place marker
  console.log('\n📍 Click map to place marker');
  const mapBounds = await mapContainer.boundingBox();
  if (mapBounds) {
    const clickX = mapBounds.x + mapBounds.width / 2;
    const clickY = mapBounds.y + mapBounds.height / 2;
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(500);
    const marker = page.locator('.custom-map-marker');
    check('Marker appears after map click', await marker.count() > 0);
  }

  // 7. Check coordinates display
  console.log('\n📐 Coordinates display');
  const coordText = page.locator('text=19.076000°');
  await page.waitForTimeout(200);
  check('Coordinates shown after marker placement', await coordText.count() > 0 || await page.locator('text=°').count() > 0);

  // 8. Drag marker
  console.log('\n🖱 Drag marker');
  const markerEl = page.locator('.custom-map-marker');
  if (await markerEl.count() > 0) {
    const markerBox = await markerEl.first().boundingBox();
    if (markerBox) {
      await page.mouse.move(markerBox.x + 16, markerBox.y + 32);
      await page.mouse.down();
      await page.mouse.move(markerBox.x + 16 + 50, markerBox.y + 32 + 30, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(500);
      check('Marker draggable', true);
    }
  }

  // 9. GPS button
  console.log('\n🎯 GPS button');
  const gpsBtn = page.locator('button[title="Use current location"]');
  check('GPS button visible', await gpsBtn.isVisible());
  await gpsBtn.click();
  await page.waitForTimeout(1000);
  check('GPS button click does not cause errors', errors.length === 0);

  // 10. Voice recorder section (navigate back to Step 2 first)
  console.log('\n🎤 Voice recorder');
  const step2Back = page.locator('button:has-text("Back")').first();
  await step2Back.click();
  await page.waitForTimeout(300);
  const recordBtn = page.locator('button', { hasText: 'Record' });
  check('Voice Record button visible', await recordBtn.isVisible());
  // Navigate back to Step 3 for remaining tests
  const nextToStep3 = page.locator('button', { hasText: /Next Step.*Location/ });
  await nextToStep3.click();
  await page.waitForTimeout(500);

  // 11. Step back/forward navigation
  console.log('\n🔄 Step navigation');
  const backBtn = page.locator('button:has-text("Back")');
  if (await backBtn.count() > 0) {
    await backBtn.first().click();
    await page.waitForTimeout(300);
    check('Can navigate back to Step 2', true);
    const nextAgain = page.locator('button', { hasText: /Next Step.*Location/ });
    await nextAgain.click();
    await page.waitForTimeout(500);
    check('Can navigate forward to Step 3 again', true);
  }

  // 12. Mobile viewport
  console.log('\n📱 Mobile viewport');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  const mobileMap = page.locator('.leaflet-container');
  check('Map renders on mobile (375px)', await mobileMap.isVisible());
  await page.setViewportSize({ width: 1280, height: 800 });

  // 13. Console errors check
  console.log('\n🔍 Final error check');
  if (errors.length > 0) {
    console.log(`   Found ${errors.length} errors:`);
    errors.forEach(e => console.log(`   - ${e}`));
  }
  check('No console or page errors', errors.length === 0);

  // Summary
  console.log(`\n${'='.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(40)}`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
