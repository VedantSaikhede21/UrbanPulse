const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

export function apiUrl(path: string): string {
  return `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    return await fetch(apiUrl(path), { method: 'POST', body: formData, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
