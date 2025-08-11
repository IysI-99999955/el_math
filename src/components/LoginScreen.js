// src/components/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/LoginScreen.css';

const LoginScreen = () => {
  const { 
    login, 
    isLoading, 
    error, 
    clearError, 
    rememberMe, 
    setRememberMe, 
    QUIZ_LIMITS,
    userName: savedUserName
  } = useQuiz();

  const [userNameInput, setUserNameInput] = useState(savedUserName);

  const handleNameChange = (e) => {
    setUserNameInput(e.target.value);
    if (error) {
      clearError();
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    login(userNameInput, rememberMe);
  };

  useEffect(() => {
    setUserNameInput(savedUserName);
  }, [savedUserName]);

  return (
    <div className="login-screen-container">
      <div className="login-box">
        <h1 className="login-title">
          <span className="brand-en">el Math</span> 퀴즈!
        </h1>
        <p className="login-subtitle">이름을 입력하고 신나는 퀴즈를 시작해봐요!</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              className="name-input" // 클래스 추가
              type="text"
              value={userNameInput}
              onChange={handleNameChange}
              placeholder="여기에 이름을 써주세요" // placeholder 하나로 통일
              disabled={isLoading}
              maxLength={QUIZ_LIMITS.MAX_NAME_LENGTH}
              aria-label="이름 입력"
            />
            <span className="char-count">
              {userNameInput.length}/{QUIZ_LIMITS.MAX_NAME_LENGTH}
            </span>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="remember-me">
            <input
              type="checkbox"
              id="remember-me-checkbox" // id 수정
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me-checkbox">이름 기억하기</label>
          </div>
          
          <button type="submit" className="start-button" disabled={!userNameInput.trim() || isLoading}>
            {isLoading ? '두근두근...' : '퀴즈 시작!'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;