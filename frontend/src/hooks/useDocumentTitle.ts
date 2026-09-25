import { useEffect } from 'react';

const BRAND = 'UrbanPulse AI';

/**
 * Keeps `document.title` consistent as "<Page> — UrbanPulse AI" without ever
 * repeating the brand, and restores the app default on unmount.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const next = title.includes(BRAND) ? title : `${title} — ${BRAND}`;
    document.title = next;
    return () => {
      document.title = `${BRAND} — AI-Powered Civic Triage`;
    };
  }, [title]);
}
