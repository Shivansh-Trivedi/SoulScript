import { useState } from 'react';
import { Card, EmptyState } from './ui.jsx';

const MOOD_COLORS = {
  joy: '#E7AD36',
  sadness: '#4F80B3',
  anger: '#C84C4B',
  fear: '#7356A5',
  disgust: '#538763',
  surprise: '#D8784C',
  neutral: '#858B96',
};
const moodColor = (mood) => MOOD_COLORS[mood] || '#7662A8';
const moodLabel = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export function MoodDistributionChart({ data }) {
  const [source, setSource] = useState('predicted');
  const rows = source === 'predicted' ? data?.ai_distribution || [] : data?.reported_distribution || data?.distribution || [];
  if (!rows.length) return <>
    <div className="trend-source-toggle" role="group" aria-label="Mood distribution source"><button type="button" aria-pressed={source === 'predicted'} onClick={() => setSource('predicted')}>AI estimates</button><button type="button" aria-pressed={source === 'reported'} onClick={() => setSource('reported')}>Your check-ins</button></div>
    <EmptyState title={source === 'predicted' ? 'No AI estimates yet' : 'No mood check-ins in this range'}>{source === 'predicted' ? 'Analyze a journal entry to see its optional AI emotion estimate here.' : 'If you choose to record how you felt in an entry, you’ll see it here.'}</EmptyState>
  </>;
  const max = Math.max(...rows.map((row) => row.count), 1);
  return <><div className="trend-source-toggle" role="group" aria-label="Mood distribution source"><button type="button" aria-pressed={source === 'predicted'} onClick={() => setSource('predicted')}>AI estimates ({data?.analyzed_entries || 0})</button><button type="button" aria-pressed={source === 'reported'} onClick={() => setSource('reported')}>Your check-ins ({data?.reported_entries || 0})</button></div><div className="mood-bars" role="list" aria-label={source === 'predicted' ? 'AI estimated mood distribution' : 'Your mood check-in distribution'}>
    {rows.map((row) => <div className="mood-bar" role="listitem" key={row.mood}>
      <div className="mood-bar__label"><span>{moodLabel(row.mood)}</span><small>{row.count} · {row.percentage}%</small></div>
      <div className="mood-bar__track"><span style={{ width: `${Math.max(4, row.count / max * 100)}%`, background: moodColor(row.mood) }} /></div>
    </div>)}
  </div>{source === 'predicted' && data?.mixed_emotion_entries?.length > 0 && <div className="mixed-estimates">
    <h3>Mixed emotion scores</h3>
    <p>Each bar shows the two strongest AI scores for a recent entry; the muted segment groups the remaining scores.</p>
    {data.mixed_emotion_entries.map((entry) => <div className="mixed-estimate" key={entry.entry_id}>
      <div className="mixed-estimate__label"><span title={entry.title}>{entry.title}</span><small>{entry.top_scores.map((score) => `${moodLabel(score.mood)} ${score.percentage}%`).join(' · ')}</small></div>
      <div className="mixed-score-track" role="img" aria-label={`${entry.title}: ${entry.top_scores.map((score) => `${moodLabel(score.mood)} ${score.percentage}%`).join(', ')}, other scores ${entry.other_percentage}%`}>
        {entry.top_scores.map((score) => <span key={score.mood} title={`${moodLabel(score.mood)} ${score.percentage}%`} style={{ width: `${score.percentage}%`, background: moodColor(score.mood) }} />)}
        {entry.other_percentage > 0 && <span className="mixed-score-track__other" title={`Other scores ${entry.other_percentage}%`} style={{ width: `${entry.other_percentage}%` }} />}
      </div>
    </div>)}
  </div>}</>;
}

export function ActivityChart({ days = [], trends = [], title = 'Journal activity' }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const emotionByDate = new Map(trends.map((trend) => {
    const [emotion] = Object.entries(trend.predicted_emotions || {}).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return [trend.date, emotion?.[0] || null];
  }));
  const max = Math.max(...days.map((day) => day.count), 1);
  const width = 720; const height = 210; const left = 28; const right = 12; const top = 12; const bottom = 34;
  const plotWidth = width - left - right; const plotHeight = height - top - bottom;
  const step = plotWidth / Math.max(days.length, 1); const barWidth = Math.max(1, Math.min(16, step * 0.68));
  const labelEvery = Math.max(1, Math.ceil(days.length / 6));
  const showTooltip = (event, day) => {
    const wrapper = event.currentTarget.ownerSVGElement?.parentElement;
    if (!wrapper) return;
    const bounds = wrapper.getBoundingClientRect();
    const x = event.clientX - bounds.left + wrapper.scrollLeft;
    const y = event.clientY - bounds.top + wrapper.scrollTop;
    setHoveredDay({ day, x: Math.max(112, Math.min(wrapper.clientWidth - 112, x)), y: Math.max(54, y) });
  };
  const hideTooltip = () => setHoveredDay(null);
  return <div className="analytics-svg-wrap"><svg className="activity-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}, ${days.reduce((sum, day) => sum + day.count, 0)} journal entries`}>
    <line x1={left} y1={top + plotHeight} x2={width - right} y2={top + plotHeight} className="chart-axis" />
    {days.map((day, index) => {
      const barHeight = day.count ? day.count / max * (plotHeight - 8) : 0;
      const x = left + step * index + (step - barWidth) / 2;
      const y = top + plotHeight - barHeight;
      const dominantEmotion = day.dominant_emotion || emotionByDate.get(String(day.date));
      const emotionColor = dominantEmotion ? moodColor(dominantEmotion) : 'var(--color-primary)';
      const chartDay = { ...day, dominant_emotion: dominantEmotion };
      return <g key={day.date}>{day.count > 0 && <rect x={x} y={y} width={barWidth} height={barHeight} rx="3" className="chart-bar" style={{ fill: emotionColor }} aria-label={`${day.date}: ${day.count} ${day.count === 1 ? 'entry' : 'entries'}${dominantEmotion ? `, most common estimate ${moodLabel(dominantEmotion)}` : ', no AI estimate'}`} onPointerEnter={(event) => showTooltip(event, chartDay)} onPointerMove={(event) => showTooltip(event, chartDay)} onPointerLeave={hideTooltip} onFocus={(event) => showTooltip(event, chartDay)} onBlur={hideTooltip} tabIndex="0" />}{index % labelEvery === 0 && <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" className="chart-label">{day.date.slice(5)}</text>}</g>;
    })}
  </svg>{hoveredDay && <div className="activity-tooltip" role="tooltip" style={{ left: hoveredDay.x, top: hoveredDay.y }}><strong>{new Date(`${hoveredDay.day.date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong><span><i style={{ background: hoveredDay.day.dominant_emotion ? moodColor(hoveredDay.day.dominant_emotion) : 'var(--color-primary)' }} />{hoveredDay.day.dominant_emotion ? moodLabel(hoveredDay.day.dominant_emotion) : 'No AI estimate'} · {hoveredDay.day.count} {hoveredDay.day.count === 1 ? 'entry' : 'entries'}</span></div>}</div>;
}

export function MoodTrendChart({ days = [] }) {
  const [source, setSource] = useState('predicted');
  const seriesKey = source === 'reported' ? 'reported_moods' : 'predicted_emotions';
  const sourceLabel = source === 'reported' ? 'Your reports' : 'Current AI estimates';
  const totals = new Map();
  days.forEach((day) => Object.entries(day[seriesKey] || {}).forEach(([mood, count]) => totals.set(mood, (totals.get(mood) || 0) + count)));
  const labels = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([mood]) => mood);
  if (!labels.length) return <><div className="trend-source-toggle" role="group" aria-label="Mood trend source"><button type="button" aria-pressed={source === 'predicted'} onClick={() => setSource('predicted')}>AI estimates</button><button type="button" aria-pressed={source === 'reported'} onClick={() => setSource('reported')}>Your check-ins</button></div><EmptyState title={source === 'reported' ? 'No mood check-ins yet' : 'No AI estimates yet'}>{source === 'reported' ? 'Your recorded moods will appear here over time.' : 'Current AI estimates will appear after you analyze entries.'}</EmptyState></>;
  const width = 720; const height = 260; const left = 34; const right = 18; const top = 20; const bottom = 38;
  const plotWidth = width - left - right; const plotHeight = height - top - bottom;
  const max = Math.max(1, ...days.flatMap((day) => labels.map((label) => day[seriesKey]?.[label] || 0)));
  const xFor = (index) => left + (days.length <= 1 ? plotWidth / 2 : index * plotWidth / (days.length - 1));
  const yFor = (count) => top + plotHeight - (count / max) * plotHeight;
  const labelEvery = Math.max(1, Math.ceil(days.length / 6));
  return <>
    <div className="trend-chart-head"><div className="chart-legend">{labels.map((label) => <span key={label}><i style={{ background: moodColor(label) }} />{moodLabel(label)}</span>)}</div><div className="trend-source-toggle" role="group" aria-label="Mood trend source"><button type="button" aria-pressed={source === 'predicted'} onClick={() => setSource('predicted')}>AI estimates</button><button type="button" aria-pressed={source === 'reported'} onClick={() => setSource('reported')}>Your check-ins</button></div></div>
    <div className="analytics-svg-wrap"><svg className="trend-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Daily ${sourceLabel.toLowerCase()} over the selected dates`}>
      {[0, max / 2, max].map((tick) => <g key={tick}><line x1={left} y1={yFor(tick)} x2={width - right} y2={yFor(tick)} className="chart-gridline" /><text x={left - 8} y={yFor(tick) + 3} textAnchor="end" className="chart-value-label">{Number.isInteger(tick) ? tick : tick.toFixed(1)}</text></g>)}
      {labels.map((label) => {
        const points = days.map((day, index) => `${xFor(index)},${yFor(day[seriesKey]?.[label] || 0)}`).join(' ');
        return <g key={label}><polyline points={points} fill="none" stroke={moodColor(label)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="trend-line" />{days.map((day, index) => {
          const count = day[seriesKey]?.[label] || 0;
          if (!count) return null;
          const y = yFor(count);
          const itemName = source === 'reported' ? 'mood check-in' : 'text estimate';
          return <g key={`${label}-${day.date}`}><title>{day.date}: {count} {moodLabel(label).toLowerCase()} {count === 1 ? itemName : `${itemName}s`}</title><circle cx={xFor(index)} cy={y} r="5" fill={moodColor(label)} /></g>;
        })}</g>;
      })}
      {days.map((day, index) => index % labelEvery === 0 && <text key={day.date} x={xFor(index)} y={height - 9} textAnchor="middle" className="chart-label">{day.date.slice(5)}</text>)}
    </svg></div>
  </>;
}

export function ComparisonSummary({ data }) {
  const pairs = data?.matrix || [];
  const estimates = data?.estimate_distribution || [];
  return <>
    <div className="comparison-metrics">
      <div><strong>{data?.prediction_entries || 0}</strong><span>entries with an AI estimate</span></div>
      <div><strong>{data?.agreement_rate == null ? '—' : `${data.agreement_rate}%`}</strong><span>same label when compared</span></div>
    </div>
    <p className="comparison-note">Current AI estimates from your analyzed entries. They describe the wording of the text, not a definitive reading of how you feel.</p>
    {estimates.length ? <div className="comparison-pairs">{estimates.map((row) => <div key={row.mood}><span>AI estimate: {moodLabel(row.mood)}</span><span aria-hidden="true">·</span><span>{row.count} {row.count === 1 ? 'entry' : 'entries'}</span><strong /></div>)}</div> : <EmptyState title="No AI estimates yet">Open a journal entry and analyze it to see an estimate here.</EmptyState>}
    {pairs.length > 0 ? <><p className="comparison-note">Compared with your own mood check-ins for the same entries:</p><div className="comparison-pairs">{pairs.map((pair) => <div key={`${pair.reported_emotion}-${pair.predicted_emotion}`}><span>You chose {moodLabel(pair.reported_emotion)}</span><span aria-hidden="true">→</span><span>AI estimate: {moodLabel(pair.predicted_emotion)}</span><strong>{pair.count}</strong></div>)}</div></> : estimates.length > 0 && <p className="comparison-footnote">Add an optional mood check-in to an entry to compare your own label with its AI estimate.</p>}
  </>;
}

export function ChartCard({ eyebrow, title, description, children, className = '' }) {
  return <Card className={`analytics-card ${className}`.trim()}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p className="analytics-card__description">{description}</p>}{children}</Card>;
}
