"use client";

import { create } from "zustand";

/**
 * Ephemeral state for the currently running lesson. Not persisted: when the
 * tab closes or the user navigates away the run is gone.
 */
export type LessonRunState = {
  lessonId: string | null;
  stepIndex: number;
  startedAt: number | null;
  wrongAttemptsTotal: number;
  perStepStars: number[];
  set: (partial: Partial<LessonRunSnapshot>) => void;
  reset: () => void;
};

export type LessonRunSnapshot = {
  lessonId: string | null;
  stepIndex: number;
  startedAt: number | null;
  wrongAttemptsTotal: number;
  perStepStars: number[];
};

const INITIAL: LessonRunSnapshot = {
  lessonId: null,
  stepIndex: 0,
  startedAt: null,
  wrongAttemptsTotal: 0,
  perStepStars: [],
};

export const useLessonRun = create<LessonRunState>((set) => ({
  ...INITIAL,
  set: (partial) => set(partial),
  reset: () => set({ ...INITIAL }),
}));
