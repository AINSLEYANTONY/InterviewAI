import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateQuestions, evaluateAnswer, generateSessionSummary } from '../services/aiService.js';
import { createSession, getSession, addAnswer, completeSession } from '../store/sessionStore.js';

const router = express.Router();

// POST /api/interview/start
router.post('/start', async (req, res) => {
  try {
    const { role, level, questionCount = 5 } = req.body;

    if (!role || !level) {
      return res.status(400).json({ error: 'role and level are required' });
    }

    const validCounts = [3, 5, 7];
    const count = validCounts.includes(Number(questionCount)) ? Number(questionCount) : 5;

    console.log(`[interview/start] Generating ${count} questions for ${level} ${role}...`);
    const questions = await generateQuestions({ role, level, count });
    console.log(`[interview/start] Got ${questions.length} questions`);

    const sessionId = uuidv4();
    const session = createSession({ id: sessionId, role, level, questions });

    res.json({
      sessionId: session.id,
      role: session.role,
      level: session.level,
      questions: session.questions,
      totalQuestions: session.questions.length
    });
  } catch (err) {
    console.error('[interview/start] ERROR:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: 'Failed to generate interview questions', details: err.message });
  }
});

// POST /api/interview/:sessionId/answer
router.post('/:sessionId/answer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionIndex, answer } = req.body;

    if (answer === undefined || questionIndex === undefined) {
      return res.status(400).json({ error: 'questionIndex and answer are required' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const question = session.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ error: 'Invalid question index' });
    }

    let feedback;
    if (!answer || answer.trim() === '') {
      feedback = {
        score: 0,
        label: 'Skipped',
        summary: 'Question was skipped.',
        strengths: [],
        improvements: ['Practice answering every question, even with a partial response.'],
        tip: 'Attempt every question — a partial answer is better than none.'
      };
    } else {
      console.log(`[interview/answer] Evaluating Q${questionIndex} for session ${sessionId}`);
      feedback = await evaluateAnswer({
        role: session.role,
        level: session.level,
        question,
        answer: answer.trim()
      });
      console.log(`[interview/answer] Score: ${feedback.score}`);
    }

    addAnswer(sessionId, { questionIndex, answer: answer.trim(), feedback });
    res.json({ feedback, questionIndex, sessionId });
  } catch (err) {
    console.error('[interview/answer] ERROR:', err.message);
    res.status(500).json({ error: 'Failed to evaluate answer', details: err.message });
  }
});

// POST /api/interview/:sessionId/complete
router.post('/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const qaPairs = session.questions.map((question, i) => ({
      question,
      answer: session.answers[i] || '[Skipped]',
      score: session.feedbacks[i]?.score || 0
    }));

    console.log(`[interview/complete] Generating summary for session ${sessionId}`);
    const summary = await generateSessionSummary({ role: session.role, level: session.level, qaPairs });

    const completed = completeSession(sessionId, summary);

    res.json({
      sessionId,
      summary,
      scores: session.feedbacks.map(f => f?.score || 0),
      averageScore: +(session.feedbacks
        .map(f => f?.score || 0)
        .reduce((a, b) => a + b, 0) / session.questions.length).toFixed(1)
    });
  } catch (err) {
    console.error('[interview/complete] ERROR:', err.message);
    res.status(500).json({ error: 'Failed to generate summary', details: err.message });
  }
});

export default router;
