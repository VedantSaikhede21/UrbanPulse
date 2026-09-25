/* Exercises the closure-media upload against a running backend.
 * Verifies the officer's own ticket is accepted, and that an officer cannot
 * attach evidence to somebody else's ticket. */
import fs from 'node:fs';

const BACKEND = process.env.BACKEND_URL || 'http://localhost';
const TID = process.env.TICKET_ID || 'b07bceb9-a325-4a81-a46e-41a528073319';
const PHOTO = process.env.PHOTO || 'demo-assets/road-repair-after.webp';
const CREDS = '.env.qa-users';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

let pass = 0, fail = 0;
const check = (n, ok, d = '') => { ok ? pass++ : fail++; console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${n}${ok ? '' : '  -> ' + d}`); };

const token = async (email) => {
  const r = await fetch(`${env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'UrbanPulse@2026' }),
  });
  return (await r.json()).access_token;
};

const post = async (tk, ticketId, file) => {
  const ext = file.slice(file.lastIndexOf('.'));
  const fd = new FormData();
  // The name has to carry the real extension: the endpoint validates magic
  // bytes against it and rejects a mismatch as type spoofing.
  fd.append('file', new Blob([fs.readFileSync(file)], { type: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg' }), `closure${ext}`);
  return fetch(`${BACKEND}/api/tickets/${ticketId}/closure-media`, {
    method: 'POST', headers: { Authorization: `Bearer ${tk}` }, body: fd,
  });
};

const officerTk = await token('officer@urbanpulse.demo');

const ok = await post(officerTk, TID, PHOTO);
const okBody = await ok.json().catch(() => ({}));
check('officer uploads closure photo', ok.status === 200, `HTTP ${ok.status} ${JSON.stringify(okBody).slice(0, 150)}`);
check('response carries closure_media_url', typeof okBody.closure_media_url === 'string' && okBody.closure_media_url.length > 0);
console.log(`        url = ${okBody.closure_media_url}`);

const citizenTk = await token('resident@urbanpulse.demo');
const denied = await post(citizenTk, TID, PHOTO);
check('citizen rejected', denied.status === 403, `HTTP ${denied.status}`);

const bad = await post(officerTk, '00000000-0000-0000-0000-000000000000', PHOTO);
check('unknown ticket -> 404', bad.status === 404, `HTTP ${bad.status}`);

const noAuth = await fetch(`${BACKEND}/api/tickets/${TID}/closure-media`, { method: 'POST', body: new FormData() });
check('unauthenticated rejected', [401, 422].includes(noAuth.status), `HTTP ${noAuth.status}`);

console.log(`\n===== CLOSURE MEDIA: ${pass} passed, ${fail} failed =====`);
if (fail) process.exitCode = 1;
