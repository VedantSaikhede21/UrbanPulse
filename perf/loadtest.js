// k6 load test for UrbanPulse public + read-only endpoints.
//
// Targets the surfaces that are reachable without auth: the
// liveness probe, the city-pulse digest, and the public map.
// Auth-gated write surfaces (citizen report, agent metrics) are
// out of scope here — they need a token-minting fixture that
// does not belong in a load test.
//
// Run:
//   k6 run perf/loadtest.js
//   k6 run -e BASE_URL=https://staging.urbanpulse.ai perf/loadtest.js
//   k6 run --vus 50 --duration 60s perf/loadtest.js
//
// The thresholds below are generous — they are not SLA numbers
// for production, just early-warning gates. Tighten them once a
// real production baseline is captured.

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:8000';

const errorRate = new Rate('http_errors');
const cityPulseLatency = new Trend('city_pulse_latency_ms', true);
const publicMapLatency = new Trend('public_map_latency_ms', true);

export const options = {
  // Stage ramp: 0 → 10 VUs over 10s, hold 30s, ramp down 10s.
  // Total 50s. Bump VUs with --vus for a harder run.
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    // <1% errors across the whole run. Anything above that is a
    // real signal, not noise.
    http_errors: ['rate<0.01'],
    // p95 budget for the read endpoints. The first iteration of
    // this test should not block the pipeline on a tighter SLO.
    'http_req_duration{endpoint:city_pulse}': ['p(95)<800'],
    'http_req_duration{endpoint:public_map}': ['p(95)<800'],
    'http_req_duration{endpoint:health}': ['p(95)<200'],
  },
};

export default function () {
  // ── 1. Liveness probe ───────────────────────────────
  // Cheap; the load test itself should never be the thing
  // that takes the health endpoint down.
  const health = http.get(`${BASE}/api/health`, {
    tags: { endpoint: 'health' },
  });
  const healthOk = check(health, {
    'health 200': r => r.status === 200,
  });
  if (!healthOk) errorRate.add(1);

  sleep(0.5);

  // ── 2. City-pulse digest ────────────────────────────
  // Powers the dashboard. Aggregated; should be <800ms p95.
  const pulse = http.get(`${BASE}/api/analytics/city-pulse`, {
    tags: { endpoint: 'city_pulse' },
  });
  cityPulseLatency.add(pulse.timings.duration);
  const pulseOk = check(pulse, {
    'pulse 200': r => r.status === 200,
    'pulse has wards': r => {
      try { return Array.isArray(r.json('wards')); } catch { return false; }
    },
  });
  if (!pulseOk) errorRate.add(1);

  sleep(0.5);

  // ── 3. Public map feed ─────────────────────────────
  // Returns nearby ticket markers; the heaviest read endpoint
  // a public visitor can hit. Anonymous (no auth) and rate-
  // limited to 60/min/IP, so the load test should also stay
  // well under that ceiling.
  const map = http.get(`${BASE}/api/tickets/near?latitude=12.97&longitude=77.59&radius_meters=1000`, {
    tags: { endpoint: 'public_map' },
  });
  publicMapLatency.add(map.timings.duration);
  const mapOk = check(map, {
    'public_map 200': r => r.status === 200,
  });
  if (!mapOk) errorRate.add(1);

  sleep(1);
}
