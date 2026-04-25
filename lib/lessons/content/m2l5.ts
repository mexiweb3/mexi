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

// "Estrellita donde estas" en Do mayor (Twinkle Twinkle Little Star).
// Do Do Sol Sol La La Sol  /  Fa Fa Mi Mi Re Re Do
const twinkle = [
  { midi: C4, durationBeats: 1 },
  { midi: C4, durationBeats: 1 },
  { midi: G4, durationBeats: 1 },
  { midi: G4, durationBeats: 1 },
  { midi: A4, durationBeats: 1 },
  { midi: A4, durationBeats: 1 },
  { midi: G4, durationBeats: 2 },
  { midi: F4, durationBeats: 1 },
  { midi: F4, durationBeats: 1 },
  { midi: E4, durationBeats: 1 },
  { midi: E4, durationBeats: 1 },
  { midi: D4, durationBeats: 1 },
  { midi: D4, durationBeats: 1 },
  { midi: C4, durationBeats: 2 },
];

export const m2l5: Lesson = {
  id: "m2l5",
  module: 2,
  orderInModule: 5,
  title: "Mi primer concierto",
  estimatedMinutes: 8,
  isPremium: true,
  steps: [
    {
      kind: "intro",
      title: "Mi primer concierto",
      narration:
        "Hoy tocas 'Estrellita donde estas' de principio a fin. Es tu concierto.",
      mascotState: "encouraging",
    },
    {
      kind: "demo",
      narration: "Escucha la cancion entera.",
      notes: twinkle,
      tempoBpm: 90,
      highlightedMidis: [C4, D4, E4, F4, G4, A4, B4, C5],
    },
    {
      kind: "exercise",
      exercise: {
        type: "play_song",
        prompt: "Tu turno: tocala completa. No importa si fallas alguna nota, sigue.",
        score: twinkle,
        tempoBpm: 85,
        passThreshold: 0.5,
      },
    },
    {
      kind: "celebration",
      message: "Tu primer concierto. Estas listo para tocar para tu familia.",
      badgeId: "five_in_a_row",
    },
  ],
};
