import type { HistoryEntry } from "./types";

const HISTORY_KEY = "typingHistory";
const HISTORY_LIMIT = 50;

const readHistory = (): HistoryEntry[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(HISTORY_KEY);
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeHistory = (entries: HistoryEntry[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
};

const getHistory = (): HistoryEntry[] => {
  return readHistory();
};

const addHistoryEntry = (entry: HistoryEntry): void => {
  if (typeof window === "undefined") {
    return;
  }

  const history = readHistory();
  history.unshift(entry);
  writeHistory(history);
};

const clearHistory = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(HISTORY_KEY);
};

export { getHistory, addHistoryEntry, clearHistory };

