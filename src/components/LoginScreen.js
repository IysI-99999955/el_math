// src/components/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/LoginScreen.css'; // 스타일 파일 연결

const LoginScreen = () => {
  // useQuiz 훅에서 필요한 상태와 함수들을 가져옴
  const { 
    login, 
    isLoading, 
    error, 
    clearError, 
    rememberMe, 
    setRememberMe, 
    QUIZ_LIMITS,
    userName: savedUserName // 저장된 사용자 이름 가져오기
  } = useQuiz();

  // 사용자 이름 입력을 위한 상태
  const [userNameInput, setUserNameInput] = useState(savedUserName);

  // 이름 입력 시 에러 메시지 초기화
  const handleNameChange = (e) => {
    setUserNameInput(e.target.value);
    if (error) {
      clearError();
    }
  };

  // 로그인 버튼 클릭 시 실행될 함수
  const handleLogin = (e) => {
    e.preventDefault();
    login(userNameInput, rememberMe);
  };

  // 컴포넌트가 처음 렌더링될 때 저장된 이름으로 input 필드를 채움
  useEffect(() => {
    setUserNameInput(savedUserName);
  }, [savedUserName]);

  return (
    // 전체 화면을 덮는 컨테이너
    <div className="login-screen-container">
      {/* 중앙에 위치할 로그인 박스 */}
      <div className="login-box">
        {/* 불필요한 텍스트는 모두 삭제 */}
        <h1 className="login-title">
          <span className="brand-en">el Math</span> 퀴즈!
        </h1>
        <p className="login-subtitle">이름을 입력하고 신나는 퀴즈를 시작해봐요!</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="사용자 이름"
              value={userNameInput}
              onChange={handleNameChange}
              placeholder="여기에 이름을 써주세요"
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
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              aria-label="로그인 기억"
            />
            <label htmlFor="rememberMe">로그인 기억</label>
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