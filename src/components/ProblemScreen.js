// src/components/ProblemScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../contexts/QuizContext';
// --- 여기가 핵심 수정 부분! ---
import 'katex/dist/katex.min.css'; // KaTeX CSS 불러오기
import { InlineMath } from 'react-katex'; // KaTeX 컴포넌트 불러오기
// --- 여기까지 ---
import '../styles/ProblemScreen.css';

const ProblemScreen = () => {
  const {
    problems, currentProblemIndex, userAnswer, setUserAnswer,
    submitAnswer, isCorrect,
    currentAttempts, QUIZ_LIMITS
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
  }, [currentProblemIndex, isCorrect]);

  useEffect(() => {
    if (isCorrect !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
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

    return () => clearInterval(timerRef.current);
  }, [currentProblemIndex, isCorrect, submitAnswer]);

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9-./:]/g, '');
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
          {/* --- 여기가 핵심 수정 부분! --- */}
          {/* dangerouslySetInnerHTML 대신 InlineMath 컴포넌트 사용 */}
          <div className="problem-text">
            <InlineMath math={currentProblem.question} />
          </div>
        </div>
        <div className="answer-section">
          <input
            id="answer-input"
            ref={inputRef}
            type="text"
            inputMode="text"
            pattern="[0-9./:-]*"
            value={userAnswer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className={`answer-input ${isCorrect === true ? 'correct' : ''} ${isCorrect === false ? 'incorrect' : ''}`}
            placeholder="정답을 입력하세요"
            disabled={isCorrect === true}
            autoFocus
            maxLength={20}
          />
        </div>
        
        <div className="action-area">
          <div className="feedback">
            {isCorrect === true && <p className="feedback-correct">정답입니다! 🎉</p>}
            {isCorrect === false && !isQuizOverDueToAttempts && (
              <p className="feedback-incorrect">아쉽네요. 다시 시도해 보세요. (남은 기회: {QUIZ_LIMITS.MAX_ATTEMPTS - currentAttempts}회)</p>
            )}
            {isQuizOverDueToAttempts && (
              <p className="feedback-incorrect">모든 기회를 사용했습니다. 퀴즈를 종료합니다. 😢</p>
            )}
          </div>
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
        </div>
      </form>
    </div>
  );
};

export default ProblemScreen;