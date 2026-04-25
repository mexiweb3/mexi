/**
 * Single source of truth for Supabase environment configuration.
 * Lazy-evaluated so missing env vars never throw at module load time.
 */

function read(name: string): string | null {
  const value = process.env[name];
  if (!value || value.trim() === "") return null;
  return value;
}

const url = read("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = read("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceRoleKey = read("SUPABASE_SERVICE_ROLE_KEY");

export type SupabaseEnv = {
  url: string | null;
  anonKey: string | null;
  serviceRoleKey: string | null;
  isConfigured: boolean;
};

export const supabaseEnv: SupabaseEnv = {
  url,
  anonKey,
  serviceRoleKey,
  isConfigured: Boolean(url && anonKey),
};

export type ConfiguredSupabaseEnv = SupabaseEnv & {
  url: string;
  anonKey: string;
};

/**
 * Throws a friendly error if Supabase is not configured.
 * Use in code paths that strictly require a real Supabase backend.
 * Returns the env narrowed to non-null url/anonKey.
 */
export function assertConfigured(): ConfiguredSupabaseEnv {
  if (!supabaseEnv.isConfigured || !supabaseEnv.url || !supabaseEnv.anonKey) {
    throw new Error(
      "Supabase no esta configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local."
    );
  }
  return supabaseEnv as ConfiguredSupabaseEnv;
}

/**
 * App URL helper. Falls back to localhost for local development.
 */
export function getAppUrl(): string {
  const fromEnv = read("NEXT_PUBLIC_APP_URL");
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3000";
}
