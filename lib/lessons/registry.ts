import type { Lesson } from "@/lib/lessons/schema";
import { m1l1 } from "@/lib/lessons/content/m1l1";
import { m1l2 } from "@/lib/lessons/content/m1l2";
import { m1l3 } from "@/lib/lessons/content/m1l3";
import { m1l4 } from "@/lib/lessons/content/m1l4";
import { m1l5 } from "@/lib/lessons/content/m1l5";

export const LESSON_LIST: readonly Lesson[] = [m1l1, m1l2, m1l3, m1l4, m1l5] as const;

const LESSONS: Record<string, Lesson> = Object.fromEntries(
  LESSON_LIST.map((l) => [l.id, l]),
);

export function getLesson(id: string): Lesson | null {
  return LESSONS[id] ?? null;
}

export function getNextLessonId(currentId: string): string | null {
  const idx = LESSON_LIST.findIndex((l) => l.id === currentId);
  if (idx < 0 || idx >= LESSON_LIST.length - 1) return null;
  return LESSON_LIST[idx + 1].id;
}

export type LessonCatalogEntry = {
  id: string;
  module: number;
  order: number;
  title: string;
  premium: boolean;
  ready: boolean;
};

export const LESSON_CATALOG: readonly LessonCatalogEntry[] = [
  { id: "m1l1", module: 1, order: 1, title: "Hola, teclado", premium: false, ready: true },
  { id: "m1l2", module: 1, order: 2, title: "Mis amigas las teclas blancas", premium: false, ready: true },
  { id: "m1l3", module: 1, order: 3, title: "Toda la familia Do-Si", premium: false, ready: true },
  { id: "m1l4", module: 1, order: 4, title: "Mis cinco dedos pianistas", premium: false, ready: true },
  { id: "m1l5", module: 1, order: 5, title: "Mi primera melodia", premium: false, ready: true },
  { id: "m2l1", module: 2, order: 1, title: "El pulso del corazon", premium: true, ready: false },
  { id: "m2l2", module: 2, order: 2, title: "Notas largas, notas cortas", premium: true, ready: false },
  { id: "m2l3", module: 2, order: 3, title: "Manos al teclado", premium: true, ready: false },
  { id: "m2l4", module: 2, order: 4, title: "Mi segunda cancion", premium: true, ready: false },
  { id: "m2l5", module: 2, order: 5, title: "Mi primer concierto", premium: true, ready: false },
];
