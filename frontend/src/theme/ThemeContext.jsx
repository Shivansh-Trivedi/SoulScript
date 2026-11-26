import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { preferencesApi } from '../services/preferences.js';

const ThemeContext = createContext(null);
const DEFAULT_THEME = { theme_mode: 'default', selected_theme: 'lavender', timezone: 'UTC', resolved_theme: 'lavender', latest_emotion: null, latest_estimate: null };
const AUTO_THEME_BY_EMOTION = {
  joy: 'mood-joy', sadness: 'mood-sadness', anger: 'mood-anger', fear: 'mood-fear',
  disgust: 'mood-disgust', surprise: 'mood-surprise', neutral: 'mood-neutral',
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme || 'default';
}

export function ThemeProvider({ children }) {
  const { status, user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const refreshPreferences = useCallback(async () => {
    const next = await preferencesApi.get();
    setPreferences(next);
    setPreview(null);
    applyTheme(next.resolved_theme);
    return next;
  }, []);

  useEffect(() => {
    let active = true;
    if (status !== 'authenticated' || !user) {
      setPreferences(null);
      setPreview(null);
      setError('');
      setLoading(false);
      applyTheme('default');
      return () => { active = false; };
    }
    setLoading(true);
    setError('');
    preferencesApi.get().then((next) => {
      if (!active) return;
      setPreferences(next);
      applyTheme(next.resolved_theme);
    }).catch((loadError) => {
      if (!active) return;
      setError(loadError.message || 'Your appearance preferences could not be loaded.');
      setPreferences(DEFAULT_THEME);
      applyTheme('default');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, user?.id]);

  const savePreferences = useCallback(async (changes) => {
    const next = await preferencesApi.update(changes);
    setPreferences(next);
    setPreview(null);
    setError('');
    applyTheme(next.resolved_theme);
    return next;
  }, []);

  const previewPreferences = useCallback((draft) => {
    setPreview(draft);
    applyTheme(draft.theme_mode === 'default' ? 'default' : draft.theme_mode === 'manual' ? draft.selected_theme : (AUTO_THEME_BY_EMOTION[preferences?.latest_emotion] || 'lavender'));
  }, [preferences?.latest_emotion]);

  const cancelPreview = useCallback(() => {
    setPreview(null);
    applyTheme(preferences?.resolved_theme || 'default');
  }, [preferences?.resolved_theme]);

  const value = useMemo(() => ({
    preferences: preferences || DEFAULT_THEME,
    loading,
    error,
    preview,
    setPreview: previewPreferences,
    cancelPreview,
    savePreferences,
    refreshPreferences,
  }), [preferences, loading, error, preview, previewPreferences, cancelPreview, savePreferences, refreshPreferences]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
