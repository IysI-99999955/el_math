// src/components/MainContent.js
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import LoginScreen from './LoginScreen';
import ProblemScreen from './ProblemScreen';
import SelectionScreen from './SelectionScreen';
import HistoryPopup from './HistoryPopup';
import LoadingScreen from './LoadingScreen';
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
    // MainContent는 이제 순수하게 화면을 보여주는 '틀' 역할만 함
    <main className="main-content">
      {renderContent()}
      {showHistoryPopup && <HistoryPopup />}
    </main>
  );
};

export default MainContent;