import { supabase } from './supabase';

/**
 * API base URL resolution.
 *
 * This app always talks to its own origin: the Vite dev server proxies `/api`
 * to the backend in development, and nginx does the same in the container and
 * in production. So the correct value of VITE_API_URL is the empty string.
 *
 * A localhost value is still tolerated for local dev (where the page itself is
 * served from localhost), but it is deliberately ignored when the page is
 * served from anywhere else. Without that guard a single stale
 * `VITE_API_URL=http://localhost:8000` baked into a build makes every API call
 * point at the *visitor's* own machine — which fails silently behind the
 * same-origin Content-Security-Policy and looks like "the whole app is broken".
 */
function resolveApiBase(): string {
  const configured = ((import.meta as any).env.VITE_API_URL ?? '').trim();
  if (!configured) return '';

  const isLoopback = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(configured);
  if (!isLoopback) return configured.replace(/\/$/, '');

  const pageHost = typeof window === 'undefined' ? '' : window.location.hostname;
  const pageIsLoopback = pageHost === 'localhost' || pageHost === '127.0.0.1' || pageHost === '::1';
  return pageIsLoopback ? configured.replace(/\/$/, '') : '';
}

const API_URL = resolveApiBase();

async function getAccessToken(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export function apiUrl(path: string): string {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = await getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(apiUrl(path), { ...options, headers, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiUpload(path: string, file: File): Promise<Response> {
  const formData = new FormData();
  formData.append('file', file);
  const token = await getAccessToken();
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    return await fetch(apiUrl(path), { method: 'POST', body: formData, headers, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
