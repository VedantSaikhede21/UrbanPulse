# Gemini Cost Monitoring

Every Gemini call the backend makes emits a structured log event
under the key `gemini_call`. This page is the operator's runbook
for turning that log stream into a cost signal.

## What gets emitted

```json
{
  "event": "gemini_call",
  "model": "gemini-2.5-flash",
  "agent": "vision",
  "latency_ms": 1234,
  "input_chars": 412,
  "input_images": 1,
  "has_audio": false,
  "ok": true
}
```

`ok=false` adds an `error` field with the exception class name.
The event fires from `_ask_gemini`, `_ask_gemini_with_images`,
and `_ask_gemini_with_audio` in `backend/app/agents/graph.py`
— every Gemini call the pipeline makes, with no aggregation.
One log line per call.

## Why logs, not a SaaS billing integration

A cloud cost-monitoring SDK is one more secret to manage
(GCP billing export, CloudWatch cost alarms, etc.) and one
more way the bill can move without anyone noticing for a
week. The log stream is already there, already indexed, and
already feeds Sentry. Aggregating in the log backend is the
right shape for a system at this scale: when a Gemini outage
becomes an incident, the same dashboard that shows the Sentry
errors shows the cost spike.

## Operator queries

Call count over the last hour, broken down by agent:

```bash
grep '"event":"gemini_call"' backend.log \
  | jq -r 'select(.timestamp > (now - 3600 | todate))
           | .agent' \
  | sort | uniq -c
```

Error rate over the last hour:

```bash
grep '"event":"gemini_call"' backend.log \
  | jq -r 'select(.timestamp > (now - 3600 | todate))
           | .ok' \
  | sort | uniq -c
```

p95 latency per agent:

```bash
grep '"event":"gemini_call"' backend.log \
  | jq -r 'select(.ok == true)
           | "\(.agent) \(.latency_ms)"' \
  | awk '{ counts[$1]++; values[$1]=values[$1]" "$2 }
         END { for (a in counts) print a, values[a] }' \
  | sort
```

## Monthly cost projection

At Gemini 2.5 Flash's published per-1M-token rate (footnote:
Google's pricing page is the source of truth; this number
moves), a single text call with a 400-char prompt and a 200-char
response costs under $0.001. A multimodal image call costs more
because of the image-token component — order of $0.01 per call.

`monthly_cost ≈ calls/day × per_call_cost × 30`

For a civic-deploy load profile (1,000 reports/day, ~6 Gemini
calls per report, 10% with an image, 1% with a voice note):

- 1,000 × 6 = 6,000 text calls/day
- 1,000 × 0.10 = 100 image calls/day
- 1,000 × 0.01 = 10 audio calls/day
- Cost ≈ 6,000 × $0.001 + 100 × $0.01 + 10 × $0.05 ≈ $13/day

That's a real, non-trivial number at the "real municipality
onboarding" scale. The log signal is what catches the
regression that turns it into a $130/day incident.

## When to alert

Set up two log-based alerts in the operator's log backend:

1. **Call-rate spike** — `gemini_call` count over any 1h window
   exceeds 3× the trailing 24h median. Catches the
   infinite-retry-loop regression and the LLM-call-amplification
   bug.
2. **Error rate** — `gemini_call.ok == false` ratio over any
   15m window exceeds 5%. Catches quota exhaustion, key
   rotation mistakes, and prompt-template regressions that
   trip the safety filter.

Both are pure-log alerts; no new infrastructure, no new secret.

## What this doc does NOT cover

- Per-tenant cost attribution (multi-municipality billing) —
  the `agent` field distinguishes agents but not callers.
  That's a follow-up if the deploy ever goes multi-tenant.
- Token-level accuracy. The log reports `input_chars` (Python
  string length), not token count. Good enough for a rate
  alert; not enough for a precise dollar projection. Google's
  billing dashboard is the source of truth for the actual
  number.
- Cost cap enforcement. The operator's job is to act on the
  alert, not to be auto-cut by the system. A hard cap would
  be a Phase 6 / 7 feature once the operator workflow
  around the alert is mature.
