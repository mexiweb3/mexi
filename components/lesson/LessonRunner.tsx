"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  ExerciseResult,
  Lesson,
  LessonStep,
} from "@/lib/lessons/schema";
import { starsForResult } from "@/lib/lessons/schema";
import { getNextLessonId } from "@/lib/lessons/registry";
import { awardBadge, saveLessonProgress } from "@/lib/persistence/progress";
import type { Stars } from "@/lib/persistence/progress";
import { trackEvent } from "@/lib/analytics/plausible";
import { useChildProfile } from "@/store/childProfile";
import { useLessonRun } from "@/store/lesson";

import ExerciseHost from "./ExerciseHost";
import StepCelebration from "./StepCelebration";
import StepDemo from "./StepDemo";
import StepIntro from "./StepIntro";

type Props = {
  lesson: Lesson;
};

function clampStars(n: number): Stars {
  if (n >= 3) return 3;
  if (n === 2) return 2;
  if (n === 1) return 1;
  return 0;
}

function averageStars(values: number[]): Stars {
  const exerciseValues = values.filter((v) => v > 0);
  if (exerciseValues.length === 0) {
    return values.length > 0 ? 1 : 0;
  }
  const avg =
    exerciseValues.reduce((acc, v) => acc + v, 0) / exerciseValues.length;
  return clampStars(Math.round(avg));
}

export default function LessonRunner({ lesson }: Props) {
  const router = useRouter();
  const activeChild = useChildProfile((s) => s.activeChild);

  const lessonId = useLessonRun((s) => s.lessonId);
  const stepIndex = useLessonRun((s) => s.stepIndex);
  const startedAt = useLessonRun((s) => s.startedAt);
  const perStepStars = useLessonRun((s) => s.perStepStars);
  const setRun = useLessonRun((s) => s.set);
  const resetRun = useLessonRun((s) => s.reset);

  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const initRef = useRef<string | null>(null);

  // (Re)initialize the run whenever the lesson id changes.
  useEffect(() => {
    if (initRef.current === lesson.id) return;
    initRef.current = lesson.id;
    setRun({
      lessonId: lesson.id,
      stepIndex: 0,
      startedAt: Date.now(),
      wrongAttemptsTotal: 0,
      perStepStars: [],
    });
    trackEvent("lesson_started", {
      lessonId: lesson.id,
      module: lesson.module,
    });
  }, [lesson.id, lesson.module, setRun]);

  // Reset on unmount so a new visit starts fresh.
  useEffect(() => {
    return () => {
      resetRun();
    };
  }, [resetRun]);

  const totalSteps = lesson.steps.length;
  const currentIndex = Math.min(stepIndex, totalSteps - 1);
  const step: LessonStep | undefined = lesson.steps[currentIndex];

  const advance = useCallback(
    (starsForStep: number = 0) => {
      const nextStars = [...perStepStars];
      nextStars[currentIndex] = starsForStep;
      const next = Math.min(currentIndex + 1, totalSteps - 1);
      setRun({
        stepIndex: next,
        perStepStars: nextStars,
      });
    },
    [currentIndex, perStepStars, setRun, totalSteps],
  );

  const handleExerciseResult = useCallback(
    (result: ExerciseResult) => {
      const earned = starsForResult(result);
      advance(earned);
    },
    [advance],
  );

  const handleExit = useCallback(() => {
    const ok = window.confirm(
      "Seguro? Tu progreso se guarda al terminar la leccion.",
    );
    if (ok) {
      resetRun();
      router.push("/nino/inicio");
    }
  }, [resetRun, router]);

  // Best-effort: only render once the store is initialized for this lesson.
  if (lessonId !== lesson.id || !step) {
    return (
      <div
        aria-hidden="true"
        className="mx-auto flex w-full max-w-md items-center justify-center py-16"
      >
        <span className="h-12 w-12 animate-bounceSoft rounded-full bg-brand-200" />
      </div>
    );
  }

  const stepNumber = currentIndex + 1;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleExit}
          aria-label="Salir de la leccion"
          className="rounded-xl border-2 border-brand-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-700 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
        >
          Salir
        </button>
        <div
          aria-label={`Paso ${stepNumber} de ${totalSteps}`}
          className="flex flex-1 flex-col gap-1"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
            Paso {stepNumber} / {totalSteps}
          </span>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalSteps}
            aria-valuenow={stepNumber}
            className="h-3 w-full overflow-hidden rounded-full border-2 border-brand-200 bg-white"
          >
            <div
              className="h-full bg-brand-400 transition-[width] duration-300"
              style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        {step.kind === "intro" ? (
          <StepIntro
            title={step.title}
            narration={step.narration}
            mascotState={step.mascotState}
            onAdvance={() => {
              setHasInteracted(true);
              advance(0);
            }}
          />
        ) : null}

        {step.kind === "demo" ? (
          <StepDemo
            narration={step.narration}
            notes={step.notes}
            tempoBpm={step.tempoBpm}
            highlightedMidis={step.highlightedMidis}
            hasInteracted={hasInteracted}
            onInteracted={() => setHasInteracted(true)}
            onAdvance={() => advance(0)}
          />
        ) : null}

        {step.kind === "exercise" ? (
          <ExerciseHost
            exercise={step.exercise}
            onResult={handleExerciseResult}
          />
        ) : null}

        {step.kind === "celebration" ? (
          <CelebrationGate
            childId={activeChild?.id ?? null}
            lessonId={lesson.id}
            startedAt={startedAt}
            stars={averageStars(perStepStars)}
            badgeId={step.badgeId}
            message={step.message}
            nextLessonId={getNextLessonId(lesson.id)}
          />
        ) : null}
      </div>
    </div>
  );
}

type CelebrationGateProps = {
  childId: string | null;
  lessonId: string;
  startedAt: number | null;
  stars: Stars;
  badgeId: string | undefined;
  message: string;
  nextLessonId: string | null;
};

function CelebrationGate({
  childId,
  lessonId,
  startedAt,
  stars,
  badgeId,
  message,
  nextLessonId,
}: CelebrationGateProps) {
  const savedRef = useRef<boolean>(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    trackEvent("lesson_completed", {
      lessonId,
      stars,
    });
    if (!childId) return;
    const durationSec =
      startedAt != null
        ? Math.max(0, Math.round((Date.now() - startedAt) / 1000))
        : 0;
    void saveLessonProgress({
      childId,
      lessonId,
      stars,
      durationSec,
    });
    if (badgeId) {
      void awardBadge({ childId, badgeId });
    }
  }, [childId, lessonId, startedAt, stars, badgeId]);

  return (
    <StepCelebration
      message={message}
      stars={stars}
      badgeId={badgeId}
      nextLessonId={nextLessonId}
    />
  );
}
