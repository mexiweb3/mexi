import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const C4 = noteToMidi("C", 4);
const D4 = noteToMidi("D", 4);
const E4 = noteToMidi("E", 4);
const F4 = noteToMidi("F", 4);
const G4 = noteToMidi("G", 4);
const A4 = noteToMidi("A", 4);
const B4 = noteToMidi("B", 4);
const C5 = noteToMidi("C", 5);

export const m1l3: Lesson = {
  id: "m1l3",
  module: 1,
  orderInModule: 3,
  title: "Toda la familia Do-Si",
  estimatedMinutes: 6,
  isPremium: false,
  steps: [
    {
      kind: "intro",
      title: "Toda la familia Do-Si",
      narration:
        "Las teclas blancas tienen siete nombres: Do, Re, Mi, Fa, Sol, La y Si. Hoy las conoces todas.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Escucha la familia entera, una a una.",
      notes: [
        { midi: C4, durationBeats: 1 },
        { midi: D4, durationBeats: 1 },
        { midi: E4, durationBeats: 1 },
        { midi: F4, durationBeats: 1 },
        { midi: G4, durationBeats: 1 },
        { midi: A4, durationBeats: 1 },
        { midi: B4, durationBeats: 1 },
        { midi: C5, durationBeats: 2 },
      ],
      tempoBpm: 90,
      highlightedMidis: [C4, D4, E4, F4, G4, A4, B4, C5],
    },
    {
      kind: "exercise",
      exercise: {
        type: "find_note",
        prompt: "Pulsa Fa. Es la primera tecla blanca despues del grupo de tres negras.",
        target: F4,
        hintAfterMs: 9000,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "find_note",
        prompt: "Ahora Sol. Esta entre dos negras del grupo de tres.",
        target: G4,
        hintAfterMs: 9000,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "find_note",
        prompt: "La sigue a Sol.",
        target: A4,
        hintAfterMs: 9000,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "find_note",
        prompt: "Y Si es la ultima antes del proximo Do.",
        target: B4,
        hintAfterMs: 9000,
      },
    },
    {
      kind: "celebration",
      message: "Conoces a toda la familia. Do, Re, Mi, Fa, Sol, La, Si.",
      badgeId: "steady_hand",
    },
  ],
};
