"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import PianoStage from "@/components/piano/PianoStage";
import { ensureAudio, playMidi } from "@/lib/audio/engine";
import type { RepeatPatternExercise } from "@/lib/lessons/schema";

import type { ExerciseProps } from "./types";

type Phase = "listen" | "repeat" | "done";

export default function RepeatPattern({
  exercise,
  onResult,
  onNoteOn,
}: ExerciseProps<RepeatPatternExercise>) {
  const { prompt, pattern, tempoBpm } = exercise;

  const [phase, setPhase] = useState<Phase>("listen");
  const [playedIndex, setPlayedIndex] = useState(0);
  const [correctInOrder, setCorrectInOrder] = useState(0);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [feedback, setFeedback] = useState<string>("Escucha el patron.");

  const startedAtRef = useRef<number>(Date.now());
  const attemptsRef = useRef(0);
  const doneRef = useRef(false);
  const demoTokenRef = useRef(0);

  const onResultRef = useRef(onResult);
  const onNoteOnRef = useRef(onNoteOn);
  useEffect(() => {
    onResultRef.current = onResult;
    onNoteOnRef.current = onNoteOn;
  }, [onResult, onNoteOn]);

  const beatMs = 60000 / Math.max(1, tempoBpm);

  const playPattern = useCallback(async (): Promise<void> => {
    await ensureAudio();
    const token = ++demoTokenRef.current;
    setIsPlayingDemo(true);

    let elapsed = 0;
    for (const note of pattern) {
      if (token !== demoTokenRef.current) return;
      const durSec = (note.durationBeats * beatMs) / 1000;
      window.setTimeout(() => {
        if (token !== demoTokenRef.current) return;
        playMidi(note.midi, Math.max(0.15, durSec * 0.95));
      }, elapsed);
      elapsed += note.durationBeats * beatMs;
    }
    window.setTimeout(() => {
      if (token === demoTokenRef.current) setIsPlayingDemo(false);
    }, elapsed + 50);
  }, [pattern, beatMs]);

  // Auto-play on mount.
  useEffect(() => {
    void playPattern();
    return () => {
      demoTokenRef.current++;
    };
  }, [playPattern]);

  const reducedMotionRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = mq.matches;
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const finish = useCallback(
    (correct: number) => {
      if (doneRef.current) return;
      doneRef.current = true;
      setPhase("done");
      const total = pattern.length || 1;
      const accuracy = Math.max(0, Math.min(1, correct / total));
      const passed = accuracy >= 0.6;
      onResultRef.current({
        passed,
        accuracy,
        attempts: Math.max(1, attemptsRef.current),
        durationMs: Date.now() - startedAtRef.current,
      });
    },
    [pattern.length],
  );

  const handleNoteOn = useCallback(
    (midi: number) => {
      onNoteOnRef.current?.(midi);
      if (doneRef.current) return;
      if (phase !== "repeat") return;

      attemptsRef.current += 1;
      const expected = pattern[playedIndex];
      const isMatch = expected ? expected.midi === midi : false;

      const nextIndex = playedIndex + 1;
      const nextCorrect = correctInOrder + (isMatch ? 1 : 0);

      setPlayedIndex(nextIndex);
      setCorrectInOrder(nextCorrect);
      setFeedback(
        isMatch ? "Bien hecho." : "Casi. Sigue intentando.",
      );

      if (nextIndex >= pattern.length) {
        finish(nextCorrect);
      }
    },
    [phase, pattern, playedIndex, correctInOrder, finish],
  );

  const handleListenAgain = useCallback(async () => {
    if (doneRef.current) return;
    setFeedback("Escucha el patron.");
    setPhase("listen");
    setPlayedIndex(0);
    setCorrectInOrder(0);
    await playPattern();
  }, [playPattern]);

  const handleStartRepeat = useCallback(async () => {
    if (doneRef.current) return;
    await ensureAudio();
    demoTokenRef.current++;
    setIsPlayingDemo(false);
    setPhase("repeat");
    setPlayedIndex(0);
    setCorrectInOrder(0);
    setFeedback("Tu turno. Toca el patron.");
  }, []);

  const handleListo = useCallback(() => {
    if (doneRef.current) return;
    finish(correctInOrder);
  }, [correctInOrder, finish]);

  return (
    <section className="flex w-full flex-col gap-4">
      <header className="flex flex-col gap-2 text-center">
        <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl">
          {prompt}
        </h2>
        <p
          className="text-base text-brand-700"
          aria-live="polite"
          aria-atomic="true"
        >
          {feedback}
        </p>
        {phase === "repeat" ? (
          <p className="text-sm text-brand-600">
            Nota {Math.min(playedIndex + 1, pattern.length)} de {pattern.length}
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleListenAgain}
          disabled={isPlayingDemo || phase === "done"}
          className="rounded-2xl bg-brand-100 px-5 py-3 text-base font-semibold text-brand-900 shadow-sm transition-colors hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Volver a escuchar
        </button>
        {phase === "listen" ? (
          <button
            type="button"
            onClick={handleStartRepeat}
            disabled={isPlayingDemo}
            className="rounded-2xl bg-brand-500 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Empezar a tocar
          </button>
        ) : null}
        {phase === "repeat" ? (
          <button
            type="button"
            onClick={handleListo}
            className="rounded-2xl bg-brand-500 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            Listo
          </button>
        ) : null}
      </div>

      <PianoStage
        labelMode="es"
        octaves={2}
        startMidi={48}
        onNoteOn={handleNoteOn}
      />
    </section>
  );
}
