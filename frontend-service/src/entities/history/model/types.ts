import type { PracticeLanguage, PracticeResult } from "@/entities/practice";

export interface HistoryEntry {
  id: string;
  language: PracticeLanguage;
  wpm: number;
  accuracy: number;
  errors: number;
  time: number;
  date: string;
  createdAt?: string;
  completedAt?: string;
}

export type HistoryInput = PracticeResult;

