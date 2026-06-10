import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext.jsx';
import { interviewApi } from '../services/api.js';

const ROLES = [
  { id: 'Software Engineer', icon: '💻', desc: 'DSA, system design, coding' },
  { id: 'Product Manager', icon: '📋', desc: 'Strategy, metrics, roadmaps' },
  { id: 'Data Scientist', icon: '📊', desc: 'ML, stats, SQL, insights' },
  { id: 'UX Designer', icon: '🎨', desc: 'Research, prototyping, process' },
  { id: 'Marketing Manager', icon: '📣', desc: 'Growth, campaigns, analytics' },
  { id: 'DevOps Engineer', icon: '⚙️', desc: 'CI/CD, infra, reliability' },
];

const LEVELS = ['Entry-level', 'Mid-level', 'Senior', 'Lead / Principal'];
const Q_COUNTS = [3, 5, 7];

const s = {
  page: { maxWidth: '760px', margin: '0 auto', padding: '3rem 2rem' },
  hero: { marginBottom: '3rem' },
  h1: { fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 400, lineHeight: 1.15, marginBottom: '0.75rem' },
  em: { fontStyle: 'italic', color: 'var(--purple-600)' },
  sub: { fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 },
  sectionLabel: { fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '2rem' },
  card: (selected) => ({
    border: selected ? '2px solid var(--purple-600)' : '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.1rem',
    cursor: 'pointer',
    background: selected ? 'var(--purple-50)' : 'var(--surface)',
    transition: 'all 0.15s ease',
    textAlign: 'left',
  }),
  cardIcon: { fontSize: '22px', marginBottom: '8px' },
  cardLabel: { fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' },
  cardDesc: { fontSize: '11px', color: 'var(--text-muted)' },
  pillRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '2rem' },
  pill: (selected) => ({
    padding: '7px 18px',
    borderRadius: '20px',
    border: selected ? '2px solid var(--purple-600)' : '1px solid var(--border)',
    background: selected ? 'var(--purple-600)' : 'var(--surface)',
    color: selected ? '#fff' : 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  startBtn: (disabled) => ({
    padding: '13px 32px',
    background: disabled ? 'var(--gray-200)' : 'var(--purple-600)',
    color: disabled ? 'var(--text-muted)' : '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '15px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  error: { marginTop: '1rem', color: 'var(--red-600)', fontSize: '14px', background: 'var(--red-50)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }
};

export default function SetupPage() {
  const [role, setRole] = useState(null);
  const [level, setLevel] = useState(null);
  const [qCount, setQCount] = useState(5);
  const [error, setError] = useState('');
  const { state, dispatch } = useInterview();
  const navigate = useNavigate();

  const isReady = role && level;

  async function handleStart() {
    if (!isReady) return;
    setError('');
    dispatch({ type: 'START_LOADING' });
    try {
      const data = await interviewApi.start(role, level, qCount);
      dispatch({ type: 'SESSION_CREATED', payload: data });
      navigate('/interview');
    } catch (err) {
      setError(err.message);
      dispatch({ type: 'RESET' });
    }
  }

  const isLoading = state.status === 'loading';

  return (
    <div style={s.page}>
      <div style={s.hero}>
        <h1 style={s.h1}>Your AI<br /><em style={s.em}>Interview Coach</em></h1>
        <p style={s.sub}>Pick a role, answer real interview questions, and get instant AI-powered feedback on every response.</p>
      </div>

      <div style={s.sectionLabel}>Choose a role</div>
      <div style={s.grid}>
        {ROLES.map(r => (
          <div key={r.id} style={s.card(role === r.id)} onClick={() => setRole(r.id)}>
            <div style={s.cardIcon}>{r.icon}</div>
            <div style={s.cardLabel}>{r.id}</div>
            <div style={s.cardDesc}>{r.desc}</div>
          </div>
        ))}
      </div>

      <div style={s.sectionLabel}>Experience level</div>
      <div style={s.pillRow}>
        {LEVELS.map(l => (
          <button key={l} style={s.pill(level === l)} onClick={() => setLevel(l)}>{l}</button>
        ))}
      </div>

      <div style={s.sectionLabel}>Number of questions</div>
      <div style={{ ...s.pillRow, marginBottom: '2.5rem' }}>
        {Q_COUNTS.map(n => (
          <button key={n} style={s.pill(qCount === n)} onClick={() => setQCount(n)}>{n} questions</button>
        ))}
      </div>

      <button style={s.startBtn(!isReady || isLoading)} onClick={handleStart} disabled={!isReady || isLoading}>
        {isLoading ? '⏳ Generating questions…' : '▶ Start Interview'}
      </button>

      {error && <div style={s.error}>⚠ {error}</div>}
    </div>
  );
}
