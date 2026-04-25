/**
 * Privacy-first analytics helpers for Plausible.
 *
 * No cookies, no PII. Only counts and ids.
 * When NEXT_PUBLIC_PLAUSIBLE_DOMAIN is missing, all calls become no-ops
 * (with a console.debug breadcrumb in development).
 */

export type PianitosEvent =
  | "signup_completed"
  | "consent_signed"
  | "child_profile_created"
  | "lesson_started"
  | "lesson_completed"
  | "paywall_seen"
  | "checkout_started"
  | "subscription_active"
  | "account_deleted"
  | "midi_connected"
  | "audio_unlocked"
  | "share_progress";

export type PlausibleEventProps = Record<string, string | number | boolean>;

const rawDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const domain: string | null =
  typeof rawDomain === "string" && rawDomain.trim().length > 0 ? rawDomain.trim() : null;

export const plausibleConfig: { domain: string | null; isConfigured: boolean } = {
  domain,
  isConfigured: domain !== null,
};

/**
 * Track a typed Pianitos event.
 *
 * SSR-safe: returns immediately when `window` is undefined.
 * Never sends personal data: callers MUST omit emails, names, etc.
 */
export function trackEvent(name: PianitosEvent, props?: PlausibleEventProps): void {
  if (typeof window === "undefined") return;

  if (!plausibleConfig.isConfigured) {
    // eslint-disable-next-line no-console
    console.debug("[plausible] would track", name, props);
    return;
  }

  const plausible = window.plausible;
  if (typeof plausible !== "function") {
    // Script not yet loaded — Plausible's queue (set up by PlausibleScript)
    // should normally absorb this. Bail quietly if it isn't ready.
    // eslint-disable-next-line no-console
    console.debug("[plausible] queue not ready, dropping", name, props);
    return;
  }

  plausible(name, props ? { props } : undefined);
}
