import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterview } from '../context/InterviewContext.jsx';
import { interviewApi } from '../services/api.js';

const s = {
  page: { maxWidth: '720px', margin: '0 auto', padding: '2.5rem 2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  tagRow: { display: 'flex', gap: '8px' },
  tag: { fontSize: '12px', fontWeight: 500, padding: '3px 10px', borderRadius: '12px', background: 'var(--purple-50)', color: 'var(--purple-800)' },
  counter: { fontSize: '13px', color: 'var(--text-muted)' },
  progressTrack: { height: '4px', background: 'var(--gray-100)', borderRadius: '2px', marginBottom: '2rem' },
  progressFill: (pct) => ({ height: '100%', width: `${pct}%`, background: 'var(--purple-600)', borderRadius: '2px', transition: 'width 0.4s ease' }),
  questionBox: {
    borderLeft: '3px solid var(--purple-600)',
    background: 'var(--gray-50)',
    borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
    padding: '1.25rem 1.5rem',
    marginBottom: '1.5rem',
  },
  questionText: { fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, lineHeight: 1.55, color: 'var(--text-primary)' },
  textarea: {
    width: '100%',
    minHeight: '140px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.1rem',
    fontSize: '14px',
    lineHeight: 1.7,
    resize: 'vertical',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    transition: 'border-color 0.15s',
    marginBottom: '1rem',
    outline: 'none',
  },
  btnRow: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  submitBtn: (disabled) => ({
    padding: '10px 24px',
    background: disabled ? 'var(--gray-200)' : 'var(--purple-600)',
    color: disabled ? 'var(--text-muted)' : '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
  }),
  skipBtn: {
    padding: '10px 18px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  nextBtn: {
    padding: '10px 24px',
    background: 'var(--purple-600)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  feedbackCard: {
    marginTop: '1.5rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    background: 'var(--surface)',
    animation: 'fadeUp 0.3s ease',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid var(--border-light)',
    background: 'var(--gray-50)',
  },
  feedbackBody: { padding: '1.1rem 1.25rem' },
  scorePill: (score) => {
    if (score >= 8) return { background: 'var(--green-50)', color: 'var(--green-600)', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' };
    if (score >= 5) return { background: 'var(--amber-50)', color: 'var(--amber-600)', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' };
    return { background: 'var(--red-50)', color: 'var(--red-600)', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px' };
  },
  listItem: { fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', display: 'flex', gap: '8px', marginBottom: '4px' },
  tip: { marginTop: '12px', padding: '10px 14px', background: 'var(--purple-50)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--purple-800)', lineHeight: 1.6 },
  dots: { display: 'flex', gap: '5px', alignItems: 'center', padding: '1rem 1.25rem' },
  dot: (delay) => ({
    width: '7px', height: '7px', borderRadius: '50%',
    background: 'var(--purple-400)',
    animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
  }),
};

export default function InterviewPage() {
  const { state, dispatch } = useInterview();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (state.status === 'idle') navigate('/');
  }, [state.status]);

  useEffect(() => {
    setAnswer('');
    setShowFeedback(false);
  }, [state.currentIndex]);

  const q = state.questions[state.currentIndex];
  const feedback = state.feedbacks[state.currentIndex];
  const total = state.questions.length;
  const pct = (state.currentIndex / total) * 100;
  const isSubmitting = state.status === 'submitting';
  const isLast = state.currentIndex === total - 1;

  async function handleSubmit() {
    if (!answer.trim() || isSubmitting) return;
    dispatch({ type: 'SUBMITTING_ANSWER' });
    try {
      const res = await interviewApi.submitAnswer(state.sessionId, state.currentIndex, answer);
      dispatch({ type: 'ANSWER_SUBMITTED', payload: { questionIndex: state.currentIndex, answer, feedback: res.feedback } });
      setShowFeedback(true);
    } catch (err) {
      dispatch({ type: 'ANSWER_SUBMITTED', payload: { questionIndex: state.currentIndex, answer, feedback: { score: 0, label: 'Error', summary: err.message, strengths: [], improvements: [], tip: '' } } });
      setShowFeedback(true);
    }
  }

  function handleSkip() {
    dispatch({ type: 'ANSWER_SUBMITTED', payload: { questionIndex: state.currentIndex, answer: '[Skipped]', feedback: { score: 0, label: 'Skipped', summary: 'Skipped.', strengths: [], improvements: [], tip: 'Try to answer every question.' } } });
    setShowFeedback(true);
  }

  async function handleNext() {
    if (isLast) {
      try {
        const res = await interviewApi.complete(state.sessionId);
        dispatch({ type: 'SESSION_COMPLETED', payload: res });
        navigate('/results');
      } catch {
        navigate('/results');
      }
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }

  return (
    <div style={s.page}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} @keyframes pulse{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}`}</style>

      <div style={s.header}>
        <div style={s.tagRow}>
          <span style={s.tag}>{state.role}</span>
          <span style={s.tag}>{state.level}</span>
        </div>
        <span style={s.counter}>Question {state.currentIndex + 1} of {total}</span>
      </div>

      <div style={s.progressTrack}>
        <div style={s.progressFill(pct)} />
      </div>

      <div style={s.questionBox}>
        <p style={s.questionText}>{q}</p>
      </div>

      {!showFeedback && (
        <>
          <textarea
            style={s.textarea}
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer here… Be specific and use real examples."
            onFocus={e => e.target.style.borderColor = 'var(--purple-600)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            disabled={isSubmitting}
          />
          <div style={s.btnRow}>
            <button style={s.submitBtn(isSubmitting || !answer.trim())} onClick={handleSubmit} disabled={isSubmitting || !answer.trim()}>
              {isSubmitting ? 'Evaluating…' : 'Submit Answer'}
            </button>
            <button style={s.skipBtn} onClick={handleSkip} disabled={isSubmitting}>Skip</button>
          </div>
        </>
      )}

      {isSubmitting && (
        <div style={s.dots}>
          <span style={s.dot(0)} /><span style={s.dot(0.2)} /><span style={s.dot(0.4)} />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '4px' }}>Analysing your answer…</span>
        </div>
      )}

      {showFeedback && feedback && (
        <div style={s.feedbackCard}>
          <div style={s.feedbackHeader}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Interviewer Feedback</span>
            <span style={s.scorePill(feedback.score)}>{feedback.score}/10 · {feedback.label}</span>
          </div>
          <div style={s.feedbackBody}>
            <p style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '12px', color: 'var(--text-primary)' }}>{feedback.summary}</p>

            {feedback.strengths?.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Strengths</div>
                {feedback.strengths.map((s, i) => <div key={i} style={s.listItem}><span style={{ color: 'var(--green-600)' }}>✓</span>{s}</div>)}
              </div>
            )}

            {feedback.improvements?.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To Improve</div>
                {feedback.improvements.map((item, i) => <div key={i} style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', display: 'flex', gap: '8px', marginBottom: '4px' }}><span style={{ color: 'var(--amber-600)' }}>→</span>{item}</div>)}
              </div>
            )}

            {feedback.tip && <div style={s.tip}>💡 {feedback.tip}</div>}

            <div style={{ marginTop: '1.25rem' }}>
              <button style={s.nextBtn} onClick={handleNext}>
                {isLast ? 'See Results →' : 'Next Question →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
