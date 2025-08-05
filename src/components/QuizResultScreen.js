import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/QuizResultScreen.css';

const QuizResultScreen = () => {
  const { isQuizFailed, stopQuiz } = useQuiz();

  if (isQuizFailed) {
    return (
      <div className="quiz-result-container">
        <div className="quiz-result-box quiz-failure">
          <p>문제를 선택하여 주시기 바랍니다.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="quiz-result-container">
      <div className="quiz-result-box">
        <h2>퀴즈가 종료되었습니다!</h2>
        <p className="quiz-history-message">
          퀴즈 완료 이력이 저장되었습니다.
        </p>
        <button className="back-to-menu-button" onClick={stopQuiz}>
          메뉴로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default QuizResultScreen;