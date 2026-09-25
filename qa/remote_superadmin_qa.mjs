/* Mint a real super_admin JWT for the deployed backend and probe the external
 * dependency health endpoint. This is how you find out — before a demo — that
 * Gemini is unreachable or its quota is exhausted.
 *
 * Usage:
 *   set SUPABASE_JWT_SECRET=<backend's SUPABASE_JWT_SECRET>
 *   node qa/remote_superadmin_qa.mjs
 */
import crypto from 'node:crypto';

const API = process.env.API_URL || 'https://backend-production-8d13.up.railway.app';
const SECRET = (process.env.SUPABASE_JWT_SECRET || '').trim();
const OFFICER_ID = (process.env.SUPER_ADMIN_ID || '').trim();
const b64 = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

if (!SECRET || !OFFICER_ID) {
  console.error('Set SUPABASE_JWT_SECRET and SUPER_ADMIN_ID first.');
  process.exit(2);
}

const now = Math.floor(Date.now() / 1000);
const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const p = b64(JSON.stringify({
  sub: OFFICER_ID, email: 'admin@urbanpulse.ai', phone: '',
  aud: 'authenticated', role: 'authenticated',
  iat: now, exp: now + 3600, user_metadata: { role: 'super_admin', name: 'Karthik Rao' },
}));
const token = `${h}.${p}.${b64(crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest())}`;

const get = async (path) => {
  const r = await fetch(API + path, { headers: { Authorization: `Bearer ${token}` } });
  let body = null;
  try { body = await r.json(); } catch {}
  return { status: r.status, body };
};

console.log('=== /api/health ===');
const h1 = await get('/api/health');
console.log(h1.status, JSON.stringify(h1.body, null, 2));

console.log('\n=== /api/health/ready ===');
const h2 = await get('/api/health/ready');
console.log(h2.status, JSON.stringify(h2.body, null, 2));

console.log('\n=== /api/health/external  (Gemini / Twilio reachability) ===');
const h3 = await get('/api/health/external');
console.log(h3.status, JSON.stringify(h3.body, null, 2));

const ext = h3.body?.dependencies || h3.body;
if (ext?.gemini) {
  console.log(`\nGEMINI: ${ext.gemini.ok ? 'OK' : 'FAILING — ' + ext.gemini.error}`);
}
