// src/components/ProblemScreen.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { QuizContext } from '../contexts/QuizContext';
import '../styles/ProblemScreen.css';

const ProblemScreen = () => {
  const {
    problems, currentProblemIndex, userAnswer, setUserAnswer,
    submitAnswer, isCorrect, nextProblem,
    currentAttempts, QUIZ_LIMITS, endQuiz
  } = useQuiz();

  const [timeLeft, setTimeLeft] = useState(10);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const currentProblem = problems?.[currentProblemIndex];
  const totalProblems = problems?.length || 0;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentProblemIndex]);

  useEffect(() => {
    // 타이머 로직
    if (isCorrect !== null) { // 정답/오답 판별이 끝났으면 타이머 중지
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(10); // 새 문제 시작 시 타이머 리셋
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          submitAnswer(true); // 시간 초과로 제출
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentProblemIndex, isCorrect, submitAnswer]);


  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9-]/g, '');
    setUserAnswer(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userAnswer.trim() !== '' && isCorrect === null) {
      e.preventDefault();
      submitAnswer(false);
    }
  };
  
  const handleSubmitClick = () => {
    if (userAnswer.trim() !== '' && isCorrect === null) {
      submitAnswer(false);
    }
  };

  if (!currentProblem) {
    return (
      <div className="problem-screen-container">
        <p>문제를 불러오는 중...</p>
      </div>
    );
  }

  const isQuizOverDueToAttempts = currentAttempts >= QUIZ_LIMITS.MAX_ATTEMPTS;

  return (
    <div className="problem-screen-container">
      <form className="problem-form" onSubmit={(e) => e.preventDefault()}>
        <div className="problem-header">
          <span className="problem-number">
            문제 {currentProblemIndex + 1} / {totalProblems}
          </span>
          <span className={`timer ${timeLeft <= 5 ? 'urgent' : ''}`}>
            남은 시간: {timeLeft}초
          </span>
        </div>
        <div className="problem-display">
          <p className="problem-text" dangerouslySetInnerHTML={{ __html: currentProblem.question }} />
        </div>
        <div className="answer-section">
          <input
            id="answer-input"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9:/.]*"
            value={userAnswer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className={`answer-input ${isCorrect === true ? 'correct' : ''} ${isCorrect === false ? 'incorrect' : ''}`}
            placeholder="정답을 입력하세요"
            disabled={isCorrect !== null}
            autoFocus
            maxLength={20}
          />
        </div>
        <div className="feedback">
          {isCorrect === true && <p className="feedback-correct">정답입니다! 🎉</p>}
          {isCorrect === false && !isQuizOverDueToAttempts && (
            <p className="feedback-incorrect">아쉽네요. 다시 시도해 보세요. (남은 기회: {QUIZ_LIMITS.MAX_ATTEMPTS - currentAttempts}회)</p>
          )}
          {isQuizOverDueToAttempts && (
            <p className="feedback-incorrect">모든 기회를 사용했습니다. 퀴즈를 종료합니다. 😢</p>
          )}
        </div>
        {/* 정답을 맞히면 버튼이 보이지 않음 */}
        {isCorrect !== true && (
          <button
            type="button"
            onClick={handleSubmitClick}
            className="submit-button"
            disabled={isCorrect !== null || userAnswer.trim() === ''}
          >
            정답 확인
          </button>
        )}
      </form>
    </div>
  );
};

export default ProblemScreen;