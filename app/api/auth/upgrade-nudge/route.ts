import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import UpgradeNudge from "@/emails/UpgradeNudge";
import { sendEmail } from "@/lib/email/send";
import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import type {
  ChildProgressRow,
  EventsRow,
  ProfilesChildRow,
  ProfilesParentRow,
} from "@/lib/supabase/types";
import { getAppUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Upgrade nudge trigger.
 *
 * Auth required. POST `{ childId }`. Validates that the parent is on the
 * free plan and the child has stars > 0 on every free lesson (m1l1..m1l5).
 * If qualifies and we have NOT already sent in the last 14 days, sends the
 * UpgradeNudge email and records an `events` row for dedup.
 *
 * Email is best-effort: a Resend miss never breaks the response.
 */

const Body = z.object({
  childId: z.string().trim().uuid(),
});

const FREE_LESSON_IDS = ["m1l1", "m1l2", "m1l3", "m1l4", "m1l5"] as const;
const DEDUP_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

type Reason =
  | "not_free"
  | "child_not_found"
  | "lessons_incomplete"
  | "recently_sent";

function noSendResponse(reason: Reason): Response {
  return NextResponse.json({ ok: true, sent: false, reason });
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!supabaseEnv.isConfigured) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { ok: false, error: "unauthenticated" },
      { status: 401 },
    );
  }

  const parentId = user.id;
  const { childId } = parsed.data;

  // Parent profile.
  const parentLookup = (await supabase
    .from("profiles_parent")
    .select("id, email, display_name, plan")
    .eq("id", parentId)
    .maybeSingle()) as unknown as {
    data:
      | Pick<ProfilesParentRow, "id" | "email" | "display_name" | "plan">
      | null;
    error: { message: string } | null;
  };

  if (parentLookup.error) {
    return NextResponse.json(
      { ok: false, error: parentLookup.error.message },
      { status: 500 },
    );
  }

  const parent = parentLookup.data;
  if (!parent) {
    return NextResponse.json(
      { ok: false, error: "parent_not_found" },
      { status: 404 },
    );
  }

  if (parent.plan !== "free") {
    return noSendResponse("not_free");
  }

  // Child profile (must belong to the parent).
  const childLookup = (await supabase
    .from("profiles_child")
    .select("id, name, parent_id")
    .eq("id", childId)
    .eq("parent_id", parentId)
    .maybeSingle()) as unknown as {
    data: Pick<ProfilesChildRow, "id" | "name" | "parent_id"> | null;
    error: { message: string } | null;
  };

  if (childLookup.error) {
    return NextResponse.json(
      { ok: false, error: childLookup.error.message },
      { status: 500 },
    );
  }

  const child = childLookup.data;
  if (!child) {
    return noSendResponse("child_not_found");
  }

  // Progress: count distinct lesson ids with stars > 0 across the free set.
  const progressLookup = (await supabase
    .from("child_progress")
    .select("lesson_id, stars")
    .eq("child_id", childId)
    .in("lesson_id", FREE_LESSON_IDS as unknown as string[])
    .gt("stars", 0)) as unknown as {
    data: Pick<ChildProgressRow, "lesson_id" | "stars">[] | null;
    error: { message: string } | null;
  };

  if (progressLookup.error) {
    return NextResponse.json(
      { ok: false, error: progressLookup.error.message },
      { status: 500 },
    );
  }

  const completed = new Set<string>(
    (progressLookup.data ?? []).map((row) => row.lesson_id),
  );
  const allDone = FREE_LESSON_IDS.every((id) => completed.has(id));
  if (!allDone) {
    return noSendResponse("lessons_incomplete");
  }

  // Dedup: have we already sent this nudge for (parent, child) in the last
  // 14 days?
  const cutoffIso = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString();
  const recentLookup = (await supabase
    .from("events")
    .select("id, created_at")
    .eq("type", "upgrade_nudge_sent")
    .eq("parent_id", parentId)
    .eq("child_id", childId)
    .gte("created_at", cutoffIso)
    .limit(1)) as unknown as {
    data: Pick<EventsRow, "id" | "created_at">[] | null;
    error: { message: string } | null;
  };

  if (recentLookup.error) {
    return NextResponse.json(
      { ok: false, error: recentLookup.error.message },
      { status: 500 },
    );
  }

  if ((recentLookup.data ?? []).length > 0) {
    return noSendResponse("recently_sent");
  }

  // Record the dedup row BEFORE sending so concurrent requests cannot race
  // into a double-send. If the insert fails we still attempt the email
  // (best-effort) but log loudly.
  const insertResult = await supabase.from("events").insert({
    parent_id: parentId,
    child_id: childId,
    type: "upgrade_nudge_sent",
    payload: { source: "api/auth/upgrade-nudge" },
  });
  if (insertResult.error) {
    console.error(
      `[upgrade-nudge] failed to record dedup row: ${insertResult.error.message}`,
    );
  }

  const appUrl = getAppUrl();
  const parentName = parent.display_name ?? undefined;

  try {
    await sendEmail({
      to: parent.email,
      subject: `${child.name} esta listo para mas lecciones`,
      react: UpgradeNudge({
        parentName,
        childName: child.name,
        appUrl,
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    console.error(`[upgrade-nudge] email threw: ${message}`);
  }

  return NextResponse.json({ ok: true, sent: true });
}
