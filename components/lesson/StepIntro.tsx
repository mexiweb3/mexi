"use client";

import { Mascot } from "@/components/mascot/Mascot";
import type { MascotStateKind } from "@/lib/lessons/schema";

type Props = {
  title: string;
  narration: string;
  mascotState: MascotStateKind;
  onAdvance: () => void;
};

export default function StepIntro({
  title,
  narration,
  mascotState,
  onAdvance,
}: Props) {
  const inlineLabel = narration.length < 80 ? narration : undefined;

  return (
    <section
      aria-label="Introduccion de la leccion"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border-4 border-brand-200 bg-white p-6 text-center shadow-[0_8px_0_0_#ffd87a]"
    >
      <h2 className="text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
        {title}
      </h2>

      <Mascot state={mascotState} size={120} label={inlineLabel} />

      {!inlineLabel ? (
        <p className="text-base leading-relaxed text-brand-800">{narration}</p>
      ) : null}

      <button
        type="button"
        onClick={onAdvance}
        className="mt-2 w-full rounded-2xl bg-brand-400 px-6 py-4 text-lg font-extrabold uppercase tracking-wider text-brand-900 shadow-[0_6px_0_0_#cc7600] transition-transform hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#cc7600] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 active:translate-y-[6px] active:shadow-none"
      >
        Empezar
      </button>
    </section>
  );
}
