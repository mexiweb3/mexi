/**
 * Certificate eligibility helpers. Pure, framework-free, server-safe.
 *
 * A child is eligible for a module diploma when every lesson in that module
 * has been completed with at least 1 star. Total stars are aggregated across
 * the module so the certificate can showcase performance.
 */

export type ModuleNumber = 1 | 2;

export type ModuleStatus = {
  complete: boolean;
  lessonsCompleted: number;
  totalStars: number;
  totalLessons: number;
};

export type ProgressInput = Record<string, { stars: 0 | 1 | 2 | 3 }>;

const MODULE_LESSONS: Record<ModuleNumber, readonly string[]> = {
  1: ["m1l1", "m1l2", "m1l3", "m1l4", "m1l5"],
  2: ["m2l1", "m2l2", "m2l3", "m2l4", "m2l5"],
};

export function getModuleLessonIds(moduleNum: ModuleNumber): readonly string[] {
  return MODULE_LESSONS[moduleNum];
}

export function moduleStatus(
  progress: ProgressInput,
  moduleNum: ModuleNumber,
): ModuleStatus {
  const lessonIds = MODULE_LESSONS[moduleNum];
  let lessonsCompleted = 0;
  let totalStars = 0;

  for (const id of lessonIds) {
    const entry = progress[id];
    if (!entry) continue;
    if (entry.stars >= 1) {
      lessonsCompleted += 1;
    }
    totalStars += entry.stars;
  }

  return {
    complete: lessonsCompleted === lessonIds.length,
    lessonsCompleted,
    totalStars,
    totalLessons: lessonIds.length,
  };
}

export const MODULE_TITLES: Record<ModuleNumber, string> = {
  1: "Cimientos",
  2: "Aventura ritmica",
};

export function getModuleTitle(moduleNum: ModuleNumber): string {
  return MODULE_TITLES[moduleNum];
}

export function isModuleNumber(value: unknown): value is ModuleNumber {
  return value === 1 || value === 2;
}

/**
 * Deterministic short certificate id derived from child + module + seed.
 * Uses a small djb2-style hash so it works in Node and Edge without
 * requiring crypto.subtle. Output is "CT-XXXXX" (5 hex chars uppercased).
 */
export function makeCertificateId(
  childId: string,
  moduleNumber: ModuleNumber,
  awardedAtSeed: string,
): string {
  const input = `${childId}-${moduleNumber}-${awardedAtSeed}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  // Convert to unsigned 32-bit, hex, then take 5 chars.
  const unsigned = hash >>> 0;
  const hex = unsigned.toString(16).padStart(8, "0").slice(0, 5).toUpperCase();
  return `CT-${hex}`;
}
