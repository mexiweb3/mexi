import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const C4 = noteToMidi("C", 4);
const D4 = noteToMidi("D", 4);
const E4 = noteToMidi("E", 4);
const G4 = noteToMidi("G", 4);

export const m2l2: Lesson = {
  id: "m2l2",
  module: 2,
  orderInModule: 2,
  title: "Notas largas, notas cortas",
  estimatedMinutes: 6,
  isPremium: true,
  steps: [
    {
      kind: "intro",
      title: "Notas largas, notas cortas",
      narration:
        "Algunas notas duran mucho. Otras pasan rapido. Vamos a oirlas y a tocarlas.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Larga, corta, corta, larga.",
      notes: [
        { midi: C4, durationBeats: 2 },
        { midi: D4, durationBeats: 0.5 },
        { midi: E4, durationBeats: 0.5 },
        { midi: G4, durationBeats: 2 },
      ],
      tempoBpm: 80,
      highlightedMidis: [C4, D4, E4, G4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "play_song",
        prompt: "Toca cada nota cuando la caja larga toque la linea. Larga vale dos.",
        score: [
          { midi: C4, durationBeats: 2 },
          { midi: D4, durationBeats: 0.5 },
          { midi: E4, durationBeats: 0.5 },
          { midi: G4, durationBeats: 2 },
        ],
        tempoBpm: 70,
        passThreshold: 0.6,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "play_song",
        prompt: "Una mas dificil: corta, corta, corta, larga, larga.",
        score: [
          { midi: C4, durationBeats: 0.5 },
          { midi: D4, durationBeats: 0.5 },
          { midi: E4, durationBeats: 0.5 },
          { midi: G4, durationBeats: 2 },
          { midi: C4, durationBeats: 2 },
        ],
        tempoBpm: 70,
        passThreshold: 0.6,
      },
    },
    {
      kind: "celebration",
      message: "Notas largas y cortas. Ya entiendes el ritmo.",
      badgeId: "perfect_beat",
    },
  ],
};
