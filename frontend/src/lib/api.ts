import { supabase } from './supabase';

const API_URL = (import.meta as any).env.VITE_API_URL ?? '';

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
