/**
 * Profile quota helpers.
 *
 * Free plan: 1 child profile.
 * Premium plan: up to 3 child profiles.
 *
 * Pure functions only. No I/O, no React, no Supabase. Safe to import from
 * server components, client components, and tests alike.
 */

export const MAX_FREE_PROFILES = 1;
export const MAX_PREMIUM_PROFILES = 3;

export type Plan = "free" | "premium";

/**
 * Maximum number of child profiles allowed on the given plan.
 */
export function profileQuota(plan: Plan): number {
  return plan === "premium" ? MAX_PREMIUM_PROFILES : MAX_FREE_PROFILES;
}

/**
 * Whether another profile may be added on the given plan.
 */
export function canAddProfile(plan: Plan, currentCount: number): boolean {
  if (currentCount < 0) return false;
  return currentCount < profileQuota(plan);
}
