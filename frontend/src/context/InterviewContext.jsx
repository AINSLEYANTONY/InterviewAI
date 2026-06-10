import React, { createContext, useContext, useReducer } from 'react';

const InterviewContext = createContext(null);

const initialState = {
  sessionId: null,
  role: null,
  level: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  feedbacks: [],
  summary: null,
  averageScore: null,
  status: 'idle' // idle | loading | active | submitting | completed
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, status: 'loading' };
    case 'SESSION_CREATED':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        role: action.payload.role,
        level: action.payload.level,
        questions: action.payload.questions,
        answers: new Array(action.payload.questions.length).fill(''),
        feedbacks: new Array(action.payload.questions.length).fill(null),
        currentIndex: 0,
        status: 'active'
      };
    case 'SUBMITTING_ANSWER':
      return { ...state, status: 'submitting' };
    case 'ANSWER_SUBMITTED': {
      const answers = [...state.answers];
      const feedbacks = [...state.feedbacks];
      answers[action.payload.questionIndex] = action.payload.answer;
      feedbacks[action.payload.questionIndex] = action.payload.feedback;
      return { ...state, answers, feedbacks, status: 'active' };
    }
    case 'NEXT_QUESTION':
      return { ...state, currentIndex: state.currentIndex + 1 };
    case 'SESSION_COMPLETED':
      return {
        ...state,
        summary: action.payload.summary,
        averageScore: action.payload.averageScore,
        status: 'completed'
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function InterviewProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <InterviewContext.Provider value={{ state, dispatch }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error('useInterview must be used inside InterviewProvider');
  return ctx;
}
