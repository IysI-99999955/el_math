// src/components/ProblemScreen.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { QuizContext } from '../contexts/QuizContext';
import '../styles/ProblemScreen.css';

// 퀴즈 완료 화면을 담당하는 컴포넌트
const QuizSummary = ({ score, totalProblems, onRestart, isFailed }) => (
  <div className={`quiz-summary ${isFailed ? 'failed-summary' : 'success-summary'}`}>
    {isFailed ? (
      <>
        <h1 className="summary-title failed-title">괜찮아요, 다음 기회에! 😊</h1>
        <p className="summary-text">5번의 기회를 모두 사용했습니다. <br/>다시 도전하면 더 잘할 수 있어요!</p>
      </>
    ) : (
      <>
        <h1 className="summary-title success-title">와! 정말 대단해요! 🎉</h1>
        <p className="summary-text">모든 문제를 다 풀었어요!</p>
        <h2 className="summary-score">
          최종 점수: {score}점 / {totalProblems}점
        </h2>
      </>
    )}
    {/* '다시 시작하기' 버튼을 제거합니다. */}
  </div>
);

const ProblemScreen = () => {
  const {
    currentProblem,
    checkAnswer,
    isQuizFinished,
    isQuizFailed,
    attempts,
    TOTAL_PROBLEMS,
    isQuizActive,
    endQuizSession,
    startNewQuiz,
    QUIZ_LIMITS,
    score
  } = useContext(QuizContext);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(8);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (currentProblem && isQuizActive) {
      setTimeLeft(8);
      setUserAnswer('');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            endQuizSession();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentProblem, isQuizActive, endQuizSession]);

  if (!currentProblem && !isQuizFinished) {
    return <div>로딩 중...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedAnswer = userAnswer.trim();
    if (trimmedAnswer === '') return;

    checkAnswer(trimmedAnswer);
    setUserAnswer('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9-]/g, '');
    setUserAnswer(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const isSubmitDisabled = !isQuizActive || timeLeft <= 0 || userAnswer.trim() === '';

  const handleRestartQuiz = () => {
    startNewQuiz();
  };

  return (
    <div className="problem-screen-container">
      {isQuizFinished ? (
        <QuizSummary
          score={score}
          totalProblems={TOTAL_PROBLEMS}
          onRestart={handleRestartQuiz}
          isFailed={isQuizFailed}
        />
      ) : (
        <form onSubmit={handleSubmit} className="problem-form">
          <div className="problem-header">
            <div>문제 {currentProblem.id} / {TOTAL_PROBLEMS}</div>
            <div className={`timer ${timeLeft <= 3 ? 'urgent' : ''}`}>남은 시간: {timeLeft}초</div>
          </div>
          <div className="problem-display">
            <span className="problem-text">{currentProblem.question}</span>
            <input
              type="text"
              inputMode="numeric"
              value={userAnswer}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="answer-input"
              placeholder="답을 입력하세요"
              autoFocus
              disabled={!isQuizActive || timeLeft <= 0}
            />
          </div>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitDisabled}
          >
            정답 확인
          </button>
          <div className="attempts-display">
            입력 시도: {attempts}회 / {QUIZ_LIMITS.MAX_PROBLEM_ATTEMPTS}회
          </div>
        </form>
      )}
    </div>
  );
};

export default ProblemScreen;