import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import interviewRoutes from './routes/interview.js';
import sessionRoutes from './routes/sessions.js';

dotenv.config();

// ── Startup checks ─────────────────────────────────────────────────────────
if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is missing! Create backend/.env and add your key.');
  console.error('   Get a free key at: https://console.groq.com');
  process.exit(1);
}
console.log('✅ GROQ_API_KEY loaded:', process.env.GROQ_API_KEY.slice(0, 8) + '...');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Rate limiting
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later.' }
});

// Routes
app.use('/api/interview', aiLimiter, interviewRoutes);
app.use('/api/sessions', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
