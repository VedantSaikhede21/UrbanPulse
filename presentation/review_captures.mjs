import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const SLIDES_DIR = '/media/vijay/VIP FILES/UrbanPulse/presentation/something/urbanpulse-ai.slides';
const OUT_DIR  = '/media/vijay/VIP FILES/UrbanPulse/presentation/review';
const PORT = 9876;

const manifestPath = path.join(SLIDES_DIR, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const slides = manifest.playlist;

// start HTTP server
const server = spawn('python3', ['-m', 'http.server', String(PORT)], {
  cwd: SLIDES_DIR,
  stdio: 'ignore',
});

await new Promise(r => setTimeout(r, 1000));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

for (const [i, slideFile] of slides.entries()) {
  const url = `http://localhost:${PORT}/slides/${slideFile}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(500);

  const num = String(i + 1).padStart(2, '0');
  const label = slideFile.replace('.html', '');
  const filename = path.join(OUT_DIR, `${num}_${label}.png`);

  await page.screenshot({ path: filename, fullPage: false });
  console.log(`[${num}/${slides.length}] ${label}`);
}

await browser.close();
server.kill();
console.log(`\nDone — ${slides.length} slides saved to ${OUT_DIR}`);
