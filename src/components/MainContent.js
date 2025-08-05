// src/components/MainContent.js
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import LoginScreen from './LoginScreen';
import ProblemScreen from './ProblemScreen';
import '../styles/MainContent.css';

const MainContent = () => {
  const { 
    isLoggedIn, 
    isQuizActive, 
    isQuizFinished, 
    userName, 
    dailyCompletedQuizzes, 
    totalPossibleQuizzes, 
    logoutUser 
  } = useQuiz();

  const handleLogout = () => {
    logoutUser();
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <LoginScreen />;
    }
    
    // 퀴즈 진행 중이거나 퀴즈가 완료된 상태 (축하 메시지 표시)
    if (isQuizActive || isQuizFinished) {
      return <ProblemScreen />;
    }

    // 로그인 후 퀴즈 시작 대기 상태 (사이드바에서 설정 및 시작)
    return (
      <div className="main-content-welcome">
        <h2>수학 퀴즈를 시작해 보세요!</h2>
        <p>사이드바에서 원하는 옵션을 선택하고 퀴즈를 시작해 주세요.</p>
        <div className="selection-guide">
          <ul className="selection-checklist">
            <li>
              학년: <span className={`selected-value`}>선택 안됨</span>
            </li>
            <li>
              유형: <span className={`selected-value`}>선택 안됨</span>
            </li>
            <li>
              난이도: <span className={`selected-value`}>선택 안됨</span>
            </li>
          </ul>
        </div>
      </div>
    );
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
    </main>
  );
};

export default MainContent;