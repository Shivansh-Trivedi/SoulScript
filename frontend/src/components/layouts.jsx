import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { entriesApi } from '../services/entries.js';
import { hasSensitiveEmotionSignal, shouldOfferSupport } from '../services/supportPrompt.js';
import { useTheme } from '../theme/ThemeContext.jsx';
import { Brand, Button, Modal, Toast } from './ui.jsx';

const navigation = [
  { to: '/app/dashboard', label: 'Dashboard', icon: '⌂' },
  { to: '/app/entries/new', label: 'New Entry', icon: '＋' },
  { to: '/app/journal', label: 'My Journal', icon: '▤' },
  { to: '/app/analytics', label: 'Analytics', icon: '◷' },
  { to: '/app/insights', label: 'Weekly Insights', icon: '✳' },
  { to: '/app/settings', label: 'Settings', icon: '⚙' },
  { to: '/app/suggestions', label: 'Suggestions', icon: '✳' },
];

export function PublicLayout() {
  return <div className="public-layout">
    <header className="public-header"><Link className="brand-link" to="/"><Brand /></Link>
      <nav className="public-nav" aria-label="Main navigation"><a href="/#how-it-works">How it works</a><a href="/#privacy">Privacy</a><Link to="/login">Sign in</Link><Link className="button button--primary button--sm" to="/register">Get started</Link></nav>
    </header><Outlet />
    <footer className="public-footer"><Brand compact /><span>A personal space for reflection.</span><a href="/#privacy">Privacy by design</a></footer>
  </div>;
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const location = useLocation();
  const { user, logout } = useAuth();
  const { preferences } = useTheme();
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMode, setSupportMode] = useState('check-in');
  const supportDismissed = useRef(false);
  const urgentSupport = useRef(false);
  const current = navigation.find((item) => location.pathname === item.to || (item.to !== '/app/dashboard' && location.pathname.startsWith(item.to)));

  useEffect(() => {
    const emotionSignals = [preferences.latest_estimate, preferences.latest_emotion];
    if (!user || !hasSensitiveEmotionSignal(emotionSignals)) return undefined;
    let active = true;
    supportDismissed.current = false;
    setSupportMode(urgentSupport.current ? 'urgent' : 'check-in');
    setSupportOpen(true);
    async function checkLatestEntry() {
      try {
        const result = await entriesApi.list({ limit: 50 });
        const candidates = result.items
          .filter((item) => item.latest_prediction && !item.latest_prediction.stale)
          .sort((a, b) => new Date(b.latest_prediction.analyzed_at) - new Date(a.latest_prediction.analyzed_at));
        for (const candidate of candidates) {
          const entry = await entriesApi.get(candidate.id);
          if (!active || supportDismissed.current) return;
          if (!shouldOfferSupport(entry.content, { top_label: candidate.latest_prediction.label, stale: candidate.latest_prediction.stale }, emotionSignals)) continue;
          urgentSupport.current = true;
          setSupportMode('urgent');
          return;
        }
      } catch { /* Keep the app usable if the optional support check cannot load an entry. */ }
    }
    checkLatestEntry();
    return () => { active = false; };
  }, [user?.id, preferences.latest_estimate, preferences.latest_emotion]);

  useEffect(() => {
    function onEntryAnalyzed(event) {
      const { content, prediction } = event.detail || {};
      if (!shouldOfferSupport(content, prediction, [preferences.latest_estimate, preferences.latest_emotion])) return;
      supportDismissed.current = false;
      urgentSupport.current = true;
      setSupportMode('urgent');
      setSupportOpen(true);
    }
    window.addEventListener('soulscript:entry-analyzed', onEntryAnalyzed);
    return () => window.removeEventListener('soulscript:entry-analyzed', onEntryAnalyzed);
  }, [preferences.latest_estimate, preferences.latest_emotion]);
  async function handleLogout() {
    setLogoutError('');
    try { await logout(); }
    catch { setLogoutError('We could not sign you out. Please check your connection and try again.'); }
  }
  return <div className="app-shell">
    {menuOpen && <button className="drawer-scrim" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
      <Link className="brand-link sidebar__brand" to="/app/dashboard" onClick={() => setMenuOpen(false)}><Brand /></Link>
      <Link className="button button--primary sidebar__new" to="/app/entries/new" onClick={() => setMenuOpen(false)}><span aria-hidden="true">＋</span> New Entry</Link>
      <nav className="side-nav" aria-label="Your journal">
        {navigation.filter((item) => item.label !== 'New Entry').map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/app/dashboard' || item.to === '/app/settings'} className={({ isActive }) => `side-nav__link ${isActive ? 'is-active' : ''}`} onClick={() => setMenuOpen(false)}><span className="side-nav__icon" aria-hidden="true">{item.icon}</span>{item.label}</NavLink>)}
      </nav>
      <div className="sidebar__account"><div className="avatar" aria-hidden="true">{user?.email?.[0]?.toUpperCase() || 'S'}</div><div className="sidebar__identity"><strong>{user?.email || 'Your space'}</strong><span>Private journal</span></div><button className="signout-button" type="button" onClick={handleLogout}>Sign out</button></div>
    </aside>
    <div className="app-main">
      <header className="app-topbar"><button className="icon-button mobile-menu-button" type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span className="menu-glyph" aria-hidden="true">☰</span></button><Brand compact /><span className="app-topbar__title">{current?.label || 'Your journal'}</span><Link className="topbar-write" to="/app/entries/new">＋ Write</Link></header>
      <main className="app-content"><Outlet /></main>
    </div>
    {logoutError && <Toast tone="error" onDismiss={() => setLogoutError('')}>{logoutError}</Toast>}
    {supportOpen && <Modal title={supportMode === 'urgent' ? 'You deserve support' : 'A gentle check-in'} onClose={() => { supportDismissed.current = true; urgentSupport.current = false; setSupportOpen(false); }} actions={<Button variant="secondary" onClick={() => { supportDismissed.current = true; urgentSupport.current = false; setSupportOpen(false); }}>Close</Button>}>
      {supportMode === 'urgent' ? <div className="support-modal-copy"><p>Your recent journal entry includes words about hurting yourself, and a current estimate or your recent pattern picked up sadness or disgust. An AI estimate can be wrong; only you know what is happening for you.</p><p><strong>“You matter, even when this moment feels heavy.”</strong></p><p>If you might act on these thoughts or are in immediate danger, call <a href="tel:112">112</a> in India. For mental health support, call Tele-MANAS at <a href="tel:14416">14416</a> or <a href="tel:18008914416">1800-89-14416</a> (24/7).</p></div> : <div className="support-modal-copy"><p>Sadness or disgust has been showing up in recent text estimates. That’s only a pattern in the words, not a verdict about how you feel.</p><p><strong>“You matter, and you deserve a little kindness today.”</strong></p><p>If you’d like to talk with someone, India’s Tele-MANAS line is <a className="support-hotline" href="tel:14416">14416</a> (24/7). You can also call <a href="tel:18008914416">1800-89-14416</a>.</p><p>For a lighter break, try <a href="https://movies.disney.com/luca" target="_blank" rel="noopener noreferrer">Luca</a>, a feel-good animated comedy about friendship and a seaside summer. If you can, take a rest and let yourself unwind.</p></div>}
    </Modal>}
  </div>;
}

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-heading__description">{description}</p>}</div>{action}</div>;
}
