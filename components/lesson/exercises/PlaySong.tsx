"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import FallingNotes, {
  type FallingNote,
} from "@/components/piano/FallingNotes";
import PianoStage from "@/components/piano/PianoStage";
import { ensureAudio, playMidi } from "@/lib/audio/engine";
import type { PlaySongExercise } from "@/lib/lessons/schema";
import { midiToNote, SOLFEGE } from "@/lib/types/music";
import { useMidiStore } from "@/store/midi";

import type { ExerciseProps } from "./types";

type Phase = "idle" | "demo" | "playing" | "done";

const WINDOW_SEC = 4;
const HIT_TOLERANCE_SEC = 0.6;
const END_BUFFER_SEC = 0.5;
const PIANO_START_MIDI = 48;
const PIANO_OCTAVES = 2;

type ScheduledNote = FallingNote & { index: number };

function buildSchedule(
  score: PlaySongExercise["score"],
  tempoBpm: number,
  leadInSec: number,
): ScheduledNote[] {
  const secPerBeat = 60 / Math.max(1, tempoBpm);
  const out: ScheduledNote[] = [];
  let cursor = leadInSec;
  for (let i = 0; i < score.length; i++) {
    const n = score[i];
    const durationSec = n.durationBeats * secPerBeat;
    out.push({
      index: i,
      midi: n.midi,
      startSec: cursor,
      durationSec,
    });
    cursor += durationSec;
  }
  return out;
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

export default function PlaySong({
  exercise,
  onResult,
  onNoteOn,
}: ExerciseProps<PlaySongExercise>) {
  const { prompt, score, tempoBpm, passThreshold } = exercise;
  const total = score.length;

  const reducedMotion = useReducedMotion();

  const notes = useMemo(
    () => buildSchedule(score, tempoBpm, WINDOW_SEC),
    [score, tempoBpm],
  );
  const lastNoteEnd = useMemo(() => {
    if (notes.length === 0) return 0;
    const last = notes[notes.length - 1];
    return last.startSec + last.durationSec;
  }, [notes]);

  // ------- State -------
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [missed, setMissed] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);

  // ------- Refs (mutable state for rAF loop) -------
  const phaseRef = useRef<Phase>("idle");
  const nextIndexRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const missedRef = useRef(0);
  const hitMapRef = useRef<boolean[]>([]);
  const missedMapRef = useRef<boolean[]>([]);

  const runStartedAtRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const sessionStartedAtRef = useRef<number>(Date.now());
  const finishedRef = useRef(false);
  const feedbackTimerRef = useRef<number | null>(null);

  const onResultRef = useRef(onResult);
  const onNoteOnRef = useRef(onNoteOn);
  useEffect(() => {
    onResultRef.current = onResult;
    onNoteOnRef.current = onNoteOn;
  }, [onResult, onNoteOn]);

  // Reset internal arrays when the exercise notes change.
  useEffect(() => {
    hitMapRef.current = new Array(notes.length).fill(false);
    missedMapRef.current = new Array(notes.length).fill(false);
  }, [notes]);

  const stopRaf = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const setPhaseSafe = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const showFeedback = useCallback((msg: string, ms = 900) => {
    setFeedback(msg);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, ms);
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    stopRaf();
    const denom = Math.max(total, 1);
    const acc = Math.max(0, Math.min(1, correctRef.current / denom));
    const isPassed = acc >= passThreshold;
    setAccuracy(acc);
    setPassed(isPassed);
    setPhaseSafe("done");
    onResultRef.current({
      passed: isPassed,
      accuracy: acc,
      attempts: 1,
      durationMs: Date.now() - sessionStartedAtRef.current,
    });
  }, [total, passThreshold, stopRaf, setPhaseSafe]);

  const tick = useCallback(
    (timestampMs: number) => {
      if (phaseRef.current !== "playing") {
        rafIdRef.current = null;
        return;
      }
      if (runStartedAtRef.current === null) {
        runStartedAtRef.current = timestampMs;
      }
      const elapsed =
        (timestampMs - runStartedAtRef.current) / 1000 + pausedElapsedRef.current;
      setCurrentTimeSec(elapsed);

      // Auto-advance any missed notes whose hit window has fully passed.
      let i = nextIndexRef.current;
      while (i < notes.length) {
        const n = notes[i];
        const limit = n.startSec + HIT_TOLERANCE_SEC;
        if (hitMapRef.current[i]) {
          i += 1;
          continue;
        }
        if (elapsed > limit) {
          if (!missedMapRef.current[i]) {
            missedMapRef.current[i] = true;
            missedRef.current += 1;
            setMissed(missedRef.current);
          }
          i += 1;
          continue;
        }
        break;
      }
      if (i !== nextIndexRef.current) {
        nextIndexRef.current = i;
        setNextIndex(i);
      }

      if (elapsed >= lastNoteEnd + END_BUFFER_SEC) {
        finish();
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    },
    [notes, lastNoteEnd, finish],
  );

  const startRaf = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // ------- Controls -------
  const handleStart = useCallback(async () => {
    await ensureAudio();
    finishedRef.current = false;
    nextIndexRef.current = 0;
    correctRef.current = 0;
    wrongRef.current = 0;
    missedRef.current = 0;
    hitMapRef.current = new Array(notes.length).fill(false);
    missedMapRef.current = new Array(notes.length).fill(false);
    setNextIndex(0);
    setCorrect(0);
    setWrong(0);
    setMissed(0);
    setAccuracy(null);
    setPassed(null);
    setCurrentTimeSec(0);
    runStartedAtRef.current = null;
    pausedElapsedRef.current = 0;
    sessionStartedAtRef.current = Date.now();
    setPhaseSafe("playing");
  }, [notes.length, setPhaseSafe]);

  const handlePause = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    stopRaf();
    if (runStartedAtRef.current !== null) {
      pausedElapsedRef.current +=
        (performance.now() - runStartedAtRef.current) / 1000;
      runStartedAtRef.current = null;
    }
    setPhaseSafe("idle");
  }, [stopRaf, setPhaseSafe]);

  const handleStop = useCallback(() => {
    stopRaf();
    runStartedAtRef.current = null;
    pausedElapsedRef.current = 0;
    setCurrentTimeSec(0);
    setPhaseSafe("idle");
  }, [stopRaf, setPhaseSafe]);

  const handleReset = useCallback(() => {
    stopRaf();
    finishedRef.current = false;
    nextIndexRef.current = 0;
    correctRef.current = 0;
    wrongRef.current = 0;
    missedRef.current = 0;
    hitMapRef.current = new Array(notes.length).fill(false);
    missedMapRef.current = new Array(notes.length).fill(false);
    runStartedAtRef.current = null;
    pausedElapsedRef.current = 0;
    setNextIndex(0);
    setCorrect(0);
    setWrong(0);
    setMissed(0);
    setAccuracy(null);
    setPassed(null);
    setCurrentTimeSec(0);
    setFeedback(null);
    setPhaseSafe("idle");
  }, [notes.length, stopRaf, setPhaseSafe]);

  const handleDemo = useCallback(async () => {
    const initial: Phase = phaseRef.current;
    if (initial === "demo" || initial === "playing") return;
    await ensureAudio();
    setPhaseSafe("demo");
    const secPerBeat = 60 / Math.max(1, tempoBpm);
    const startedAt = performance.now();
    for (let i = 0; i < score.length; i++) {
      const current: Phase = phaseRef.current;
      if (current !== "demo") return;
      const n = score[i];
      const durationSec = n.durationBeats * secPerBeat;
      playMidi(n.midi, Math.max(0.15, durationSec * 0.95));
      await new Promise<void>((resolve) =>
        window.setTimeout(resolve, Math.max(0, durationSec) * 1000),
      );
      // Bail if user cancelled or moved on.
      const after: Phase = phaseRef.current;
      if (after !== "demo") return;
      // Avoid runaway in case of long score.
      if (performance.now() - startedAt > 60_000) break;
    }
    const last: Phase = phaseRef.current;
    if (last === "demo") {
      setPhaseSafe("idle");
    }
  }, [score, tempoBpm, setPhaseSafe]);

  // Drive rAF when entering "playing".
  useEffect(() => {
    if (phase === "playing") {
      startRaf();
    } else {
      stopRaf();
    }
    return () => {
      stopRaf();
    };
  }, [phase, startRaf, stopRaf]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      stopRaf();
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [stopRaf]);

  // ------- Input handling -------
  const handleInput = useCallback(
    (midi: number, fromHardware: boolean) => {
      onNoteOnRef.current?.(midi);
      if (phaseRef.current !== "playing") return;
      const i = nextIndexRef.current;
      const expected = notes[i];
      if (!expected) return;

      const now = currentTimeSecRef.current;
      const delta = now - expected.startSec;

      if (midi === expected.midi) {
        if (delta < -HIT_TOLERANCE_SEC) {
          // Too early.
          showFeedback("Espera...");
          return;
        }
        if (delta > HIT_TOLERANCE_SEC) {
          // Already counted as missed by the rAF tick.
          return;
        }
        // Valid hit.
        hitMapRef.current[i] = true;
        correctRef.current += 1;
        setCorrect(correctRef.current);
        nextIndexRef.current = i + 1;
        setNextIndex(i + 1);
        showFeedback("Bien!");
        // Both VirtualKeyboard (on-screen) and KeyboardMidiBridge (hardware)
        // already trigger playMidi upstream, so we don't replay here. The
        // `fromHardware` flag is preserved so future hooks can use it.
        void fromHardware;
        return;
      }
      // Wrong note: kid-kind feedback, do not block.
      wrongRef.current += 1;
      setWrong(wrongRef.current);
      showFeedback("Casi");
    },
    [notes, showFeedback],
  );

  // Keep currentTimeSec available to handlers via a ref to avoid stale closures.
  const currentTimeSecRef = useRef(0);
  useEffect(() => {
    currentTimeSecRef.current = currentTimeSec;
  }, [currentTimeSec]);

  // Mirror MIDI hardware via the store.
  const lastEvent = useMidiStore((s) => s.lastEvent);
  const lastEventRef = useRef(lastEvent);
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent === lastEventRef.current) return;
    lastEventRef.current = lastEvent;
    if (lastEvent.type !== "noteOn") return;
    handleInput(lastEvent.midi, true);
  }, [lastEvent, handleInput]);

  // Handler for the on-screen keyboard.
  const handleKeyboardNoteOn = useCallback(
    (midi: number) => {
      handleInput(midi, false);
    },
    [handleInput],
  );

  // ------- Derived UI bits -------
  const upcoming = notes[nextIndex];
  const upcomingMidi = upcoming?.midi ?? null;
  const upcomingLabel = upcomingMidi !== null
    ? (() => {
        const n = midiToNote(upcomingMidi);
        return `${SOLFEGE[n.name]} ${n.octave}`;
      })()
    : null;

  const counterText = `Nota ${Math.min(nextIndex + 1, total)} de ${total}`;
  const displayedCounterText = phase === "done" ? `${total} de ${total}` : counterText;

  return (
    <section className="flex w-full flex-col gap-4">
      <header className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-2xl font-bold text-brand-900 sm:text-3xl md:text-4xl">
          {prompt}
        </h2>
        <p className="text-base text-brand-700" aria-live="polite">
          {displayedCounterText}
        </p>
        <p className="text-sm text-brand-600" aria-live="polite">
          Aciertos: {correct} de {total}
          {wrong > 0 ? ` | Casi: ${wrong}` : ""}
          {missed > 0 ? ` | Perdidas: ${missed}` : ""}
        </p>
        {feedback ? (
          <p
            role="status"
            className={
              "rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-800" +
              (reducedMotion ? "" : " animate-bounceSoft")
            }
          >
            {feedback}
          </p>
        ) : null}
        {upcomingLabel && phase !== "done" ? (
          <p className="sr-only" aria-live="polite">
            Siguiente nota: {upcomingLabel}
          </p>
        ) : null}
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <div className="h-[180px] md:h-[260px] lg:h-[280px]">
          <FallingNotes
            startMidi={PIANO_START_MIDI}
            octaves={PIANO_OCTAVES}
            notes={notes}
            currentTimeSec={currentTimeSec}
            windowSec={WINDOW_SEC}
            className="h-full"
          />
        </div>
        <div className="-mt-px">
          <PianoStage
            labelMode="es"
            octaves={PIANO_OCTAVES}
            startMidi={PIANO_START_MIDI}
            highlightedMidis={
              phase === "playing" && upcomingMidi !== null ? [upcomingMidi] : []
            }
            onNoteOn={handleKeyboardNoteOn}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-3">
        {phase === "idle" || phase === "demo" ? (
          <>
            <button
              type="button"
              className="btn-primary min-h-[60px]"
              onClick={() => {
                void handleStart();
              }}
            >
              {currentTimeSec > 0 ? "Reanudar" : "Empezar"}
            </button>
            <button
              type="button"
              className="btn-secondary min-h-[60px]"
              onClick={() => {
                void handleDemo();
              }}
              disabled={phase === "demo"}
            >
              {phase === "demo" ? "Reproduciendo..." : "Tocar demostracion"}
            </button>
            {currentTimeSec > 0 ? (
              <button
                type="button"
                className="btn-secondary min-h-[60px]"
                onClick={handleReset}
              >
                Volver a empezar
              </button>
            ) : null}
          </>
        ) : null}

        {phase === "playing" ? (
          <>
            <button
              type="button"
              className="btn-secondary min-h-[60px]"
              onClick={handlePause}
            >
              Pausar
            </button>
            <button
              type="button"
              className="btn-secondary min-h-[60px]"
              onClick={handleStop}
            >
              Detener
            </button>
          </>
        ) : null}

        {phase === "done" ? (
          <div className="flex w-full flex-col items-center gap-3">
            <p
              className="text-lg font-bold text-brand-900"
              role="status"
              aria-live="polite"
            >
              {passed === true
                ? `Lo lograste! Precision ${(Math.round((accuracy ?? 0) * 100))}%`
                : `Sigue practicando. Precision ${(Math.round((accuracy ?? 0) * 100))}%`}
            </p>
            <button
              type="button"
              className="btn-primary min-h-[60px]"
              onClick={handleReset}
            >
              Volver a empezar
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
