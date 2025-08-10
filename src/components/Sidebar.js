// src/components/Sidebar.js
import React from 'react';
import { useQuiz } from '../contexts/QuizContext';
import '../styles/Sidebar.css';
import { initializeAudio } from '../utils/audioPlayer';

const Sidebar = () => {
  const {
    isLoggedIn, selectedGrade, setSelectedGrade, selectedType, setSelectedType,
    selectedLevel, setSelectedLevel, startNewQuiz, isQuizActive, isSidebarOpen,
    toggleSidebar,
  } = useQuiz();

  const grades = ['1학년', '2학년', '3학년', '4학년', '5학년', '6학년'];
  const levels = ['초급', '중급', '고급'];
  
  const getAvailableTypes = (grade) => {
    switch (grade) {
      case '1학년': return ['덧셈', '뺄셈'];
      case '2학년':
      case '3학년': return ['덧셈', '뺄셈', '곱셈', '나눗셈'];
      default: return ['덧셈', '뺄셈', '곱셈', '나눗셈', '분수', '소수', '제곱', '비와 비율'];
    }
  };

  const types = getAvailableTypes(selectedGrade);
  
  const handleSelectRandom = () => {
    setSelectedType(['Random']);
  };

  const handleSettingChange = (setting, value) => {
    if (isQuizActive) return;

    switch(setting) {
      case 'grade':
        setSelectedGrade(value);
        if (value === '1학년' && (selectedType.includes('곱셈') || selectedType.includes('나눗셈') || selectedType.includes('Random'))) {
          setSelectedType(['덧셈']);
        }
        break;
      case 'type':
        if (value === 'Random') {
          setSelectedType(['Random']);
        } else {
          setSelectedType([value]);
        }
        break;
      case 'level':
        setSelectedLevel(value);
        break;
      default:
        break;
    }
  };

  const handleStartQuiz = () => {
    if (selectedGrade && selectedType.length > 0 && selectedLevel) {
      initializeAudio();
      startNewQuiz();
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isSidebarOpen ? '◀' : '▶'}
      </button>
      {isSidebarOpen && (
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
            <h2>유형 선택</h2>
            <div className="options-grid">
              {types.map(type => {
                const isSelected = selectedType.includes(type);
                return (
                  <button
                    key={type}
                    className={`sidebar-button ${isSelected ? 'active' : ''}`}
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
                  onClick={() => handleSettingChange('level', level)}
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