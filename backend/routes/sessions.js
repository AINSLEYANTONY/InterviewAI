import express from 'express';
import { getAllSessions, getSession, deleteSession } from '../store/sessionStore.js';

const router = express.Router();

// GET /api/sessions - list all sessions
router.get('/', (req, res) => {
  const sessions = getAllSessions();
  res.json(sessions.map(s => ({
    id: s.id,
    role: s.role,
    level: s.level,
    createdAt: s.createdAt,
    completedAt: s.completedAt,
    totalQuestions: s.questions.length,
    answeredQuestions: s.answers.filter(Boolean).length,
    averageScore: s.feedbacks.length
      ? +(s.feedbacks.map(f => f?.score || 0).reduce((a, b) => a + b, 0) / s.questions.length).toFixed(1)
      : null,
    readinessLevel: s.summary?.readinessLevel || null
  })));
});

// GET /api/sessions/:id - get full session detail
router.get('/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// DELETE /api/sessions/:id
router.delete('/:id', (req, res) => {
  const deleted = deleteSession(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Session not found' });
  res.json({ message: 'Session deleted' });
});

export default router;
