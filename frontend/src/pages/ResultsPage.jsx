import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext.jsx';

const scoreColor = (score) => {
  if (score >= 8) return { bg: 'var(--green-50)', text: 'var(--green-600)' };
  if (score >= 5) return { bg: 'var(--amber-50)', text: 'var(--amber-600)' };
  return { bg: 'var(--red-50)', text: 'var(--red-600)' };
};

const readinessColors = {
  'Ready to interview': { bg: 'var(--green-50)', text: 'var(--green-600)' },
  'Almost ready': { bg: 'var(--amber-50)', text: 'var(--amber-600)' },
  'Needs more prep': { bg: 'var(--red-50)', text: 'var(--red-600)' },
};

export default function ResultsPage() {
  const { state, dispatch } = useInterview();
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState(null);

  if (state.status === 'idle') {
    navigate('/');
    return null;
  }

  const { summary, averageScore, questions, answers, feedbacks, role, level } = state;
  const answered = feedbacks.filter(f => f && f.score > 0).length;
  const overallPct = Math.round((averageScore || 0) * 10);
  const rc = readinessColors[summary?.readinessLevel] || readinessColors['Needs more prep'];

  function restart() {
    dispatch({ type: 'RESET' });
    navigate('/');
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 2rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '64px', color: 'var(--purple-600)', lineHeight: 1 }}>{overallPct}%</div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '12px' }}>Overall Score</div>
        {summary?.readinessLevel && (
          <span style={{ ...rc, fontSize: '13px', fontWeight: 600, padding: '5px 14px', borderRadius: '14px', display: 'inline-block' }}>
            {summary.readinessLevel}
          </span>
        )}
        {summary?.overallVerdict && (
          <p style={{ marginTop: '1rem', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '520px', margin: '1rem auto 0' }}>
            {summary.overallVerdict}
          </p>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '2rem' }}>
        {[
          { label: 'Answered', value: `${answered}/${questions.length}` },
          { label: 'Avg Score', value: `${averageScore?.toFixed(1)}/10` },
          { label: 'Role', value: role },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Top Strength & Growth */}
      {(summary?.topStrength || summary?.topGrowthArea) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '2rem' }}>
          {summary.topStrength && (
            <div style={{ background: 'var(--green-50)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Top Strength</div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{summary.topStrength}</div>
            </div>
          )}
          {summary.topGrowthArea && (
            <div style={{ background: 'var(--amber-50)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--amber-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Growth Area</div>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{summary.topGrowthArea}</div>
            </div>
          )}
        </div>
      )}

      {/* Next Steps */}
      {summary?.nextSteps?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Next Steps</div>
          {summary.nextSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px', fontSize: '14px', lineHeight: 1.6 }}>
              <span style={{ minWidth: '22px', height: '22px', background: 'var(--purple-50)', color: 'var(--purple-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, marginTop: '1px' }}>{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      )}

      {/* Q&A Review */}
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Review Your Answers</div>
      <div style={{ marginBottom: '2rem' }}>
        {questions.map((q, i) => {
          const fb = feedbacks[i];
          const sc = scoreColor(fb?.score || 0);
          const isOpen = openIdx === i;
          return (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginBottom: '8px', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                style={{ width: '100%', padding: '12px 14px', background: 'var(--surface)', border: 'none', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '12px' }}
              >
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Q{i + 1}: {q.length > 60 ? q.slice(0, 60) + '…' : q}</span>
                <span style={{ ...sc, fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap' }}>{fb?.score || 0}/10</span>
              </button>
              {isOpen && (
                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-light)', background: 'var(--gray-50)', fontSize: '13px', lineHeight: 1.7 }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}><strong>Your answer:</strong> {answers[i] || '—'}</div>
                  <div style={{ color: 'var(--text-primary)' }}><strong>Feedback:</strong> {fb?.summary || '—'}</div>
                  {fb?.tip && <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--purple-50)', borderRadius: 'var(--radius-sm)', color: 'var(--purple-800)' }}>💡 {fb.tip}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={restart} style={{ padding: '13px 28px', background: 'var(--purple-600)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
          Try Another Interview
        </button>
        <button onClick={() => navigate('/history')} style={{ padding: '13px 24px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '15px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          View History
        </button>
      </div>
    </div>
  );
}
