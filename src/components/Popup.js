import React from 'react';
import '../styles/Popup.css';

/**
 * 퀴즈 종료 후 점수를 표시하고 재시작 버튼을 제공하는 팝업 컴포넌트
 * @param {object} props
 * @param {number} props.score - 최종 점수
 * @param {function} props.onRestart - 퀴즈 재시작을 위한 콜백 함수
 */
const Popup = ({ score, onRestart }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2>퀴즈 종료!</h2>
        <p>당신의 점수는 **{score}**점입니다!</p>
        <button onClick={onRestart}>다시 시작</button>
      </div>
    </div>
  );
};

export default Popup;