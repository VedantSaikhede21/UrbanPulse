/* Does a real photo upload work on the deployed backend?
 *
 * This is the demo's core path (citizen attaches a photo to a report), and
 * health/external already reports supabase_storage as failing. This confirms
 * the user-visible consequence: a 500 on /api/upload.
 */
import crypto from 'node:crypto';

const API = process.env.API_URL || 'https://backend-production-8d13.up.railway.app';
const SECRET = (process.env.SUPABASE_JWT_SECRET || '').trim();
const OFFICER_ID = (process.env.SUPER_ADMIN_ID || '').trim();
const b64 = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const now = Math.floor(Date.now() / 1000);
const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const p = b64(JSON.stringify({
  sub: OFFICER_ID, email: 'admin@urbanpulse.ai', phone: '',
  aud: 'authenticated', role: 'authenticated',
  iat: now, exp: now + 3600, user_metadata: { role: 'super_admin', name: 'Karthik Rao' },
}));
const token = `${h}.${p}.${b64(crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest())}`;

// Smallest valid PNG (1x1 transparent).
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const form = new FormData();
form.append('file', new Blob([png], { type: 'image/png' }), 'probe.png');

const r = await fetch(`${API}/api/upload`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: form,
});

console.log(`POST /api/upload -> ${r.status}`);
const text = await r.text();
console.log(text.slice(0, 500));

if (r.ok) {
  console.log('\nUPLOAD OK — media pipeline works end to end.');
} else {
  console.log('\nUPLOAD FAILED — photo reports will break in the demo.');
  console.log('Most likely cause: SUPABASE_STORAGE_BUCKET is set but the bucket does not exist.');
}
