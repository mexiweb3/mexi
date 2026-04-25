import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const C4 = noteToMidi("C", 4);
const D4 = noteToMidi("D", 4);
const E4 = noteToMidi("E", 4);

// "Mary tuvo un corderito" — primera frase: Mi Re Do Re Mi Mi Mi
const melody = [
  { midi: E4, durationBeats: 1 },
  { midi: D4, durationBeats: 1 },
  { midi: C4, durationBeats: 1 },
  { midi: D4, durationBeats: 1 },
  { midi: E4, durationBeats: 1 },
  { midi: E4, durationBeats: 1 },
  { midi: E4, durationBeats: 2 },
];

export const m1l5: Lesson = {
  id: "m1l5",
  module: 1,
  orderInModule: 5,
  title: "Mi primera melodia",
  estimatedMinutes: 7,
  isPremium: false,
  steps: [
    {
      kind: "intro",
      title: "Mi primera melodia",
      narration:
        "Hoy tocas tu primera cancion: 'Mary tuvo un corderito'. Solo necesitas Do, Re y Mi.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Asi suena. Escucha bien el orden de las notas.",
      notes: melody,
      tempoBpm: 80,
      highlightedMidis: [C4, D4, E4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "repeat_pattern",
        prompt: "Repite la melodia: Mi, Re, Do, Re, Mi, Mi, Mi.",
        pattern: melody,
        tempoBpm: 70,
        toleranceMs: 1800,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "play_song",
        prompt: "Ahora con las notas que caen: tocalas a tiempo.",
        score: melody,
        tempoBpm: 70,
        passThreshold: 0.6,
      },
    },
    {
      kind: "celebration",
      message: "Tu primera cancion de verdad. Tocaste 'Mary tuvo un corderito'.",
      badgeId: "perfect_beat",
    },
  ],
};
