import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.jsx';
import { authApi } from './auth/api.js';
import { entriesApi } from './services/entries.js';
import { useTheme } from './theme/ThemeContext.jsx';
import { analyticsApi, browserTimezone, dateRangeDaysBefore, defaultAnalyticsRange, localDateValue } from './services/analytics.js';
import { weeklyInsightsApi } from './services/weeklyInsights.js';
import { ActivityChart, ChartCard, ComparisonSummary, MoodDistributionChart, MoodTrendChart } from './components/analytics.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, Modal, TextField, Toast } from './components/ui.jsx';
import { PageHeading } from './components/layouts.jsx';
import { emotionSuggestions } from './data/emotionSuggestions.js';

function PlaceholderPage({ eyebrow = 'Your space', title, description, next }) {
  return <><PageHeading eyebrow={eyebrow} title={title} description={description} /><Card className="placeholder-card"><div className="placeholder-card__art" aria-hidden="true"><span>✳</span><i /><i /><i /></div><div><Badge>Coming in a later phase</Badge><h2>This part of your journal is taking shape.</h2><p>{next}</p></div></Card></>;
}

function moodLabel(value = '') { return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export function LandingPage() {
  return <main>
    <section className="hero page-container">
      <div className="hero__copy"><p className="eyebrow"><span className="eyebrow-dot" />A quiet space for reflection</p><h1>Your thoughts.<br />Your emotions.<br /><span>Your story.</span></h1><p className="hero__description">A private journal to help you write freely, notice patterns, and reflect on your own terms.</p><div className="hero__actions"><Link className="button button--primary button--lg" to="/register">Create your journal <span aria-hidden="true">→</span></Link><Link className="button button--secondary button--lg" to="/login">I already have an account</Link></div><div className="trust-note"><span aria-hidden="true">⌑</span> Your writing stays yours.</div></div>
      <div className="preview-wrap" aria-label="Illustrative product preview"><Card className="journal-preview"><div className="preview-top"><div><span className="preview-kicker">A MOMENT TO REMEMBER</span><h2>A little breathing room</h2></div><span className="preview-date">Today</span></div><p className="preview-text">I stepped outside after a long afternoon. The air felt softer than I expected, and for a few minutes I let myself slow down.</p><div className="preview-divider" /><div className="preview-bottom"><div><span className="preview-label">YOUR NOTE</span><Badge tone="green">A bit lighter</Badge></div><div className="preview-spark" aria-hidden="true">✧</div></div></Card><div className="preview-caption"><span className="preview-dot" />Illustrative preview · sample text</div><div className="preview-orbit preview-orbit--one" /><div className="preview-orbit preview-orbit--two" /></div>
    </section>
    <section className="feature-section page-container" id="how-it-works"><div className="section-heading"><p className="eyebrow">A gentler way to reflect</p><h2>Make space for what matters.</h2><p>Simple tools for writing today and understanding your own story over time.</p></div><div className="feature-grid"><Feature icon="✎" title="Write privately" text="Capture a thought in a calm, uncluttered space. Your journal is yours to keep." tone="lavender" /><Feature icon="⌁" title="Notice patterns" text="Explore your entries over time with clear, grounded views of what you recorded." tone="peach" /><Feature icon="✳" title="Reflect gently" text="Revisit your week with prompts based on your writing, never unsupported conclusions." tone="sage" /></div></section>
    <section className="privacy-band" id="privacy"><div className="privacy-band__inner"><span className="privacy-icon" aria-hidden="true">⌑</span><div><p className="eyebrow">Your words are personal</p><h2>Reflection on your terms.</h2><p>SoulScript is designed as a private, non-clinical journal. Any emotion estimate is just a model’s reading of text—you stay in control.</p></div><Link to="/register" className="text-link">Start with a blank page <span aria-hidden="true">→</span></Link></div></section>
  </main>;
}
function Feature({ icon, title, text, tone }) { return <Card className="feature-card"><span className={`feature-icon feature-icon--${tone}`} aria-hidden="true">{icon}</span><h3>{title}</h3><p>{text}</p></Card>; }

export function LoginPage() { return <AuthPage mode="login" />; }
export function RegisterPage() { return <AuthPage mode="register" />; }
function AuthPage({ mode }) {
  const register = mode === 'register';
  const { login, register: createAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (register && password !== confirmation) { setError('The passwords do not match.'); return; }
    setSubmitting(true);
    try {
      if (register) await createAccount({ email, password });
      else await login({ email, password });
      const destination = location.state?.from;
      const safePath = destination?.pathname?.startsWith('/app') ? `${destination.pathname}${destination.search || ''}` : '/app/dashboard';
      navigate(safePath, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'We could not complete that request. Please try again.');
    } finally { setSubmitting(false); }
  }

  const passwordType = showPassword ? 'text' : 'password';
  return <main className="auth-page"><div className="auth-card"><p className="eyebrow">{register ? 'Begin with a blank page' : 'Welcome back'}</p><h1>{register ? 'Create your account' : 'Sign in to your journal'}</h1><p className="auth-card__intro">{register ? 'A private space to write and reflect, at your own pace.' : 'Your journal is right where you left it.'}</p>
    <form onSubmit={handleSubmit}>
      <TextField label="Email address" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <div className="field"><label className="field__label" htmlFor="auth-password">Password</label><div className="password-control"><input id="auth-password" className="input" type={passwordType} autoComplete={register ? 'new-password' : 'current-password'} minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div>{register && <span className="field__hint">Use 12–128 characters.</span>}</div>
      {register && <TextField label="Confirm password" type={passwordType} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />}
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : register ? 'Create account' : 'Sign in'} {!submitting && <span aria-hidden="true">→</span>}</Button>
    </form>
    <p className="auth-switch">{register ? 'Already have an account?' : 'New to SoulScript?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
    <p className="phase-note">Your password is securely hashed and never stored in plain text.</p>
  </div></main>;
}

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    setLoading(true); setError('');
    const range = dateRangeDaysBefore(29);
    try {
      const [activity, moods, trends, entries] = await Promise.all([
        analyticsApi.activity(range), analyticsApi.moods(range), analyticsApi.trends(range), entriesApi.list({ limit: 5 }),
      ]);
      setData({ activity, moods, trends, entries: entries.items });
    } catch (loadError) { setError(loadError.message || 'Your dashboard could not be loaded.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  const aiMoods = data?.moods?.ai_distribution || [];
  const topEstimateCount = Math.max(0, ...aiMoods.map((item) => item.count));
  const topEstimateLabels = aiMoods.filter((item) => item.count === topEstimateCount).map((item) => moodLabel(item.mood));
  const topEstimateText = topEstimateLabels.length > 1 ? topEstimateLabels.join(' + ') : topEstimateLabels[0] || 'Not analyzed yet';

  return <>
    <PageHeading eyebrow="Your space" title="A little room to reflect." description="Your recent writing and patterns, based on what you saved." action={<Link className="button button--primary" to="/app/entries/new">＋ Write an entry</Link>} />
    {loading ? <LoadingState label="Loading your dashboard…" /> : error ? <ErrorState title="We couldn’t load your dashboard" action={<Button variant="secondary" size="sm" onClick={loadDashboard}>Try again</Button>}>{error}</ErrorState> : <>
      <div className="dashboard-metrics">
        <Card><span>Entries · last 30 days</span><strong>{data.activity.total_entries}</strong></Card>
        <Card><span>Entries with a current AI estimate</span><strong>{data.moods.analyzed_entries}</strong></Card>
        <Card><span>{topEstimateLabels.length > 1 ? 'Most common AI estimates' : 'Most common AI estimate'}</span><strong>{topEstimateText}</strong></Card>
      </div>
      {data.activity.total_entries === 0 ? <EmptyState title="Your patterns will appear here">Add a journal entry, then optionally analyze it to see an AI estimate.</EmptyState> : <div className="dashboard-chart-grid">
        <div className="dashboard-chart-column">
          <ChartCard eyebrow="Your writing" title="Activity · 30 days"><ActivityChart days={data.activity.days} trends={data.trends.days} /></ChartCard>
          <Card className="dashboard-side"><span className="feature-icon feature-icon--sage" aria-hidden="true">✳</span><h3>Your week, in time</h3><p>When you are ready, revisit your writing week by week.</p><Link className="subtle-link" to="/app/insights">About weekly reflections</Link></Card>
        </div>
        <ChartCard eyebrow="AI emotion estimates" title="Mood distribution"><MoodDistributionChart data={data.moods} /></ChartCard>
      </div>}
      <Card className="dashboard-recent"><div className="card-heading"><div><p className="eyebrow">Your writing</p><h2>Recent entries</h2></div><Link to="/app/journal" className="subtle-link">View journal →</Link></div>
        {data.entries.length ? <div className="dashboard-entry-list">{data.entries.map((entry) => <Link key={entry.id} to={`/app/entries/${entry.id}`}><span><strong>{entry.title || 'Untitled entry'}</strong><small>{entry.excerpt}</small></span><time>{formatEntryDate(entry.created_at, { month: 'short', day: 'numeric' })}</time></Link>)}</div> : <EmptyState title="No saved entries yet">Your journal timeline keeps the entries you choose to save.</EmptyState>}
      </Card>
    </>}
  </>;
}
const moodOptions = ['calm', 'happy', 'sad', 'anxious', 'frustrated', 'relieved', 'hopeful', 'excited', 'tired', 'grateful', 'other', 'prefer not to say'];

function MoodField({ value, onChange }) {
  return <div className="field"><label className="field__label" htmlFor="entry-mood">How did you feel? <span>(optional)</span></label><select className="input mood-select" id="entry-mood" value={value || ''} onChange={(event) => onChange(event.target.value || null)}><option value="">Choose if you’d like</option>{moodOptions.map((mood) => <option key={mood} value={mood}>{mood.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}</select><span className="field__hint">This is your own report, separate from any AI estimate.</span></div>;
}

function EntryFields({ title, setTitle, content, setContent, mood, setMood }) {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return <>
    <TextField label="Title (optional)" placeholder="Give this entry a title" maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} />
    <div className="field"><label className="field__label" htmlFor="entry-content">Your entry</label><textarea id="entry-content" className="input entry-textarea" placeholder="Start wherever you are…" maxLength={20000} value={content} onChange={(event) => setContent(event.target.value)} required aria-describedby="entry-content-meta" /><div className="editor-meta" id="entry-content-meta"><span>Only you can see this entry.</span><span>{words} {words === 1 ? 'word' : 'words'} · {content.length.toLocaleString()} / 20,000 characters</span></div></div>
    <MoodField value={mood} onChange={setMood} />
  </>;
}

function useWarnBeforeLeaving(dirty) {
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}

export function NewEntryPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dirty = Boolean(title || content || mood);
  useWarnBeforeLeaving(dirty && !saving);
  async function saveEntry(event) {
    event.preventDefault(); setError(''); setSaving(true);
    try {
      const entry = await entriesApi.create({ title: title.trim() || null, content, self_reported_mood: mood || null });
      navigate(`/app/entries/${entry.id}`, { replace: true, state: { saved: true } });
    } catch (saveError) { setError(saveError.message || 'Your entry could not be saved. Your writing is still here; please try again.'); }
    finally { setSaving(false); }
  }
  return <><PageHeading eyebrow="Your journal" title="A page of your own." description="Write a little or a lot. You can save without analyzing." action={<Link className="button button--secondary" to="/app/journal">Back to journal</Link>} />
    <form className="entry-editor card" onSubmit={saveEntry}><div className="entry-editor__main"><EntryFields title={title} setTitle={setTitle} content={content} setContent={setContent} mood={mood} setMood={setMood} />
      {error && <ErrorState title="Your entry wasn’t saved">{error}</ErrorState>}
      <div className="editor-actions"><Button type="submit" disabled={saving || !content.trim()}>{saving ? 'Saving…' : 'Save entry'}</Button><span>Analysis can be requested after saving.</span></div>
    </div><aside className="entry-editor__privacy"><span className="privacy-icon" aria-hidden="true">⌑</span><h2>Your words stay yours.</h2><p>Your entry is saved to your private account. You can edit or delete it whenever you want.</p><div className="privacy-rule" /><p className="privacy-secondary">Your own mood report is optional and will stay distinct from any future AI estimate.</p></aside></form>
  </>;
}

function formatEntryDate(value, options = { dateStyle: 'long', timeStyle: 'short' }) {
  return new Intl.DateTimeFormat(undefined, options).format(new Date(value));
}

function EmotionAnalysisCard({ prediction, onAnalyze, analyzing, error }) {
  const score = prediction?.scores?.[prediction.top_label];
  return <Card className="emotion-analysis-card"><div className="emotion-analysis-card__heading"><div><p className="eyebrow">Optional text analysis</p><h2>AI-estimated emotions</h2></div>{prediction && <Badge tone={prediction.stale ? 'amber' : 'lavender'}>{prediction.stale ? 'Earlier text' : 'Model estimate'}</Badge>}</div>
    <p className="emotion-analysis-card__note">An estimate about the English text, not a statement about how you truly feel.</p>
    {analyzing ? <LoadingState label="Analyzing your entry…" /> : prediction ? <><div className="emotion-analysis-card__result"><strong>{prediction.top_label}</strong>{Number.isFinite(score) && <span>Highest model score: {(score * 100).toFixed(1)}%</span>}</div>{prediction.stale && <p className="analysis-stale" role="status">This analysis is from an earlier version of the entry. Analyze again to update it.</p>}<p className="analysis-provenance">{prediction.model_name} · {formatEntryDate(prediction.created_at)}</p><details className="emotion-scores"><summary>View all model scores</summary><ul>{Object.entries(prediction.scores || {}).sort((a, b) => b[1] - a[1]).map(([label, value]) => <li key={label}><span>{label}</span><span>{(value * 100).toFixed(1)}%</span></li>)}</ul></details></> : <p className="emotion-analysis-card__empty">No analysis yet. You can request one whenever you’re ready.</p>}
    {error && <ErrorState title="Analysis couldn’t be completed">{error}</ErrorState>}<Button variant="secondary" onClick={onAnalyze} disabled={analyzing}>{prediction ? (prediction.stale ? 'Re-analyze entry' : 'Analyze again') : 'Analyze entry'}</Button>
  </Card>;
}

function EmotionFeedbackCard({ feedback, onSave, saving, error, saved }) {
  const [emotion, setEmotion] = useState(feedback?.reported_emotion || '');
  useEffect(() => { setEmotion(feedback?.reported_emotion || ''); }, [feedback?.reported_emotion]);
  return <Card className="emotion-feedback-card">
    <p className="eyebrow">Your perspective</p><h2>How did you feel?</h2>
    <p className="emotion-feedback-card__note">Your report is stored separately and never changes the model estimate.</p>
    <form onSubmit={(event) => { event.preventDefault(); if (emotion) onSave(emotion); }}>
      <label className="field__label" htmlFor="reported-emotion">Your emotion</label>
      <select className="input" id="reported-emotion" value={emotion} onChange={(event) => setEmotion(event.target.value)}>
        <option value="">Choose an emotion</option>
        {['anger', 'disgust', 'fear', 'joy', 'neutral', 'sadness', 'surprise', 'other', 'prefer_not_to_say'].map((label) => <option key={label} value={label}>{label === 'prefer_not_to_say' ? 'Prefer not to say' : label[0].toUpperCase() + label.slice(1)}</option>)}
      </select>
      {error && <p className="form-error" role="alert">{error}</p>}
      {saved && <p className="feedback-saved" role="status">Your report is saved.</p>}
      <Button type="submit" variant="secondary" disabled={!emotion || saving}>{saving ? 'Saving…' : feedback ? 'Update my report' : 'Save my report'}</Button>
    </form>
  </Card>;
}

export function JournalPage() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({ q: '', from: '', to: '' });
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const successMessage = location.state?.message;
  const hasFilters = Boolean(applied.q || applied.from || applied.to);

  async function loadEntries({ filters = applied, cursor = null, append = false } = {}) {
    const currentRequest = ++requestId.current;
    if (append) setLoadingMore(true); else setLoading(true);
    setError('');
    try {
      const result = await entriesApi.list({ ...filters, cursor });
      if (currentRequest !== requestId.current) return;
      setItems((current) => append ? [...current, ...result.items] : result.items);
      setNextCursor(result.next_cursor);
    } catch (loadError) {
      if (currentRequest === requestId.current) setError(loadError.message || 'Your journal could not be loaded. Please try again.');
    } finally {
      if (currentRequest === requestId.current) { setLoading(false); setLoadingMore(false); }
    }
  }

  useEffect(() => { loadEntries({ filters: applied }); }, []);

  function applyFilters(event) {
    event.preventDefault();
    const filters = { q: query, from, to };
    setApplied(filters); setItems([]); setNextCursor(null);
    if (from && to && from > to) { setError('The start date must be on or before the end date.'); setLoading(false); return; }
    loadEntries({ filters });
  }

  function clearFilters() {
    const empty = { q: '', from: '', to: '' };
    setQuery(''); setFrom(''); setTo(''); setApplied(empty); setItems([]); setNextCursor(null);
    loadEntries({ filters: empty });
  }

  return <><PageHeading eyebrow="Your writing" title="My Journal" description="A private home for everything you’ve saved." action={<Link className="button button--primary" to="/app/entries/new">＋ New entry</Link>} />
    {successMessage && <Toast tone="success">{successMessage}</Toast>}
    <Card className="journal-list-card"><form className="journal-filters" onSubmit={applyFilters}>
      <TextField label="Search your entries" type="search" placeholder="Search title or writing" value={query} onChange={(event) => setQuery(event.target.value)} />
      <TextField label="From" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
      <TextField label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      <div className="filter-actions"><Button type="submit" size="sm" disabled={loading}>Apply filters</Button>{hasFilters && <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>}</div>
    </form>
    {loading && items.length === 0 ? <LoadingState label="Loading your journal…" /> : error ? <ErrorState title="We couldn’t load your entries" action={<Button variant="secondary" size="sm" onClick={() => loadEntries()}>Try again</Button>}>{error}</ErrorState> : items.length === 0 ? <EmptyState title={hasFilters ? 'No entries match those filters' : 'Your journal starts here'} action={hasFilters ? <Button variant="secondary" size="sm" onClick={clearFilters}>Clear filters</Button> : <Link className="button button--primary button--sm" to="/app/entries/new">Write your first entry</Link>}>{hasFilters ? 'Try a different search or date range.' : 'Write your first entry whenever you’re ready. It will appear here.'}</EmptyState> : <div className="entry-list">{items.map((entry) => <Link className="entry-list__item" to={`/app/entries/${entry.id}`} key={entry.id}><div className="entry-list__main"><div className="entry-list__title-row"><h2>{entry.title || 'Untitled entry'}</h2>{entry.self_reported_mood && <Badge tone="lavender">You felt {entry.self_reported_mood.replaceAll('_', ' ')}</Badge>}{entry.latest_prediction && <Badge tone={entry.latest_prediction.stale ? 'amber' : 'green'}>{entry.latest_prediction.stale ? 'Analysis from earlier text' : `AI estimate: ${entry.latest_prediction.label}`}</Badge>}</div><p>{entry.excerpt}</p></div><time dateTime={entry.created_at}>{formatEntryDate(entry.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</time><span className="entry-list__arrow" aria-hidden="true">→</span></Link>)}</div>}
    {nextCursor && <div className="load-more"><Button variant="secondary" onClick={() => loadEntries({ cursor: nextCursor, append: true })} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Load more entries'}</Button></div>}
    </Card>
  </>;
}

export function EntryDetailPage() {
  const { entryId } = useParams();
  const navigate = useNavigate();
  const { refreshPreferences } = useTheme();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const dirty = Boolean(entry && editing && (title !== (entry.title || '') || content !== entry.content || (mood || '') !== (entry.self_reported_mood || '')));
  useWarnBeforeLeaving(dirty && !saving);

  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError('');
    entriesApi.get(entryId).then((value) => {
      if (!active) return;
      setEntry(value); setTitle(value.title || ''); setContent(value.content); setMood(value.self_reported_mood || '');
    }).catch((fetchError) => { if (active) setLoadError(fetchError.message || 'This entry could not be opened.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [entryId]);

  async function saveChanges(event) {
    event.preventDefault(); setSaving(true); setSaveError(''); setSaved(false);
    try {
      const updated = await entriesApi.update(entryId, { title: title.trim() || null, content, self_reported_mood: mood || null });
      const contentChanged = entry.content !== updated.content;
      const refreshed = await entriesApi.get(entryId);
      setEntry(refreshed); setTitle(refreshed.title || ''); setContent(refreshed.content); setMood(refreshed.self_reported_mood || ''); setEditing(false); setSaved(true);
      if (contentChanged) setSaved('Entry updated. Any future analysis will use the edited text.');
      if (contentChanged) refreshPreferences().catch(() => {});
    } catch (updateError) { setSaveError(updateError.message || 'Your changes could not be saved. Please retry.'); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    setDeleting(true); setDeleteError('');
    try { await entriesApi.delete(entryId); refreshPreferences().catch(() => {}); navigate('/app/journal', { replace: true, state: { message: 'Entry deleted.' } }); }
    catch (removeError) { setDeleteError(removeError.message || 'The entry could not be deleted. Please try again.'); }
    finally { setDeleting(false); }
  }

  async function analyzeEntry() {
    setAnalyzing(true); setAnalysisError('');
    try {
      const prediction = await entriesApi.analyze(entryId);
      setEntry((current) => ({ ...current, latest_prediction: prediction }));
      window.dispatchEvent(new CustomEvent('soulscript:entry-analyzed', { detail: { content: entry.content, prediction } }));
      refreshPreferences().catch(() => {});
    } catch (analysisFailure) {
      setAnalysisError(analysisFailure.status === 429 ? 'You’ve requested several analyses recently. Please wait before retrying.' : analysisFailure.message || 'Your entry is saved. Analysis is temporarily unavailable.');
    } finally { setAnalyzing(false); }
  }

  async function saveFeedback(reportedEmotion) {
    setFeedbackSaving(true); setFeedbackError(''); setFeedbackSaved(false);
    try {
      const feedback = await entriesApi.saveFeedback(entryId, reportedEmotion);
      setEntry((current) => ({ ...current, feedback }));
      setFeedbackSaved(true);
    } catch (feedbackFailure) { setFeedbackError(feedbackFailure.message || 'Your report could not be saved. Please try again.'); }
    finally { setFeedbackSaving(false); }
  }

  if (loading) return <LoadingState label="Opening your entry…" />;
  if (loadError || !entry) return <><PageHeading eyebrow="Your journal" title="Entry unavailable" /><ErrorState title="We couldn’t open this entry" action={<Link className="button button--secondary button--sm" to="/app/journal">Back to journal</Link>}>{loadError || 'This entry was not found.'}</ErrorState></>;

  return <><Link to="/app/journal" className="back-link">← My Journal</Link>
    <div className="entry-detail-head"><div><p className="eyebrow">{formatEntryDate(entry.created_at)}</p><h1>{entry.title || 'Untitled entry'}</h1>{entry.self_reported_mood && <Badge tone="lavender">You felt {entry.self_reported_mood.replaceAll('_', ' ')}</Badge>}</div><div className="entry-detail-actions"><Button variant="secondary" onClick={() => { setEditing((value) => !value); setSaveError(''); }}>{editing ? 'Cancel edit' : 'Edit entry'}</Button><Button variant="ghost" onClick={() => { setDeleteOpen(true); setDeleteError(''); }}>Delete</Button></div></div>
    {saved && <Toast tone="success" onDismiss={() => setSaved(false)}>{typeof saved === 'string' ? saved : 'Entry saved.'}</Toast>}
    {editing ? <form className="entry-editor card entry-edit-form" onSubmit={saveChanges}><EntryFields title={title} setTitle={setTitle} content={content} setContent={setContent} mood={mood} setMood={setMood} />{saveError && <ErrorState title="Your changes weren’t saved">{saveError}</ErrorState>}<div className="editor-actions"><Button type="submit" disabled={saving || !content.trim()}>{saving ? 'Saving…' : 'Save changes'}</Button><Button variant="secondary" type="button" onClick={() => { setEditing(false); setTitle(entry.title || ''); setContent(entry.content); setMood(entry.self_reported_mood || ''); }}>Cancel</Button></div></form> : <Card className="entry-detail-content"><div className="entry-detail-meta"><span>Last updated {formatEntryDate(entry.updated_at)}</span><span>Private to your account</span></div><div className="entry-content">{entry.content}</div></Card>}
    {!editing && <EmotionAnalysisCard prediction={entry.latest_prediction} onAnalyze={analyzeEntry} analyzing={analyzing} error={analysisError} />}
    {!editing && <EmotionFeedbackCard feedback={entry.feedback} onSave={saveFeedback} saving={feedbackSaving} error={feedbackError} saved={feedbackSaved} />}
    {deleteOpen && <Modal title="Delete this entry?" onClose={() => !deleting && setDeleteOpen(false)} actions={<><Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>Keep entry</Button><Button variant="danger" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete entry'}</Button></>}><p>This permanently removes the entry. Any related emotion analysis or feedback will also be removed.</p>{deleteError && <p className="form-error" role="alert">{deleteError}</p>}</Modal>}
  </>;
}
export function AnalyticsPage() {
  const initialRange = defaultAnalyticsRange();
  const [draft, setDraft] = useState({ from: initialRange.from, to: initialRange.to });
  const [applied, setApplied] = useState(initialRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rangeError, setRangeError] = useState('');

  async function loadAnalytics(range = applied) {
    setLoading(true); setError('');
    try {
      const [moods, trends, activity, comparison] = await Promise.all([
        analyticsApi.moods(range), analyticsApi.trends(range), analyticsApi.activity(range), analyticsApi.comparison(range),
      ]);
      setData({ moods, trends, activity, comparison });
    } catch (loadError) { setError(loadError.message || 'Your analytics could not be loaded.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAnalytics(initialRange); }, []);

  function applyRange(event) {
    event.preventDefault(); setRangeError('');
    if (draft.from > draft.to) { setRangeError('Choose a start date on or before the end date.'); return; }
    const range = { ...draft, timezone: initialRange.timezone };
    setApplied(range); loadAnalytics(range);
  }

  return <>
    <PageHeading eyebrow="Over time" title="Patterns, at your pace." description="Explore current AI estimates from your entries and compare them with moods you chose to report." />
    <Card className="analytics-range-card"><form className="analytics-range" onSubmit={applyRange}>
      <TextField label="From" type="date" value={draft.from} onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))} />
      <TextField label="To" type="date" value={draft.to} onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))} />
      <Button type="submit" disabled={loading}>{loading ? 'Updating…' : 'Apply dates'}</Button>
    </form><span className="field__hint">Dates follow your local timezone: {initialRange.timezone}.</span>
      {rangeError && <p className="form-error" role="alert">{rangeError}</p>}
    </Card>
    {loading && <LoadingState label="Gathering your patterns…" />}
    {!loading && error && <ErrorState title="We couldn’t load your analytics" action={<Button variant="secondary" size="sm" onClick={() => loadAnalytics()}>Try again</Button>}>{error}</ErrorState>}
    {!loading && !error && data && <>
      {data.activity.total_entries === 0 && <EmptyState title="No entries in this date range">Choose a wider range or add a new journal entry.</EmptyState>}
      <div className="analytics-grid">
        <div className="analytics-column">
          <ChartCard eyebrow="Your writing" title="Journal activity" description={`${data.activity.total_entries} ${data.activity.total_entries === 1 ? 'entry' : 'entries'} in the dates you chose.`}><ActivityChart days={data.activity.days} trends={data.trends.days} /></ChartCard>
          <ChartCard eyebrow="AI estimates over time" title="Mood trends" description="Follow how estimates change across the selected dates. Switch to your check-ins to see moods you recorded yourself."><MoodTrendChart days={data.trends.days} /></ChartCard>
        </div>
        <div className="analytics-column">
          <ChartCard eyebrow="AI emotion estimates" title="Mood distribution" description={`${data.moods.analyzed_entries} of ${data.moods.total_entries} entries have a current AI estimate.`}><MoodDistributionChart data={data.moods} /></ChartCard>
          <ChartCard eyebrow="AI estimates and your check-ins" title="Emotion results" description="View AI estimates on their own, and compare with your own mood labels when available."><ComparisonSummary data={data.comparison} /></ChartCard>
        </div>
      </div>
    </>}
  </>;
}
function formatWeekDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

function insightStatusLabel(status) {
  if (status === 'ready') return 'Ready to read';
  if (status === 'stale') return 'Ready to refresh';
  if (status === 'insufficient_data') return 'A few more entries';
  return 'Not created yet';
}

export function InsightsPage() {
  const timezone = browserTimezone();
  const [weekOf, setWeekOf] = useState(localDateValue(new Date()));
  const [insight, setInsight] = useState(null);
  const [history, setHistory] = useState([]);
  const [nextBefore, setNextBefore] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');

  async function loadHistory({ append = false, before = null } = {}) {
    setHistoryError(''); setHistoryLoading(true);
    try {
      const result = await weeklyInsightsApi.history({ limit: 12, before });
      setHistory((current) => append ? [...current, ...result.items] : result.items);
      setNextBefore(result.next_before);
    } catch (loadError) { setHistoryError(loadError.message || 'Insight history could not be loaded.'); }
    finally { setHistoryLoading(false); }
  }

  async function loadWeek(dateValue = weekOf) {
    setLoading(true); setError('');
    try {
      const result = await weeklyInsightsApi.get({ week_of: dateValue, timezone });
      setInsight(result);
    } catch (loadError) { setError(loadError.message || 'This week could not be loaded.'); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    loadWeek(weekOf);
    loadHistory();
  }, []);

  async function generateInsight() {
    setGenerating(true); setError('');
    try {
      const result = await weeklyInsightsApi.generate({ week_of: weekOf, timezone });
      setInsight(result);
      await loadHistory();
    } catch (generateError) { setError(generateError.message || 'The weekly reflection could not be generated.'); }
    finally { setGenerating(false); }
  }

  function changeWeek(offset) {
    const local = new Date(`${weekOf}T12:00:00`);
    local.setDate(local.getDate() + offset * 7);
    const dateValue = localDateValue(local);
    setWeekOf(dateValue); loadWeek(dateValue);
  }

  function viewSelectedWeek(event) {
    event.preventDefault(); loadWeek(weekOf);
  }

  return <>
    <PageHeading eyebrow="A weekly pause" title="Weekly Insights" description="A grounded reflection on the entries you chose to save." />
    <Card className="weekly-range-card"><form className="weekly-range" onSubmit={viewSelectedWeek}>
      <Button type="button" variant="secondary" size="sm" aria-label="Previous week" onClick={() => changeWeek(-1)}>←</Button>
      <TextField label="Choose a date in the week" type="date" value={weekOf} onChange={(event) => setWeekOf(event.target.value)} />
      <Button type="button" variant="secondary" size="sm" aria-label="Next week" onClick={() => changeWeek(1)}>→</Button>
      <Button type="submit" variant="secondary" size="sm" disabled={loading}>View week</Button>
    </form><span className="field__hint">Weeks run Monday to Sunday in {timezone}.</span></Card>
    {error && <ErrorState title="Weekly reflection unavailable" action={<Button variant="secondary" size="sm" onClick={() => loadWeek()}>Try again</Button>}>{error}</ErrorState>}
    {loading ? <LoadingState label="Gathering this week’s entries…" /> : insight && <Card className="weekly-insight-card">
      <div className="weekly-insight-heading"><div><p className="eyebrow">{formatWeekDate(insight.week_start)} – {formatWeekDate(insight.week_end)}</p><h2>Your week in review</h2></div><Badge tone={insight.status === 'stale' ? 'amber' : insight.status === 'ready' ? 'green' : 'neutral'}>{insightStatusLabel(insight.status)}</Badge></div>
      {insight.status === 'stale' && <p className="weekly-stale-note" role="status">This reflection needs a refresh. Your entries or the reflection format have changed; refresh it to see the latest version.</p>}
      {insight.status === 'insufficient_data' && <EmptyState title="A little more writing will help">You’ve saved {insight.entry_count} {insight.entry_count === 1 ? 'entry' : 'entries'} this week. Save {Math.max(0, insight.minimum_entry_count - insight.entry_count)} more to make space for a weekly reflection.</EmptyState>}
      {insight.status === 'not_generated' && <div className="weekly-not-generated"><p>You’ve saved {insight.entry_count} {insight.entry_count === 1 ? 'entry' : 'entries'} this week. A reflection becomes available after {insight.minimum_entry_count} entries.</p><p>It will offer a gentle recap and a few open questions. Your writing is yours to interpret; we won’t treat repeated words as a measure of what matters to you.</p></div>}
      {(insight.status === 'ready' || insight.status === 'stale') && insight.summary && <>
        <p className="weekly-summary">{insight.summary}</p>
        {insight.reflection_prompts.length > 0 && <div className="weekly-prompts"><span className="field__label">Questions to reflect on — answer any that feel useful</span><ul>{insight.reflection_prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ul></div>}
      </>}
      <div className="weekly-supporting"><div className="weekly-supporting__heading"><span className="field__label">Entries included ({insight.supporting_entries.length} of {insight.entry_count})</span><Button type="button" size="sm" onClick={generateInsight} disabled={generating}>{generating ? 'Putting it together…' : insight.status === 'ready' || insight.status === 'stale' ? 'Refresh reflection' : 'Create reflection'}</Button></div>
        {insight.supporting_entries.length ? <ul>{insight.supporting_entries.map((entry) => <li key={entry.id}><Link to={`/app/entries/${entry.id}`}>{entry.title || 'Untitled entry'}</Link><time>{formatEntryDate(entry.created_at, { month: 'short', day: 'numeric' })}</time></li>)}</ul> : <p className="field__hint">No entries in this week yet.</p>}
      </div>
    </Card>}
    <Card className="weekly-history-card"><div className="card-heading"><div><p className="eyebrow">Past weeks</p><h2>Reflection history</h2></div></div>
      {historyError && <ErrorState title="History could not be loaded">{historyError}</ErrorState>}
      {historyLoading ? <LoadingState label="Loading reflection history…" /> : !historyError && history.length === 0 ? <EmptyState title="No saved reflections yet">Create a reflection to start a weekly history.</EmptyState> : <div className="weekly-history-list">{history.map((item) => <button type="button" key={item.id} onClick={() => { setWeekOf(item.week_start); loadWeek(item.week_start); }}><span><strong>{formatWeekDate(item.week_start)} – {formatWeekDate(item.week_end)}</strong><small>{item.entry_count} {item.entry_count === 1 ? 'entry' : 'entries'} · {insightStatusLabel(item.status)}</small></span><span aria-hidden="true">→</span></button>)}</div>}
      {nextBefore && <div className="weekly-history-more"><Button type="button" variant="secondary" onClick={() => loadHistory({ append: true, before: nextBefore })}>Load older weeks</Button></div>}
    </Card>
  </>;
}
const themeChoices = [
  { id: 'mood-joy', label: 'Joy', description: 'Golden amber and warm cream', swatches: ['#FBF8ED', '#E7AD36', '#E9DEBC'] },
  { id: 'mood-sadness', label: 'Sadness', description: 'Quiet blue and mist', swatches: ['#F1F5FA', '#4F80B3', '#D9E3EE'] },
  { id: 'mood-anger', label: 'Anger', description: 'Warm red and soft rose', swatches: ['#FAF2F1', '#C84C4B', '#EAD8D5'] },
  { id: 'mood-fear', label: 'Fear', description: 'Deep violet and lilac', swatches: ['#F6F3FA', '#7356A5', '#E0D9EB'] },
  { id: 'mood-disgust', label: 'Disgust', description: 'Leaf green and pale sage', swatches: ['#F2F7F1', '#538763', '#D9E5D7'] },
  { id: 'mood-surprise', label: 'Surprise', description: 'Bright coral and peach', swatches: ['#FBF3EE', '#D8784C', '#EAD9CD'] },
  { id: 'mood-neutral', label: 'Neutral', description: 'Balanced slate and cool gray', swatches: ['#F4F5F6', '#858B96', '#DDE1E5'] },
];

export function SuggestionsPage() {
  const { preferences, loading, error } = useTheme();
  const suggestionEmotion = String(preferences.latest_estimate || '').toLowerCase();
  const suggestionSet = emotionSuggestions[suggestionEmotion];

  return <>
    <PageHeading eyebrow="For you" title="Suggestions" description="Optional ideas that follow the latest current estimate from your journal." />
    {error && <ErrorState title="Suggestions need attention">{error}</ErrorState>}
    {loading ? <LoadingState label="Loading your suggestions…" /> : <Card className="settings-data-card settings-suggestions-card">
      <p className="eyebrow">Gentle suggestions</p><h2>{suggestionSet ? `A few ideas for ${moodLabel(suggestionEmotion).toLowerCase()}` : 'Explore something that feels right'}</h2>
      <p>{suggestionSet ? suggestionSet.intro : 'Movies, reading, and videos will appear here after you run an emotion estimate on a journal entry.'}</p>
      <p className="suggestions-note">Based on the most recently analyzed entry. This text estimate is only a guess about the writing, not a description of you or advice.</p>
      {suggestionSet ? <div className="suggestion-list">{suggestionSet.items.map((item) => <a className="suggestion-item" href={item.url} target="_blank" rel="noopener noreferrer" key={`${item.type}-${item.title}`}><span className="suggestion-item__type">{item.type}</span><strong>{item.title}<span aria-hidden="true"> ↗</span></strong><span>{item.description}</span></a>)}</div> : <p className="suggestions-note">Suggestions update after your next analysis. You choose whether to open anything; journal text is not shared with these sites.</p>}
    </Card>}
  </>;
}

export function SettingsPage() {
  const { preferences, loading, error, savePreferences, setPreview, cancelPreview } = useTheme();
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSaved, setExportSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePhrase, setDeletePhrase] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { setDraft(preferences); }, [preferences]);

  if (loading) return <LoadingState label="Loading your preferences…" />;

  function updateDraft(changes) {
    const next = { ...draft, ...changes };
    setDraft(next); setPreview(next); setSaved(false); setSaveError('');
  }

  async function submitPreferences(event) {
    event.preventDefault(); setSaving(true); setSaveError(''); setSaved(false);
    try {
      await savePreferences({ theme_mode: draft.theme_mode, selected_theme: draft.selected_theme, timezone: draft.timezone });
      setSaved(true);
    } catch (saveFailure) { setSaveError(saveFailure.message || 'Your appearance preferences could not be saved.'); }
    finally { setSaving(false); }
  }

  function discardChanges() {
    setDraft(preferences); cancelPreview(); setSaveError(''); setSaved(false);
  }

  async function exportData() {
    setExporting(true); setExportError(''); setExportSaved(false);
    try {
      const data = await authApi.exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url; link.download = 'soulscript-export.json';
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      setExportSaved(true);
    } catch (exportFailure) { setExportError(exportFailure.message || 'Your export could not be created. Please try again.'); }
    finally { setExporting(false); }
  }

  async function confirmAccountDeletion(event) {
    event.preventDefault(); setDeleting(true); setDeleteError('');
    try {
      await deleteAccount({ current_password: deletePassword, confirmation: deletePhrase });
      setDeleteOpen(false);
      navigate('/', { replace: true });
    } catch (deleteFailure) { setDeleteError(deleteFailure.message || 'Your account could not be deleted. Please try again.'); }
    finally { setDeleting(false); }
  }

  return <>
    <PageHeading eyebrow="Your preferences" title="Settings" description="Choose how SoulScript feels as you write and reflect." />
    {(error || saveError) && <ErrorState title="Preferences need attention">{saveError || error}</ErrorState>}
    {saved && <Toast tone="success" onDismiss={() => setSaved(false)}>Your appearance preferences are saved.</Toast>}
    {exportError && <ErrorState title="Export could not be completed">{exportError}</ErrorState>}
    {exportSaved && <Toast tone="success" onDismiss={() => setExportSaved(false)}>Your JSON export was downloaded.</Toast>}
    <form className="settings-layout" onSubmit={submitPreferences}>
      <Card className="settings-card">
        <p className="eyebrow">Appearance</p><h2>Choose a theme</h2>
        <p className="settings-card__intro">Preview a palette, then save it for your account.</p>
        <fieldset className="theme-modes"><legend className="field__label">Theme behavior</legend>
          {[
            ['default', 'Default', 'Keep the standard SoulScript colors. Automatic changes are off.'],
            ['manual', 'Manual', 'Choose one palette and keep it selected.'],
            ['auto', 'Automatic', 'Set the whole app’s palette from the most common AI estimate in the last 30 days; a tie follows the latest estimate.'],
          ].map(([value, label, description]) => <label className={`theme-mode ${draft.theme_mode === value ? 'is-selected' : ''}`} key={value}>
            <input type="radio" name="theme_mode" value={value} checked={draft.theme_mode === value} onChange={() => updateDraft({ theme_mode: value })} />
            <span><strong>{label}</strong><small>{description}</small></span>
          </label>)}
        </fieldset>
        {draft.theme_mode === 'manual' && <fieldset className="theme-picker"><legend className="field__label">Palette</legend>
          {themeChoices.map((theme) => <button type="button" className={`theme-choice theme-choice--${theme.id} ${draft.selected_theme === theme.id ? 'is-selected' : ''}`} key={theme.id} aria-pressed={draft.selected_theme === theme.id} style={{ '--swatch-a': theme.swatches[0], '--swatch-b': theme.swatches[1], '--swatch-c': theme.swatches[2] }} onClick={() => updateDraft({ selected_theme: theme.id })}>
            <span className="theme-choice__swatches" aria-hidden="true"><i /><i /><i /></span><strong>{theme.label}</strong><small>{theme.description}</small>
          </button>)}
        </fieldset>}
        {draft.theme_mode === 'auto' && <p className="theme-auto-note">{preferences.latest_emotion ? `Most common AI estimate in the last 30 days: ${preferences.latest_emotion}. A tie follows the most recently analyzed tied emotion.` : 'Your standard palette stays in place until an entry has a current AI estimate.'}</p>}
        <div className="settings-preview" aria-label="Theme preview"><span className="eyebrow">Live preview</span><div className="settings-preview__sample"><span className="settings-preview__dot" /><div><strong>A little space to reflect</strong><small>Your palette preview</small></div><span className="settings-preview__button">Write</span></div></div>
        <div className="settings-actions"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save appearance'}</Button><Button type="button" variant="secondary" onClick={discardChanges} disabled={saving}>Discard changes</Button></div>
      </Card>
    </form>
    <div className="settings-data-grid">
      <Card className="settings-data-card">
        <p className="eyebrow">Your data</p><h2>Take a copy with you</h2>
        <p>Your JSON export includes your journal entries, mood reports, AI estimate history, preferences, and weekly reflections. It is scoped to your account and excludes passwords and session credentials.</p>
        <Button type="button" variant="secondary" onClick={exportData} disabled={exporting}>{exporting ? 'Preparing export…' : 'Download my data'}</Button>
      </Card>
      <Card className="settings-data-card">
        <p className="eyebrow">Privacy and AI</p><h2>Your writing stays yours</h2>
        <ul className="privacy-disclosures">
          <li>Your entries and reports are available only to your authenticated account.</li>
          <li>Optional emotion analysis runs locally in the SoulScript backend. Journal text is not sent to an inference API.</li>
          <li>The estimate uses the English-language j-hartmann/emotion-english-distilroberta-base model.</li>
          <li>Emotion labels are estimates about English text, not facts about you or a clinical assessment.</li>
          <li>When a current estimate or recent pattern points to sadness or disgust, SoulScript may show a gentle check-in. It also checks recent analyzed entries locally for direct first-person self-harm wording so it can show urgent support links when appropriate. Journal text is not sent to another service for this check.</li>
          <li>You can export your records or permanently delete your account and its active database records.</li>
        </ul>
      </Card>
      <Card className="settings-data-card settings-danger-zone">
        <p className="eyebrow">Account</p><h2>Delete your account</h2>
        <p>Deletion removes your entries, predictions, feedback, preferences, weekly reflections, and active sessions. You will need your current password to confirm.</p>
        <Button type="button" variant="danger" onClick={() => { setDeleteOpen(true); setDeletePassword(''); setDeletePhrase(''); setDeleteError(''); }}>Delete account</Button>
      </Card>
    </div>
    {deleteOpen && <Modal title="Permanently delete your account?" onClose={() => !deleting && setDeleteOpen(false)} actions={<><Button type="button" variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>Keep my account</Button><Button type="submit" variant="danger" form="account-deletion-form" disabled={deleting || deletePhrase !== 'DELETE MY ACCOUNT' || !deletePassword}>{deleting ? 'Deleting…' : 'Delete permanently'}</Button></>}>
      <p>This removes your live SoulScript records and ends your active sessions. External database snapshots, if an operator created them, follow that operator’s retention policy.</p>
      <form id="account-deletion-form" className="account-deletion-form" onSubmit={confirmAccountDeletion}>
        <TextField label="Current password" type="password" autoComplete="current-password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} />
        <TextField label="Type DELETE MY ACCOUNT to confirm" value={deletePhrase} onChange={(event) => setDeletePhrase(event.target.value)} autoComplete="off" />
        {deleteError && <p className="form-error" role="alert">{deleteError}</p>}
      </form>
    </Modal>}
  </>;
}
