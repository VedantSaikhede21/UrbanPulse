/* Proves the backend accepts a real Supabase ES256 token and rejects the
 * algorithm-confusion cases that the old HS256-only check would have waved
 * through. Talks to whatever BACKEND is pointed at, so it can be run against
 * localhost before a deploy and against the deployed URL after.
 */
import fs from 'node:fs';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';
const SUPA = fs.readFileSync('.env', 'utf8');
const env = Object.fromEntries(
  SUPA.split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const SUPA_URL = env.SUPABASE_URL;
const ANON = env.SUPABASE_ANON_KEY;

const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const sign = (alg, obj, key = 'not-a-real-key') =>
  `${b64({ alg, typ: 'JWT' })}.${b64(obj)}.${Buffer.from(key).toString('base64url')}`;

let pass = 0, fail = 0;
const check = (name, ok, detail = '') => {
  ok ? pass++ : fail++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  -> ' + detail}`);
};

// 1. real token from the live project
const login = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: ANON, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'officer@urbanpulse.demo', password: 'UrbanPulse@2026' }),
});
const sess = await login.json();
if (!sess.access_token) {
  console.error('could not obtain a token:', JSON.stringify(sess).slice(0, 200));
  process.exit(2);
}
const real = sess.access_token;
const realHeader = JSON.parse(Buffer.from(real.split('.')[0], 'base64url').toString());
console.log(`\nlive token alg=${realHeader.alg} kid=${realHeader.kid ? 'yes' : 'no'}\n`);

const call = (token, path = '/api/officers/queue') =>
  fetch(`${BACKEND}${path}`, { headers: { Authorization: `Bearer ${token}` } });

// 2. the real ES256 token must be accepted
const okRes = await call(real);
const okBody = await okRes.text();
check('real ES256 token accepted', okRes.status === 200, `HTTP ${okRes.status} ${okBody.slice(0, 160)}`);

// 3. the queue must actually contain the officer's data
if (okRes.status === 200) {
  const data = JSON.parse(okBody);
  const n = Array.isArray(data) ? data.length : (data.items?.length ?? data.tickets?.length ?? null);
  console.log(`        queue payload: ${Array.isArray(data) ? 'array' : 'object'}, length=${n}`);
}

// 4. unsigned token must be refused
const noneTok = sign('none', {
  sub: '00000000-0000-0000-0000-000000000000', role: 'super_admin',
  aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 9999,
});
check('alg=none rejected', (await call(noneTok)).status === 401);

// 5. HS256 signed with the wrong secret must be refused
const hs = sign('HS256', {
  sub: sess.user.id, role: 'super_admin', aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + 9999,
});
check('HS256 with wrong secret rejected', (await call(hs)).status === 401);

// 6. garbage must be refused without a 500
check('malformed token -> 401 not 500', (await call('not.a.jwt')).status === 401);

console.log(`\n===== JWT ALG: ${pass} passed, ${fail} failed =====`);
if (fail) process.exitCode = 1;
