// src/components/MainContent.js
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import LoginScreen from './LoginScreen';
import ProblemScreen from './ProblemScreen';
import SelectionScreen from './SelectionScreen';
import HistoryPopup from './HistoryPopup';
import LoadingScreen from './LoadingScreen';
import CompletionScreen from './CompletionScreen'; // 새로 추가
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
      case 'completion': // 새로 추가
        return <CompletionScreen />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <main className="main-content">
      {renderContent()}
      {showHistoryPopup && <HistoryPopup />}
    </main>
  );
};

export default MainContent;