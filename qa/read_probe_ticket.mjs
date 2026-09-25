/* Reads back a submitted probe ticket: final status, the agent trace, and
 * whether the run was served by Gemini or by the rule-based fallback.
 */
import crypto from 'node:crypto';

const API = process.env.API_URL || 'https://backend-production-8d13.up.railway.app';
const SECRET = (process.env.SUPABASE_JWT_SECRET || '').trim();
const SUB = (process.env.CITIZEN_ID || '').trim();
const TICKET = (process.env.TICKET_ID || '').trim();
const b64 = b => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const now = Math.floor(Date.now() / 1000);
const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
const p = b64(JSON.stringify({
  sub: SUB, email: 'qa-probe@test.urbanpulse', phone: '',
  aud: 'authenticated', role: 'authenticated',
  iat: now, exp: now + 3600, user_metadata: { role: 'citizen', name: 'QA Citizen' },
}));
const token = `${h}.${p}.${b64(crypto.createHmac('sha256', SECRET).update(`${h}.${p}`).digest())}`;

const get = async (path) => {
  const r = await fetch(API + path, { headers: { Authorization: `Bearer ${token}` } });
  let b = null; try { b = await r.json(); } catch {}
  return { status: r.status, body: b };
};

const t = await get(`/api/tickets/${TICKET}`);
console.log(`GET /api/tickets/${TICKET} -> ${t.status}`);
if (t.body) {
  const x = t.body;
  console.log(JSON.stringify({
    status: x.status,
    category: x.category,
    severity: x.severity,
    priority_score: x.priority_score,
    priority_reason: x.priority_reason,
    verification_status: x.verification_status,
    processing_state: x.processing_state,
    ai_degraded: x.ai_degraded,
    assigned_officer: x.assigned_officer,
    has_media: !!x.original_media_url,
  }, null, 2));
}

console.log('\n=== agent trace (from the ticket) ===');
const agents = t.body?.agents ?? t.body?.agent_logs ?? t.body?.trace;
if (Array.isArray(agents)) {
  for (const a of agents) {
    console.log(`  ${String(a.agent ?? a.node ?? '?').padEnd(16)} ${a.status ?? ''} ${(a.message ?? a.summary ?? '').slice(0, 90)}`);
  }
  console.log(`\n  total agent steps: ${agents.length}`);
} else {
  console.log('  (no agent list on this payload; keys: ' + Object.keys(t.body ?? {}).join(', ') + ')');
}
