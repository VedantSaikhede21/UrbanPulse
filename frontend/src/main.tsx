import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'

// Sentry must initialise before any user code runs so the React
// ErrorBoundary integration can wire itself into the root. The
// function is a no-op when VITE_SENTRY_DSN is unset.
initSentry()

// A tab opened before a deploy keeps the old entry chunk in memory, but the
// content-hashed route chunks it lazily imports are gone from the new build.
// The result is a hard "Failed to fetch dynamically imported module" on the
// first in-app navigation, which used to strand users on a blank screen right
// after login. Reloading fetches a consistent set of assets.
//
// The sessionStorage marker allows exactly one automatic reload per browser
// session, so a genuinely missing chunk can never turn into a reload loop. A
// second occurrence is left to surface normally, and a second deploy within one
// session may need a manual refresh.
const CHUNK_RELOAD_KEY = 'up:chunk-reload'
window.addEventListener('unhandledrejection', event => {
  const reason = event.reason as { message?: string } | undefined
  const message = reason?.message ?? String(event.reason ?? '')
  if (!/dynamically imported module|Failed to fetch|Importing a module script failed/i.test(message)) return
  event.preventDefault()
  Sentry.captureException(reason, { tags: { kind: 'chunk-load-failure' } })
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return
  sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
  window.location.reload()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<App />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
