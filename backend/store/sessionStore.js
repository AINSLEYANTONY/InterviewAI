/**
 * Simple in-memory session store.
 * In production, replace with a database (PostgreSQL, MongoDB, etc.)
 */

const sessions = new Map();

export function createSession({ id, role, level, questions }) {
  const session = {
    id,
    role,
    level,
    questions,
    answers: [],
    feedbacks: [],
    createdAt: new Date().toISOString(),
    completedAt: null,
    summary: null
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id) {
  return sessions.get(id) || null;
}

export function addAnswer(id, { questionIndex, answer, feedback }) {
  const session = sessions.get(id);
  if (!session) return null;
  session.answers[questionIndex] = answer;
  session.feedbacks[questionIndex] = feedback;
  sessions.set(id, session);
  return session;
}

export function completeSession(id, summary) {
  const session = sessions.get(id);
  if (!session) return null;
  session.completedAt = new Date().toISOString();
  session.summary = summary;
  sessions.set(id, session);
  return session;
}

export function getAllSessions() {
  return Array.from(sessions.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function deleteSession(id) {
  return sessions.delete(id);
}
