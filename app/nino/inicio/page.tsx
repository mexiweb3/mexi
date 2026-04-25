"use client";

import Link from "next/link";
import { Lock, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { Mascot } from "@/components/mascot/Mascot";
import { LESSON_CATALOG } from "@/lib/lessons/registry";
import type { LessonCatalogEntry } from "@/lib/lessons/registry";
import {
  getLessonProgress,
  type LessonProgressEntry,
} from "@/lib/persistence/progress";
import { useChildProfile } from "@/store/childProfile";

type Stars = 0 | 1 | 2 | 3;

type ProgressMap = Record<string, LessonProgressEntry>;

function LessonCard({
  lesson,
  index,
  highlight,
  stars,
}: {
  lesson: LessonCatalogEntry;
  index: number;
  highlight: boolean;
  stars: Stars;
}) {
  const isLocked = lesson.premium;
  const isReady = lesson.ready;
  const isInteractive = !isLocked && isReady;

  const className = cn(
    "flex items-center gap-4 rounded-3xl border-4 bg-white p-4 shadow-[0_6px_0_0_#ffd87a] transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
    isLocked
      ? "border-brand-100 opacity-80"
      : isReady
      ? "border-brand-200 hover:border-brand-300"
      : "border-brand-100 opacity-90",
    highlight && isInteractive && "border-brand-500 motion-safe:animate-bounceSoft",
  );

  const starLabel =
    stars === 0
      ? "Cero estrellas obtenidas"
      : `${stars} de 3 estrellas obtenidas`;

  const inner = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold",
          isLocked
            ? "bg-brand-100 text-brand-600"
            : "bg-brand-400 text-brand-900",
        )}
      >
        {isLocked ? <Lock className="h-6 w-6" strokeWidth={2.5} /> : index + 1}
      </span>
      <span className="flex flex-1 flex-col text-left">
        <span className="text-base font-extrabold leading-tight text-brand-900">
          {lesson.title}
        </span>
        {highlight && isInteractive ? (
          <span className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-600">
            Empezar aqui
          </span>
        ) : isLocked ? (
          <span className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-600">
            Premium
          </span>
        ) : !isReady ? (
          <span className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-600">
            Pronto
          </span>
        ) : (
          <span className="mt-1 text-xs font-semibold text-brand-700">
            Modulo {lesson.module} - Leccion {lesson.order}
          </span>
        )}
        <span className="mt-2 flex items-center gap-1" aria-label={starLabel}>
          {[1, 2, 3].map((i) => {
            const filled = i <= stars;
            return (
              <Star
                key={i}
                aria-hidden="true"
                className={cn(
                  "h-4 w-4",
                  filled ? "text-brand-400" : "text-brand-300",
                )}
                strokeWidth={2.25}
                fill={filled ? "currentColor" : "none"}
              />
            );
          })}
        </span>
      </span>
    </>
  );

  if (!isInteractive) {
    const ariaLabel = isLocked
      ? `Leccion bloqueada: ${lesson.title}`
      : `Leccion no disponible aun: ${lesson.title}`;
    return (
      <div
        role="button"
        aria-disabled="true"
        aria-label={ariaLabel}
        className={cn(className, "cursor-not-allowed")}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/nino/leccion/${lesson.id}`}
      aria-label={`Abrir leccion: ${lesson.title}`}
      className={className}
    >
      {inner}
    </Link>
  );
}

export default function NinoInicioPage() {
  const activeChild = useChildProfile((s) => s.activeChild);
  const name = activeChild?.name ?? "amigo";
  const childId = activeChild?.id ?? null;

  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    if (!childId) {
      setProgress({});
      return;
    }
    let cancelled = false;
    void getLessonProgress(childId)
      .then((p) => {
        if (!cancelled) setProgress(p);
      })
      .catch(() => {
        if (!cancelled) setProgress({});
      });
    return () => {
      cancelled = true;
    };
  }, [childId]);

  // Highlight the first ready lesson the child has not yet completed.
  const highlightId =
    LESSON_CATALOG.find(
      (entry) => entry.ready && !entry.premium && !progress[entry.id],
    )?.id ?? LESSON_CATALOG.find((entry) => entry.ready && !entry.premium)?.id;

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
        {LESSON_CATALOG.map((lesson, idx) => {
          const stars = (progress[lesson.id]?.stars ?? 0) as Stars;
          return (
            <li
              key={lesson.id}
              className={cn(
                "list-none",
                // Subtle horizontal stagger on >=sm screens to evoke a winding path.
                idx % 2 === 1 ? "sm:translate-x-4" : "sm:-translate-x-2",
              )}
            >
              <LessonCard
                lesson={lesson}
                index={idx}
                highlight={lesson.id === highlightId}
                stars={stars}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
