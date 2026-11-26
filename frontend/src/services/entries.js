import { apiRequest } from '../auth/api.js';

export const entriesApi = {
  list({ q, from, to, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', sort = 'newest', limit = 20, cursor } = {}) {
    const query = new URLSearchParams({ timezone, sort, limit: String(limit) });
    if (q?.trim()) query.set('q', q.trim());
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    if (cursor) query.set('cursor', cursor);
    return apiRequest(`/entries?${query.toString()}`);
  },
  get: (id) => apiRequest(`/entries/${id}`),
  create: (entry) => apiRequest('/entries', { method: 'POST', body: entry }),
  update: (id, changes) => apiRequest(`/entries/${id}`, { method: 'PATCH', body: changes }),
  delete: (id) => apiRequest(`/entries/${id}`, { method: 'DELETE' }),
  analyze: (id) => apiRequest(`/entries/${id}/analyze`, { method: 'POST' }),
  emotions: (id) => apiRequest(`/entries/${id}/emotions`),
  saveFeedback: (id, reported_emotion) => apiRequest(`/entries/${id}/feedback`, { method: 'PUT', body: { reported_emotion } }),
};
