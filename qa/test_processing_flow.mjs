import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
let ticketId = null;

try {
  const created = await page.request.post(`${BASE}/api/tickets`, {
    data: {
      category: 'Water Leak',
      severity: 'medium',
      description: `QA SSE pending regression ${Date.now()}`,
      latitude: 12.9715,
      longitude: 77.5945,
      status: 'reported',
      priority_score: 2,
    },
  });
  if (!created.ok()) throw new Error(`Ticket create failed: ${created.status()}`);
  ticketId = (await created.json()).id;

  await page.goto(`${BASE}/citizen/processing/${ticketId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const body = await page.locator('body').innerText();
  if (body.includes('Disconnected') || body.includes('Connection to the AI pipeline was lost')) {
    throw new Error('Processing page lost the SSE connection while the worker was running');
  }
  if (!body.includes('AI Pipeline Complete')) {
    throw new Error('Processing page did not reach pipeline completion');
  }
  console.log('processing-sse=pass');
} finally {
  if (ticketId) await page.request.delete(`${BASE}/api/tickets/${ticketId}`);
  await browser.close();
}
