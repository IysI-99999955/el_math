// src/utils/problemGenerator.js
export const generateProblem = (grade, types, level, problemIndex) => {
  let num1, num2, answer, question;
  let maxNumber = 10;
  if (level === '중급') maxNumber = 50;
  if (level === '고급') maxNumber = 100;

  let availableTypes = types;
  // 1학년인 경우 곱셈과 나눗셈을 제외
  if (grade === '1학년') {
    availableTypes = types.filter(t => t !== '곱셈' && t !== '나눗셈');
    // 만약 1학년인데 선택된 유형에 덧셈/뺄셈이 없다면 기본값으로 덧셈을 추가
    if (availableTypes.length === 0) {
      availableTypes = ['덧셈'];
    }
  }

  const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  const currentId = problemIndex + 1;

  switch (randomType) {
    case '덧셈':
      num1 = Math.floor(Math.random() * maxNumber) + 1;
      num2 = Math.floor(Math.random() * maxNumber) + 1;
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
      break;
    case '뺄셈':
      num1 = Math.floor(Math.random() * maxNumber) + 1;
      num2 = Math.floor(Math.random() * num1) + 1;
      question = `${num1} - ${num2}`;
      answer = num1 - num2;
      break;
    case '곱셈':
      num1 = Math.floor(Math.random() * 9) + 1;
      num2 = Math.floor(Math.random() * 9) + 1;
      question = `${num1} × ${num2}`;
      answer = num1 * num2;
      break;
    case '나눗셈':
      num2 = Math.floor(Math.random() * 9) + 1;
      num1 = (Math.floor(Math.random() * 9) + 1) * num2;
      question = `${num1} ÷ ${num2}`;
      answer = num1 / num2;
      break;
    case 'Random':
      // 'Random'이 선택되었을 때, 실제 연산 유형을 다시 랜덤으로 선택
      const allAvailableTypes = ['덧셈', '뺄셈', '곱셈', '나눗셈'].filter(t => !(grade === '1학년' && (t === '곱셈' || t === '나눗셈')));
      const actualRandomType = allAvailableTypes[Math.floor(Math.random() * allAvailableTypes.length)];
      return generateProblem(grade, [actualRandomType], level, problemIndex); // 재귀 호출
    default:
      // 기본값 설정 (에러 방지)
      num1 = Math.floor(Math.random() * maxNumber) + 1;
      num2 = Math.floor(Math.random() * maxNumber) + 1;
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
      break;
  }

  return {
    id: currentId,
    question,
    answer,
    num1, // 문제 풀이 화면에서 연산자를 분리하여 표시하기 위해 추가
    num2, // 문제 풀이 화면에서 연산자를 분리하여 표시하기 위해 추가
    operator: randomType === '덧셈' ? '+' : randomType === '뺄셈' ? '-' : randomType === '곱셈' ? '×' : '÷', // 연산자 추가
  };
};