// src/contexts/QuizContext.js
import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { generateProblem } from '../utils/problemGenerator';
import { playSound } from '../utils/audioPlayer';

const QuizContext = createContext();

const STORAGE_KEYS = {
  USER_NAME: 'math_quiz_user_name',
  REMEMBER_ME: 'math_quiz_remember_me',
  USER_DATA_PREFIX: 'math_quiz_user_data_',
  QUIZ_HISTORY: 'math_quiz_history',
};

const QUIZ_LIMITS = {
  DAILY_PROBLEM_COUNT: 50, // 1회 퀴즈당 문제 수
  MAX_PROBLEM_ATTEMPTS: 5,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 20,
  DUPLICATE_NAMES: ['admin', 'test', 'guest'],
  TOTAL_POSSIBLE_QUIZZES: 'α',
};

const safeGetItem = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error getting item from localStorage for key "${key}":`, error);
    return defaultValue;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error setting item to localStorage for key "${key}":`, error);
    return false;
  }
};

const getUserDataKey = (userName, dataName) => `${STORAGE_KEYS.USER_DATA_PREFIX}${userName}_${dataName}`;

const checkDailyReset = (userName) => {
  const today = new Date().toDateString();
  const lastResetDateKey = getUserDataKey(userName, 'last_reset_date');
  const lastResetDate = safeGetItem(lastResetDateKey, null);

  if (lastResetDate !== today) {
    safeSetItem(getUserDataKey(userName, 'daily_completed_quizzes'), 0);
    safeSetItem(getUserDataKey(userName, 'solved_problem_count'), 0);
    safeSetItem(lastResetDateKey, today);
    return true;
  }
  return false;
};

const getInitialQuizSettings = () => ({
  grade: '1학년',
  difficulty: '초급',
  categories: ['덧셈'],
});

const getInitialState = (initialUserName = null) => {
  let userName = initialUserName;
  let isLoggedIn = !!initialUserName;

  if (isLoggedIn) {
    checkDailyReset(userName);
  } else {
    userName = null;
  }

  const dailyCompletedQuizzes = isLoggedIn ? safeGetItem(getUserDataKey(userName, 'daily_completed_quizzes'), 0) : 0;
  const solvedProblemCount = isLoggedIn ? safeGetItem(getUserDataKey(userName, 'solved_problem_count'), 0) : 0;
  const quizSettings = isLoggedIn ? safeGetItem(getUserDataKey(userName, 'quiz_settings'), getInitialQuizSettings()) : getInitialQuizSettings();

  return {
    userName,
    isLoggedIn,
    isQuizActive: false,
    isQuizFinished: false,
    isQuizFailed: false,
    selectedGrade: quizSettings.grade,
    selectedType: quizSettings.categories,
    selectedLevel: quizSettings.difficulty,
    currentProblem: null,
    problemHistory: [],
    score: 0,
    attempts: 0,
    dailyCompletedQuizzes,
    solvedProblemCount,
    error: null,
    isLoading: false,
  };
};

export const QuizProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const storedUserName = safeGetItem(STORAGE_KEYS.USER_NAME, null);
    const rememberMe = safeGetItem(STORAGE_KEYS.REMEMBER_ME, false);
    return getInitialState(rememberMe ? storedUserName : null);
  });

  const updateState = useCallback((newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  }, []);
  
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const loginUser = useCallback(async (name, rememberMe) => {
    updateState({ isLoading: true, error: null });
    const sanitizedName = name.trim();

    if (!sanitizedName || typeof sanitizedName !== 'string') {
      updateState({ error: '올바른 이름을 입력해주세요.', isLoading: false });
      return false;
    }
    if (sanitizedName.length < QUIZ_LIMITS.MIN_NAME_LENGTH || sanitizedName.length > QUIZ_LIMITS.MAX_NAME_LENGTH) {
      updateState({ error: `이름은 ${QUIZ_LIMITS.MIN_NAME_LENGTH}~${QUIZ_LIMITS.MAX_NAME_LENGTH}자여야 합니다.`, isLoading: false });
      return false;
    }
    if (QUIZ_LIMITS.DUPLICATE_NAMES.includes(sanitizedName.toLowerCase())) {
      updateState({ error: '사용자 이름을 확인하십시오.', isLoading: false });
      return false;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      safeSetItem(STORAGE_KEYS.USER_NAME, sanitizedName);
      safeSetItem(STORAGE_KEYS.REMEMBER_ME, rememberMe);

      const newState = getInitialState(sanitizedName);
      setState(newState);
      return true;
    } catch (err) {
      updateState({ error: '로그인 중 오류가 발생했습니다.', isLoading: false });
      return false;
    }
  }, [updateState]);

  const logoutUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER_NAME);
    safeSetItem(STORAGE_KEYS.REMEMBER_ME, false);
    setState(getInitialState(null));
  }, []);

  const setSelectedGrade = useCallback((grade) => {
    updateState({ selectedGrade: grade });
    const currentSettings = {
      grade,
      categories: state.selectedType,
      difficulty: state.selectedLevel,
    };
    safeSetItem(getUserDataKey(state.userName, 'quiz_settings'), currentSettings);
  }, [state.userName, state.selectedType, state.selectedLevel, updateState]);

  const setSelectedType = useCallback((type) => {
    updateState({ selectedType: type });
    const currentSettings = {
      grade: state.selectedGrade,
      categories: type,
      difficulty: state.selectedLevel,
    };
    safeSetItem(getUserDataKey(state.userName, 'quiz_settings'), currentSettings);
  }, [state.userName, state.selectedGrade, state.selectedLevel, updateState]);

  const setSelectedLevel = useCallback((level) => {
    updateState({ selectedLevel: level });
    const currentSettings = {
      grade: state.selectedGrade,
      categories: state.selectedType,
      difficulty: level,
    };
    safeSetItem(getUserDataKey(state.userName, 'quiz_settings'), currentSettings);
  }, [state.userName, state.selectedGrade, state.selectedType, updateState]);

  const generateNewProblem = useCallback((currentProblemHistory, currentScore) => {
    if (currentProblemHistory.length >= QUIZ_LIMITS.DAILY_PROBLEM_COUNT) {
      updateState({ isQuizActive: false, isQuizFinished: true, currentProblem: null });
      const historyEntry = {
        userName: state.userName,
        date: new Date().toLocaleDateString('ko-KR'),
        time: new Date().toLocaleTimeString('ko-KR'),
        course: {
          grade: state.selectedGrade,
          type: state.selectedType.join(', '),
          level: state.selectedLevel,
        },
        problemsSolved: QUIZ_LIMITS.DAILY_PROBLEM_COUNT,
        score: currentScore,
      };
      const existingHistory = safeGetItem(STORAGE_KEYS.QUIZ_HISTORY, []);
      safeSetItem(STORAGE_KEYS.QUIZ_HISTORY, [...existingHistory, historyEntry]);

      const newDailyCompleted = state.dailyCompletedQuizzes + 1;
      safeSetItem(getUserDataKey(state.userName, 'daily_completed_quizzes'), newDailyCompleted);
      updateState({ dailyCompletedQuizzes: newDailyCompleted });
      return;
    }

    const newProblem = generateProblem(state.selectedGrade, state.selectedType, state.selectedLevel, currentProblemHistory.length);
    updateState({ currentProblem: newProblem, attempts: 0 });
  }, [state.userName, state.selectedGrade, state.selectedType, state.selectedLevel, state.dailyCompletedQuizzes, updateState]);

  const checkAnswer = useCallback((userAnswer) => {
    if (!state.currentProblem) return;

    const answerValue = parseInt(userAnswer, 10);
    const isCorrect = answerValue === parseInt(state.currentProblem.answer, 10);

    if (isCorrect) {
      // 정답인 경우
      playSound('correct'); // 정답 소리 재생
      setState(prevState => {
        const newScore = prevState.score + 1;
        const newProblemHistory = [...prevState.problemHistory, { ...prevState.currentProblem, result: 'correct' }];
        const newSolvedCount = prevState.solvedProblemCount + 1;
        
        safeSetItem(getUserDataKey(prevState.userName, 'solved_problem_count'), newSolvedCount);
        
        if (newProblemHistory.length >= QUIZ_LIMITS.DAILY_PROBLEM_COUNT) {
          const historyEntry = {
            userName: prevState.userName,
            date: new Date().toLocaleDateString('ko-KR'),
            time: new Date().toLocaleTimeString('ko-KR'),
            course: {
              grade: prevState.selectedGrade,
              type: prevState.selectedType.join(', '),
              level: prevState.selectedLevel,
            },
            problemsSolved: QUIZ_LIMITS.DAILY_PROBLEM_COUNT,
            score: newScore,
          };
          const existingHistory = safeGetItem(STORAGE_KEYS.QUIZ_HISTORY, []);
          safeSetItem(STORAGE_KEYS.QUIZ_HISTORY, [...existingHistory, historyEntry]);

          const newDailyCompleted = prevState.dailyCompletedQuizzes + 1;
          safeSetItem(getUserDataKey(prevState.userName, 'daily_completed_quizzes'), newDailyCompleted);
          
          return {
            ...prevState,
            score: newScore,
            problemHistory: newProblemHistory,
            solvedProblemCount: newSolvedCount,
            dailyCompletedQuizzes: newDailyCompleted,
            isQuizActive: false,
            isQuizFinished: true,
            currentProblem: null,
            attempts: 0
          };
        } else {
          const newProblem = generateProblem(
            prevState.selectedGrade, 
            prevState.selectedType, 
            prevState.selectedLevel, 
            newProblemHistory.length
          );
          
          return {
            ...prevState,
            score: newScore,
            problemHistory: newProblemHistory,
            solvedProblemCount: newSolvedCount,
            currentProblem: newProblem,
            attempts: 0
          };
        }
      });
    } else {
      // 오답인 경우
      playSound('incorrect'); // 오답 소리 재생
      setState(prevState => {
        const newAttempts = prevState.attempts + 1;
        if (newAttempts >= QUIZ_LIMITS.MAX_PROBLEM_ATTEMPTS) {
          alert(`문제풀이 실패! 초기 화면으로 돌아갑니다.`);
          return {
            ...prevState,
            isQuizActive: false,
            isQuizFinished: true,
            isQuizFailed: true,
            currentProblem: null,
            attempts: 0,
            score: 0,
            problemHistory: []
          };
        }
        return {
          ...prevState,
          attempts: newAttempts
        };
      });
    }
  }, [state.currentProblem, state.userName]);

  const startNewQuiz = useCallback(() => {
    updateState({
      isQuizStarted: true,
      isQuizActive: true,
      isQuizFinished: false,
      isQuizFailed: false,
      score: 0,
      attempts: 0,
      problemHistory: [],
    });
  }, [updateState]);

  useEffect(() => {
    if (state.isQuizActive && !state.currentProblem && state.problemHistory.length === 0) {
      const newProblem = generateProblem(state.selectedGrade, state.selectedType, state.selectedLevel, 0);
      updateState({ currentProblem: newProblem, attempts: 0 });
    }
  }, [state.isQuizActive, state.currentProblem, state.problemHistory.length, state.selectedGrade, state.selectedType, state.selectedLevel, updateState]);

  const endQuizSession = useCallback(() => {
    playSound('timeout'); // 타임아웃 소리 재생
    updateState({ 
      isQuizActive: false, 
      isQuizFinished: true, 
      currentProblem: null, 
      attempts: 0, 
      score: 0, 
      problemHistory: [] 
    });
  }, [updateState]);

  const value = {
    ...state,
    setSelectedGrade,
    setSelectedType,
    setSelectedLevel,
    loginUser,
    logoutUser,
    startNewQuiz,
    checkAnswer,
    endQuizSession,
    clearError,
    TOTAL_PROBLEMS: QUIZ_LIMITS.DAILY_PROBLEM_COUNT,
    QUIZ_LIMITS,
    totalPossibleQuizzes: QUIZ_LIMITS.TOTAL_POSSIBLE_QUIZZES,
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export { QuizContext };