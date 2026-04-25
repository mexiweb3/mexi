"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

import { cn } from "@/lib/cn";

import { mascotVariants, sparkleVariants } from "./animations";

type MascotState = "idle" | "celebrating" | "encouraging";

type Props = {
  state?: MascotState;
  size?: number;
  label?: string;
  className?: string;
};

const SPARKLE_POSITIONS: ReadonlyArray<{ cx: number; cy: number; r: number }> = [
  { cx: 18, cy: 22, r: 2.4 },
  { cx: 78, cy: 18, r: 2.0 },
  { cx: 86, cy: 46, r: 2.2 },
];

export function Mascot({ state = "idle", size = 96, label, className }: Props) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const ariaLabel = label ?? "Doli, el ayudante";
  const variants = mascotVariants[state];

  const svg = (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
      aria-labelledby={titleId}
      className="block"
    >
      <title id={titleId}>{ariaLabel}</title>
      {/* Flag (brand-400) */}
      <path
        d="M62 18 C 78 26, 86 40, 78 58 C 86 46, 84 32, 70 22 Z"
        fill="#ffb01f"
        stroke="#cc7600"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Stem */}
      <rect x="60" y="18" width="3.5" height="58" fill="#1a1a1a" rx="1" />
      {/* Note head */}
      <ellipse
        cx="42"
        cy="78"
        rx="26"
        ry="20"
        fill="#1a1a1a"
        transform="rotate(-18 42 78)"
      />
      {/* Eyes */}
      <g>
        <circle cx="32" cy="74" r="6" fill="#ffffff" />
        <circle cx="50" cy="70" r="6" fill="#ffffff" />
        <circle cx="33" cy="75" r="2.4" fill="#1a1a1a" />
        <circle cx="51" cy="71" r="2.4" fill="#1a1a1a" />
      </g>
      {/* Smile */}
      <path
        d="M30 86 Q 41 94, 52 84"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  const sparkles =
    state === "celebrating" && !reduceMotion ? (
      <svg
        viewBox="0 0 100 120"
        width={size}
        height={size}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        {SPARKLE_POSITIONS.map((dot, i) => (
          <motion.circle
            key={`${dot.cx}-${dot.cy}`}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill="#ffd87a"
            stroke="#ffb01f"
            strokeWidth="0.6"
            variants={sparkleVariants}
            custom={i}
            initial="hidden"
            animate="visible"
          />
        ))}
      </svg>
    ) : null;

  const mascotBox = (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
      aria-hidden={label ? "true" : undefined}
    >
      {reduceMotion ? (
        svg
      ) : (
        <motion.div
          variants={variants}
          animate="animate"
          style={{ transformOrigin: "50% 70%" }}
          aria-hidden="true"
        >
          {svg}
        </motion.div>
      )}
      {sparkles}
    </div>
  );

  return (
    <div
      className={cn(
        "inline-flex items-end gap-3 max-sm:flex-col max-sm:items-start",
        className,
      )}
      role={label ? "group" : undefined}
      aria-label={label ? ariaLabel : undefined}
    >
      {mascotBox}
      {label ? (
        <div
          className="relative max-w-[18rem] rounded-2xl border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 shadow-md"
          role="status"
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}

export default Mascot;
