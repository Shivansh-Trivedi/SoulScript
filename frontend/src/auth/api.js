const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

function readCookie(name) {
  const prefix = `${name}=`;
  const item = document.cookie.split('; ').find((cookie) => cookie.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = readCookie('soulscript_csrf');
    if (csrf) headers.set('X-CSRF-Token', csrf);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: 'include',
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === 'string' ? data.detail : 'The request could not be completed. Please try again.';
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const authApi = {
  me: () => apiRequest('/me'),
  register: (credentials) => apiRequest('/auth/register', { method: 'POST', body: credentials }),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  deleteAccount: (confirmation) => apiRequest('/me', { method: 'DELETE', body: confirmation }),
  exportData: () => apiRequest('/export', { method: 'POST' }),
};
