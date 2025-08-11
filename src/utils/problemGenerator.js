// src/utils/problemGenerator.js

// 랜덤 정수를 생성하는 헬퍼 함수
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// --- 여기가 핵심! 난이도별 숫자 범위를 생성하는 함수 ---
const getNumberRange = (level) => {
  // 초급: 항상 한 자릿수 vs 한 자릿수
  if (level === '초급') {
    const num1 = getRandomInt(1, 9);
    const num2 = getRandomInt(1, 9);
    return { num1, num2 };
  }

  // 중급: 3가지 유형 중 하나를 랜덤으로 선택
  if (level === '중급') {
    const subType = getRandomInt(0, 2); // 0, 1, 2 중 하나를 랜덤으로 뽑음

    switch (subType) {
      // 유형 1: 한 자릿수 vs 한 자릿수
      case 0:
        return { num1: getRandomInt(1, 9), num2: getRandomInt(1, 9) };
      
      // 유형 2: 두 자릿수 vs 한 자릿수
      case 1:
        return { num1: getRandomInt(10, 99), num2: getRandomInt(1, 9) };

      // 유형 3: 두 자릿수 vs 두 자릿수
      case 2:
        return { num1: getRandomInt(10, 99), num2: getRandomInt(10, 99) };
      
      // 혹시 모를 예외 처리 (기본값으로 유형 2 반환)
      default:
        return { num1: getRandomInt(10, 99), num2: getRandomInt(1, 9) };
    }
  }

  // level 값이 초급/중급이 아닐 경우의 기본값
  return { num1: getRandomInt(1, 9), num2: getRandomInt(1, 9) };
};


// --- 각 문제 유형별 생성 함수 (이 아래는 수정할 필요 없음) ---

const generateAdditionProblem = (level) => {
  const { num1, num2 } = getNumberRange(level);
  const question = `${num1} + ${num2} = ?`;
  const answer = (num1 + num2).toString();
  return { question, answer };
};

const generateSubtractionProblem = (level) => {
  let { num1, num2 } = getNumberRange(level);
  // 항상 큰 수에서 작은 수를 빼도록 보장하여 음수 답변을 방지
  if (num1 < num2) {
    [num1, num2] = [num2, num1]; // 두 숫자를 맞바꿈
  }
  const question = `${num1} - ${num2} = ?`;
  const answer = (num1 - num2).toString();
  return { question, answer };
};

const generateMultiplicationProblem = (level) => {
  const { num1, num2 } = getNumberRange(level);
  const question = `${num1} × ${num2} = ?`;
  const answer = (num1 * num2).toString();
  return { question, answer };
};

const generateDivisionProblem = (level) => {
  // 나누어 떨어지는 문제를 만들기 위해, 먼저 두 수를 곱해서 피제수(나눠지는 수)를 만듦
  const { num1: factor1, num2: factor2 } = getNumberRange(level);
  const product = factor1 * factor2;
  
  // 두 인수 중 하나를 제수(나누는 수)로 랜덤 선택
  const divisor = Math.random() < 0.5 ? factor1 : factor2;
  const quotient = product / divisor; // 몫

  const question = `${product} ÷ ${divisor} = ?`;
  const answer = quotient.toString();
  return { question, answer };
};


// --- 아래는 기존과 동일한 로직 (분수, 소수 등) ---

const generateFractionProblem = (level) => {
  let num1, num2, question, answer;
  if (level === '초급') {
    num1 = getRandomInt(2, 9);
    num2 = getRandomInt(2, 9);
    question = `\\frac{1}{${num1}} + \\frac{1}{${num2}} = ?`;
    const ansNum = num1 + num2;
    const ansDen = num1 * num2;
    answer = `${ansNum}/${ansDen}`;
  } else { // 중급
    num1 = getRandomInt(2, 9);
    num2 = getRandomInt(2, 9);
    question = `\\frac{1}{${num1}} \\times \\frac{1}{${num2}} = ?`;
    answer = `1/${num1 * num2}`;
  }
  return { question, answer };
};

const problemGenerators = {
  '덧셈': generateAdditionProblem,
  '뺄셈': generateSubtractionProblem,
  '곱셈': generateMultiplicationProblem,
  '나눗셈': generateDivisionProblem,
  '분수': generateFractionProblem,
  '소수': (level) => {
    let int1, int2;
    if (level === '초급') {
      int1 = getRandomInt(1, 99);
      int2 = getRandomInt(1, 9);
    } else { // 중급
      int1 = getRandomInt(1, 999);
      int2 = getRandomInt(1, 99);
    }
    const num1 = int1 / 10;
    const num2 = int2 / 10;
    const question = `${num1.toFixed(1)} + ${num2.toFixed(1)} = ?`;
    const answer = (num1 + num2).toFixed(1);
    return { question, answer };
  },
  '제곱': (level) => {
    let num = level === '초급' ? getRandomInt(2, 9) : getRandomInt(10, 20);
    const question = `${num}² = ?`;
    const answer = (num * num).toString();
    return { question, answer };
  },
  '비와 비율': (level) => {
    let num1 = getRandomInt(2, 10);
    let num2 = getRandomInt(2, 10);
    let ratio = level === '초급' ? getRandomInt(2, 5) : getRandomInt(2, 10);
    const question = `${num1} : ${num2} = ? : ${num2 * ratio}`;
    const answer = (num1 * ratio).toString();
    return { question, answer };
  },
};

export const generateProblem = (grade, types, level, index) => {
  let availableTypes = Object.keys(problemGenerators);
  if (grade === '1학년') {
    availableTypes = ['덧셈', '뺄셈'];
  } else if (grade === '2학년' || grade === '3학년') {
    availableTypes = ['덧셈', '뺄셈', '곱셈', '나눗셈'];
  }
  
  const selectedType = types[0];
  
  if (problemGenerators[selectedType]) {
    return problemGenerators[selectedType](level);
  }
  
  return problemGenerators['덧셈'](level);
};