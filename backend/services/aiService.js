import OpenAI from 'openai';

const MODEL = 'llama-3.3-70b-versatile';

// Lazy client — created on first use so dotenv has already run in server.js
let _client = null;
function getClient() {
  if (!_client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set. Add it to backend/.env');
    }
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _client;
}

async function chat(systemPrompt, userPrompt) {
  const res = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });
  return res.choices[0].message.content;
}

export async function generateQuestions({ role, level, count }) {
  const raw = await chat(
    `You are an expert technical recruiter with 15+ years of experience.
Return ONLY a valid JSON array of strings. No markdown, no preamble, no explanation.
Each string is a distinct, realistic interview question tailored to the role and experience level.`,
    `Generate exactly ${count} interview questions for a ${level} ${role} position.
Mix behavioral (40%), situational (30%), and role-specific technical questions (30%).
Make them progressively challenging. Return ONLY a JSON array of strings.`
  );
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function evaluateAnswer({ role, level, question, answer }) {
  const raw = await chat(
    `You are a senior interviewer evaluating candidate responses.
Return ONLY valid JSON with these exact keys:
- score: integer 1-10
- label: one of "Excellent", "Strong", "Good", "Needs Work", "Poor"
- summary: one sentence overall verdict
- strengths: array of 1-2 short strength strings
- improvements: array of 1-2 short improvement strings
- tip: one actionable tip for next time
No markdown, no extra text outside JSON.`,
    `Role: ${role} (${level})
Question: ${question}
Candidate Answer: ${answer}

Evaluate this answer fairly and return JSON only.`
  );
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateSessionSummary({ role, level, qaPairs }) {
  const formatted = qaPairs.map((qa, i) =>
    `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`
  ).join('\n\n');

  const raw = await chat(
    `You are a career coach giving post-interview feedback.
Return ONLY valid JSON with these keys:
- overallVerdict: 2-3 sentence overall assessment
- topStrength: the candidate's biggest demonstrated strength (1 sentence)
- topGrowthArea: the most important area to improve (1 sentence)
- readinessLevel: one of "Ready to interview", "Almost ready", "Needs more prep"
- nextSteps: array of 3 actionable next-step strings
No markdown, no text outside JSON.`,
    `Role applied for: ${role} (${level})\n\nInterview transcript:\n${formatted}\n\nProvide a comprehensive session summary as JSON.`
  );
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}
