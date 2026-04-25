"use client";

import type { Exercise, ExerciseResult } from "@/lib/lessons/schema";

import FindNote from "./exercises/FindNote";
import PlaySong from "./exercises/PlaySong";
import RepeatPattern from "./exercises/RepeatPattern";

type Props = {
  exercise: Exercise;
  onResult: (r: ExerciseResult) => void;
  onNoteOn?: (midi: number) => void;
};

/**
 * Pure dispatch: picks the right exercise component for the given exercise
 * variant and forwards props. Leaves all logic to the children.
 */
export default function ExerciseHost({
  exercise,
  onResult,
  onNoteOn,
}: Props) {
  switch (exercise.type) {
    case "find_note":
      return (
        <FindNote
          exercise={exercise}
          onResult={onResult}
          onNoteOn={onNoteOn}
        />
      );
    case "repeat_pattern":
      return (
        <RepeatPattern
          exercise={exercise}
          onResult={onResult}
          onNoteOn={onNoteOn}
        />
      );
    case "play_song":
      return (
        <PlaySong
          exercise={exercise}
          onResult={onResult}
          onNoteOn={onNoteOn}
        />
      );
    default: {
      // Exhaustiveness guard.
      const _exhaustive: never = exercise;
      return _exhaustive;
    }
  }
}
