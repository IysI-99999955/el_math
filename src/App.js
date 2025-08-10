// src/App.js
import React, { useEffect } from 'react';
import { useQuiz } from './contexts/QuizContext';
import LoginScreen from './components/LoginScreen';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import Popup from './components/Popup';
import './styles/App.css';

const App = () => {
  const { isLoggedIn, showResultPopup, quizScore, closeResultPopup } = useQuiz();

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <MainContent />
      {showResultPopup && <Popup score={quizScore} onClose={closeResultPopup} />}
    </div>
  );
};

export default App;