import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const C4 = noteToMidi("C", 4);

export const m2l1: Lesson = {
  id: "m2l1",
  module: 2,
  orderInModule: 1,
  title: "El pulso del corazon",
  estimatedMinutes: 6,
  isPremium: true,
  steps: [
    {
      kind: "intro",
      title: "El pulso del corazon",
      narration:
        "La musica tiene un pulso, como tu corazon. Hoy vas a sentirlo y tocarlo.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Cuatro pulsos seguidos en Do. Pum, pum, pum, pum.",
      notes: [
        { midi: C4, durationBeats: 1 },
        { midi: C4, durationBeats: 1 },
        { midi: C4, durationBeats: 1 },
        { midi: C4, durationBeats: 1 },
      ],
      tempoBpm: 80,
      highlightedMidis: [C4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "play_song",
        prompt: "Sigue el pulso. Toca Do cuatro veces, una por cada caja que cae.",
        score: [
          { midi: C4, durationBeats: 1 },
          { midi: C4, durationBeats: 1 },
          { midi: C4, durationBeats: 1 },
          { midi: C4, durationBeats: 1 },
        ],
        tempoBpm: 70,
        passThreshold: 0.6,
      },
    },
    {
      kind: "celebration",
      message: "Sentiste el pulso. Ahora la musica vive en ti.",
      badgeId: "perfect_beat",
    },
  ],
};
