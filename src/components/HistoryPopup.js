// src/components/HistoryPopup.js
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/HistoryPopup.css';

const HistoryPopup = () => {
  const { quizHistoryList, toggleHistoryPopup } = useQuiz();

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="popup-overlay" onClick={toggleHistoryPopup}>
      <div className="popup-container history-popup" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-button" onClick={toggleHistoryPopup}>
          &times;
        </button>
        <h2>나의 퀴즈 이력</h2>
        <div className="history-list-container">
          {quizHistoryList.length > 0 ? (
            <ul className="history-list">
              {quizHistoryList.map((quiz, index) => (
                <li key={index} className="history-item">
                  <span className="history-date">{formatDateTime(quiz.date)}</span>
                  <span className="history-score">
                    {quiz.score} / {quiz.totalProblems}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-history-message">아직 퀴즈를 푼 이력이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPopup;