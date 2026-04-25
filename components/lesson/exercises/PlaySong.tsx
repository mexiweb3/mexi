"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import PianoStage from "@/components/piano/PianoStage";
import type { PlaySongExercise } from "@/lib/lessons/schema";
import { midiToNote, SOLFEGE } from "@/lib/types/music";
import { useMidiStore } from "@/store/midi";

import type { ExerciseProps } from "./types";

export default function PlaySong({
  exercise,
  onResult,
  onNoteOn,
}: ExerciseProps<PlaySongExercise>) {
  const { prompt, score, passThreshold } = exercise;

  const total = score.length;

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [pulse, setPulse] = useState(0);

  const startedAtRef = useRef<number>(Date.now());
  const doneRef = useRef(false);
  const indexRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);

  const onResultRef = useRef(onResult);
  const onNoteOnRef = useRef(onNoteOn);
  useEffect(() => {
    onResultRef.current = onResult;
    onNoteOnRef.current = onNoteOn;
  }, [onResult, onNoteOn]);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const totalAttempted = correctRef.current + wrongRef.current;
    const denom = Math.max(total, 1);
    const accuracy = Math.max(0, Math.min(1, correctRef.current / denom));
    const passed = accuracy >= passThreshold;
    const attempts = Math.max(1, totalAttempted);
    onResultRef.current({
      passed,
      accuracy,
      attempts,
      durationMs: Date.now() - startedAtRef.current,
    });
  }, [total, passThreshold]);

  const handleInput = useCallback(
    (midi: number) => {
      if (doneRef.current) return;
      onNoteOnRef.current?.(midi);

      const i = indexRef.current;
      const expected = score[i];
      if (!expected) return;

      if (expected.midi === midi) {
        const nextCorrect = correctRef.current + 1;
        correctRef.current = nextCorrect;
        setCorrect(nextCorrect);

        const nextIndex = i + 1;
        indexRef.current = nextIndex;
        setIndex(nextIndex);

        if (nextIndex >= total) {
          finish();
        }
      } else {
        const nextWrong = wrongRef.current + 1;
        wrongRef.current = nextWrong;
        setWrong(nextWrong);
        // We are kid-kind: do not block, just count it.
      }
    },
    [score, total, finish],
  );

  // Mirror MIDI hardware via the store.
  const lastEvent = useMidiStore((s) => s.lastEvent);
  const lastEventStampRef = useRef<number | null>(null);
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type !== "noteOn") return;
    // De-dup: zustand re-emits same reference only on actual change, but
    // guard against StrictMode double-invocations using identity.
    const stamp = lastEvent.midi * 1_000_000 + lastEvent.velocity * 1000;
    if (lastEventStampRef.current === stamp) return;
    lastEventStampRef.current = stamp;
    handleInput(lastEvent.midi);
  }, [lastEvent, handleInput]);

  // Pulse the upcoming note for a kid-friendly cue.
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return;
    if (doneRef.current) return;
    const id = window.setInterval(() => {
      setPulse((p) => (p + 1) % 2);
    }, 700);
    return () => window.clearInterval(id);
  }, [reducedMotion, index]);

  const upcoming = score[index];
  const upcomingMidi = upcoming?.midi ?? null;

  // Falling notes simplified: render a stack of upcoming bars above the
  // piano, with the next one largest.
  const upcomingList = score.slice(index, index + 4);

  return (
    <section className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">
          {prompt}
        </h2>
        <p className="text-base text-brand-700" aria-live="polite">
          Nota {Math.min(index + 1, total)} de {total}
        </p>
        <p className="text-sm text-brand-600">
          Aciertos: {correct} | Intentos extra: {wrong}
        </p>
      </header>

      <div
        className="relative mx-auto flex h-28 w-full max-w-md items-end justify-center gap-2 overflow-hidden rounded-2xl bg-brand-50/60 p-3"
        aria-hidden
      >
        {upcomingList.length === 0 ? (
          <span className="text-sm text-brand-600">Listo.</span>
        ) : (
          upcomingList.map((n, i) => {
            const note = midiToNote(n.midi);
            const isNext = i === 0;
            const heightPct = isNext ? 100 : 70 - i * 12;
            const opacity = isNext ? 1 : 0.55 - i * 0.1;
            return (
              <div
                key={`${i}-${n.midi}`}
                className="flex flex-col items-center justify-end"
                style={{ opacity }}
              >
                <div
                  className={
                    "w-8 rounded-t-md bg-brand-400 transition-all duration-200" +
                    (isNext && !reducedMotion && pulse % 2 === 0
                      ? " scale-y-105"
                      : "")
                  }
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: isNext ? "#f4a300" : "#f4cf85",
                  }}
                />
                <span className="mt-1 text-[10px] font-semibold text-brand-800">
                  {SOLFEGE[note.name]}
                </span>
              </div>
            );
          })
        )}
      </div>

      <PianoStage
        labelMode="es"
        octaves={2}
        startMidi={48}
        highlightedMidis={upcomingMidi !== null ? [upcomingMidi] : []}
        onNoteOn={handleInput}
      />
    </section>
  );
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
