/**
 * Single source of truth for Stripe environment configuration.
 * Lazy-evaluated so missing env vars never throw at module load time.
 */

function read(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value;
}

const secret = read("STRIPE_SECRET_KEY");
const publishable = read("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
const webhookSecret = read("STRIPE_WEBHOOK_SECRET");
const priceMonthly = read("STRIPE_PRICE_MONTHLY");
const priceYearly = read("STRIPE_PRICE_YEARLY");

export type StripeEnv = {
  secret: string | null;
  publishable: string | null;
  webhookSecret: string | null;
  priceMonthly: string | null;
  priceYearly: string | null;
  isConfigured: boolean;
};

export const stripeEnv: StripeEnv = {
  secret,
  publishable,
  webhookSecret,
  priceMonthly,
  priceYearly,
  isConfigured: Boolean(secret && publishable && (priceMonthly || priceYearly)),
};

/**
 * Returns the Stripe price id for the requested plan, or null if missing.
 */
export function getPriceId(plan: "monthly" | "yearly"): string | null {
  return plan === "monthly" ? priceMonthly : priceYearly;
}
