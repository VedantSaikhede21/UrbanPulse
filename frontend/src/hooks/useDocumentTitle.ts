import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — UrbanPulse AI`;
    return () => { document.title = 'UrbanPulse AI — AI-Powered Civic Triage'; };
  }, [title]);
}
