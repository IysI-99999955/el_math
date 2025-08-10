// src/components/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/LoginScreen.css';

const LoginScreen = () => {
  const { login, error, clearError, QUIZ_LIMITS, isLoading } = useQuiz();
  const [userNameInput, setUserNameInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const storedRememberMe = localStorage.getItem('math_quiz_remember_me') === 'true';
    setRememberMe(storedRememberMe);
    if (storedRememberMe) {
      const storedUserName = localStorage.getItem('math_quiz_user_name');
      if (storedUserName) {
        setUserNameInput(storedUserName);
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    login(userNameInput, rememberMe);
  };

  const handleNameChange = (e) => {
    if (error) clearError();
    setUserNameInput(e.target.value);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">수학 퀴즈에 오신 것을 환영합니다!</h1>
        <p className="login-subtitle">퀴즈를 시작하려면 이름을 입력하세요.</p>
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="text"
              className="name-input"
              value={userNameInput}
              onChange={handleNameChange}
              placeholder="이름을 입력하세요"
              disabled={isLoading}
              maxLength={QUIZ_LIMITS.MAX_NAME_LENGTH}
              aria-label="사용자 이름 입력"
            />
            <span className="char-count">
              {userNameInput.length}/{QUIZ_LIMITS.MAX_NAME_LENGTH}
            </span>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="remember-me">
            <input
              type="checkbox"
              id="remember-me-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me-checkbox">이름 기억하기</label>
          </div>
          <button type="submit" className="start-button" disabled={!userNameInput.trim() || isLoading}>
            퀴즈 시작
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;