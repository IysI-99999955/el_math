// src/components/MainContent.js
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import ProblemScreen from './ProblemScreen';
import '../styles/MainContent.css';

const MainContent = () => {
  const { isLoggedIn, isQuizActive, userName, logout } = useQuiz();

  const renderContent = () => {
    if (!isLoggedIn) {
      return null;
    }
    
    if (isQuizActive) {
      return <ProblemScreen />;
    }

    return (
      <div className="main-content-welcome">
        <header className="user-header">
          <span className="user-name">{userName}님, 환영합니다!</span>
          <button className="logout-button" onClick={logout}>로그아웃</button>
        </header>
        <h2>수학 퀴즈를 시작해 보세요!</h2>
        <p>사이드바에서 원하는 옵션을 선택하고 퀴즈를 시작해 주세요.</p>
      </div>
    );
  };

  return (
    <main className="main-content">
      {renderContent()}
    </main>
  );
};

export default MainContent;