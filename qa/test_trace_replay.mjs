import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1';
const TICKET_ID = process.env.TICKET_ID || 'ad45e781-7e26-401e-bf66-8cf63d9b572f';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  await page.goto(`${BASE}/trace`, { waitUntil: 'networkidle' });
  await page.getByRole('textbox', { name: 'Paste a Ticket UUID' }).fill(TICKET_ID);
  await page.getByRole('button', { name: 'Run Pipeline' }).click();
  await page.getByText('Pipeline Complete', { exact: true }).waitFor({ state: 'visible', timeout: 30000 });
  await page.getByText('CX Agent', { exact: true }).first().waitFor({ state: 'visible' });
  await page.getByText('Analytics Agent', { exact: true }).first().waitFor({ state: 'visible' });
  console.log('trace-replay=pass');
} finally {
  await browser.close();
}
