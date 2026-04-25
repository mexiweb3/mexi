import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const C3 = noteToMidi("C", 3);
const E3 = noteToMidi("E", 3);
const G3 = noteToMidi("G", 3);
const C4 = noteToMidi("C", 4);
const E4 = noteToMidi("E", 4);
const G4 = noteToMidi("G", 4);

export const m2l3: Lesson = {
  id: "m2l3",
  module: 2,
  orderInModule: 3,
  title: "Manos al teclado",
  estimatedMinutes: 7,
  isPremium: true,
  steps: [
    {
      kind: "intro",
      title: "Manos al teclado",
      narration:
        "Tu mano derecha ya conoce el camino. Hoy invitamos a la izquierda. Vive en las teclas mas graves.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Escucha: la mano izquierda toca grave, la derecha toca agudo.",
      notes: [
        { midi: C3, durationBeats: 1 },
        { midi: E3, durationBeats: 1 },
        { midi: G3, durationBeats: 1 },
        { midi: C4, durationBeats: 1 },
        { midi: E4, durationBeats: 1 },
        { midi: G4, durationBeats: 2 },
      ],
      tempoBpm: 80,
      highlightedMidis: [C3, E3, G3, C4, E4, G4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "find_note",
        prompt: "Encuentra el Do grave. Esta a la izquierda del Do central.",
        target: C3,
        hintAfterMs: 9000,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "repeat_pattern",
        prompt: "Repite con la mano izquierda: Do grave, Mi grave, Sol grave.",
        pattern: [
          { midi: C3, durationBeats: 1 },
          { midi: E3, durationBeats: 1 },
          { midi: G3, durationBeats: 1 },
        ],
        tempoBpm: 70,
        toleranceMs: 1500,
      },
    },
    {
      kind: "celebration",
      message: "Las dos manos saludan al teclado. Pronto tocaran juntas.",
      badgeId: "steady_hand",
    },
  ],
};
