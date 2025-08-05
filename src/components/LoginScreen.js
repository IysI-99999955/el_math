// src/components/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/LoginScreen.css';

const LoginScreen = () => {
  const { loginUser, error, clearError, QUIZ_LIMITS } = useQuiz();
  const [userNameInput, setUserNameInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 '로그인 기억' 상태 및 사용자 이름 불러오기
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
    clearError(); // 이전 에러 메시지 초기화
    const success = await loginUser(userNameInput, rememberMe);
    if (success) {
      // 로그인 성공 후 추가 로직 (예: 메인 화면으로 전환)
      console.log('로그인 성공!');
    }
  };

  const handleNameChange = (e) => {
    if (error) clearError(); // 입력 시작 시 에러 메시지 지우기
    setUserNameInput(e.target.value);
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1>수학 퀴즈</h1>
        <p>이름을 입력하고 시작하세요!</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="사용자 이름"
              value={userNameInput}
              onChange={handleNameChange}
              maxLength={QUIZ_LIMITS.MAX_NAME_LENGTH}
              aria-label="사용자 이름 입력"
            />
            <span className="char-count">
              {userNameInput.length}/{QUIZ_LIMITS.MAX_NAME_LENGTH}
            </span>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="remember-me-group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              aria-label="로그인 기억"
            />
            <label htmlFor="rememberMe">로그인 기억</label>
          </div>
          <button type="submit" className="login-button">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;