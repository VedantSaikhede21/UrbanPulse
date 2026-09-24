# Stateless Backend Runbook

The UrbanPulse backend is designed to run as N interchangeable
processes behind a load balancer. This page is the operator's
checklist for confirming that property and the two ways to break
it.

## Is the backend stateless?

Read this against a freshly-cloned `main` to confirm nothing has
drifted:

- **Rate-limit counters live in Redis.**
  `app/limiter.py` keys the slowapi `Limiter` on
  `settings.REDIS_URL`. Every instance counts against the same
  buckets. If `REDIS_URL` is unset, the limiter silently falls
  back to in-process memory — the warning log
  `rate_limiter_storage backend=in_memory` is the canary.
  Production must set `REDIS_URL`.
- **Retry / job state lives in the database.**
  Tickets commit with `processing_state='pending'` and the ARQ
  worker (`app/queue.py`) picks them up off a Redis queue,
  opening its own DB session. There is no in-process queue. If
  an instance dies mid-request, the ticket is in Postgres; if
  an instance dies mid-job, ARQ re-delivers to another worker.
- **Files live in Supabase Storage.**
  `app/services/storage.py` selects `SupabaseStorage` when
  `SUPABASE_STORAGE_BUCKET` is set. There is no in-bucket
  fallback in production — a missing `SUPABASE_URL` or
  `SUPABASE_SERVICE_ROLE_KEY` raises at startup rather than
  silently writing to local disk.
- **The one piece of process-local state is `httpx.AsyncClient`**
  inside `TwilioService` (`app/services/twilio_service.py`).
  It is created lazily on the first outbound WhatsApp call and
  cached on the instance. This is harmless for horizontal
  scale: `httpx.AsyncClient` is safe to re-create per process;
  no request-affinity is implied, and the connection pool
  resets on instance restart. The `close()` method exists for
  clean shutdown only.

If all four answers are "yes" (or "the canary log is not
present"), the backend is stateless.

## Deployment shape

Three backend containers behind one load balancer, one ARQ
worker, one Redis, one Postgres, one Supabase bucket:

```bash
# .env is shared; REDIS_URL and SUPABASE_* are the same on
# every host. The only thing that varies is the listening port.
docker compose up --profile redis --scale backend=3
# Worker is a separate container (different command) — see
# the worker service in docker-compose.yml. Do NOT colocate
# the ARQ worker with the API process.
```

A request can land on any backend instance. A triage job is
picked up by any worker. A citizen photo is fetched from the
same Supabase bucket regardless of who stored it. There is no
"sticky session" anywhere in the system.

## Two things that would break statelessness

1. **Writing `uploads/` to local disk.** The
   `LocalStorage` backend is a dev fallback. In production,
   `SUPABASE_STORAGE_BUCKET` must be set so the
   `get_storage()` factory picks `SupabaseStorage`. A second
   instance on a different host would not see the first
   instance's disk — and even two instances on the same host
   with a shared volume would race on the same key. The
   storage factory in `app/services/storage.py` refuses this
   state with a `RuntimeError` at startup when the bucket is
   set but credentials are missing; treat that error as a
   deploy blocker, not a warning.
2. **Running the ARQ worker inside the API container.** The
   API and the worker both open DB sessions and both call the
   pipeline graph. Running them in the same process works in
   dev but is wrong in production: a worker stuck on a
   multi-second Gemini call would head-of-line block the API
   event loop (FastAPI runs the request handler on the same
   loop the ARQ job is awaiting), and a worker OOM would
   take the API down with it. The worker's `max_jobs=1`
   setting makes the contention even worse — see
   `app/queue.WorkerSettings`. Run the worker as its own
   container; scale workers by adding containers, not by
   raising concurrency.

## Signal to watch

`SELECT count(*) FROM tickets WHERE processing_state='pending';`
should stay near zero. A drift upward means the worker is
falling behind, not that the API is broken. Two follow-up
checks at that point:

- **Worker container count.** If pending > worker_concurrency
  × 10 (the same rough rule of thumb ARQ's own dashboard
  uses), scale out workers before doing anything else.
- **`arq_enqueue_failed` log lines.** If present, Redis was
  unreachable from the API. The enqueue path logs and
  returns False rather than 5xx; the ticket sits in
  `pending` until an operator re-enqueues (or a future
  `requeue_stale` cron job sweeps the table — see the
  `tickets WHERE processing_state='pending' AND
  created_at < now() - interval '10 minutes'` query, which
  Phase 6 will turn into a real sweep).
