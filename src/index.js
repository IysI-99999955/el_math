// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QuizProvider } from './contexts/QuizContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QuizProvider>
      <App />
    </QuizProvider>
  </React.StrictMode>
);

// 뷰포트 높이를 계산하여 --vh 변수에 설정하는 함수
const setFullHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// 페이지가 처음 로드될 때 실행
setFullHeight();

// 화면 크기가 변경될 때마다 다시 실행 (가로/세로 전환 시)
window.addEventListener('resize', setFullHeight);
