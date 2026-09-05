// Sentry wiring for the browser bundle.
//
// Same opt-in contract as the backend: when VITE_SENTRY_DSN is
// empty / unset, initSentry() is a no-op and every capture call
// is dropped. Dev and CI builds never touch the network.
//
// A Sentry bundle is ~30 KB gzipped; bundling it in the entry
// chunk unconditionally would add that cost to every page even
// when the DSN is missing. Calling `initSentry()` at startup
// still imports the module, so the cost is paid once on first
// page load — acceptable, and it lets a real production deploy
// start capturing without a redeploy.
import * as Sentry from "@sentry/react";

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const SAMPLE_RATE = Number(
  (import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string | undefined) ?? 0.1,
);

let initialised = false;

export function initSentry(): void {
  if (initialised) return;
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    // The frontend can run in dev (no-op), staging, or production;
    // the DSN lives in the deploy env. Setting environment from
    // Vite so dashboards can filter by stage.
    environment: import.meta.env.MODE,
    tracesSampleRate: SAMPLE_RATE,
    // PII scrubbing on the browser side: we do not log phone
    // numbers or emails as breadcrumbs. The backend scrubber
    // (app.sentry) does the same for server events.
    beforeSend(event) {
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete (event.user as { username?: string }).username;
      }
      if (event.extra) {
        for (const k of [
          "phone",
          "email",
          "media_url",
          "to_number",
          "from_number",
          "body",
        ]) {
          if (k in event.extra) delete (event.extra as Record<string, unknown>)[k];
        }
      }
      return event;
    },
  });
  initialised = true;
}

export function captureException(err: unknown, extra?: Record<string, unknown>): void {
  if (!initialised) return;
  Sentry.captureException(err, { extra });
}

export function captureMessage(msg: string, extra?: Record<string, unknown>): void {
  if (!initialised) return;
  Sentry.captureMessage(msg, { extra });
}
