import React from 'react';
import { QuizProvider, useQuiz } from './contexts/QuizContext';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import './styles/App.css';

// 퀴즈 상태에 따라 사이드바를 조건부로 렌더링하는 Wrapper 컴포넌트
function AppContent() {
  const { isQuizActive } = useQuiz();

  return (
    <div className={`app-container ${isQuizActive ? 'quiz-active' : ''}`}>
      <Sidebar />
      <MainContent />
    </div>
  );
}

// QuizContext.Provider로 전체 앱을 감싸 상태를 공유
function App() {
  return (
    <QuizProvider>
      <AppContent />
    </QuizProvider>
  );
}

export default App;