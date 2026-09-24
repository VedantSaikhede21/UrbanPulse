# Load testing

`loadtest.js` is a k6 script that exercises the read endpoints a
public visitor can hit — liveness, the city-pulse digest, and the
nearby-tickets feed that powers the public incident map.

## Run

```sh
# Local stack on default ports
k6 run perf/loadtest.js

# Point at a deployed environment
k6 run -e BASE_URL=https://staging.urbanpulse.ai perf/loadtest.js

# Harder run (more VUs, longer duration)
k6 run --vus 50 --duration 60s perf/loadtest.js
```

## Thresholds

The SLOs in the script are deliberately generous (p95 < 800ms on
the read endpoints, < 1% error rate). They are not production
SLAs — they are early-warning gates that catch a regression that
makes the public surface 5–10× slower. Tighten them once a real
production baseline is captured.

## Auth-gated write paths

The script does not exercise the citizen report submit, the
officer queue, or the agent metrics endpoint. Those endpoints
need a minted JWT, and a load test that bypasses auth is testing
nothing real. Add a second script with a token-minting fixture
once a write-path load profile is needed.
