import "server-only";

import { Resend } from "resend";

import { emailEnv } from "@/lib/email/env";

let cached: Resend | null = null;

/**
 * Server-only Resend SDK client. Lazy-initialized; returns null when the
 * RESEND_API_KEY env var is missing so the app keeps booting in demo mode.
 * Callers MUST handle the null case (treat as no-op).
 */
export function getResend(): Resend | null {
  if (!emailEnv.apiKey) return null;
  if (cached) return cached;
  cached = new Resend(emailEnv.apiKey);
  return cached;
}
