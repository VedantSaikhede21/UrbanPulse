import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log('=== LOADING LANDING PAGE ===');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Get page metrics
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`Total page height: ${totalHeight}px (${(totalHeight / 1080).toFixed(1)}vh)`);

  // Find the pipeline section
  const pipelineInfo = await page.evaluate(() => {
    const section = document.querySelector('section:nth-child(4)'); // pipeline is 4th section
    if (!section) return { error: 'pipeline section not found' };
    const rect = section.getBoundingClientRect();
    const sticky = section.querySelector('[class*="sticky"]');
    const track = section.querySelector('[class*="flex"][class*="gap-16"]');
    return {
      sectionTop: rect.top + window.scrollY,
      sectionHeight: rect.height,
      stickyExists: !!sticky,
      trackExists: !!track,
      trackWidth: track ? track.scrollWidth : 0,
      trackCards: track ? track.children.length : 0,
    };
  });
  console.log('\n=== PIPELINE SECTION METRICS ===');
  console.log(JSON.stringify(pipelineInfo, null, 2));

  // Calculate scroll positions
  const pipelineStart = pipelineInfo.sectionTop || 0;
  const pipelineHeight = pipelineInfo.sectionHeight || 3240;
  const scrollDistance = pipelineInfo.trackWidth - 1920 || 1200;

  console.log(`\nScroll math:`);
  console.log(`  Pipeline start: ${pipelineStart}px`);
  console.log(`  Pipeline height: ${pipelineHeight}px (${(pipelineHeight/1080).toFixed(1)}vh)`);
  console.log(`  Track width: ${pipelineInfo.trackWidth}px`);
  console.log(`  Viewport width: 1920px`);
  console.log(`  Max scroll distance (track - viewport): ${scrollDistance}px`);
  console.log(`  Sticky duration: ${pipelineHeight}px of scroll`);
  console.log(`  Animation duration: ${scrollDistance}px of scroll`);
  console.log(`  Dead space: ${(pipelineHeight - scrollDistance)}px (${(((pipelineHeight - scrollDistance) / pipelineHeight) * 100).toFixed(0)}%)`);

  // Take screenshots at every 10% of pipeline scroll
  console.log('\n=== SCREENSHOTS ===');
  for (let pct = 0; pct <= 100; pct += 10) {
    const scrollPos = pipelineStart + (pipelineHeight * pct / 100);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollPos);
    await page.waitForTimeout(300);
    await page.screenshot({ 
      path: `/tmp/opencode/pipeline-${pct}pct.png`,
      fullPage: false
    });
    
    // Check what's visible in the pipeline
    const visibleInfo = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="flex"][class*="gap-16"] > div');
      const visible = [];
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const inView = rect.left < window.innerWidth && rect.right > 0;
        const percentInView = Math.max(0, Math.min(1, 
          (Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)) / rect.width
        ));
        visible.push({ index: i, left: Math.round(rect.left), right: Math.round(rect.right), percentInView: Math.round(percentInView * 100) });
      });
      return visible;
    });
    
    console.log(`  ${pct}% scroll:`);
    console.log(`    scrollY=${Math.round(scrollPos)}px`);
    console.log(`    visible cards: ${JSON.stringify(visibleInfo.filter(c => c.percentInView > 0))}`);
    if (visibleInfo.filter(c => c.percentInView > 0).length === 0) {
      console.log(`    ⚠️  BLANK VIEWPORT — no cards visible`);
    }
  }

  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
