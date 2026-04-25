"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import PianoStage from "@/components/piano/PianoStage";
import { ensureAudio, playMidi } from "@/lib/audio/engine";
import type { FindNoteExercise } from "@/lib/lessons/schema";
import { midiToNote, SOLFEGE } from "@/lib/types/music";

import type { ExerciseProps } from "./types";

type Feedback =
  | { kind: "idle" }
  | { kind: "wrong"; message: string }
  | { kind: "correct" };

export default function FindNote({
  exercise,
  onResult,
  onNoteOn,
}: ExerciseProps<FindNoteExercise>) {
  const { prompt, target, hintAfterMs } = exercise;

  const [attempts, setAttempts] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const [done, setDone] = useState(false);

  const startedAtRef = useRef<number>(Date.now());
  const doneRef = useRef(false);
  const onResultRef = useRef(onResult);
  const onNoteOnRef = useRef(onNoteOn);

  useEffect(() => {
    onResultRef.current = onResult;
    onNoteOnRef.current = onNoteOn;
  }, [onResult, onNoteOn]);

  // Auto reveal hint after timeout if not solved.
  useEffect(() => {
    if (done) return;
    const id = window.setTimeout(() => {
      if (!doneRef.current) setHintShown(true);
    }, Math.max(0, hintAfterMs));
    return () => window.clearTimeout(id);
  }, [hintAfterMs, done]);

  const handleNoteOn = useCallback(
    async (midi: number) => {
      onNoteOnRef.current?.(midi);
      if (doneRef.current) return;

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (midi === target) {
        doneRef.current = true;
        setDone(true);
        setFeedback({ kind: "correct" });

        // Short success cue: target + perfect fifth.
        await ensureAudio();
        playMidi(target, 0.4);
        window.setTimeout(() => playMidi(target + 7, 0.5), 120);

        const accuracy =
          nextAttempts === 1
            ? 1
            : Math.max(0.5, 1 - 0.15 * wrongAttempts);
        const durationMs = Date.now() - startedAtRef.current;

        onResultRef.current({
          passed: true,
          accuracy,
          attempts: nextAttempts,
          durationMs,
        });
        return;
      }

      const nextWrong = wrongAttempts + 1;
      setWrongAttempts(nextWrong);
      setFeedback({
        kind: "wrong",
        message: "Casi. Esta a un lado.",
      });

      if (nextWrong >= 3) {
        setHintShown(true);
      }
    },
    [attempts, target, wrongAttempts],
  );

  const targetNote = midiToNote(target);
  const targetLabel = `${SOLFEGE[targetNote.name]} ${targetNote.octave}`;

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
          {feedback.kind === "correct"
            ? `Muy bien. Esa es ${targetLabel}.`
            : feedback.kind === "wrong"
              ? feedback.message
              : hintShown
                ? `Pista: busca ${targetLabel}.`
                : "Tocala en el piano."}
        </p>
      </header>

      <PianoStage
        labelMode="es"
        octaves={2}
        startMidi={48}
        highlightedMidis={hintShown ? [target] : []}
        onNoteOn={handleNoteOn}
      />
    </section>
  );
}
