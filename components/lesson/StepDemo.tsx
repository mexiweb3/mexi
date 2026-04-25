"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ensureAudio, playMidi } from "@/lib/audio/engine";
import type { NoteSeq } from "@/lib/lessons/schema";
import { midiToNote, SOLFEGE } from "@/lib/types/music";
import { cn } from "@/lib/cn";

type Props = {
  narration: string;
  notes: NoteSeq;
  tempoBpm: number;
  highlightedMidis?: number[];
  hasInteracted: boolean;
  onInteracted: () => void;
  onAdvance: () => void;
};

function noteSpanish(midi: number): string {
  const n = midiToNote(midi);
  return SOLFEGE[n.name];
}

export default function StepDemo({
  narration,
  notes,
  tempoBpm,
  highlightedMidis,
  hasInteracted,
  onInteracted,
  onAdvance,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const cancelRef = useRef<boolean>(false);
  const autoPlayedRef = useRef<boolean>(false);

  const secondsPerBeat = 60 / Math.max(1, tempoBpm);

  const play = useCallback(async () => {
    if (notes.length === 0) return;
    if (isPlaying) return;
    cancelRef.current = false;
    setIsPlaying(true);
    await ensureAudio();
    for (let i = 0; i < notes.length; i += 1) {
      if (cancelRef.current) break;
      const note = notes[i];
      const durSec = Math.max(0.1, note.durationBeats * secondsPerBeat);
      setActiveIndex(i);
      playMidi(note.midi, Math.max(0.1, durSec * 0.95));
      await new Promise<void>((resolve) =>
        setTimeout(resolve, durSec * 1000),
      );
    }
    if (!cancelRef.current) {
      setActiveIndex(-1);
    }
    setIsPlaying(false);
  }, [notes, isPlaying, secondsPerBeat]);

  useEffect(() => {
    if (hasInteracted && !autoPlayedRef.current) {
      autoPlayedRef.current = true;
      void play();
    }
    return () => {
      cancelRef.current = true;
    };
    // intentional: only auto-play on first eligible mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInteracted]);

  const handleStart = useCallback(async () => {
    onInteracted();
    autoPlayedRef.current = true;
    await play();
  }, [onInteracted, play]);

  const highlightSet = new Set<number>(highlightedMidis ?? []);

  return (
    <section
      aria-label="Demostracion"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border-4 border-brand-200 bg-white p-6 text-center shadow-[0_8px_0_0_#ffd87a]"
    >
      <p className="text-base leading-relaxed text-brand-800">{narration}</p>

      <div
        aria-label="Notas de la demostracion"
        className="flex w-full flex-wrap items-center justify-center gap-3"
      >
        {notes.map((note, i) => {
          const isActive = i === activeIndex;
          const isHighlighted = highlightSet.has(note.midi);
          return (
            <span
              key={`${note.midi}-${i}`}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "inline-flex h-20 min-w-[5rem] items-center justify-center rounded-2xl border-4 px-4 text-3xl font-extrabold transition-all",
                isActive
                  ? "scale-110 border-brand-500 bg-brand-300 text-brand-900 shadow-[0_4px_0_0_#cc7600]"
                  : isHighlighted
                  ? "border-brand-300 bg-brand-100 text-brand-900"
                  : "border-brand-200 bg-white text-brand-800",
              )}
            >
              {noteSpanish(note.midi)}
            </span>
          );
        })}
      </div>

      {!hasInteracted ? (
        <button
          type="button"
          onClick={handleStart}
          className="w-full rounded-2xl bg-brand-400 px-6 py-4 text-lg font-extrabold uppercase tracking-wider text-brand-900 shadow-[0_6px_0_0_#cc7600] transition-transform hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#cc7600] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 active:translate-y-[6px] active:shadow-none"
        >
          Tocar demostracion
        </button>
      ) : (
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void play()}
            disabled={isPlaying}
            className="flex-1 rounded-2xl border-4 border-brand-300 bg-white px-4 py-3 text-base font-extrabold uppercase tracking-wider text-brand-900 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
          >
            Volver a escuchar
          </button>
          <button
            type="button"
            onClick={onAdvance}
            className="flex-1 rounded-2xl bg-brand-400 px-4 py-3 text-base font-extrabold uppercase tracking-wider text-brand-900 shadow-[0_6px_0_0_#cc7600] transition-transform hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#cc7600] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 active:translate-y-[6px] active:shadow-none"
          >
            Continuar
          </button>
        </div>
      )}
    </section>
  );
}
