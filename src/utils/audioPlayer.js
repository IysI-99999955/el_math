// src/utils/audioPlayer.js
const getAudioPath = (filename) => {
  if (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL + `/assets/${filename}`;
  }
  return `/assets/${filename}`;
};

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
  console.log('Audio: Initializing audio...');
  Object.values(audioCache).forEach(audio => {
    audio.load();
    audio.play().then(() => {
      console.log('Audio: Playback permission granted.');
      audio.pause();
      audio.currentTime = 0;
    }).catch(error => {
      console.warn('Audio: Playback failed on initialization (this is normal for browser policy):', error);
    });
  });
};

export const playSound = (type) => {
  if (currentAudio && !currentAudio.ended) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  const audio = audioCache[type];
  
  if (!audio) {
    console.warn(`Audio: Unknown sound type: ${type}`);
    return;
  }

  audio.currentTime = 0;
  currentAudio = audio;
  
  audio.play().then(() => {
    console.log(`Audio: Playing sound type: ${type}`);
  }).catch(error => {
    console.error(`Audio: Playback failed for ${type}:`, error);
  });

  audio.onended = () => {
    if (currentAudio === audio) {
      currentAudio = null;
    }
  };
};

export const stopAllAudio = () => {
  Object.values(audioCache).forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  currentAudio = null;
};