import type { HistoryEntry, HistoryInput } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4455";
const HISTORY_ENDPOINT = `${API_BASE_URL}/api/private/history`;

interface HistoryResponse {
  id: string;
  language: string;
  wpm: number;
  accuracy: number;
  errors: number;
  time: number;
  date: string;
  created_at?: string;
  completed_at?: string;
}

interface ErrorResponse {
  error?: string;
  message?: string;
  code?: string;
}

const parseHistoryEntry = (entry: HistoryResponse): HistoryEntry => ({
  id: entry.id,
  language: entry.language as HistoryEntry["language"],
  wpm: entry.wpm,
  accuracy: entry.accuracy,
  errors: entry.errors,
  time: entry.time,
  date: entry.date,
  createdAt: entry.created_at,
  completedAt: entry.completed_at,
});

const parseError = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as ErrorResponse;
    if (data?.message) {
      return data.message;
    }
  } catch {
    // Ignore JSON parse errors and fall back to status text
  }
  return response.statusText || "Unexpected error";
};

const getHistory = async (limit = 50): Promise<HistoryEntry[]> => {
  const url = new URL(HISTORY_ENDPOINT);
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as HistoryResponse[];
  return data.map(parseHistoryEntry);
};

const addHistoryEntry = async (entry: HistoryInput): Promise<HistoryEntry> => {
  const response = await fetch(HISTORY_ENDPOINT, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      language: entry.language,
      wpm: entry.wpm,
      accuracy: entry.accuracy,
      errors: entry.errors,
      time: entry.time,
      date: entry.date,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as HistoryResponse;
  return parseHistoryEntry(data);
};

const clearHistory = async (): Promise<void> => {
  const response = await fetch(HISTORY_ENDPOINT, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(await parseError(response));
  }
};

export { getHistory, addHistoryEntry, clearHistory };

