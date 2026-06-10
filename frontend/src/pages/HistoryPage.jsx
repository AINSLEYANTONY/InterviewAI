import React, { useEffect, useState } from 'react';
import { sessionsApi } from '../services/api.js';

const scoreColor = (avg) => {
  if (!avg) return { bg: 'var(--gray-100)', text: 'var(--gray-600)' };
  if (avg >= 8) return { bg: 'var(--green-50)', text: 'var(--green-600)' };
  if (avg >= 5) return { bg: 'var(--amber-50)', text: 'var(--amber-600)' };
  return { bg: 'var(--red-50)', text: 'var(--red-600)' };
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    sessionsApi.getAll()
      .then(setSessions)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this session?')) return;
    try {
      await sessionsApi.delete(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: 400, marginBottom: '0.5rem' }}>Interview History</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '2rem' }}>All your past interview sessions in one place.</p>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading sessions…</p>}
      {error && <p style={{ color: 'var(--red-600)' }}>Error: {error}</p>}

      {!loading && sessions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '1rem' }}>📭</div>
          <p>No sessions yet. Start an interview to see your history here.</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {sessions.map(s => {
          const sc = scoreColor(s.averageScore);
          const date = new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          return (
            <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.1rem 1.4rem', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{s.role}</span>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: 'var(--purple-50)', color: 'var(--purple-800)' }}>{s.level}</span>
                  {s.readinessLevel && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{s.readinessLevel}</span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{date} · {s.answeredQuestions}/{s.totalQuestions} answered</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {s.averageScore !== null && (
                  <span style={{ ...sc, fontSize: '14px', fontWeight: 700, padding: '4px 12px', borderRadius: '12px' }}>
                    {s.averageScore?.toFixed(1)}/10
                  </span>
                )}
                <button
                  onClick={() => handleDelete(s.id)}
                  style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'transparent', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
