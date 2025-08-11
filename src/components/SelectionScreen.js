// src/components/SelectionScreen.js
import React, { useEffect } from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/SelectionScreen.css';

const SelectionScreen = () => {
  const {
    selectedGrade, setSelectedGrade, selectedType, setSelectedType,
    selectedLevel, setSelectedLevel, startNewQuiz, isSoundEnabled,
    toggleSound, userName, toggleHistoryPopup, logout
  } = useQuiz();

  const grades = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];
  const levels = ['초급', '중급'];
  
  const getAvailableTypes = (grade) => {
    switch (grade) {
      case '1학년': return ['덧셈', '뺄셈'];
      case '2학년': case '3학년': return ['덧셈', '뺄셈', '곱셈', '나눗셈'];
      default: return ['덧셈', '뺄셈', '곱셈', '나눗셈', '분수', '소수', '제곱', '비와 비율'];
    }
  };

  const types = getAvailableTypes(selectedGrade);
  const showRandomButton = ['4학년', '5학년', '6학년'].includes(selectedGrade);

  // --- 여기가 핵심 수정 부분 (1번 해결) ---
  const handleTypeChange = (type) => {
    if (type === 'Random') {
      setSelectedType(['Random']);
      return;
    }

    // 'Random'이 아닌 다른 버튼을 눌렀을 때
    const newSelection = new Set(selectedType.filter(t => t !== 'Random'));

    if (newSelection.has(type)) {
      newSelection.delete(type);
    } else {
      newSelection.add(type);
    }

    if (newSelection.size === 0) {
      // 선택이 모두 해제되면 기본값으로 첫 번째 유형을 선택
      setSelectedType([types[0]]);
    } else {
      setSelectedType(Array.from(newSelection));
    }
  };
  
  const handleSettingChange = (setting, value) => {
    switch(setting) {
      case 'grade':
        setSelectedGrade(value);
        const availableTypes = getAvailableTypes(value);
        // 학년 변경 시, 선택된 유형이 유효하지 않으면 기본값으로 변경
        const validTypes = selectedType.filter(t => availableTypes.includes(t) || t === 'Random');
        if (validTypes.length === 0) {
          setSelectedType([availableTypes[0]]);
        } else {
          setSelectedType(validTypes);
        }
        break;
      case 'level':
        setSelectedLevel(value);
        break;
      default: break;
    }
  };

  const handleStartQuiz = () => {
    if (selectedGrade && selectedType.length > 0 && selectedLevel) {
      startNewQuiz();
    }
  };

  return (
    <div className="selection-screen">
      <header className="selection-header">
        <span className="user-name">{userName}님, 환영합니다!</span>
        <button className="logout-button" onClick={logout}>&times;</button>
      </header>

      <div className="selection-container">
        <h1 className="selection-title">퀴즈 설정하기</h1>
        
        <div className="menu-section">
          <h3>학년 선택</h3>
          <div className="options-grid">
            {grades.map(grade => (
              <button key={grade} className={`option-button ${selectedGrade === grade ? 'active' : ''}`} onClick={() => handleSettingChange('grade', grade)}>
                {grade}
              </button>
            ))}
          </div>
        </div>

        <div className="menu-section">
          <h3>유형 선택</h3>
          <div className="options-grid-dynamic">
            {types.map(type => (
              <button key={type} className={`option-button ${selectedType.includes(type) ? 'active' : ''}`} onClick={() => handleTypeChange(type)}>
                {type}
              </button>
            ))}
            {/* --- 여기가 핵심 수정 부분 (2번 해결) --- */}
            {showRandomButton && (
              <button className={`option-button ${selectedType.includes('Random') ? 'active' : ''}`} onClick={() => handleTypeChange('Random')}>
                랜덤
              </button>
            )}
          </div>
        </div>

        <div className="menu-section">
          <h3>난이도 선택</h3>
          <div className="options-grid">
            {levels.map(level => (
              <button key={level} className={`option-button ${selectedLevel === level ? 'active' : ''}`} onClick={() => handleSettingChange('level', level)}>
                {level}
              </button>
            ))}
          </div>
        </div>

        <button className="start-quiz-button" onClick={handleStartQuiz} disabled={!selectedGrade || selectedType.length === 0 || !selectedLevel}>
          퀴즈 시작!
        </button>

        <div className="bottom-actions">
          <button className="history-button" onClick={toggleHistoryPopup}>
            퀴즈 이력 조회
          </button>
          <button className={`sound-button ${isSoundEnabled ? 'on' : 'off'}`} onClick={toggleSound}>
            {isSoundEnabled ? '소리 켜짐' : '소리 꺼짐'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionScreen;