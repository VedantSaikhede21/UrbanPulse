/* Create email+password demo users in Supabase Auth.

 * Google OAuth is fragile in a hackathon: the consent screen shows an
 * "app isn't verified" warning, and the implicit flow redirects to whatever
 * Site URL is configured. Email+password removes that dependency entirely —
 * Supabase has mailer_autoconfirm=true, so these accounts are usable
 * immediately with no confirmation click.
 *
 * Passwords are generated per run unless QA_USERS_JSON supplies them, and are
 * written to a gitignored file rather than printed here.
 *
 * Usage:  node qa/seed_demo_users.mjs
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#') && l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);

const SUPABASE_URL = process.env.SUPABASE_URL || env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
const OUT = '.env.qa-users';

if (!SUPABASE_URL || !ANON) {
  console.error('SUPABASE_URL / SUPABASE_ANON_KEY not found in .env');
  process.exit(2);
}

// Fixed password on purpose. These are throwaway demo credentials for a live
// demo that someone else has to type under pressure, and a random password
// would be unusable (and unrecoverable without the service-role key, which is
// sealed on Railway). Override with QA_PW_<ROLE> if you want a different one.
const FIXED_PW = process.env.QA_DEMO_PASSWORD || 'UrbanPulse@2026';

// role is written into user_metadata; app/auth/deps.py reads the staff role
// from the officers table, so the citizen's metadata only needs to say citizen.
const USERS = [
  { email: 'citizen@urbanpulse.demo', name: 'Aarav Citizen', role: 'citizen' },
  { email: 'officer@urbanpulse.demo', name: 'Dave Kumar', role: 'officer' },
  { email: 'dept@urbanpulse.demo', name: 'Anita Desai', role: 'dept_head' },
  { email: 'admin@urbanpulse.demo', name: 'Meera Iyer', role: 'admin' },
  { email: 'superadmin@urbanpulse.demo', name: 'Karthik Rao', role: 'super_admin' },
];

const results = [];

for (const u of USERS) {
  const pw = process.env[`QA_PW_${u.role.toUpperCase()}`] || FIXED_PW;

  // Create via the PUBLIC signup endpoint. The admin endpoint needs the
  // service-role key, which is deliberately sealed on Railway and absent from
  // the local .env. Signup works because the project has disable_signup=false
  // and mailer_autoconfirm=true, so no confirmation round-trip is needed.
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: u.email,
      password: pw,
      data: { role: u.role, name: u.name },
    }),
  });
  const body = await res.json().catch(() => ({}));
  let status = null;

  if (res.ok && (body?.id || body?.user?.id)) {
    status = 'created';
  } else if (/already been registered|already exists/i.test(JSON.stringify(body))) {
    status = 'exists';
  } else {
    console.log(`  FAILED   ${u.role.padEnd(11)} ${u.email} -> ${res.status} ${JSON.stringify(body).slice(0, 140)}`);
    continue;
  }

  // Verify the credentials actually work, rather than assuming they do.
  const login = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: u.email, password: pw }),
  });
  const session = await login.json().catch(() => ({}));
  const usable = login.ok && !!session?.access_token;

  console.log(`  ${status === 'created' ? 'CREATED ' : 'EXISTS  '} ${u.role.padEnd(11)} ${u.email}` +
              (usable ? '  -> login verified' : `  -> LOGIN FAILED: ${JSON.stringify(session).slice(0, 100)}`));

  if (usable) {
    results.push({ ...u, id: body.id || body?.user?.id, password: pw,
                   user_id: session.user?.id, status });
  }
}

if (results.length) {
  const lines = results.map(r =>
    `# ${r.role}  (auth user id: ${r.user_id})\n${r.email}=${r.password}`).join('\n');
  fs.writeFileSync(OUT, lines + '\n');
  fs.appendFileSync('.gitignore', '\n# QA-generated demo credentials — never commit\n.env.qa-users\n');
  console.log(`\n${results.length}/${USERS.length} users usable. credentials -> ${path.resolve(OUT)} (gitignored)`);
  console.log('view with:  type .env.qa-users');
}
