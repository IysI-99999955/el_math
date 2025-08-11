// src/utils/problemGenerator.js
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getNumberRange = (level) => {
  if (level === '초급') {
    const num1 = getRandomInt(1, 9);
    const num2 = getRandomInt(1, 9);
    return { num1, num2 };
  }

  if (level === '중급') {
    const subType = getRandomInt(0, 2);
    switch (subType) {
      case 0: return { num1: getRandomInt(1, 9), num2: getRandomInt(1, 9) };
      case 1: return { num1: getRandomInt(10, 99), num2: getRandomInt(1, 9) };
      case 2: return { num1: getRandomInt(10, 99), num2: getRandomInt(10, 99) };
      default: return { num1: getRandomInt(10, 99), num2: getRandomInt(1, 9) };
    }
  }
  return { num1: getRandomInt(1, 9), num2: getRandomInt(1, 9) };
};

const generateAdditionProblem = (level) => {
  const { num1, num2 } = getNumberRange(level);
  const question = `${num1} + ${num2} = ?`;
  const answer = (num1 + num2).toString();
  return { question, answer };
};

const generateSubtractionProblem = (level) => {
  let { num1, num2 } = getNumberRange(level);
  if (num1 < num2) {
    [num1, num2] = [num2, num1];
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
  const { num1: factor1, num2: factor2 } = getNumberRange(level);
  const product = factor1 * factor2;
  const divisor = Math.random() < 0.5 ? factor1 : factor2;
  const quotient = product / divisor;
  const question = `${product} ÷ ${divisor} = ?`;
  const answer = quotient.toString();
  return { question, answer };
};

const generateFractionProblem = (level) => {
  let num1, num2, question, answer;
  if (level === '초급') {
    num1 = getRandomInt(2, 9);
    num2 = getRandomInt(2, 9);
    question = `\\frac{1}{${num1}} + \\frac{1}{${num2}} = ?`;
    const ansNum = num1 + num2;
    const ansDen = num1 * num2;
    answer = `${ansNum}/${ansDen}`;
  } else {
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
    } else {
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

// --- 여기가 핵심 수정 부분 (3번 해결) ---
export const generateProblem = (grade, types, level, index) => {
  let availableTypes;
  switch (grade) {
    case '1학년': availableTypes = ['덧셈', '뺄셈']; break;
    case '2학년': case '3학년': availableTypes = ['덧셈', '뺄셈', '곱셈', '나눗셈']; break;
    default: availableTypes = Object.keys(problemGenerators);
  }

  let typeToGenerate;
  if (types.includes('Random')) {
    // '랜덤' 선택 시, 해당 학년에서 가능한 모든 유형 중 하나를 랜덤 선택
    typeToGenerate = availableTypes[getRandomInt(0, availableTypes.length - 1)];
  } else {
    // 여러 유형 선택 시, 순서대로 돌아가며 문제 출제
    typeToGenerate = types[index % types.length];
  }

  if (problemGenerators[typeToGenerate]) {
    return problemGenerators[typeToGenerate](level);
  }
  
  // 예외 처리
  return problemGenerators['덧셈'](level);
};