import "server-only";

import Stripe from "stripe";

import { stripeEnv } from "@/lib/stripe/env";

let cached: Stripe | null = null;

/**
 * API version pinned per project brief. Cast through `Stripe.LatestApiVersion`
 * because the installed `stripe` types may advertise a newer literal than the
 * one we want to lock to — Stripe accepts any valid version string at runtime.
 */
const PINNED_API_VERSION =
  "2024-11-20.acacia" as unknown as Stripe.LatestApiVersion;

/**
 * Server-only Stripe SDK client. Lazy-initialized; returns null when the
 * STRIPE_SECRET_KEY env var is missing so the app keeps booting in demo mode.
 */
export function getStripe(): Stripe | null {
  if (!stripeEnv.secret) return null;
  if (cached) return cached;
  cached = new Stripe(stripeEnv.secret, {
    apiVersion: PINNED_API_VERSION,
    typescript: true,
    appInfo: {
      name: "Pianitos",
      version: "0.1.0",
    },
  });
  return cached;
}
