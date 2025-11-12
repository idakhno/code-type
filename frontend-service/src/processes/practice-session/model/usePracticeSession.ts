import { useState, useEffect, useCallback } from "react";

import { practiceModel } from "@/entities/practice";
import { historyModel } from "@/entities/history";

type PracticeLanguage = practiceModel.PracticeLanguage;
type PracticeResult = practiceModel.PracticeResult;

interface PracticeSessionApi {
  language: PracticeLanguage;
  snippet: string;
  currentIndex: number;
  errors: Set<number>;
  isStarted: boolean;
  isPaused: boolean;
  isFinished: boolean;
  timeElapsed: number;
  wpm: number;
  accuracy: number;
  lastResult: PracticeResult | null;
  start: () => boolean;
  togglePause: () => boolean;
  stop: () => boolean;
  restart: () => void;
  newTest: () => void;
  changeLanguage: (language: PracticeLanguage) => void;
  clearLastResult: () => void;
}

const usePracticeSession = (): PracticeSessionApi => {
  const [language, setLanguage] = useState<PracticeLanguage>("javascript");
  const [snippet, setSnippet] = useState<string>(() => practiceModel.getInitialSnippet("javascript"));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [lastResult, setLastResult] = useState<PracticeResult | null>(null);

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setErrors(new Set());
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setStartTime(null);
    setPausedTime(0);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
    setLastResult(null);
  }, []);

  const updateWpm = useCallback((chars: number, seconds: number) => {
    setWpm(practiceModel.calculateWpm(chars, seconds));
  }, []);

  const loadSnippet = useCallback(
    (lang: PracticeLanguage) => {
      const newSnippet = practiceModel.getRandomSnippet(lang);
      setSnippet(newSnippet);
      resetSession();
    },
    [resetSession],
  );

  useEffect(() => {
    let interval: number | undefined;
    if (isStarted && !isPaused && !isFinished && startTime) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime - pausedTime) / 1000);
        setTimeElapsed(elapsed);
        updateWpm(currentIndex, elapsed);
      }, 100);
    }
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isStarted, isPaused, isFinished, startTime, pausedTime, currentIndex, updateWpm]);

  const finishSession = useCallback(
    (finalAccuracy: number) => {
      const result: PracticeResult = {
        wpm,
        accuracy: finalAccuracy,
        errors: errors.size,
        time: timeElapsed,
        language,
        date: new Date().toISOString(),
      };
      historyModel.addHistoryEntry(result);
      setLastResult(result);
    },
    [wpm, errors, timeElapsed, language],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!isStarted || isPaused || isFinished) {
        return;
      }

      let char = event.key;
      const expectedChar = snippet[currentIndex];

      if (char === "Enter") {
        event.preventDefault();
        char = "\n";
      } else if (char === "Tab") {
        event.preventDefault();
        char = "\t";
      }

      if (char === expectedChar) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);

        if (newIndex === snippet.length) {
          setIsFinished(true);
          const finalAccuracy = practiceModel.calculateAccuracy(snippet.length, errors.size);
          setAccuracy(finalAccuracy);
          finishSession(finalAccuracy);
        }
      } else if (char.length === 1) {
        const newErrors = new Set(errors);
        newErrors.add(currentIndex);
        setErrors(newErrors);
        const currentAccuracy = practiceModel.calculateAccuracy(Math.max(currentIndex, 1), newErrors.size);
        setAccuracy(currentAccuracy);
      }
    },
    [isStarted, isPaused, isFinished, snippet, currentIndex, errors, finishSession],
  );

  useEffect(() => {
    if (isStarted && !isPaused && !isFinished) {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [isStarted, isPaused, isFinished, handleKeyPress]);

  const start = () => {
    if (isStarted) {
      return false;
    }
    setIsStarted(true);
    setStartTime(Date.now());
    setLastResult(null);
    return true;
  };

  const togglePause = () => {
    if (!isStarted || isFinished) {
      return false;
    }

    setPausedTime((prev) => (isPaused && startTime ? prev : prev + (startTime ? Date.now() - startTime : 0)));
    setStartTime(Date.now());
    setIsPaused((prev) => !prev);
    return !isPaused;
  };

  const stop = () => {
    if (!isStarted || isFinished) {
      return false;
    }
    setIsFinished(true);
    return true;
  };

  const restart = () => {
    resetSession();
    setIsStarted(true);
    setStartTime(Date.now());
  };

  const newTest = () => {
    loadSnippet(language);
  };

  const changeLanguage = (lang: PracticeLanguage) => {
    setLanguage(lang);
    loadSnippet(lang);
  };

  const clearLastResult = () => setLastResult(null);

  return {
    language,
    snippet,
    currentIndex,
    errors,
    isStarted,
    isPaused,
    isFinished,
    timeElapsed,
    wpm,
    accuracy,
    lastResult,
    start,
    togglePause,
    stop,
    restart,
    newTest,
    changeLanguage,
    clearLastResult,
  };
};

export { usePracticeSession };

