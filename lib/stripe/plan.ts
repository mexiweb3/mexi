import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseEnv } from "@/lib/supabase/env";
import type { SubscriptionsRow } from "@/lib/supabase/types";

export type ActiveSubscription = {
  status: string;
  periodEnd: string | null;
  cancelAt: string | null;
};

/**
 * Returns the current subscription row for a parent, or null if none exists
 * (or if Supabase is not configured / errored). Reads via the admin client so
 * webhook-written rows are always visible without RLS friction.
 */
export async function getActiveSubscriptionForParent(
  parentId: string,
): Promise<ActiveSubscription | null> {
  if (!supabaseEnv.isConfigured || !supabaseEnv.serviceRoleKey) return null;

  try {
    const admin = getSupabaseAdmin();
    const result = (await admin
      .from("subscriptions")
      .select("status, current_period_end, cancel_at")
      .eq("parent_id", parentId)
      .maybeSingle()) as unknown as {
      data: Pick<
        SubscriptionsRow,
        "status" | "current_period_end" | "cancel_at"
      > | null;
      error: { message: string } | null;
    };

    if (result.error || !result.data || !result.data.status) return null;
    return {
      status: result.data.status,
      periodEnd: result.data.current_period_end,
      cancelAt: result.data.cancel_at,
    };
  } catch {
    return null;
  }
}

/**
 * True for subscription statuses that should unlock premium content.
 */
export function isPremiumStatus(
  status: string | null | undefined,
): boolean {
  return status === "active" || status === "trialing";
}
