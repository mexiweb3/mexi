import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const C4 = noteToMidi("C", 4);
const D4 = noteToMidi("D", 4);
const E4 = noteToMidi("E", 4);
const F4 = noteToMidi("F", 4);
const G4 = noteToMidi("G", 4);

export const m1l4: Lesson = {
  id: "m1l4",
  module: 1,
  orderInModule: 4,
  title: "Mis cinco dedos pianistas",
  estimatedMinutes: 7,
  isPremium: false,
  steps: [
    {
      kind: "intro",
      title: "Mis cinco dedos pianistas",
      narration:
        "Cada dedo tiene un numero. Pulgar 1, indice 2, corazon 3, anular 4 y menique 5. Pon tus cinco dedos sobre Do, Re, Mi, Fa, Sol.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Sube uno por uno: 1, 2, 3, 4, 5. Un dedo, una nota.",
      notes: [
        { midi: C4, durationBeats: 1 },
        { midi: D4, durationBeats: 1 },
        { midi: E4, durationBeats: 1 },
        { midi: F4, durationBeats: 1 },
        { midi: G4, durationBeats: 2 },
      ],
      tempoBpm: 80,
      highlightedMidis: [C4, D4, E4, F4, G4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "repeat_pattern",
        prompt: "Tu turno. Sube: Do, Re, Mi, Fa, Sol.",
        pattern: [
          { midi: C4, durationBeats: 1 },
          { midi: D4, durationBeats: 1 },
          { midi: E4, durationBeats: 1 },
          { midi: F4, durationBeats: 1 },
          { midi: G4, durationBeats: 1 },
        ],
        tempoBpm: 70,
        toleranceMs: 1500,
      },
    },
    {
      kind: "demo",
      narration: "Y ahora baja: 5, 4, 3, 2, 1.",
      notes: [
        { midi: G4, durationBeats: 1 },
        { midi: F4, durationBeats: 1 },
        { midi: E4, durationBeats: 1 },
        { midi: D4, durationBeats: 1 },
        { midi: C4, durationBeats: 2 },
      ],
      tempoBpm: 80,
      highlightedMidis: [G4, F4, E4, D4, C4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "repeat_pattern",
        prompt: "Tu turno bajando: Sol, Fa, Mi, Re, Do.",
        pattern: [
          { midi: G4, durationBeats: 1 },
          { midi: F4, durationBeats: 1 },
          { midi: E4, durationBeats: 1 },
          { midi: D4, durationBeats: 1 },
          { midi: C4, durationBeats: 1 },
        ],
        tempoBpm: 70,
        toleranceMs: 1500,
      },
    },
    {
      kind: "celebration",
      message: "Cinco dedos, cinco notas. Estas listo para tocar tu primera melodia.",
      badgeId: "steady_hand",
    },
  ],
};
