import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell, PublicLayout } from './components/layouts.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ThemeProvider } from './theme/ThemeContext.jsx';
import { GuestOnly, RequireAuth } from './auth/RouteGuards.jsx';
import {
  AnalyticsPage, DashboardPage, EntryDetailPage, InsightsPage, JournalPage,
  LandingPage, LoginPage, NewEntryPage, RegisterPage, SettingsPage, SuggestionsPage,
} from './pages.jsx';
import './styles.css';

function App() {
  return <BrowserRouter><AuthProvider><ThemeProvider><Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Route>
    <Route element={<RequireAuth />}>
    <Route path="/app" element={<AppShell />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="entries/new" element={<NewEntryPage />} />
      <Route path="entries/:entryId" element={<EntryDetailPage />} />
      <Route path="journal" element={<JournalPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="insights" element={<InsightsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="suggestions" element={<SuggestionsPage />} />
      <Route path="settings/suggestions" element={<Navigate to="/app/suggestions" replace />} />
    </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></ThemeProvider></AuthProvider></BrowserRouter>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
