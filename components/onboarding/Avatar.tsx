"use client";

import { cn } from "@/lib/cn";
import type { OnboardingAvatar } from "@/store/onboarding";

type AvatarProps = {
  id: OnboardingAvatar;
  size?: number;
  className?: string;
  title?: string;
};

type AvatarStyle = {
  bg: string;
  face: string;
  // Mouth path is a quadratic curve for a smile.
  mouthDip?: number;
  blush?: string;
};

const STYLES: Record<OnboardingAvatar, AvatarStyle> = {
  a1: { bg: "#ffb01f", face: "#331e00", mouthDip: 8, blush: "#ff8a8a" },
  a2: { bg: "#5ac8fa", face: "#08344a", mouthDip: 6, blush: "#ffc1c1" },
  a3: { bg: "#ffe9b8", face: "#663b00", mouthDip: 7, blush: "#ffb1b1" },
  a4: { bg: "#cc7600", face: "#fff7e6", mouthDip: 8, blush: "#ffd2d2" },
  a5: { bg: "#ffd87a", face: "#663b00", mouthDip: 5, blush: "#ff9e9e" },
  a6: { bg: "#995800", face: "#fff7e6", mouthDip: 7, blush: "#ffc7c7" },
};

const NAMES: Record<OnboardingAvatar, string> = {
  a1: "Avatar naranja",
  a2: "Avatar azul",
  a3: "Avatar crema",
  a4: "Avatar marron",
  a5: "Avatar amarillo",
  a6: "Avatar cafe",
};

export function Avatar({ id, size = 80, className, title }: AvatarProps) {
  const style = STYLES[id];
  const label = title ?? NAMES[id];
  // Geometry on a 100x100 viewBox.
  const eyeY = 42;
  const leftEyeX = 36;
  const rightEyeX = 64;
  const eyeR = 5;
  const mouthY = 62;
  const mouthDip = style.mouthDip ?? 6;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("block", className)}
    >
      <circle cx="50" cy="50" r="48" fill={style.bg} />
      {/* blush */}
      {style.blush ? (
        <>
          <circle cx="28" cy="58" r="5" fill={style.blush} opacity="0.7" />
          <circle cx="72" cy="58" r="5" fill={style.blush} opacity="0.7" />
        </>
      ) : null}
      {/* eyes */}
      <circle cx={leftEyeX} cy={eyeY} r={eyeR} fill={style.face} />
      <circle cx={rightEyeX} cy={eyeY} r={eyeR} fill={style.face} />
      {/* eye shines */}
      <circle cx={leftEyeX + 1.5} cy={eyeY - 1.5} r={1.2} fill="#ffffff" />
      <circle cx={rightEyeX + 1.5} cy={eyeY - 1.5} r={1.2} fill="#ffffff" />
      {/* smile */}
      <path
        d={`M 32 ${mouthY} Q 50 ${mouthY + mouthDip * 1.5} 68 ${mouthY}`}
        fill="none"
        stroke={style.face}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
