// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 모바일 환경에서 뷰포트 높이를 정확하게 계산하기 위한 유틸리티 함수
const setFullHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// 페이지 로드 및 화면 크기 변경 시 함수 실행
setFullHeight();
window.addEventListener('resize', setFullHeight);
