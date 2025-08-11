// src/components/MainContent.js
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import LoginScreen from './LoginScreen';
import ProblemScreen from './ProblemScreen';
import LoginScreen from './LoginScreen';
import SelectionScreen from './SelectionScreen'; // Sidebar 대신 사용
import HistoryPopup from './HistoryPopup';
import LoadingScreen from './LoadingScreen'; // 로딩 스크린 추가
import '../styles/MainContent.css';

const MainContent = () => {
  const { appState, showHistoryPopup } = useQuiz();

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <LoadingScreen />;
      case 'login':
        return <LoginScreen />;
      case 'selection':
        return <SelectionScreen />;
      case 'quiz':
        return <ProblemScreen />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <main className="main-content">
      {isLoggedIn && (
        <header className="user-header">
          <div className="user-info-status">
            <span className="user-name">{userName}</span>
            <span className="quiz-status">오늘 완료: ({dailyCompletedQuizzes}/{totalPossibleQuizzes})</span>
          </div>
          <button className="logout-button" onClick={handleLogout} aria-label="로그아웃">
            <svg viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px', display: 'block'}}>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </header>
      )}
      {renderContent()}
      {showHistoryPopup && <HistoryPopup />}
    </main>
  );
};

export default MainContent;