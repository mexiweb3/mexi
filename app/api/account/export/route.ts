import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import type {
  ChildBadgesRow,
  ChildProgressRow,
  EventsRow,
  ProfilesChildRow,
  ProfilesParentRow,
  SubscriptionsRow,
} from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportParent = {
  id: string;
  email: string;
  displayName: string | null;
  locale: string;
  plan: ProfilesParentRow["plan"];
  createdAt: string;
  consentSignedAt: string | null;
};

type ExportChild = {
  id: string;
  name: string;
  age: number;
  avatar: ProfilesChildRow["avatar"];
  keyboardBrand: ProfilesChildRow["keyboard_brand"];
  createdAt: string;
};

type ExportProgress = {
  childId: string;
  lessonId: string;
  stars: number | null;
  bestScore: number | null;
  completedAt: string | null;
  totalTimeSec: number;
  attempts: number;
};

type ExportBadge = {
  childId: string;
  badgeId: string;
  awardedAt: string;
};

type ExportSubscription = {
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAt: string | null;
} | null;

type ExportEvent = {
  id: number;
  type: string;
  createdAt: string;
};

type ExportPayload = {
  exportedAt: string;
  parent: ExportParent;
  children: ExportChild[];
  progress: ExportProgress[];
  badges: ExportBadge[];
  subscription: ExportSubscription;
  events: ExportEvent[];
};

function todayStamp(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear().toString().padStart(4, "0");
  const mm = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = d.getUTCDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(): Promise<Response> {
  if (!supabaseEnv.isConfigured) {
    return NextResponse.json(
      { ok: false, error: "Supabase no esta configurado." },
      { status: 503 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "Supabase no esta configurado." },
      { status: 503 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { ok: false, error: "No autenticado." },
      { status: 401 },
    );
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Configuracion de servidor incompleta." },
      { status: 503 },
    );
  }

  // Parent row
  const parentResult = (await admin
    .from("profiles_parent")
    .select(
      "id, email, display_name, locale, plan, created_at, consent_signed_at",
    )
    .eq("id", user.id)
    .maybeSingle()) as unknown as {
    data: Pick<
      ProfilesParentRow,
      | "id"
      | "email"
      | "display_name"
      | "locale"
      | "plan"
      | "created_at"
      | "consent_signed_at"
    > | null;
    error: { message: string } | null;
  };

  if (parentResult.error) {
    return NextResponse.json(
      { ok: false, error: parentResult.error.message },
      { status: 500 },
    );
  }

  const parentRow = parentResult.data;
  const exportParent: ExportParent = parentRow
    ? {
        id: parentRow.id,
        email: parentRow.email,
        displayName: parentRow.display_name,
        locale: parentRow.locale,
        plan: parentRow.plan,
        createdAt: parentRow.created_at,
        consentSignedAt: parentRow.consent_signed_at,
      }
    : {
        id: user.id,
        email: user.email ?? "",
        displayName: null,
        locale: "es",
        plan: "free",
        createdAt: user.created_at ?? new Date().toISOString(),
        consentSignedAt: null,
      };

  // Children
  const childrenResult = (await admin
    .from("profiles_child")
    .select("id, name, age, avatar, keyboard_brand, created_at")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })) as unknown as {
    data: Pick<
      ProfilesChildRow,
      "id" | "name" | "age" | "avatar" | "keyboard_brand" | "created_at"
    >[] | null;
    error: { message: string } | null;
  };

  if (childrenResult.error) {
    return NextResponse.json(
      { ok: false, error: childrenResult.error.message },
      { status: 500 },
    );
  }

  const childRows = childrenResult.data ?? [];
  const childIds = childRows.map((c) => c.id);
  const exportChildren: ExportChild[] = childRows.map((c) => ({
    id: c.id,
    name: c.name,
    age: c.age,
    avatar: c.avatar,
    keyboardBrand: c.keyboard_brand,
    createdAt: c.created_at,
  }));

  // Progress + badges (only when there are children)
  let exportProgress: ExportProgress[] = [];
  let exportBadges: ExportBadge[] = [];

  if (childIds.length > 0) {
    const progressResult = (await admin
      .from("child_progress")
      .select(
        "child_id, lesson_id, stars, best_score, completed_at, total_time_sec, attempts",
      )
      .in("child_id", childIds)) as unknown as {
      data: ChildProgressRow[] | null;
      error: { message: string } | null;
    };

    if (progressResult.error) {
      return NextResponse.json(
        { ok: false, error: progressResult.error.message },
        { status: 500 },
      );
    }

    exportProgress = (progressResult.data ?? []).map((p) => ({
      childId: p.child_id,
      lessonId: p.lesson_id,
      stars: p.stars,
      bestScore: p.best_score,
      completedAt: p.completed_at,
      totalTimeSec: p.total_time_sec,
      attempts: p.attempts,
    }));

    const badgesResult = (await admin
      .from("child_badges")
      .select("child_id, badge_id, awarded_at")
      .in("child_id", childIds)) as unknown as {
      data: ChildBadgesRow[] | null;
      error: { message: string } | null;
    };

    if (badgesResult.error) {
      return NextResponse.json(
        { ok: false, error: badgesResult.error.message },
        { status: 500 },
      );
    }

    exportBadges = (badgesResult.data ?? []).map((b) => ({
      childId: b.child_id,
      badgeId: b.badge_id,
      awardedAt: b.awarded_at,
    }));
  }

  // Subscription
  const subscriptionResult = (await admin
    .from("subscriptions")
    .select("status, current_period_end, cancel_at")
    .eq("parent_id", user.id)
    .maybeSingle()) as unknown as {
    data: Pick<
      SubscriptionsRow,
      "status" | "current_period_end" | "cancel_at"
    > | null;
    error: { message: string } | null;
  };

  if (subscriptionResult.error) {
    return NextResponse.json(
      { ok: false, error: subscriptionResult.error.message },
      { status: 500 },
    );
  }

  const exportSubscription: ExportSubscription = subscriptionResult.data
    ? {
        status: subscriptionResult.data.status,
        currentPeriodEnd: subscriptionResult.data.current_period_end,
        cancelAt: subscriptionResult.data.cancel_at,
      }
    : null;

  // Events
  const eventsResult = (await admin
    .from("events")
    .select("id, type, created_at")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true })) as unknown as {
    data: Pick<EventsRow, "id" | "type" | "created_at">[] | null;
    error: { message: string } | null;
  };

  if (eventsResult.error) {
    return NextResponse.json(
      { ok: false, error: eventsResult.error.message },
      { status: 500 },
    );
  }

  const exportEvents: ExportEvent[] = (eventsResult.data ?? []).map((e) => ({
    id: e.id,
    type: e.type,
    createdAt: e.created_at,
  }));

  const payload: ExportPayload = {
    exportedAt: new Date().toISOString(),
    parent: exportParent,
    children: exportChildren,
    progress: exportProgress,
    badges: exportBadges,
    subscription: exportSubscription,
    events: exportEvents,
  };

  const filename = `pianitos-export-${todayStamp()}.json`;
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
