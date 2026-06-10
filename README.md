# 🎤 AI Mock Interviewer

A full-stack AI-powered interview practice app. Pick a role, answer questions, and get instant feedback — powered by **Groq + Llama 3.3 70B** (free & fast).

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js + Express |
| AI | Groq API — llama-3.3-70b-versatile (free tier) |
| State | React Context + useReducer |
| Storage | In-memory (swap for PostgreSQL in prod) |

---

## Project Structure

```
ai-mock-interviewer/
├── backend/
│   ├── routes/
│   │   ├── interview.js     # POST /start, /answer, /complete
│   │   └── sessions.js      # GET/DELETE session history
│   ├── services/
│   │   └── aiService.js     # Groq API calls (OpenAI-compatible)
│   ├── store/
│   │   └── sessionStore.js  # In-memory session store
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/Navbar.jsx
│   │   ├── context/InterviewContext.jsx
│   │   ├── pages/
│   │   │   ├── SetupPage.jsx
│   │   │   ├── InterviewPage.jsx
│   │   │   ├── ResultsPage.jsx
│   │   │   └── HistoryPage.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
└── package.json
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install && npm run install:all
```

### 2. Get a free Groq API key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free) → API Keys → Create API Key
3. Copy the key

### 3. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
PORT=5000
```

### 4. Run both servers

```bash
# From root
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

---

## API Reference

### `POST /api/interview/start`
**Body:** `{ role, level, questionCount }`
**Response:** `{ sessionId, questions[], role, level, totalQuestions }`

### `POST /api/interview/:sessionId/answer`
**Body:** `{ questionIndex, answer }`
**Response:** `{ feedback: { score, label, summary, strengths[], improvements[], tip } }`

### `POST /api/interview/:sessionId/complete`
**Response:** `{ summary: { overallVerdict, topStrength, topGrowthArea, readinessLevel, nextSteps[] }, averageScore }`

### `GET /api/sessions` — list all sessions
### `GET /api/sessions/:id` — full session detail
### `DELETE /api/sessions/:id` — delete a session

---

## Production Upgrades

### Swap in PostgreSQL
Replace `backend/store/sessionStore.js`:
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  role TEXT, level TEXT,
  questions JSONB, answers JSONB, feedbacks JSONB, summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### Add auth
Use Clerk, Auth0, or Passport.js for user accounts.

### Deploy
- **Backend**: Railway, Render, or Fly.io
- **Frontend**: Vercel or Netlify
