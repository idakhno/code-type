export type PracticeLanguage = "javascript" | "python" | "go";

export interface PracticeState {
  language: PracticeLanguage;
  snippet: string;
  currentIndex: number;
  errors: Set<number>;
  isStarted: boolean;
  isPaused: boolean;
  isFinished: boolean;
  startTime: number | null;
  pausedTime: number;
  timeElapsed: number;
}

export interface PracticeResult {
  wpm: number;
  accuracy: number;
  errors: number;
  time: number;
  language: PracticeLanguage;
  date: string;
}

