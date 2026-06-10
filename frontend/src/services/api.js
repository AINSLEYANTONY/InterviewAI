import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  res => res.data,
  err => {
    // Extract the most useful error message available
    const serverMsg = err.response?.data?.details || err.response?.data?.error;
    const httpStatus = err.response?.status;
    const message = serverMsg
      ? `${serverMsg} (HTTP ${httpStatus})`
      : err.code === 'ECONNABORTED'
      ? 'Request timed out — Groq API may be slow, try again.'
      : err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const interviewApi = {
  start: (role, level, questionCount) =>
    api.post('/interview/start', { role, level, questionCount }),

  submitAnswer: (sessionId, questionIndex, answer) =>
    api.post(`/interview/${sessionId}/answer`, { questionIndex, answer }),

  complete: (sessionId) =>
    api.post(`/interview/${sessionId}/complete`),
};

export const sessionsApi = {
  getAll: () => api.get('/sessions'),
  getOne: (id) => api.get(`/sessions/${id}`),
  delete: (id) => api.delete(`/sessions/${id}`),
};

export default api;
