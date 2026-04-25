"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics/plausible";

type Props = {
  /**
   * Lesson id of the just-completed lesson. Component only renders when
   * this equals the last free lesson id (`m1l5`).
   */
  lessonId: string;
  /**
   * Parent plan. Component only renders when this is "free".
   */
  plan: "free" | "premium";
};

const LAST_FREE_LESSON_ID = "m1l5";

/**
 * Inline upgrade nudge intended to render INSIDE the lesson celebration
 * step (StepCelebration) when the user has just completed the last free
 * lesson on the free plan.
 *
 * Self-contained: emits `paywall_seen` once on mount and exposes a dismiss.
 * Two CTAs: "Ver Premium" (Link to /precios) and "Ahora no" (close).
 *
 * Wiring (sibling lane):
 *   import { CompletionUpgradeNudge } from "@/components/lesson/CompletionUpgradeNudge";
 *   ...inside StepCelebration's JSX:
 *   <CompletionUpgradeNudge lessonId={lessonId} plan={plan} />
 *
 * Mobile-first, max-w-md.
 */
export function CompletionUpgradeNudge({
  lessonId,
  plan,
}: Props): JSX.Element | null {
  const shouldShow = lessonId === LAST_FREE_LESSON_ID && plan === "free";

  const [closed, setClosed] = useState<boolean>(false);
  const firedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!shouldShow) return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackEvent("paywall_seen", { reason: "lesson_complete_m1l5" });
  }, [shouldShow]);

  if (!shouldShow || closed) return null;

  return (
    <aside
      role="region"
      aria-label="Sugerencia de Premium"
      className="mx-auto mt-6 w-full max-w-md rounded-3xl border-4 border-brand-200 bg-white p-5 text-brand-900 shadow-[0_6px_0_0_#ffd87a]"
    >
      <h3 className="text-lg font-extrabold leading-tight sm:text-xl">
        Tu siguiente reto te espera en Premium
      </h3>
      <p className="mt-2 text-sm leading-snug text-brand-800">
        Desbloquea el modulo 2 con ritmo, manos juntas y nuevas canciones.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href="/precios"
          className="kid-button !min-h-[48px] !px-5 !py-3 text-center text-sm"
        >
          Ver Premium
        </Link>
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="kid-button-secondary !min-h-[48px] !px-5 !py-3 text-sm"
        >
          Ahora no
        </button>
      </div>
    </aside>
  );
}

export default CompletionUpgradeNudge;
