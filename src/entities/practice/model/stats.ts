const calculateWpm = (chars: number, seconds: number): number => {
  if (seconds <= 0) {
    return 0;
  }
  const words = chars / 5;
  const minutes = seconds / 60;
  return Math.round(words / minutes);
};

const calculateAccuracy = (totalChars: number, errorCount: number): number => {
  if (totalChars === 0) {
    return 100;
  }
  const correctChars = totalChars - errorCount;
  const accuracy = (correctChars / totalChars) * 100;
  return Math.max(0, Math.round(accuracy));
};

export { calculateWpm, calculateAccuracy };

