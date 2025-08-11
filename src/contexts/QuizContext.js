// src/contexts/QuizContext.js
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { generateProblem } from '../utils/problemGenerator';
import { playSound } from '../utils/audioPlayer';

const STORAGE_KEYS = {
  USER_NAME: 'math_quiz_user_name',
  REMEMBER_ME: 'math_quiz_remember_me',
  QUIZ_HISTORY_ALL_USERS: 'math_quiz_history_all_users',
};

const QUIZ_LIMITS = {
  DAILY_PROBLEM_COUNT: 30,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 10,
  DUPLICATE_NAMES: ['admin', 'test', 'guest'],
  MAX_ATTEMPTS: 5,
  MAX_RETRY_ATTEMPTS: 100,
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
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item to localStorage for key "${key}":`, error);
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

const generateProblemKey = (problem) => `${problem.question}-${problem.answer}`;

const QuizContext = createContext();
export const useQuiz = () => useContext(QuizContext);

export const QuizProvider = ({ children }) => {
  const [appState, setAppState] = useState('loading');
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('1학년');
  const [selectedType, setSelectedType] = useState(['덧셈']);
  const [selectedLevel, setSelectedLevel] = useState('초급');
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [problemHistory, setProblemHistory] = useState([]);
  const [quizScore, setQuizScore] = useState(0);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [quizHistoryList, setQuizHistoryList] = useState([]);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);

  const clearError = useCallback(() => setError(''), []);
  const toggleSound = useCallback(() => setIsSoundEnabled(prev => !prev), []);
  const toggleHistoryPopup = useCallback(() => setShowHistoryPopup(prev => !prev), []);

  const login = useCallback((name, remember) => {
    setIsLoading(true);
    setError('');
    const sanitizedName = name.trim();

    if (!sanitizedName || sanitizedName.length < QUIZ_LIMITS.MIN_NAME_LENGTH || sanitizedName.length > QUIZ_LIMITS.MAX_NAME_LENGTH) {
      setError(`이름은 ${QUIZ_LIMITS.MIN_NAME_LENGTH}~${QUIZ_LIMITS.MAX_NAME_LENGTH}자 사이로 입력해주세요.`);
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
    if (remember) {
      safeSetItem(STORAGE_KEYS.USER_NAME, sanitizedName);
      safeSetItem(STORAGE_KEYS.REMEMBER_ME, true);
    } else {
      safeRemoveItem(STORAGE_KEYS.USER_NAME);
      safeRemoveItem(STORAGE_KEYS.REMEMBER_ME);
    }
    
    const allHistory = safeGetItem(STORAGE_KEYS.QUIZ_HISTORY_ALL_USERS, {});
    setQuizHistoryList(allHistory[sanitizedName] || []);

    setAppState('selection');
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserName('');
    if (!rememberMe) {
      safeRemoveItem(STORAGE_KEYS.USER_NAME);
    }
    setIsQuizActive(false);
    setAppState('login');
  }, [rememberMe]);

  const endQuiz = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const allHistory = safeGetItem(STORAGE_KEYS.QUIZ_HISTORY_ALL_USERS, {});
    const userHistory = allHistory[userName] || [];

    const newRecord = {
      date: today,
      score: quizScore,
      totalProblems: problems.length,
    };
    
    const todayIndex = userHistory.findIndex(record => record.date === today);
    
    let updatedHistory;
    if (todayIndex > -1) {
      userHistory[todayIndex] = newRecord;
      updatedHistory = [...userHistory];
    } else {
      updatedHistory = [newRecord, ...userHistory];
    }
    
    allHistory[userName] = updatedHistory;
    safeSetItem(STORAGE_KEYS.QUIZ_HISTORY_ALL_USERS, allHistory);
    setQuizHistoryList(updatedHistory);

    setIsQuizActive(false);
    setAppState('selection');
  }, [userName, quizScore, problems.length]);

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

  const startNewQuiz = useCallback(() => {
    setIsQuizActive(true);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setIsCorrect(null);
    setProblemHistory([]);
    setQuizScore(0);
    setCurrentAttempts(0);

    const newProblems = [];
    const generatedKeys = new Set();
    let retryCount = 0;
    while (newProblems.length < QUIZ_LIMITS.DAILY_PROBLEM_COUNT && retryCount < QUIZ_LIMITS.MAX_RETRY_ATTEMPTS) {
      const problem = generateProblem(selectedGrade, selectedType, selectedLevel, newProblems.length);
      const problemKey = generateProblemKey(problem);
      if (!generatedKeys.has(problemKey)) {
        newProblems.push(problem);
        generatedKeys.add(problemKey);
      }
      retryCount++;
    }
    setProblems(newProblems);
    setAppState('quiz');
  }, [selectedGrade, selectedType, selectedLevel]);

  const submitAnswer = useCallback((isTimeout = false) => {
    if (!isQuizActive || isCorrect !== null) return;
    const problem = problems[currentProblemIndex];
    if (!problem) return;

    const isAnswerCorrect = problem.answer.toString().trim().toLowerCase() === userAnswer.trim().toLowerCase();

    if (isAnswerCorrect) {
      setIsCorrect(true);
      setQuizScore(prev => prev + 1);
      if (isSoundEnabled) playSound('correct');
      setProblemHistory(prev => [...prev, { ...problem, userAnswer, isAnswerCorrect: true }]);
      setTimeout(() => nextProblem(), 1000);
    } else {
      const newAttempts = currentAttempts + 1;
      setCurrentAttempts(newAttempts);
      setIsCorrect(false);

      if (newAttempts >= QUIZ_LIMITS.MAX_ATTEMPTS || isTimeout) {
        if (isSoundEnabled) playSound('incorrect');
        setProblemHistory(prev => [...prev, { ...problem, userAnswer: isTimeout ? '시간 초과' : userAnswer, isAnswerCorrect: false }]);
        setTimeout(() => endQuiz(), 1500);
      } else {
        setTimeout(() => {
          setIsCorrect(null);
          setUserAnswer('');
        }, 1000);
      }
    }
  }, [isQuizActive, isCorrect, problems, currentProblemIndex, userAnswer, currentAttempts, isSoundEnabled, endQuiz, nextProblem]);

  useEffect(() => {
    const initializeApp = () => {
      const storedRememberMe = safeGetItem(STORAGE_KEYS.REMEMBER_ME, false);
      const storedName = storedRememberMe ? safeGetItem(STORAGE_KEYS.USER_NAME, '') : '';

      if (storedName && storedRememberMe) {
        setUserName(storedName);
        setRememberMe(true);
        setIsLoggedIn(true);
        const allHistory = safeGetItem(STORAGE_KEYS.QUIZ_HISTORY_ALL_USERS, {});
        setQuizHistoryList(allHistory[storedName] || []);
        setAppState('selection');
      } else {
        setAppState('login');
      }
      setIsLoading(false);
    };
    initializeApp();
  }, []);

  const value = {
    appState, userName, isLoggedIn, rememberMe, setRememberMe, login, logout, error, isLoading, clearError,
    QUIZ_LIMITS, selectedGrade, setSelectedGrade, selectedType, setSelectedType,
    selectedLevel, setSelectedLevel, startNewQuiz, isQuizActive, problems,
    currentProblemIndex, userAnswer, setUserAnswer, isCorrect, submitAnswer,
    nextProblem, problemHistory, quizScore, currentAttempts,
    isSoundEnabled, toggleSound,
    quizHistoryList, showHistoryPopup, toggleHistoryPopup,
    endQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};