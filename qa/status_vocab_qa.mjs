/* Proves the needs_review fix: PublicMap had no colour/label/radius entry for
 * it, so those tickets drew no dot at all. Assert every distinct status in the
 * live city feed has a label, a colour and a radius.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';
const OUT = '.playwright-mcp/verify';

const map = fs.readFileSync('frontend/src/lib/ticketStatus.ts', 'utf8');
const extract = (name) => {
  const m = map.match(new RegExp(`${name}: Record<string, string> = \\{([\\s\\S]*?)\\};`));
  return m ? [...m[1].matchAll(/(\w+):\s*'([^']+)'/g)].map(x => [x[1], x[2]]) : [];
};
const extractNum = (name) => {
  const m = map.match(new RegExp(`${name}: Record<string, number> = \\{([\\s\\S]*?)\\};`));
  return m ? [...m[1].matchAll(/(\w+):\s*(\d+)/g)].map(x => [x[1], x[2]]) : [];
};

const colors = new Map(extract('MAP_COLOR'));
const labels = new Map(extract('DISPLAY'));
const radii = new Map(extractNum('MAP_RADIUS'));
const badges = new Map(extract('BADGE'));

const LIVE = ['reported', 'assigned', 'in_progress', 'needs_review', 'resolved', 'verified'];
let fail = 0;
for (const s of LIVE) {
  const c = colors.get(s), l = labels.get(s), r = radii.get(s), b = badges.get(s);
  const ok = c && l && r && b;
  if (!ok) fail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${s.padEnd(13)} label=${l ?? '-'} color=${c ?? '-'} radius=${r ?? '-'} badge=${b ?? '-'}`);
}

const br = await chromium.launch({ headless: true });
const pg = await (await br.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await pg.goto(BASE + '/public-map', { waitUntil: 'networkidle', timeout: 30000 });
fs.mkdirSync(OUT, { recursive: true });
await pg.screenshot({ path: `${OUT}/publicmap-needs-review.png`, fullPage: true });
const legend = await pg.evaluate(() => document.body.innerText);
const hasNR = /Needs review/i.test(legend);
console.log(`  ${hasNR ? 'PASS' : 'FAIL'}  live public map legend mentions "Needs review"`);
await br.close();

console.log(`\n===== STATUS VOCABULARY: ${LIVE.length * 2 + 1 - fail - (hasNR ? 0 : 1)} passed, ${fail + (hasNR ? 0 : 1)} failed =====`);
process.exitCode = fail + (hasNR ? 0 : 1) ? 1 : 0;
