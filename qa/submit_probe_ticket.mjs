/* Submits ONE real report to the deployed backend and reports how the
 * pipeline progresses. Purpose: measure the true number of Gemini calls a
 * single ticket costs, so we can compute how many demos fit in the daily quota.
 *
 * This spends real Gemini quota — run it deliberately, not in a loop.
 */
import crypto from 'node:crypto';

const API = process.env.API_URL || 'https://backend-production-8d13.up.railway.app';
const SECRET = (process.env.SUPABASE_JWT_SECRET || '').trim();
const SUB = (process.env.CITIZEN_ID || '').trim() || crypto.randomUUID();
// citizens.email is UNIQUE. A fixed probe email would collide with the row a
// previous run created and surface a 500, so make it unique per run.
const EMAIL = `qa-probe-${Date.now().toString(36)}@test.urbanpulse`;
const b64 = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const now = Math.floor(Date.now() / 1000);
const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const p = b64(JSON.stringify({
  sub: SUB, email: EMAIL, phone: '',
  aud: 'authenticated', role: 'authenticated',
  iat: now, exp: now + 3600, user_metadata: { role: 'citizen', name: 'QA Citizen' },
}));
const token = `${h}.${p}.${b64(crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest())}`;

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

// 1. upload a photo so the Vision agent takes its image path
const form = new FormData();
form.append('file', new Blob([png], { type: 'image/png' }), 'probe.png');
const up = await fetch(`${API}/api/upload`, {
  method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
});
const upBody = await up.json();
console.log(`upload: ${up.status}`);
if (!up.ok) { console.log(upBody); process.exit(1); }

const mediaUrl = upBody.url || upBody.media_url;

// 2. submit the report
const created = await fetch(`${API}/api/tickets`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'Water Leak',
    severity: 'high',
    description: 'Large water pipeline burst on the main road near the station, water is pooling across the road and vehicles are splashing pedestrians.',
    latitude: 19.033,
    longitude: 73.0298,
    // The schema field is original_media_url, not media_url. Pydantic ignores
    // unknown keys, so sending media_url silently drops the photo and the
    // Vision agent then reports "No image provided".
    original_media_url: mediaUrl,
  }),
});
const ticket = await created.json();
console.log(`create: ${created.status}`);
if (!created.ok) { console.log(ticket); process.exit(1); }
const id = ticket.id || ticket.ticket_id;
console.log(`ticket_id: ${id}`);
console.log(`CITIZEN_ID=${SUB}`);
console.log(`\nNow watch: curl ${API}/api/tickets/${id}/process  (SSE trace)`);
console.log(`Or open the Processing page in the browser for that ticket id.`);
