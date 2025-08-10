// src/utils/problemGenerator.js
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

export const generateProblem = (grade, types, level, problemIndex) => {
  let num1, num2, answer, question, type;
  
  const allTypes = (grade === '1학년' || grade === '2학년' || grade === '3학년')
    ? ['덧셈', '뺄셈', '곱셈', '나눗셈']
    : ['덧셈', '뺄셈', '곱셈', '나눗셈', '분수', '소수', '제곱', '비와 비율'];
  
  if (types.includes('Random')) {
    type = allTypes[getRandomInt(0, allTypes.length - 1)];
  } else {
    type = types[getRandomInt(0, types.length - 1)];
  }

  let maxNumber;
  switch (level) {
    case '초급': maxNumber = 20; break;
    case '중급': maxNumber = 99; break;
    case '고급': maxNumber = 999; break;
    default: maxNumber = 20;
  }

  switch(type) {
    case '덧셈':
      num1 = getRandomInt(1, maxNumber);
      num2 = getRandomInt(1, maxNumber);
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
      break;
    case '뺄셈':
      num1 = getRandomInt(1, maxNumber);
      num2 = getRandomInt(1, num1);
      question = `${num1} - ${num2}`;
      answer = num1 - num2;
      break;
    case '곱셈':
      num1 = getRandomInt(1, 9);
      num2 = getRandomInt(1, 9);
      question = `${num1} × ${num2}`;
      answer = num1 * num2;
      break;
    case '나눗셈':
      num2 = getRandomInt(1, 9);
      num1 = (getRandomInt(1, 9)) * num2;
      question = `${num1} ÷ ${num2}`;
      answer = num1 / num2;
      break;
    case '분수':
      num1 = getRandomInt(1, 10);
      num2 = getRandomInt(2, 10);
      const num3 = getRandomInt(1, 10);
      const num4 = getRandomInt(2, 10);
      question = `${num1}/${num2} + ${num3}/${num4}`;
      const commonDenom = num2 * num4;
      const result1 = (num1 * num4) + (num3 * num2);
      const divisor = gcd(result1, commonDenom);
      answer = `${result1/divisor}/${commonDenom/divisor}`;
      break;
    case '소수':
      const range = level === '초급' ? {min: 1, max: 20}
                  : level === '중급' ? {min: 5, max: 50}
                  : {min: 10, max: 99};
      const int1 = getRandomInt(range.min, range.max);
      const int2 = getRandomInt(range.min, range.max);
      num1 = int1 / 10;
      num2 = int2 / 10;
      question = `${num1.toFixed(1)} + ${num2.toFixed(1)}`;
      answer = ((int1 + int2) / 10).toFixed(1);
      break;
    case '제곱':
      num1 = getRandomInt(1, 12);
      question = `${num1}²`;
      answer = num1 * num1;
      break;
    case '비와 비율':
      num1 = getRandomInt(2, 10);
      num2 = getRandomInt(2, 10);
      const ratio = getRandomInt(2, 5);
      question = `${num1} : ${num2} = ? : ${num2 * ratio}`;
      answer = num1 * ratio;
      break;
    case 'Random':
      const allAvailableTypes = ['덧셈', '뺄셈', '곱셈', '나눗셈'].filter(t => 
        !(grade === '1학년' && (t === '곱셈' || t === '나눗셈'))
      );
      const actualRandomType = allAvailableTypes[Math.floor(Math.random() * allAvailableTypes.length)];
      return generateProblem(grade, [actualRandomType], level, problemIndex);
    default:
      question = `문제 ${problemIndex + 1}`;
      answer = 0;
      break;
  }
  
  return { id: problemIndex + 1, question, answer: String(answer) };
};