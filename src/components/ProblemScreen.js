// src/components/ProblemScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import '../styles/ProblemScreen.css';

const ProblemScreen = () => {
  const {
    problems, currentProblemIndex, userAnswer, setUserAnswer,
    submitAnswer, isCorrect,
    currentAttempts, QUIZ_LIMITS,
    endQuiz // endQuiz 함수를 가져옴
  } = useQuiz();

  const [timeLeft, setTimeLeft] = useState(10);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const currentProblem = problems?.[currentProblemIndex];
  const totalProblems = problems?.length || 0;

  // --- 여기가 핵심! ---
  // 퀴즈가 실패로 끝났는지 여부를 판단하는 변수
  const isQuizFailed = (currentAttempts >= QUIZ_LIMITS.MAX_ATTEMPTS || timeLeft === 0) && isCorrect === false;

  useEffect(() => {
    // 퀴즈가 실패 상태가 아닐 때만 포커스를 줌
    if (inputRef.current && !isQuizFailed) {
      inputRef.current.focus();
    }
  }, [currentProblemIndex, isCorrect, isQuizFailed]);

  useEffect(() => {
    // 퀴즈가 실패했거나, 정답/오답 판정이 끝났으면 타이머 중지
    if (isQuizFailed || isCorrect !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(10);
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
  }, [currentProblemIndex, isCorrect, submitAnswer, isQuizFailed]);

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
            // 퀴즈가 실패했거나, 정답을 맞혔을 때 비활성화
            disabled={isQuizFailed || isCorrect === true}
            autoFocus
            maxLength={20}
          />
        </div>
        
        <div className="action-area">
          <div className="feedback">
            {isCorrect === true && <p className="feedback-correct">정답입니다! 🎉</p>}
            {isCorrect === false && !isQuizFailed && (
              <p className="feedback-incorrect">아쉽네요. 다시 시도해 보세요. (남은 기회: {QUIZ_LIMITS.MAX_ATTEMPTS - currentAttempts}회)</p>
            )}
            {isQuizFailed && (
              <p className="feedback-incorrect">퀴즈가 종료되었습니다. 😢</p>
            )}
          </div>

          {/* --- 여기가 핵심! --- */}
          {/* 퀴즈가 실패했을 때 '확인' 버튼을 보여줌 */}
          {isQuizFailed ? (
            <button
              type="button"
              onClick={() => endQuiz('failure')}
              className="submit-button"
            >
              확인
            </button>
          ) : (
            // 그 외의 경우 (정답 맞히기 전)
            isCorrect !== true && (
              <button
                type="button"
                onClick={handleSubmitClick}
                className="submit-button"
                disabled={isCorrect !== null || userAnswer.trim() === ''}
              >
                정답 확인
              </button>
            )
          )}
        </div>
      </form>
    </div>
  );
};

export default ProblemScreen;