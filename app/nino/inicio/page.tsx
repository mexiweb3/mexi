"use client";

import Link from "next/link";
import { Lock, Star } from "lucide-react";

import { cn } from "@/lib/cn";
import { Mascot } from "@/components/mascot/Mascot";
import { useChildProfile } from "@/store/childProfile";

type Lesson = {
  id: number;
  title: string;
  premium: boolean;
};

const LESSONS: ReadonlyArray<Lesson> = [
  { id: 1, title: "Conoce el piano", premium: false },
  { id: 2, title: "El nombre de las notas", premium: false },
  { id: 3, title: "Toca tu primera melodia", premium: false },
  { id: 4, title: "Manos y dedos", premium: false },
  { id: 5, title: "Ritmo facil", premium: false },
  { id: 6, title: "Acordes basicos", premium: true },
  { id: 7, title: "Lectura inicial", premium: true },
  { id: 8, title: "Manos juntas", premium: true },
  { id: 9, title: "Canciones cortas", premium: true },
  { id: 10, title: "Mini recital", premium: true },
];

function LessonCard({
  lesson,
  highlight,
}: {
  lesson: Lesson;
  highlight: boolean;
}) {
  const isLocked = lesson.premium;
  const className = cn(
    "flex items-center gap-4 rounded-3xl border-4 bg-white p-4 shadow-[0_6px_0_0_#ffd87a] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
    isLocked
      ? "border-brand-100 opacity-80"
      : "border-brand-200 hover:border-brand-300",
    highlight && !isLocked && "border-brand-500 motion-safe:animate-bounceSoft"
  );

  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold",
          isLocked
            ? "bg-brand-100 text-brand-600"
            : "bg-brand-400 text-brand-900"
        )}
      >
        {isLocked ? <Lock className="h-6 w-6" strokeWidth={2.5} /> : lesson.id}
      </span>
      <span className="flex flex-1 flex-col text-left">
        <span className="text-base font-extrabold leading-tight text-brand-900">
          {lesson.title}
        </span>
        {highlight && !isLocked ? (
          <span className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-600">
            Empezar aqui
          </span>
        ) : isLocked ? (
          <span className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-600">
            Premium
          </span>
        ) : (
          <span className="mt-1 text-xs font-semibold text-brand-700">
            Leccion {lesson.id}
          </span>
        )}
        <span
          className="mt-2 flex items-center gap-1"
          aria-label="Cero estrellas obtenidas"
        >
          {[0, 1, 2].map((i) => (
            <Star
              key={i}
              aria-hidden="true"
              className="h-4 w-4 text-brand-300"
              strokeWidth={2.25}
            />
          ))}
        </span>
      </span>
    </>
  );

  if (isLocked) {
    return (
      <div
        role="button"
        aria-disabled="true"
        aria-label={`Leccion ${lesson.id} bloqueada: ${lesson.title}`}
        className={cn(className, "cursor-not-allowed")}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/nino/leccion/${lesson.id}`}
      aria-label={`Abrir leccion ${lesson.id}: ${lesson.title}`}
      className={className}
    >
      {inner}
    </Link>
  );
}

export default function NinoInicioPage() {
  const activeChild = useChildProfile((s) => s.activeChild);
  const name = activeChild?.name ?? "amigo";

  return (
    <section>
      <div className="flex items-center gap-4">
        <Mascot state="idle" size={88} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Hola
          </p>
          <h1 className="text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
            {name}!
          </h1>
          <p className="mt-1 text-sm text-brand-800">
            Listo para tu siguiente aventura?
          </p>
        </div>
      </div>

      <ol
        aria-label="Mapa de lecciones"
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {LESSONS.map((lesson, idx) => (
          <li
            key={lesson.id}
            className={cn(
              "list-none",
              // Subtle horizontal stagger on >=sm screens to evoke a winding path.
              idx % 2 === 1 ? "sm:translate-x-4" : "sm:-translate-x-2"
            )}
          >
            <LessonCard lesson={lesson} highlight={lesson.id === 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}
