// src/utils/audioPlayer.js

const audioCache = {
  correct: new Audio('/assets/dingdongdaeng.mp3'),
  incorrect: new Audio('/assets/bbibbic.mp3'),
};

let currentAudio = null;

Object.values(audioCache).forEach(audio => {
  audio.volume = 0.7;
  audio.preload = 'auto';
});


// 브라우저의 자동재생 정책을 해결하기 위해 오디오를 초기화하는 함수
export const initializeAudio = () => {
  console.log('Audio: Initializing...');
  // 모든 오디오를 한번씩 재생 시도하고 바로 멈춰서 '재생 권한'을 얻음
  Object.values(audioCache).forEach(audio => {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(error => {
        // 사용자가 상호작용하기 전에는 이 에러가 뜨는게 정상이니 걱정 안해도 돼.
        console.log('Audio initialization requires user interaction.');
      });
    }
  });
};
// --- 여기까지 추가 ---

export const playSound = (type) => {
  if (currentAudio && !currentAudio.ended) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audio = audioCache[type];
  
  if (!audio) {
    console.warn(`Unknown sound type: ${type}`);
    return;
  }

  audio.currentTime = 0;
  currentAudio = audio;
  
  audio.play().catch(error => {
    console.warn('Audio play failed:', error);
  });

  audio.onended = () => {
    if (currentAudio === audio) {
      currentAudio = null;
    }
  };
};

export const stopAllSounds = () => {
  if (currentAudio && !currentAudio.ended) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

export const setVolume = (volume) => {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  Object.values(audioCache).forEach(audio => {
    audio.volume = clampedVolume;
  });
};