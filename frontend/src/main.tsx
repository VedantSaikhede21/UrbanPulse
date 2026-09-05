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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<App />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
