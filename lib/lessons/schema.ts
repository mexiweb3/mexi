import { z } from "zod";

export const NoteEventSchema = z.object({
  midi: z.number().int().min(0).max(127),
  durationBeats: z.number().positive().default(1),
});
export type NoteEvent = z.infer<typeof NoteEventSchema>;

export const NoteSeqSchema = z.array(NoteEventSchema);
export type NoteSeq = z.infer<typeof NoteSeqSchema>;

export const FindNoteExerciseSchema = z.object({
  type: z.literal("find_note"),
  prompt: z.string(),
  target: z.number().int().min(0).max(127),
  hintAfterMs: z.number().int().positive().default(8000),
});
export type FindNoteExercise = z.infer<typeof FindNoteExerciseSchema>;

export const RepeatPatternExerciseSchema = z.object({
  type: z.literal("repeat_pattern"),
  prompt: z.string(),
  pattern: NoteSeqSchema,
  tempoBpm: z.number().positive().default(80),
  toleranceMs: z.number().int().positive().default(800),
});
export type RepeatPatternExercise = z.infer<typeof RepeatPatternExerciseSchema>;

export const PlaySongExerciseSchema = z.object({
  type: z.literal("play_song"),
  prompt: z.string(),
  score: NoteSeqSchema,
  tempoBpm: z.number().positive().default(80),
  passThreshold: z.number().min(0).max(1).default(0.7),
});
export type PlaySongExercise = z.infer<typeof PlaySongExerciseSchema>;

export const ExerciseSchema = z.discriminatedUnion("type", [
  FindNoteExerciseSchema,
  RepeatPatternExerciseSchema,
  PlaySongExerciseSchema,
]);
export type Exercise = z.infer<typeof ExerciseSchema>;

export const MascotStateSchema = z.enum(["idle", "celebrating", "encouraging"]);
export type MascotStateKind = z.infer<typeof MascotStateSchema>;

export const LessonStepSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("intro"),
    title: z.string(),
    narration: z.string(),
    mascotState: MascotStateSchema.default("encouraging"),
  }),
  z.object({
    kind: z.literal("demo"),
    narration: z.string(),
    notes: NoteSeqSchema,
    tempoBpm: z.number().positive().default(80),
    highlightedMidis: z.array(z.number().int()).optional(),
  }),
  z.object({
    kind: z.literal("exercise"),
    exercise: ExerciseSchema,
  }),
  z.object({
    kind: z.literal("celebration"),
    message: z.string(),
    badgeId: z.string().optional(),
  }),
]);
export type LessonStep = z.infer<typeof LessonStepSchema>;

export const LessonSchema = z.object({
  id: z.string(),
  module: z.number().int().positive(),
  orderInModule: z.number().int().positive(),
  title: z.string(),
  estimatedMinutes: z.number().int().positive(),
  isPremium: z.boolean(),
  steps: z.array(LessonStepSchema).min(1),
});
export type Lesson = z.infer<typeof LessonSchema>;

export type ExerciseResult = {
  passed: boolean;
  accuracy: number;
  attempts: number;
  durationMs: number;
};

export function starsForResult(result: ExerciseResult): 0 | 1 | 2 | 3 {
  if (!result.passed) return 0;
  if (result.accuracy >= 0.95 && result.attempts <= 1) return 3;
  if (result.accuracy >= 0.8) return 2;
  return 1;
}
