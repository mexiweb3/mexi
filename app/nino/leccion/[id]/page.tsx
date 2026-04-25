"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import LessonRunner from "@/components/lesson/LessonRunner";
import { Mascot } from "@/components/mascot/Mascot";
import { getLesson, LESSON_CATALOG } from "@/lib/lessons/registry";

export default function LessonPage() {
  const params = useParams<{ id: string | string[] }>();
  const rawId = params?.id;
  const id = useMemo<string | null>(() => {
    if (typeof rawId === "string") return rawId;
    if (Array.isArray(rawId) && rawId.length > 0) return rawId[0];
    return null;
  }, [rawId]);

  const lesson = id ? getLesson(id) : null;
  const catalogEntry = id
    ? LESSON_CATALOG.find((entry) => entry.id === id)
    : null;
  const isReady = catalogEntry?.ready === true;

  if (!lesson || !isReady) {
    return (
      <section
        aria-label="Leccion no disponible"
        className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border-4 border-brand-200 bg-white p-6 text-center shadow-[0_8px_0_0_#ffd87a]"
      >
        <Mascot
          state="encouraging"
          size={120}
          label="Esta leccion estara lista pronto."
        />
        <p className="text-base leading-relaxed text-brand-800">
          Mientras tanto puedes seguir practicando con las lecciones que ya
          estan disponibles.
        </p>
        <Link
          href="/nino/inicio"
          className="w-full rounded-2xl bg-brand-400 px-6 py-4 text-center text-lg font-extrabold uppercase tracking-wider text-brand-900 shadow-[0_6px_0_0_#cc7600] transition-transform hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#cc7600] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 active:translate-y-[6px] active:shadow-none"
        >
          Volver al mapa
        </Link>
      </section>
    );
  }

  return <LessonRunner lesson={lesson} />;
}
