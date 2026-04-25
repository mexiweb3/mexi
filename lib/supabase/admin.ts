import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;

let cached: SupabaseAdminClient | null = null;

/**
 * Service-role Supabase client. SERVER ONLY. Bypasses RLS.
 * Throws if env is missing — never call from request handlers without
 * checking `supabaseEnv.isConfigured` first.
 */
export function getSupabaseAdmin(): SupabaseAdminClient {
  if (!supabaseEnv.url || !supabaseEnv.serviceRoleKey) {
    throw new Error(
      "Supabase admin no esta configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor."
    );
  }
  if (cached) return cached;
  cached = createClient<Database>(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cached;
}
