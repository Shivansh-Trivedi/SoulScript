import { apiRequest } from '../auth/api.js';

function queryFor({ from, to, timezone }) {
  return new URLSearchParams({ from, to, timezone }).toString();
}

export const analyticsApi = {
  moods: (range) => apiRequest(`/analytics/moods?${queryFor(range)}`),
  trends: (range) => apiRequest(`/analytics/trends?${queryFor(range)}`),
  activity: (range) => apiRequest(`/analytics/activity?${queryFor(range)}`),
  comparison: (range) => apiRequest(`/analytics/comparison?${queryFor(range)}`),
};

export function browserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

export function localDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function defaultAnalyticsRange() {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 29);
  return { from: localDateValue(start), to: localDateValue(end), timezone: browserTimezone() };
}

export function dateRangeDaysBefore(days) {
  const end = new Date();
  return { from: localDateValue(new Date(end.getFullYear(), end.getMonth(), end.getDate() - days)), to: localDateValue(end), timezone: browserTimezone() };
}
