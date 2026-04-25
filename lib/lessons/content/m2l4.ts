import type { Lesson } from "@/lib/lessons/schema";
import { noteToMidi } from "@/lib/types/music";

const G3 = noteToMidi("G", 3);
const A3 = noteToMidi("A", 3);
const B3 = noteToMidi("B", 3);
const C4 = noteToMidi("C", 4);
const D4 = noteToMidi("D", 4);
const E4 = noteToMidi("E", 4);
const F4 = noteToMidi("F", 4);
const G4 = noteToMidi("G", 4);

// "Cumpleanos feliz" en Do mayor, primeras dos frases.
// Sol Sol La Sol Do Si  /  Sol Sol La Sol Re Do
const happyBirthday = [
  { midi: G3, durationBeats: 0.75 },
  { midi: G3, durationBeats: 0.25 },
  { midi: A3, durationBeats: 1 },
  { midi: G3, durationBeats: 1 },
  { midi: C4, durationBeats: 1 },
  { midi: B3, durationBeats: 2 },
  { midi: G3, durationBeats: 0.75 },
  { midi: G3, durationBeats: 0.25 },
  { midi: A3, durationBeats: 1 },
  { midi: G3, durationBeats: 1 },
  { midi: D4, durationBeats: 1 },
  { midi: C4, durationBeats: 2 },
];

// Frases simplificadas para el modo repeat_pattern (sin ritmo punteado).
const happyBirthdaySimple = [
  { midi: G3, durationBeats: 1 },
  { midi: G3, durationBeats: 1 },
  { midi: A3, durationBeats: 1 },
  { midi: G3, durationBeats: 1 },
  { midi: C4, durationBeats: 1 },
  { midi: B3, durationBeats: 1 },
];

export const m2l4: Lesson = {
  id: "m2l4",
  module: 2,
  orderInModule: 4,
  title: "Mi segunda cancion",
  estimatedMinutes: 7,
  isPremium: true,
  steps: [
    {
      kind: "intro",
      title: "Mi segunda cancion",
      narration:
        "Hoy tocas 'Cumpleanos feliz'. Si la dominas, podras tocarla en cualquier fiesta.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Asi suena la primera frase.",
      notes: happyBirthdaySimple,
      tempoBpm: 80,
      highlightedMidis: [G3, A3, B3, C4, D4, E4, F4, G4],
    },
    {
      kind: "exercise",
      exercise: {
        type: "repeat_pattern",
        prompt: "Repite la primera frase: Sol Sol La Sol Do Si.",
        pattern: happyBirthdaySimple,
        tempoBpm: 70,
        toleranceMs: 1800,
      },
    },
    {
      kind: "exercise",
      exercise: {
        type: "play_song",
        prompt: "Las dos frases con el ritmo correcto. Tu puedes.",
        score: happyBirthday,
        tempoBpm: 80,
        passThreshold: 0.55,
      },
    },
    {
      kind: "celebration",
      message: "Felicidades. Acabas de aprender 'Cumpleanos feliz'.",
      badgeId: "perfect_beat",
    },
  ],
};
