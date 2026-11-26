import { apiRequest } from '../auth/api.js';

function weekQuery({ week_of, timezone }) {
  return new URLSearchParams({ week_of, timezone }).toString();
}

export const weeklyInsightsApi = {
  get: (selection) => apiRequest(`/insights/weekly?${weekQuery(selection)}`),
  generate: (selection) => apiRequest(`/insights/weekly/generate?${weekQuery(selection)}`, { method: 'POST' }),
  history: ({ limit = 12, before } = {}) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (before) query.set('before', before);
    return apiRequest(`/insights/history?${query.toString()}`);
  },
};
