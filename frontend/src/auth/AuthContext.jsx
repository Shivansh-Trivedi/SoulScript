import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);
  const [sessionError, setSessionError] = useState('');

  const restoreSession = useCallback(async () => {
    setStatus('checking');
    setSessionError('');
    try {
      const profile = await authApi.me();
      setUser(profile);
      setStatus('authenticated');
    } catch (error) {
      setUser(null);
      if (error.status === 401) setStatus('guest');
      else {
        setStatus('unavailable');
        setSessionError('We could not check your session. Check that SoulScript is running, then retry.');
      }
    }
  }, []);

  useEffect(() => { restoreSession(); }, [restoreSession]);

  const login = useCallback(async (credentials) => {
    const result = await authApi.login(credentials);
    setUser(result.user);
    setStatus('authenticated');
    return result.user;
  }, []);

  const register = useCallback(async (credentials) => {
    const result = await authApi.register(credentials);
    setUser(result.user);
    setStatus('authenticated');
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setStatus('guest');
  }, []);

  const deleteAccount = useCallback(async (confirmation) => {
    await authApi.deleteAccount(confirmation);
    setUser(null);
    setStatus('guest');
  }, []);

  const value = useMemo(() => ({ status, user, login, register, logout, deleteAccount, restoreSession, sessionError }), [status, user, login, register, logout, deleteAccount, restoreSession, sessionError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
