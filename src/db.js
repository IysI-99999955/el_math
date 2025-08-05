// src/db.js
import Dexie from 'dexie';

// Dexie를 사용하여 로컬 IndexedDB에 데이터베이스를 생성
export const db = new Dexie('QuizDatabase');

// 데이터베이스의 버전과 스토어(테이블) 스키마 정의
// 'scores' 스토어는 'id'를 기본 키로 사용하며, 'score', 'grade', 'type', 'level', 'date'를 저장함
db.version(1).stores({
  scores: '++id, score, grade, type, level, date'
});