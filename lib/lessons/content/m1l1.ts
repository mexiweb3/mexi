import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const C4 = noteToMidi("C", 4);

export const m1l1: Lesson = {
  id: "m1l1",
  module: 1,
  orderInModule: 1,
  title: "Hola, teclado",
  estimatedMinutes: 5,
  isPremium: false,
  steps: [
    {
      kind: "intro",
      title: "Hola, teclado",
      narration:
        "Hola, soy Doli. Hoy vas a hacer sonar tu teclado por primera vez. Solo necesitamos una nota: Do.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration:
        "Mira: Do esta justo antes del grupo de dos teclas negras. Yo lo voy a tocar.",
      notes: [{ midi: C4, durationBeats: 2 }],
      tempoBpm: 70,
      highlightedMidis: [C4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "find_note",
        prompt: "Tu turno: encuentra el Do y pulsalo.",
        target: C4,
        hintAfterMs: 8000,
      },
    },
    {
      kind: "celebration",
      message: "Lo lograste. Tocaste tu primer Do.",
      badgeId: "first_do",
    },
  ],
};
