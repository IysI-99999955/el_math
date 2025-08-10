// src/contexts/QuizContext.js
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { generateProblem } from '../utils/problemGenerator';
import { playSound } from '../utils/audioPlayer';

const STORAGE_KEYS = {
  USER_NAME: 'math_quiz_user_name',
  REMEMBER_ME: 'math_quiz_remember_me',
};

const QUIZ_LIMITS = {
  DAILY_PROBLEM_COUNT: 40,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 20,
  DUPLICATE_NAMES: ['admin', 'test', 'guest'],
  MAX_ATTEMPTS: 5,
};

const safeGetItem = (key, defaultValue) => {
  try {
    if (typeof localStorage === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return defaultValue;
    const parsedItem = JSON.parse(item);
    return parsedItem !== null ? parsedItem : defaultValue;
  } catch (error) {
    console.warn(`Error getting item from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

const safeSetItem = (key, value) => {
  try {
    if (typeof localStorage === 'undefined') {
      console.warn('localStorage not supported');
      return false;
    }
    const serialized = JSON.stringify(value);
    if (serialized.length > 5242880) { // 5MB 제한
      console.warn('Data too large for localStorage');
      return false;
    }
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      try {
        localStorage.clear();
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('localStorage retry failed:', retryError);
        return false;
      }
    }
    console.warn(`Error setting item to localStorage for key "${key}":`, error);
    return false;
  }
};

const safeRemoveItem = (key) => {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing item from localStorage for key "${key}":`, error);
    return false;
  }
};

const QuizContext = createContext();

export const useQuiz = () => useContext(QuizContext);

export const QuizProvider = ({ children }) => {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [selectedGrade, setSelectedGrade] = useState('1학년');
  const [selectedType, setSelectedType] = useState(['덧셈']);
  const [selectedLevel, setSelectedLevel] = useState('초급');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isQuizActive, setIsQuizActive] = useState(false);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [problemHistory, setProblemHistory] = useState([]);
  const [isQuizEnded, setIsQuizEnded] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [showQuizSummary, setShowQuizSummary] = useState(false);
  const [currentAttempts, setCurrentAttempts] = useState(0);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isQuizActive) return;
    setIsSidebarOpen(prev => !prev);
  }, [isQuizActive]);

  const login = useCallback((name, remember) => {
    setIsLoading(true);
    setError('');

    const sanitizedName = name.trim();
    if (!sanitizedName || typeof sanitizedName !== 'string') {
      setError('올바른 이름을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (sanitizedName.length < QUIZ_LIMITS.MIN_NAME_LENGTH || sanitizedName.length > QUIZ_LIMITS.MAX_NAME_LENGTH) {
      setError(`이름은 ${QUIZ_LIMITS.MIN_NAME_LENGTH}~${QUIZ_LIMITS.MAX_NAME_LENGTH}자여야 합니다.`);
      setIsLoading(false);
      return;
    }

    if (QUIZ_LIMITS.DUPLICATE_NAMES.includes(sanitizedName.toLowerCase())) {
      setError('사용할 수 없는 이름입니다.');
      setIsLoading(false);
      return;
    }

    setUserName(sanitizedName);
    setIsLoggedIn(true);
    setRememberMe(remember);
    safeSetItem(STORAGE_KEYS.USER_NAME, sanitizedName);
    safeSetItem(STORAGE_KEYS.REMEMBER_ME, remember);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName('');
    safeRemoveItem(STORAGE_KEYS.USER_NAME);
    safeRemoveItem(STORAGE_KEYS.REMEMBER_ME);
    setIsQuizActive(false);
    setIsSidebarOpen(true);
    setShowQuizSummary(false);
  }, []);

  const startNewQuiz = useCallback(() => {
    setIsQuizActive(true);
    setIsQuizEnded(false);
    setShowQuizSummary(false);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setIsCorrect(null);
    setProblemHistory([]);
    setQuizScore(0);
    setShowResultPopup(false);
    setIsSidebarOpen(false);
    setCurrentAttempts(0);

    const newProblems = Array.from({ length: QUIZ_LIMITS.DAILY_PROBLEM_COUNT }, (_, i) => 
      generateProblem(selectedGrade, selectedType, selectedLevel, i)
    );
    setProblems(newProblems);
  }, [selectedGrade, selectedType, selectedLevel]);

  const endQuiz = useCallback(() => {
    setIsQuizActive(false);
    setIsQuizEnded(true);
    setShowResultPopup(true);
    setShowQuizSummary(true);
    setIsSidebarOpen(true);
  }, []);

  const submitAnswer = useCallback((isTimeout = false) => {
    if (!isQuizActive || isCorrect !== null) return;
    
    const problem = problems[currentProblemIndex];
    if (!problem) return;
    const isAnswerCorrect = problem.answer.toLowerCase().trim() === userAnswer.trim().toLowerCase();
    
    if (isAnswerCorrect) {
      setIsCorrect(true);
      setQuizScore(prev => prev + 1);
      playSound('correct');
      setProblemHistory(prev => [...prev, { ...problem, userAnswer: userAnswer, isAnswerCorrect: true }]);
      setTimeout(() => {
        setIsCorrect(null);
        nextProblem();
      }, 1500);
    } else {
      const newAttempts = currentAttempts + 1;
      setCurrentAttempts(newAttempts);
      setIsCorrect(false);

      if (newAttempts >= QUIZ_LIMITS.MAX_ATTEMPTS || isTimeout) {
        playSound('incorrect');
        setProblemHistory(prev => [...prev, { ...problem, userAnswer: isTimeout ? '시간 초과' : userAnswer, isAnswerCorrect: false }]);
        setTimeout(() => {
          setIsCorrect(null);
          endQuiz();
        }, 1500);
      } else {
        setTimeout(() => {
          setIsCorrect(null);
          setUserAnswer('');
        }, 1000);
      }
    }
  }, [isQuizActive, isCorrect, problems, currentProblemIndex, userAnswer, currentAttempts, endQuiz, nextProblem]);

  const nextProblem = useCallback(() => {
    if (currentProblemIndex + 1 < problems.length) {
      setCurrentProblemIndex(prev => prev + 1);
      setUserAnswer('');
      setIsCorrect(null);
      setCurrentAttempts(0);
    } else {
      endQuiz();
    }
  }, [currentProblemIndex, problems.length, endQuiz]);

  const closeResultPopup = useCallback(() => {
    setShowResultPopup(false);
  }, []);

  useEffect(() => {
    const storedName = safeGetItem(STORAGE_KEYS.USER_NAME, null);
    const storedRememberMe = safeGetItem(STORAGE_KEYS.REMEMBER_ME, false);
    if (storedName && storedRememberMe) {
      setUserName(storedName);
      setIsLoggedIn(true);
      setRememberMe(true);
    }
  }, []);

  const value = {
    userName, isLoggedIn, rememberMe, login, logout, error, isLoading, clearError,
    QUIZ_LIMITS, selectedGrade, setSelectedGrade, selectedType, setSelectedType,
    selectedLevel, setSelectedLevel, startNewQuiz, isQuizActive, problems,
    currentProblemIndex, userAnswer, setUserAnswer, isCorrect, submitAnswer,
    nextProblem, problemHistory, isQuizEnded, quizScore, showResultPopup,
    closeResultPopup, toggleSidebar, isSidebarOpen, showQuizSummary,
    currentAttempts
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export { QuizContext };