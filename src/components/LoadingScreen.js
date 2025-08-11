// src/components/LoadingScreen.js
import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>정보를 불러오는 중...</p>
    </div>
  );
};

export default LoadingScreen;