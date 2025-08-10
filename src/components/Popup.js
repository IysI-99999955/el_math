// src/components/Popup.js
import React from 'react';
import '../styles/Popup.css';

const Popup = ({ score, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>퀴즈 종료!</h2>
        <p>당신의 점수는 **{score}**점입니다!</p>
        <button onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default Popup;