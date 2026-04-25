export type BadgeIcon = "star" | "flame" | "hand" | "ear" | "metronome";

export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  icon: BadgeIcon;
};

export const BADGE_CATALOG: readonly BadgeDef[] = [
  {
    id: "first_do",
    name: "Primer Do",
    description: "Tocaste tu primer Do en el teclado.",
    icon: "star",
  },
  {
    id: "five_in_a_row",
    name: "Cinco dias seguidos",
    description: "Practicaste cinco dias seguidos.",
    icon: "flame",
  },
  {
    id: "steady_hand",
    name: "Mano firme",
    description: "Mantuviste el pulso en una cancion completa.",
    icon: "hand",
  },
  {
    id: "sharp_ear",
    name: "Oido fino",
    description: "Reconociste cinco notas seguidas.",
    icon: "ear",
  },
  {
    id: "perfect_beat",
    name: "Ritmo perfecto",
    description: "Pasaste un ejercicio de ritmo sin errores.",
    icon: "metronome",
  },
] as const;

const BADGES = Object.fromEntries(BADGE_CATALOG.map((b) => [b.id, b])) as Record<
  string,
  BadgeDef
>;

export function getBadge(id: string): BadgeDef | null {
  return BADGES[id] ?? null;
}
