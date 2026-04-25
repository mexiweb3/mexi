"use client";

import { createBrowserClient } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export type SupabaseBrowserClient = ReturnType<
  typeof createBrowserClient<Database>
>;

let cached: SupabaseBrowserClient | null = null;

/**
 * Returns a Supabase browser client, or null if env is not configured.
 * Memoized across calls within the same browser session.
 */
export function getSupabaseBrowser(): SupabaseBrowserClient | null {
  if (!supabaseEnv.isConfigured || !supabaseEnv.url || !supabaseEnv.anonKey) {
    return null;
  }
  if (cached) return cached;
  cached = createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.anonKey);
  return cached;
}
