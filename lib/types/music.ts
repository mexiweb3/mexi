export type NoteName =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export const NOTE_NAMES: NoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const SOLFEGE: Record<NoteName, string> = {
  C: "Do",
  "C#": "Do#",
  D: "Re",
  "D#": "Re#",
  E: "Mi",
  F: "Fa",
  "F#": "Fa#",
  G: "Sol",
  "G#": "Sol#",
  A: "La",
  "A#": "La#",
  B: "Si",
};

export type Note = {
  midi: number;
  name: NoteName;
  octave: number;
  isBlack: boolean;
};

export function midiToNote(midi: number): Note {
  const idx = ((midi % 12) + 12) % 12;
  const name = NOTE_NAMES[idx];
  const octave = Math.floor(midi / 12) - 1;
  return { midi, name, octave, isBlack: name.includes("#") };
}

export function noteToMidi(name: NoteName, octave: number): number {
  return 12 * (octave + 1) + NOTE_NAMES.indexOf(name);
}

export type LabelMode = "es" | "en" | "off";

export function noteLabel(note: Note, mode: LabelMode): string {
  if (mode === "off") return "";
  if (mode === "es") return SOLFEGE[note.name];
  return note.name;
}
