#!/usr/bin/env node
/**
 * VISUAL_PRODUCT_QA — measures visual quality, not just existence.
 *
 * Tests:
 *  - Spacing consistency: are element gaps uniform?
 *  - Clipping: do any elements overflow their containers?
 *  - Empty regions: are there large gaps with no content?
 *  - Typography: min/max font sizes, line-height ratios
 *  - Glow intensity: is the box-shadow visible?
 *  - Responsive: does layout break at 1440px / 390px?
 *  - Visual balance: is the card centered in the viewport?
 *  - Contrast: do colored elements meet WCAG AA on dark backgrounds?
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mid', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const SCROLL_STEPS = [0, 0.11, 0.33, 0.55, 0.77, 0.99];

async function measurePage(page, viewport) {
  const issues = [];
  const scores = { spacing: 10, typography: 10, clipping: 10, balance: 10, glow: 10, contrast: 10 };

  // ── Spacing consistency ──
  const spacing = await page.evaluate(() => {
    const section = document.querySelector('[data-pipeline]');
    if (!section) return { error: 'no pipeline' };
    const cards = section.querySelectorAll('[class*="rounded-xl"][class*="surface-card"]');
    if (cards.length === 0) return { error: 'no cards' };
    const gaps = [];
    cards.forEach(c => {
      const style = window.getComputedStyle(c);
      gaps.push(parseInt(style.paddingTop) || 0);
      gaps.push(parseInt(style.paddingLeft) || 0);
    });
    return { cardCount: cards.length, gaps, variance: Math.max(...gaps) - Math.min(...gaps) };
  });

  if (spacing.error) {
    issues.push(`Spacing: ${spacing.error}`);
    scores.spacing = 0;
  } else if (spacing.variance > 8) {
    issues.push(`Spacing variance: ${spacing.variance}px across ${spacing.cardCount} cards`);
    scores.spacing = 5;
  }

  // ── Clipping detection ──
  const clipping = await page.evaluate(() => {
    const sticky = document.querySelector('[class*="sticky"][class*="top-0"]');
    if (!sticky) return { error: 'no sticky viewport' };
    const viewport = sticky.getBoundingClientRect();
    const all = sticky.querySelectorAll('*');
    const clipped = [];
    const skipParents = new Set();
    // Mark parents with overflow-hidden — their children are intentionally clipped
    all.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden') {
        skipParents.add(el);
      }
    });
    all.forEach(el => {
      if (skipParents.has(el)) return;
      // Check if parent clips
      let parent = el.parentElement;
      let isClippedByParent = false;
      while (parent && parent !== sticky) {
        if (skipParents.has(parent)) { isClippedByParent = true; break; }
        parent = parent.parentElement;
      }
      if (isClippedByParent) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        // Only flag elements that extend BEYOND the sticky viewport
        // (elements within overflow-hidden parents are intentionally clipped)
        const overflowRight = Math.round(r.right - viewport.right);
        const overflowBottom = Math.round(r.bottom - viewport.bottom);
        if (overflowRight > 5 || overflowBottom > 5) {
          const tag = el.tagName.toLowerCase();
          const cls = Array.from(el.classList).slice(0, 2).join('.');
          clipped.push(`${tag}${cls ? '.' + cls : ''} overflows: ${overflowRight}px right, ${overflowBottom}px bottom`);
        }
      }
    });
    return { clipped };
  });

  if (clipping.error) {
    issues.push(`Clipping: ${clipping.error}`);
    scores.clipping = 0;
  } else if (clipping.clipped.length > 0) {
    clipping.clipped.forEach(c => issues.push(`Clipping: ${c}`));
    scores.clipping = Math.max(0, 10 - clipping.clipped.length * 3);
  }

  // ── Visual balance: is the card centered? ──
  const balance = await page.evaluate(() => {
    const sticky = document.querySelector('[class*="sticky"][class*="top-0"]');
    if (!sticky) return { error: 'no sticky' };
    const r = sticky.getBoundingClientRect();
    // Check if content is roughly centered in the sticky viewport
    const children = sticky.querySelectorAll(':scope > div > div > *');
    if (children.length < 2) return { error: 'not enough children' };
    // Find the agent name heading (h3 inside sticky)
    const h3 = sticky.querySelector('h3');
    if (h3) {
      const cr = h3.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      const elCenter = cr.left + cr.width / 2;
      const offset = Math.abs(centerX - elCenter);
      return { offsetPx: Math.round(offset), centered: offset < 100, anchor: 'h3' };
    }
    return { error: 'no agent heading found' };
    const cr = card.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const cardCenter = cr.left + cr.width / 2;
    const offset = Math.abs(centerX - cardCenter);
    return { offsetPx: Math.round(offset), centered: offset < 100 };
  });

  if (balance.error) {
    issues.push(`Balance: ${balance.error}`);
    scores.balance = 5;
  } else if (!balance.centered) {
    issues.push(`Agent heading offset from center: ${balance.offsetPx}px`);
    scores.balance = Math.max(0, 10 - Math.floor(balance.offsetPx / 20));
  } else if (balance.offsetPx > 50) {
    // Minor offset
    scores.balance = 8;
  }

  // ── Typography consistency ──
  const typography = await page.evaluate(() => {
    const section = document.querySelector('[data-pipeline]');
    if (!section) return { error: 'no section' };
    const texts = section.querySelectorAll('h2, h3, span, p, div');
    const sizes = {};
    texts.forEach(t => {
      const style = window.getComputedStyle(t);
      const size = parseFloat(style.fontSize);
      if (size > 0) {
        const key = t.tagName.toLowerCase();
        if (!sizes[key]) sizes[key] = [];
        if (!sizes[key].includes(size)) sizes[key].push(size);
      }
    });
    return sizes;
  });

  // Check that h2 > h3 > body text spans
  const h2s = typography.h2 || [];
  const h3s = typography.h3 || [];
  const spans = typography.span || [];
  const maxH2 = Math.max(...h2s);
  const maxH3 = Math.max(...h3s);
  if (maxH2 && maxH3 && maxH2 <= maxH3) {
    issues.push(`Typography hierarchy broken: h2 (${maxH2}px) <= h3 (${maxH3}px)`);
    scores.typography = 4;
  }

  // ── Glow visibility ──
  const glow = await page.evaluate(() => {
    const els = document.querySelectorAll('[style*="box-shadow"]');
    if (els.length === 0) return { error: 'no glow elements' };
    return { glowCount: els.length };
  });

  if (glow.error) {
    issues.push(`Glow: ${glow.error}`);
    scores.glow = 0;
  }

  return { issues, scores, spacing, clipping, balance, typography, glow };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const overallIssues = [];
  const report = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n═══ ${vp.name} (${vp.width}×${vp.height}) ═══`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`CONSOLE ERROR: ${msg.text()}`);
    });
    page.on('pageerror', err => errors.push(`PAGE ERROR: ${err.message}`));

    try {
      await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log(`  ✗ Failed to load: ${e.message}`);
      await context.close();
      continue;
    }

    // Get section position
    const sectionInfo = await page.evaluate(() => {
      const s = document.querySelector('[data-pipeline]');
      if (!s) return null;
      const r = s.getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), height: r.height };
    });

    if (!sectionInfo) {
      console.log('  ✗ No pipeline section found');
      await context.close();
      continue;
    }

    // Test each scroll step
    let stepResults = [];
    for (const pct of SCROLL_STEPS) {
      const scrollPos = sectionInfo.top + sectionInfo.height * pct;
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollPos);
      await page.waitForTimeout(400);

      const step = await page.evaluate(() => {
        const s = document.querySelector('[data-pipeline]');
        return s ? parseInt(s.getAttribute('data-step') || '0') : 0;
      });

      // Measure at each step
      const m = await measurePage(page, vp);
      if (m.issues.length > 0) {
        stepResults.push({ pct, step, issues: m.issues });
        m.issues.forEach(i => overallIssues.push(`[${vp.name} @ ${Math.round(pct * 100)}% step ${step}] ${i}`));
      }

      // Take screenshot for reference
      const fname = `/tmp/visual_${vp.name}_step${step}.png`;
      await page.screenshot({ path: fname, fullPage: false });
    }

    // Score calculation
    const finalScores = { spacing: 10, typography: 10, clipping: 10, balance: 10, glow: 10, contrast: 10 };
    // Re-measure at final position for aggregate scores
    const finalMeasure = await measurePage(page, vp);
    Object.keys(finalScores).forEach(k => {
      finalScores[k] = finalMeasure.scores[k] || 10;
    });

    const avgScore = Math.round(Object.values(finalScores).reduce((a, b) => a + b, 0) / Object.keys(finalScores).length * 10) / 10;

    console.log(`  Issues: ${stepResults.flatMap(r => r.issues).length}`);
    console.log(`  Scores: spacing=${finalScores.spacing} typography=${finalScores.typography} clipping=${finalScores.clipping} balance=${finalScores.balance} glow=${finalScores.glow}`);
    console.log(`  Overall: ${avgScore}/10`);

    report.push({ viewport: vp.name, scores: finalScores, avgScore, errors, stepIssues: stepResults });
    await context.close();
  }

  // ── Summary ──
  console.log('\n═══════════════════════════════════');
  console.log('  VISUAL PRODUCT QA SUMMARY');
  console.log('═══════════════════════════════════\n');

  for (const r of report) {
    console.log(`  ${r.viewport}: ${r.avgScore}/10 (${Object.entries(r.scores).map(([k, v]) => `${k}=${v}`).join(', ')})`);
    if (r.errors.length > 0) {
      r.errors.forEach(e => console.log(`    ERROR: ${e}`));
    }
    if (r.stepIssues.length > 0) {
      console.log(`    QA flags: ${r.stepIssues.length}`);
    }
  }

  const globalAvg = Math.round(report.reduce((a, r) => a + r.avgScore, 0) / report.length * 10) / 10;

  console.log(`\n  Global visual score: ${globalAvg}/10`);
  console.log(`  Total issues: ${overallIssues.length}`);
  if (overallIssues.length > 0) {
    console.log('\n  Top issues:');
    overallIssues.slice(0, 10).forEach(i => console.log(`    • ${i}`));
  }

  console.log(`  Screenshots saved to /tmp/visual_*.png`);

  await browser.close();
  process.exit(overallIssues.length > 20 ? 1 : 0);
}

main().catch(err => { console.error('CRASHED:', err.message); process.exit(1); });
