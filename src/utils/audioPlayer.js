// src/utils/audioPlayer.js

// 오디오 객체들을 미리 생성하고 재사용
const audioCache = {
  correct: new Audio('/assets/dingdongdaeng.mp3'),
  incorrect: new Audio('/assets/bbibbic.mp3'),
  timeout: new Audio('/assets/bbibbic.mp3'),
};

// 현재 재생 중인 오디오를 추적
let currentAudio = null;

// 오디오 파일이 로드되면 볼륨 설정 (선택사항)
Object.values(audioCache).forEach(audio => {
  audio.volume = 0.7; // 볼륨을 70%로 설정
  audio.preload = 'auto'; // 미리 로드
});

export const playSound = (type) => {
  // 현재 재생 중인 오디오가 있으면 정지
  if (currentAudio && !currentAudio.ended) {
    currentAudio.pause();
    currentAudio.currentTime = 0; // 처음으로 되돌리기
  }

  // 해당 타입의 오디오 가져오기
  const audio = audioCache[type];
  
  if (!audio) {
    console.warn(`Unknown sound type: ${type}`);
    return;
  }

  // 오디오 재생 위치를 처음으로 리셋 (이전 재생이 끝나지 않은 경우 대비)
  audio.currentTime = 0;
  
  // 현재 재생 중인 오디오로 설정
  currentAudio = audio;
  
  // 재생 시작
  audio.play().catch(error => {
    console.warn('Audio play failed:', error);
  });

  // 재생이 끝나면 currentAudio 초기화
  audio.onended = () => {
    if (currentAudio === audio) {
      currentAudio = null;
    }
  };
};

// 모든 오디오 정지 (필요한 경우 사용)
export const stopAllSounds = () => {
  if (currentAudio && !currentAudio.ended) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

// 볼륨 조절 함수 (필요한 경우 사용)
export const setVolume = (volume) => {
  const clampedVolume = Math.max(0, Math.min(1, volume)); // 0-1 사이로 제한
  Object.values(audioCache).forEach(audio => {
    audio.volume = clampedVolume;
  });
};