// src/components/CompletionScreen.js
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/CompletionScreen.css';

const CompletionScreen = () => {
  const { quizScore, problems, returnToSelection, userName } = useQuiz();
  const totalProblems = problems.length;

  return (
    <div className="completion-container">
      <div className="completion-box">
        <h1 className="completion-title">🎉 정말 대단해, {userName}! 🎉</h1>
        <p className="completion-subtitle">모든 문제를 다 풀었어!</p>
        <div className="score-display">
          <p>최종 점수</p>
          <span>{quizScore} / {totalProblems}</span>
        </div>
        <button className="confirm-button" onClick={returnToSelection}>
          확인
        </button>
      </div>
    </div>
  );
};

export default CompletionScreen;