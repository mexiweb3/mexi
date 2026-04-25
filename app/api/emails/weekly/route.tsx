import { NextResponse } from "next/server";

import WeeklySummary, {
  type WeeklySummaryBadge,
  type WeeklySummaryLesson,
} from "@/emails/WeeklySummary";
import { weeklySummaryWindow } from "@/lib/email/cron";
import { sendEmail } from "@/lib/email/send";
import { LESSON_CATALOG } from "@/lib/lessons/registry";
import { getSupabaseAdmin, type SupabaseAdminClient } from "@/lib/supabase/admin";
import { getAppUrl, supabaseEnv } from "@/lib/supabase/env";
import type {
  ChildBadgesRow,
  ChildProgressRow,
  ProfilesChildRow,
  ProfilesParentRow,
} from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WeeklyBody = {
  parentId?: unknown;
};

type Stars = 0 | 1 | 2 | 3;

function clampStars(value: number | null): Stars {
  if (value == null || Number.isNaN(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 3) return 3;
  if (value >= 2) return 2;
  return 1;
}

function lessonTitle(lessonId: string): string {
  const entry = LESSON_CATALOG.find((l) => l.id === lessonId);
  return entry?.title ?? lessonId;
}

function isAuthorized(req: Request): { ok: boolean; warning?: string } {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || secret.trim() === "") {
    return {
      ok: true,
      warning: "CRON_SECRET no configurado: ejecucion abierta solo en dev.",
    };
  }
  const expected = `Bearer ${secret}`;
  return { ok: auth === expected };
}

async function fetchParents(
  admin: SupabaseAdminClient,
  parentId: string | null,
): Promise<ProfilesParentRow[]> {
  let query = admin.from("profiles_parent").select("*");
  if (parentId) {
    query = query.eq("id", parentId);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as ProfilesParentRow[];
}

async function fetchChildren(
  admin: SupabaseAdminClient,
  parentId: string,
): Promise<ProfilesChildRow[]> {
  const { data, error } = await admin
    .from("profiles_child")
    .select("*")
    .eq("parent_id", parentId);
  if (error) throw new Error(error.message);
  return (data ?? []) as ProfilesChildRow[];
}

async function fetchProgress(
  admin: SupabaseAdminClient,
  childId: string,
  fromIso: string,
  toIso: string,
): Promise<ChildProgressRow[]> {
  const { data, error } = await admin
    .from("child_progress")
    .select("*")
    .eq("child_id", childId)
    .gte("completed_at", fromIso)
    .lte("completed_at", toIso);
  if (error) throw new Error(error.message);
  return (data ?? []) as ChildProgressRow[];
}

async function fetchBadges(
  admin: SupabaseAdminClient,
  childId: string,
  fromIso: string,
  toIso: string,
): Promise<WeeklySummaryBadge[]> {
  const { data, error } = await admin
    .from("child_badges")
    .select("badge_id, awarded_at")
    .eq("child_id", childId)
    .gte("awarded_at", fromIso)
    .lte("awarded_at", toIso);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Pick<ChildBadgesRow, "badge_id" | "awarded_at">[];
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.badge_id);
  const { data: badgeRows, error: badgeError } = await admin
    .from("badges")
    .select("id, name, description")
    .in("id", ids);
  if (badgeError) throw new Error(badgeError.message);
  const byId = new Map<string, { name: string; description: string }>();
  for (const b of badgeRows ?? []) {
    byId.set(b.id, { name: b.name, description: b.description });
  }
  return rows.map((r) => {
    const found = byId.get(r.badge_id);
    return {
      name: found?.name ?? r.badge_id,
      description: found?.description ?? "",
    };
  });
}

export async function POST(req: Request) {
  if (!supabaseEnv.isConfigured) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 },
    );
  }

  const auth = isAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: WeeklyBody = {};
  try {
    body = (await req.json()) as WeeklyBody;
  } catch {
    body = {};
  }
  const parentIdFilter =
    typeof body.parentId === "string" && body.parentId.trim().length > 0
      ? body.parentId
      : null;

  let admin: SupabaseAdminClient;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 },
    );
  }

  const now = new Date();
  const { weekStart, weekEnd } = weeklySummaryWindow(now);
  const fromIso = weekStart.toISOString();
  const toIso = weekEnd.toISOString();
  const appUrl = getAppUrl();

  let parents: ProfilesParentRow[];
  try {
    parents = await fetchParents(admin, parentIdFilter);
  } catch (err) {
    const message = err instanceof Error ? err.message : "fetch_parents_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;

  for (const parent of parents) {
    let children: ProfilesChildRow[];
    try {
      children = await fetchChildren(admin, parent.id);
    } catch {
      skipped += 1;
      continue;
    }

    if (children.length === 0) {
      skipped += 1;
      continue;
    }

    let parentHadActivity = false;
    const childSummaries: {
      child: ProfilesChildRow;
      lessons: WeeklySummaryLesson[];
      badges: WeeklySummaryBadge[];
      totalMinutes: number;
    }[] = [];

    for (const child of children) {
      let progress: ChildProgressRow[] = [];
      let badges: WeeklySummaryBadge[] = [];
      try {
        progress = await fetchProgress(admin, child.id, fromIso, toIso);
        badges = await fetchBadges(admin, child.id, fromIso, toIso);
      } catch {
        // Skip this child but keep iterating.
        continue;
      }
      const lessons: WeeklySummaryLesson[] = progress.map((p) => ({
        title: lessonTitle(p.lesson_id),
        stars: clampStars(p.stars),
      }));
      const totalSec = progress.reduce(
        (acc, p) => acc + (p.total_time_sec ?? 0),
        0,
      );
      const totalMinutes = Math.round(totalSec / 60);
      if (lessons.length > 0 || badges.length > 0) {
        parentHadActivity = true;
      }
      childSummaries.push({ child, lessons, badges, totalMinutes });
    }

    // Free parents with zero activity get skipped; premium always sends.
    if (parent.plan === "free" && !parentHadActivity) {
      skipped += 1;
      continue;
    }

    let parentSentAny = false;
    for (const summary of childSummaries) {
      const result = await sendEmail({
        to: parent.email,
        subject: `Resumen semanal de ${summary.child.name}`,
        react: (
          <WeeklySummary
            parentName={parent.display_name ?? undefined}
            childName={summary.child.name}
            weekStart={fromIso}
            weekEnd={toIso}
            lessonsCompleted={summary.lessons}
            totalMinutes={summary.totalMinutes}
            newBadges={summary.badges}
            appUrl={appUrl}
          />
        ),
      });
      if (result.ok) parentSentAny = true;
    }

    if (parentSentAny) sent += 1;
    else skipped += 1;
  }

  const response = NextResponse.json({ sent, skipped });
  if (auth.warning) response.headers.set("x-cron-warning", auth.warning);
  return response;
}
