import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

export type SupabaseServerClient = ReturnType<
  typeof createServerClient<Database>
>;

/**
 * Returns a Supabase server client bound to the current request cookies,
 * or null if env is not configured. Cookie writes are best-effort: they no-op
 * when called from a Server Component (Next disallows mutation there).
 */
export function getSupabaseServer(): SupabaseServerClient | null {
  if (!supabaseEnv.isConfigured || !supabaseEnv.url || !supabaseEnv.anonKey) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server Components cannot mutate cookies; middleware handles refresh.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // see above
        }
      },
    },
  });
}
