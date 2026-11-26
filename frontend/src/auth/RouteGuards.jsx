import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { Button, ErrorState, LoadingState } from '../components/ui.jsx';

function SessionCheck() {
  return <main className="auth-check"><LoadingState label="Checking your session…" /></main>;
}

function SessionUnavailable({ retry }) {
  return <main className="auth-check"><ErrorState title="SoulScript could not connect" action={<Button onClick={retry}>Try again</Button>}>Your private pages stay hidden until we can confirm your session.</ErrorState></main>;
}

export function RequireAuth() {
  const { status, restoreSession } = useAuth();
  const location = useLocation();
  if (status === 'checking') return <SessionCheck />;
  if (status === 'unavailable') return <SessionUnavailable retry={restoreSession} />;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function GuestOnly() {
  const { status, restoreSession } = useAuth();
  if (status === 'checking') return <SessionCheck />;
  if (status === 'unavailable') return <SessionUnavailable retry={restoreSession} />;
  if (status === 'authenticated') return <Navigate to="/app/dashboard" replace />;
  return <Outlet />;
}
