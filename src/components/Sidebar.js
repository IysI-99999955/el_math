// src/components/Sidebar.js
import React, { useContext } from 'react';
import { QuizContext } from '../contexts/QuizContext';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { 
    selectedGrade, setSelectedGrade, 
    selectedType, setSelectedType, 
    selectedLevel, setSelectedLevel, 
    startNewQuiz, isQuizActive, isLoggedIn
  } = useContext(QuizContext);

  const grades = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];
  const types = ['덧셈', '뺄셈', '곱셈', '나눗셈'];
  const levels = ['초급', '중급', '고급'];

  const handleStartQuiz = () => {
    if (selectedGrade && selectedType.length > 0 && selectedLevel) {
      startNewQuiz();
    }
  };

  const handleSettingChange = (setting, value) => {
    if (isQuizActive) return;

    switch(setting) {
      case 'grade':
        setSelectedGrade(value);
        // 1학년 선택 시 곱셈, 나눗셈 선택 해제
        if (value === '1학년' && (selectedType.includes('곱셈') || selectedType.includes('나눗셈') || selectedType.includes('Random'))) {
          setSelectedType(['덧셈']);
        }
        break;
      case 'type':
        // 'Random' 선택 시 다른 모든 유형 선택 해제
        if (value === 'Random') {
          setSelectedType(['Random']);
        } else {
          setSelectedType([value]);
        }
        break;
      case 'difficulty':
        setSelectedLevel(value);
        break;
      default:
        break;
    }
  };

  const handleSelectRandom = () => {
    setSelectedType(['Random']);
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <h1>수학 퀴즈</h1>
      </div>

      {isLoggedIn && (
        <>
          <div className="menu-section">
            <h2>학년 선택</h2>
            <div className="options-grid">
              {grades.map(grade => (
                <button
                  key={grade}
                  className={`sidebar-button ${selectedGrade === grade ? 'active' : ''}`}
                  onClick={() => handleSettingChange('grade', grade)}
                  disabled={isQuizActive}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
          <div className="menu-section">
            <h2>문제 유형 선택</h2>
            <div className="options-grid">
              {types.map(type => {
                if (selectedGrade === '1학년' && (type === '곱셈' || type === '나눗셈')) {
                  return null;
                }
                return (
                  <button
                    key={type}
                    className={`sidebar-button ${selectedType.includes(type) ? 'active' : ''}`}
                    onClick={() => handleSettingChange('type', type)}
                    disabled={isQuizActive}
                  >
                    {type}
                  </button>
                );
              })}
              {!(selectedGrade === '1학년' && selectedType.includes('Random')) && (
                 <button
                  className={`sidebar-button ${selectedType.includes('Random') ? 'active' : ''}`}
                  onClick={handleSelectRandom}
                  disabled={isQuizActive || selectedGrade === '1학년'}
                >
                  랜덤
                </button>
              )}
            </div>
          </div>
          <div className="menu-section">
            <h2>난이도 선택</h2>
            <div className="options-grid">
              {levels.map(level => (
                <button
                  key={level}
                  className={`sidebar-button ${selectedLevel === level ? 'active' : ''}`}
                  onClick={() => handleSettingChange('difficulty', level)}
                  disabled={isQuizActive}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          <button 
            className="start-button"
            onClick={handleStartQuiz}
            disabled={!selectedGrade || selectedType.length === 0 || !selectedLevel || isQuizActive}
          >
            퀴즈 시작
          </button>
        </>
      )}
    </div>
  );
};

export default Sidebar;