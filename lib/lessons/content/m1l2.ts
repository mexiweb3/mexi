import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const C4 = noteToMidi("C", 4);
const D4 = noteToMidi("D", 4);
const E4 = noteToMidi("E", 4);

export const m1l2: Lesson = {
  id: "m1l2",
  module: 1,
  orderInModule: 2,
  title: "Mis amigas las teclas blancas",
  estimatedMinutes: 6,
  isPremium: false,
  steps: [
    {
      kind: "intro",
      title: "Mis amigas las teclas blancas",
      narration:
        "Las teclas blancas son tus amigas. Cada una tiene un nombre. Hoy te presento a tres: Do, Re y Mi.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Escucha: Do, Re, Mi. Las tres estan juntas, una al lado de la otra.",
      notes: [
        { midi: C4, durationBeats: 1 },
        { midi: D4, durationBeats: 1 },
        { midi: E4, durationBeats: 1 },
      ],
      tempoBpm: 80,
      highlightedMidis: [C4, D4, E4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "find_note",
        prompt: "Pulsa Re. Esta entre las dos teclas negras del primer grupo.",
        target: D4,
        hintAfterMs: 9000,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "find_note",
        prompt: "Ahora Mi. Esta justo despues de Re.",
        target: E4,
        hintAfterMs: 9000,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "repeat_pattern",
        prompt: "Repite el patron: Do, Re, Mi.",
        pattern: [
          { midi: C4, durationBeats: 1 },
          { midi: D4, durationBeats: 1 },
          { midi: E4, durationBeats: 1 },
        ],
        tempoBpm: 70,
        toleranceMs: 1500,
      },
    },
    {
      kind: "celebration",
      message: "Excelente. Ahora conoces Do, Re y Mi.",
      badgeId: "sharp_ear",
    },
  ],
};
