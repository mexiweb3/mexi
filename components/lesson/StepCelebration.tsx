"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { Mascot } from "@/components/mascot/Mascot";
import { cn } from "@/lib/cn";

const BADGE_NAMES: Record<string, string> = {
  first_do: "Mi primer Do",
  sharp_ear: "Oido fino",
  steady_hand: "Mano firme",
  perfect_beat: "Pulso perfecto",
  five_in_a_row: "Cinco seguidas",
};

type Props = {
  message: string;
  stars: 0 | 1 | 2 | 3;
  badgeId?: string;
  nextLessonId: string | null;
};

const STAR_BURSTS = [
  { x: -60, y: -40, delay: 0.05 },
  { x: 50, y: -55, delay: 0.18 },
  { x: -30, y: 50, delay: 0.3 },
  { x: 65, y: 30, delay: 0.42 },
  { x: 0, y: -70, delay: 0.55 },
];

function StarIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-10 w-10", className)}
    >
      <path
        d="M12 2.5l2.7 6.3 6.8.6-5.2 4.6 1.6 6.7L12 17.3l-5.9 3.4 1.6-6.7-5.2-4.6 6.8-.6L12 2.5z"
        fill={filled ? "#ffb01f" : "#ffffff"}
        stroke="#cc7600"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StepCelebration({
  message,
  stars,
  badgeId,
  nextLessonId,
}: Props) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState<number>(0);

  useEffect(() => {
    if (stars <= 0) {
      setRevealed(0);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= stars; i += 1) {
      const t = setTimeout(() => {
        if (!cancelled) setRevealed(i);
      }, i * 350);
      timers.push(t);
    }
    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
    };
  }, [stars]);

  const badgeName = badgeId ? (BADGE_NAMES[badgeId] ?? badgeId) : null;

  return (
    <section
      aria-label="Celebracion"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border-4 border-brand-200 bg-white p-6 text-center shadow-[0_8px_0_0_#ffd87a]"
    >
      <div className="relative inline-block">
        <Mascot state="celebrating" size={140} />
        {!reduce
          ? STAR_BURSTS.map((b, i) => (
              <motion.svg
                key={i}
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-6"
                initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.2, 0.8],
                  x: b.x,
                  y: b.y,
                }}
                transition={{
                  duration: 1.1,
                  delay: b.delay,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 1.6,
                }}
              >
                <path
                  d="M12 2.5l2.7 6.3 6.8.6-5.2 4.6 1.6 6.7L12 17.3l-5.9 3.4 1.6-6.7-5.2-4.6 6.8-.6L12 2.5z"
                  fill="#ffd87a"
                  stroke="#ffb01f"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </motion.svg>
            ))
          : null}
      </div>

      <p className="text-lg font-extrabold leading-tight text-brand-900">
        {message}
      </p>

      <div
        role="img"
        aria-label={`${stars} de 3 estrellas`}
        className="flex items-center justify-center gap-2"
      >
        {[1, 2, 3].map((i) => {
          const filled = i <= revealed;
          if (reduce) {
            return <StarIcon key={i} filled={filled} />;
          }
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.6, opacity: 0.4 }}
              animate={
                filled
                  ? { scale: [0.6, 1.25, 1], opacity: 1 }
                  : { scale: 0.9, opacity: 0.5 }
              }
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <StarIcon filled={filled} />
            </motion.div>
          );
        })}
      </div>

      {badgeName ? (
        <div
          aria-label={`Insignia obtenida: ${badgeName}`}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border-4 border-brand-300 bg-brand-50 px-4 py-3"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-400 text-base font-extrabold text-brand-900 shadow-[0_3px_0_0_#cc7600]"
          >
            <StarIcon filled={true} className="h-7 w-7" />
          </span>
          <span className="flex flex-col text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
              Nueva insignia
            </span>
            <span className="text-base font-extrabold text-brand-900">
              {badgeName}
            </span>
          </span>
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Link
          href="/nino/inicio"
          className="flex-1 rounded-2xl border-4 border-brand-300 bg-white px-4 py-3 text-center text-base font-extrabold uppercase tracking-wider text-brand-900 transition-colors hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
        >
          Volver al mapa
        </Link>
        {nextLessonId ? (
          <Link
            href={`/nino/leccion/${nextLessonId}`}
            className="flex-1 rounded-2xl bg-brand-400 px-4 py-3 text-center text-base font-extrabold uppercase tracking-wider text-brand-900 shadow-[0_6px_0_0_#cc7600] transition-transform hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#cc7600] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 active:translate-y-[6px] active:shadow-none"
          >
            Siguiente leccion
          </Link>
        ) : null}
      </div>
    </section>
  );
}
