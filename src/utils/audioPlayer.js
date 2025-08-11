// src/utils/audioPlayer.js

// 어떤 환경에서도 public 폴더의 경로를 정확히 찾도록 수정
const getAudioPath = (filename) => `${process.env.PUBLIC_URL}/assets/${filename}`;

const audioCache = {
  correct: new Audio(getAudioPath('dingdongdaeng.mp3')),
  incorrect: new Audio(getAudioPath('bbibbic.mp3')),
};

let currentAudio = null;

Object.values(audioCache).forEach(audio => {
  audio.volume = 0.7;
  audio.preload = 'auto';
});

export const initializeAudio = () => {
  console.log('Audio: Initializing...');
  Object.values(audioCache).forEach(audio => {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(error => {
        console.log('Audio initialization requires user interaction.');
      });
    }
  });
};

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