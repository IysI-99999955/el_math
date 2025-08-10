// src/components/ProblemScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/ProblemScreen.css';

const QuizSummary = React.memo(() => (
  <div className="quiz-summary">
    <h1 className="summary-title success-title">🎉 와! 정말 대단해요! 🎉</h1>
    <p className="summary-text">모든 문제를 다 풀었어요!</p>
  </div>
));

const sanitizeHTML = (str) => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

const ProblemScreen = () => {
  const {
    problems, currentProblemIndex, isQuizActive, userAnswer, setUserAnswer,
    submitAnswer, isCorrect, nextProblem, showQuizSummary,
    currentAttempts, QUIZ_LIMITS, selectedType,
  } = useQuiz();

  const [timeLeft, setTimeLeft] = useState(10);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const currentProblem = problems?.[currentProblemIndex];
  const totalProblems = problems?.length || 0;

  const isFractionMode = Array.isArray(selectedType) && selectedType.includes('분수');
  const isDecimalMode = Array.isArray(selectedType) && selectedType.includes('소수');
  const isRandomMode = Array.isArray(selectedType) && selectedType.includes('Random');

  const inputMode = (isFractionMode || isRandomMode) ? 'text' :
                    isDecimalMode ? 'decimal' : 'numeric';
  
  const placeholder = isFractionMode ? '예: 3/4 또는 2' :
                      isDecimalMode ? '예: 3.5' :
                      '답을 입력하세요';

  useEffect(() => {
    if (showQuizSummary) return;

    if (isQuizActive) {
      if (inputRef.current) {
        inputRef.current.focus();
      }
      setTimeLeft(10);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            submitAnswer(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isQuizActive, currentProblemIndex, showQuizSummary, submitAnswer]);
  
  useEffect(() => {
    if (isCorrect === true) {
      if (timerRef.current) clearInterval(timerRef.current);
      const feedbackTimer = setTimeout(() => {
        nextProblem();
      }, 1500);
      return () => clearTimeout(feedbackTimer);
    }
  }, [isCorrect, nextProblem]);
  
  const handleInputChange = (e) => {
    if (isCorrect === null) {
      setUserAnswer(e.target.value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isCorrect === true) {
        nextProblem();
      } else if (userAnswer.trim() !== '') {
        submitAnswer();
      }
    }
  };

  if (showQuizSummary) {
    return <QuizSummary />;
  }

  return (
    <div className="problem-screen-container">
      <form onSubmit={(e) => { e.preventDefault(); if (isCorrect === null) submitAnswer(); }} className="problem-form">
        <div className="problem-header">
          <div>문제 {currentProblemIndex + 1} / {totalProblems}</div>
          <div className={`timer ${timeLeft <= 3 ? 'urgent' : ''}`}>남은 시간: {timeLeft}초</div>
        </div>
        <div className="problem-display">
          <span className="problem-text" dangerouslySetInnerHTML={{ __html: sanitizeHTML(currentProblem?.question) }} />
          <input
            ref={inputRef}
            type="text"
            inputMode={inputMode}
            value={userAnswer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className={`answer-input ${isCorrect === true ? 'correct' : ''} ${isCorrect === false ? 'incorrect' : ''}`}
            placeholder={placeholder}
            disabled={!isQuizActive || isCorrect !== null}
            autoFocus
            maxLength={20}
          />
        </div>
        <div className="feedback">
          {isCorrect === true && <p className="feedback-correct">정답입니다! 🎉</p>}
          {isCorrect === false && currentAttempts < QUIZ_LIMITS.MAX_ATTEMPTS && (
            <p className="feedback-incorrect">아쉽네요. 다시 시도해 보세요. (시도 {currentAttempts} / {QUIZ_LIMITS.MAX_ATTEMPTS}회)</p>
          )}
          {currentAttempts >= QUIZ_LIMITS.MAX_ATTEMPTS && (
            <p className="feedback-incorrect">5회 모두 틀렸습니다. 퀴즈를 종료합니다. 😢</p>
          )}
        </div>
        <button
          type="button"
          onClick={isCorrect === null ? submitAnswer : nextProblem}
          className="submit-button"
          disabled={!isQuizActive || (isCorrect === null && userAnswer.trim() === '')}
        >
          {isCorrect === null && currentAttempts < QUIZ_LIMITS.MAX_ATTEMPTS && '정답 확인'}
          {isCorrect === false && currentAttempts < QUIZ_LIMITS.MAX_ATTEMPTS && '다시 시도'}
          {isCorrect === true && '다음 문제'}
          {currentAttempts >= QUIZ_LIMITS.MAX_ATTEMPTS && '퀴즈 종료'}
        </button>
      </form>
    </div>
  );
};

export default ProblemScreen;