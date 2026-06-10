import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { InterviewProvider } from './context/InterviewContext.jsx';
import Navbar from './components/Navbar.jsx';
import SetupPage from './pages/SetupPage.jsx';
import InterviewPage from './pages/InterviewPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';

export default function App() {
  return (
    <InterviewProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<SetupPage />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </InterviewProvider>
  );
}
