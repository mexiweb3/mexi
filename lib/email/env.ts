/**
 * Single source of truth for Resend / email environment configuration.
 * Lazy-evaluated so missing env vars never throw at module load time.
 * Email is OPTIONAL: when not configured, send routines should log + no-op.
 */

function read(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value;
}

const apiKey = read("RESEND_API_KEY");
const from = read("RESEND_FROM") ?? "Pianitos <hola@pianitos.app>";

export type EmailEnv = {
  apiKey: string | null;
  from: string;
  isConfigured: boolean;
};

export const emailEnv: EmailEnv = {
  apiKey,
  from,
  isConfigured: Boolean(apiKey),
};
