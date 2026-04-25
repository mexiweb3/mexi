import type { Exercise, ExerciseResult } from "@/lib/lessons/schema";

/**
 * Common props every exercise component receives. Generic over the exercise
 * variant so individual components can narrow without casts.
 */
export type ExerciseProps<E extends Exercise> = {
  exercise: E;
  onResult: (r: ExerciseResult) => void;
  /** Optional hook for the runner to mirror MIDI input from external sources. */
  onNoteOn?: (midi: number) => void;
};
