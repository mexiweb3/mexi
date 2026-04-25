"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { midiToNote, SOLFEGE } from "@/lib/types/music";

export type FallingNote = {
  midi: number;
  startSec: number;
  durationSec: number;
};

type FallingNotesProps = {
  /** First white key (typically C). */
  startMidi: number;
  /** Same as VirtualKeyboard. */
  octaves: number;
  /** Pre-scheduled notes. */
  notes: FallingNote[];
  /** Controlled time pointer; parent advances it via rAF. */
  currentTimeSec: number;
  /** Seconds of look-ahead visible at once. */
  windowSec?: number;
  /** Visual offset where notes hit the piano (default 0). */
  hitLineOffsetPx?: number;
  /** Additional class names. */
  className?: string;
  /** Highlights any note whose [startSec, startSec + durationSec] currently spans the hit line. */
  activeMidis?: number[];
};

type KeyInfo = {
  midi: number;
  isBlack: boolean;
  whiteIndex: number;
  blackIndex: number;
};

function buildKeys(startMidi: number, octaves: number): KeyInfo[] {
  const total = octaves * 12;
  const keys: KeyInfo[] = [];
  let whiteIndex = 0;
  let blackIndex = 0;
  for (let i = 0; i < total; i++) {
    const midi = startMidi + i;
    const isBlack = midiToNote(midi).isBlack;
    keys.push({
      midi,
      isBlack,
      whiteIndex: isBlack ? -1 : whiteIndex,
      blackIndex: isBlack ? blackIndex : -1,
    });
    if (isBlack) blackIndex++;
    else whiteIndex++;
  }
  return keys;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

export default function FallingNotes({
  startMidi,
  octaves,
  notes,
  currentTimeSec,
  windowSec = 4,
  hitLineOffsetPx = 0,
  className,
  activeMidis,
}: FallingNotesProps) {
  const keys = useMemo(
    () => buildKeys(startMidi, octaves),
    [startMidi, octaves],
  );
  const whiteKeys = useMemo(() => keys.filter((k) => !k.isBlack), [keys]);
  const blackKeys = useMemo(() => keys.filter((k) => k.isBlack), [keys]);

  const whiteCount = whiteKeys.length;
  const whiteWidthPct = whiteCount > 0 ? 100 / whiteCount : 0;
  const blackWidthPct = whiteWidthPct * 0.6;

  const reducedMotion = useReducedMotion();

  const activeSet = useMemo(
    () => new Set(activeMidis ?? []),
    [activeMidis],
  );

  // Map midi -> horizontal position (left%) and width%.
  const horizontalForMidi = useMemo(() => {
    const map = new Map<number, { leftPct: number; widthPct: number; isBlack: boolean }>();
    for (const k of keys) {
      if (!k.isBlack) {
        map.set(k.midi, {
          leftPct: k.whiteIndex * whiteWidthPct,
          widthPct: whiteWidthPct,
          isBlack: false,
        });
      }
    }
    for (const b of blackKeys) {
      // Same math as VirtualKeyboard: center over the boundary between two white keys.
      const prevWhite = whiteKeys.findIndex((w) => w.midi > b.midi) - 1;
      const whitePos = prevWhite < 0 ? whiteKeys.length - 1 : prevWhite;
      const center = (whitePos + 1) * whiteWidthPct;
      const left = center - blackWidthPct / 2;
      map.set(b.midi, {
        leftPct: left,
        widthPct: blackWidthPct,
        isBlack: true,
      });
    }
    return map;
  }, [keys, whiteKeys, blackKeys, whiteWidthPct, blackWidthPct]);

  // Precompute culled/visible notes with vertical positioning expressed in
  // percentages of the track height. Top 0% = far away, 100% = hit line.
  // top% = (1 - (note.startSec - currentTimeSec) / windowSec) * 100
  // height% = (note.durationSec / windowSec) * 100
  const visibleNotes = useMemo(() => {
    const out: Array<{
      key: string;
      midi: number;
      isBlack: boolean;
      leftPct: number;
      widthPct: number;
      topPct: number;
      heightPct: number;
      label: string;
      isActive: boolean;
    }> = [];
    for (let i = 0; i < notes.length; i++) {
      const n = notes[i];
      const endSec = n.startSec + n.durationSec;
      // Cull: if the note's whole window is in the past or too far in the future.
      if (endSec < currentTimeSec) continue;
      if (n.startSec > currentTimeSec + windowSec) continue;
      const horiz = horizontalForMidi.get(n.midi);
      if (!horiz) continue;

      const topPct =
        (1 - (n.startSec - currentTimeSec) / windowSec) * 100;
      const heightPct = (n.durationSec / windowSec) * 100;

      const note = midiToNote(n.midi);
      const label = SOLFEGE[note.name];

      // A note is "active" when the hit line passes through it.
      const isActive =
        currentTimeSec >= n.startSec &&
        currentTimeSec <= endSec + 0.05 &&
        activeSet.has(n.midi);

      out.push({
        key: `${i}-${n.midi}`,
        midi: n.midi,
        isBlack: horiz.isBlack,
        leftPct: horiz.leftPct,
        widthPct: horiz.widthPct,
        topPct,
        heightPct,
        label,
        isActive,
      });
    }
    return out;
  }, [notes, currentTimeSec, windowSec, horizontalForMidi, activeSet]);

  const transitionClass = reducedMotion
    ? ""
    : "transition-[top,height] duration-75 ease-linear";

  return (
    <div
      role="img"
      aria-label="Notas que caen"
      className={cn(
        "relative w-full overflow-hidden rounded-t-2xl",
        "bg-gradient-to-b from-brand-50 to-brand-100/60",
        "aspect-[7/3] min-h-[180px] max-h-[320px]",
        // Bottom border + soft glow as the "hit line".
        "border-b border-brand-700",
        "shadow-[inset_0_-8px_16px_-8px_rgba(244,147,0,0.45)]",
        className,
      )}
      style={{
        minWidth: `${whiteCount * 60}px`,
      }}
    >
      {/* Faint vertical guides at white-key boundaries (decorative). */}
      <div className="pointer-events-none absolute inset-0 flex" aria-hidden>
        {whiteKeys.map((k) => (
          <div
            key={`g-${k.midi}`}
            className="flex-1 border-r border-brand-200/40 last:border-r-0"
          />
        ))}
      </div>

      {/* Bars. */}
      {visibleNotes.map((b) => {
        const baseColor = b.isBlack
          ? "bg-brand-600 text-white"
          : "bg-brand-300 text-brand-900";
        const activeColor = b.isBlack
          ? "bg-brand-500 text-white ring-4 ring-brand-300"
          : "bg-brand-400 text-brand-900 ring-4 ring-brand-500";
        return (
          <div
            key={b.key}
            aria-hidden
            className={cn(
              "absolute rounded-md shadow-[0_2px_0_rgba(0,0,0,0.12)]",
              "flex items-end justify-center pb-1",
              "text-[10px] font-semibold leading-none",
              transitionClass,
              b.isActive ? activeColor : baseColor,
            )}
            style={{
              left: `${b.leftPct}%`,
              width: `calc(${b.widthPct}% - 2px)`,
              marginLeft: "1px",
              // top is computed in percent of track height; bottom-anchored bars
              // are achieved by shifting up by the height.
              top: `calc(${b.topPct}% - ${b.heightPct}%)`,
              height: `max(16px, ${b.heightPct}%)`,
              transform:
                hitLineOffsetPx !== 0
                  ? `translateY(${-hitLineOffsetPx}px)`
                  : undefined,
            }}
          >
            <span className="hidden min-[420px]:inline truncate px-1">
              {b.label}
            </span>
          </div>
        );
      })}

      {/* Hit line overlay (1px line + glow). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-brand-700"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-brand-500/30 to-transparent"
      />
    </div>
  );
}
