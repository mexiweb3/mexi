"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { supabaseEnv } from "@/lib/supabase/env";

export type Stars = 0 | 1 | 2 | 3;

export type SaveLessonProgressInput = {
  childId: string;
  lessonId: string;
  stars: Stars;
  durationSec: number;
};

export type LessonProgressEntry = {
  stars: Stars;
  lastCompletedAt: string;
};

export type AwardBadgeInput = {
  childId: string;
  badgeId: string;
};

const PROGRESS_KEY = "pianitos.demoProgress";
const BADGES_KEY = "pianitos.demoBadges";

type DemoProgressRecord = {
  childId: string;
  lessonId: string;
  stars: Stars;
  durationSec: number;
  attempts: number;
  lastCompletedAt: string;
};

type DemoBadgeRecord = {
  childId: string;
  badgeId: string;
  awardedAt: string;
};

function clampStars(n: number): Stars {
  if (n <= 0) return 0;
  if (n >= 3) return 3;
  if (n === 1) return 1;
  if (n === 2) return 2;
  return 0;
}

function isStars(v: unknown): v is Stars {
  return v === 0 || v === 1 || v === 2 || v === 3;
}

function readProgress(): DemoProgressRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: DemoProgressRecord[] = [];
    for (const item of parsed) {
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        if (
          typeof rec.childId === "string" &&
          typeof rec.lessonId === "string" &&
          isStars(rec.stars) &&
          typeof rec.durationSec === "number" &&
          typeof rec.attempts === "number" &&
          typeof rec.lastCompletedAt === "string"
        ) {
          out.push({
            childId: rec.childId,
            lessonId: rec.lessonId,
            stars: rec.stars,
            durationSec: rec.durationSec,
            attempts: rec.attempts,
            lastCompletedAt: rec.lastCompletedAt,
          });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

function writeProgress(rows: DemoProgressRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(rows));
}

function readBadges(): DemoBadgeRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BADGES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: DemoBadgeRecord[] = [];
    for (const item of parsed) {
      if (item && typeof item === "object") {
        const rec = item as Record<string, unknown>;
        if (
          typeof rec.childId === "string" &&
          typeof rec.badgeId === "string" &&
          typeof rec.awardedAt === "string"
        ) {
          out.push({
            childId: rec.childId,
            badgeId: rec.badgeId,
            awardedAt: rec.awardedAt,
          });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

function writeBadges(rows: DemoBadgeRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BADGES_KEY, JSON.stringify(rows));
}

function saveProgressLocal(input: SaveLessonProgressInput): void {
  const all = readProgress();
  const existing = all.find(
    (r) => r.childId === input.childId && r.lessonId === input.lessonId,
  );
  const now = new Date().toISOString();
  if (existing) {
    existing.attempts = existing.attempts + 1;
    existing.durationSec = existing.durationSec + Math.max(0, input.durationSec);
    existing.stars = clampStars(Math.max(existing.stars, input.stars));
    existing.lastCompletedAt = now;
  } else {
    all.push({
      childId: input.childId,
      lessonId: input.lessonId,
      stars: input.stars,
      durationSec: Math.max(0, input.durationSec),
      attempts: 1,
      lastCompletedAt: now,
    });
  }
  writeProgress(all);
}

/**
 * Persist a lesson result for a child. When Supabase is configured and the
 * parent is signed in, upserts into `child_progress` (sums total_time_sec,
 * increments attempts, takes max(stars, best_score)). Falls back to
 * localStorage under `pianitos.demoProgress` otherwise.
 */
export async function saveLessonProgress(
  input: SaveLessonProgressInput,
): Promise<void> {
  const supabase = supabaseEnv.isConfigured ? getSupabaseBrowser() : null;

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      if (userId) {
        const { data: existingRow } = await supabase
          .from("child_progress")
          .select("stars, best_score, total_time_sec, attempts")
          .eq("child_id", input.childId)
          .eq("lesson_id", input.lessonId)
          .maybeSingle();

        const prevStars = existingRow?.stars ?? 0;
        const prevBest = existingRow?.best_score ?? 0;
        const prevTime = existingRow?.total_time_sec ?? 0;
        const prevAttempts = existingRow?.attempts ?? 0;

        const newStars = Math.max(prevStars, input.stars);
        const newBest = Math.max(prevBest, input.stars);
        const newTotalTime = prevTime + Math.max(0, input.durationSec);
        const newAttempts = prevAttempts + 1;
        const completedAt = new Date().toISOString();

        const { error } = await supabase.from("child_progress").upsert(
          {
            child_id: input.childId,
            lesson_id: input.lessonId,
            stars: newStars,
            best_score: newBest,
            completed_at: completedAt,
            total_time_sec: newTotalTime,
            attempts: newAttempts,
          },
          { onConflict: "child_id,lesson_id" },
        );

        if (!error) return;
        // fall through to local storage on error
      }
    } catch {
      // fall through
    }
  }

  saveProgressLocal(input);
}

/**
 * Read all lesson progress for a given child, keyed by lessonId.
 * Reads from Supabase when configured + signed in, otherwise from local
 * demo storage.
 */
export async function getLessonProgress(
  childId: string,
): Promise<Record<string, LessonProgressEntry>> {
  const supabase = supabaseEnv.isConfigured ? getSupabaseBrowser() : null;

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      if (userId) {
        const { data, error } = await supabase
          .from("child_progress")
          .select("lesson_id, stars, completed_at")
          .eq("child_id", childId);

        if (!error && data) {
          const out: Record<string, LessonProgressEntry> = {};
          for (const row of data) {
            const stars = clampStars(row.stars ?? 0);
            const lastCompletedAt = row.completed_at ?? new Date(0).toISOString();
            out[row.lesson_id] = { stars, lastCompletedAt };
          }
          return out;
        }
      }
    } catch {
      // fall through
    }
  }

  const all = readProgress().filter((r) => r.childId === childId);
  const out: Record<string, LessonProgressEntry> = {};
  for (const r of all) {
    out[r.lessonId] = {
      stars: r.stars,
      lastCompletedAt: r.lastCompletedAt,
    };
  }
  return out;
}

/**
 * Award a badge to a child. Idempotent: re-awarding the same badge does not
 * duplicate. Uses Supabase when configured + signed in, otherwise local
 * storage.
 */
export async function awardBadge(input: AwardBadgeInput): Promise<void> {
  const supabase = supabaseEnv.isConfigured ? getSupabaseBrowser() : null;

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      if (userId) {
        const { error } = await supabase.from("child_badges").upsert(
          {
            child_id: input.childId,
            badge_id: input.badgeId,
            awarded_at: new Date().toISOString(),
          },
          { onConflict: "child_id,badge_id" },
        );
        if (!error) return;
      }
    } catch {
      // fall through
    }
  }

  const all = readBadges();
  const exists = all.some(
    (b) => b.childId === input.childId && b.badgeId === input.badgeId,
  );
  if (!exists) {
    all.push({
      childId: input.childId,
      badgeId: input.badgeId,
      awardedAt: new Date().toISOString(),
    });
    writeBadges(all);
  }
}

/**
 * List badge IDs awarded to a given child. Reads from Supabase when
 * configured + signed in, otherwise from local demo storage.
 */
export async function listAwardedBadges(childId: string): Promise<string[]> {
  const supabase = supabaseEnv.isConfigured ? getSupabaseBrowser() : null;

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      if (userId) {
        const { data, error } = await supabase
          .from("child_badges")
          .select("badge_id")
          .eq("child_id", childId);

        if (!error && data) {
          return data.map((row) => row.badge_id);
        }
      }
    } catch {
      // fall through
    }
  }

  return readBadges()
    .filter((b) => b.childId === childId)
    .map((b) => b.badgeId);
}
