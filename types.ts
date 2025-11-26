export interface VoiceSample {
  id: string;
  name: string;
  url: string;
  buffer: AudioBuffer | null;
  duration: number;
}

export interface GeneratedAudio {
  id: string;
  text: string;
  style: string;
  timestamp: number;
  audioUrl: string; // Blob URL
  duration: number;
}

export enum Emotion {
  NEUTRAL = 'Neutral',
  CHEERFUL = 'Cheerful',
  SERIOUS = 'Serious',
  SAD = 'Sad',
  EXCITED = 'Excited',
  WHISPERING = 'Whispering',
}

export enum PrebuiltVoice {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
}
