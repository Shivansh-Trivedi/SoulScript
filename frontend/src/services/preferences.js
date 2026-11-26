import { apiRequest } from '../auth/api.js';

export const preferencesApi = {
  get: () => apiRequest('/preferences'),
  update: (changes) => apiRequest('/preferences', { method: 'PATCH', body: changes }),
};
