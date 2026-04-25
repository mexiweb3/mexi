import { NextResponse, type NextRequest } from "next/server";

import { stripeEnv } from "@/lib/stripe/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import type { ProfilesParentRow, SubscriptionsRow } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeleteBody = {
  confirm?: unknown;
};

async function readBody(request: NextRequest): Promise<DeleteBody> {
  try {
    const data = (await request.json()) as DeleteBody;
    if (data && typeof data === "object") return data;
    return {};
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  if (!supabaseEnv.isConfigured) {
    return NextResponse.json(
      { ok: false, error: "Supabase no esta configurado." },
      { status: 503 },
    );
  }

  const body = await readBody(request);
  if (body.confirm !== "BORRAR") {
    return NextResponse.json(
      { ok: false, error: "Confirmacion invalida." },
      { status: 400 },
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

  const parentId = user.id;

  // Step 1: best-effort cancel Stripe subscription.
  if (stripeEnv.isConfigured) {
    try {
      const parentLookup = (await admin
        .from("profiles_parent")
        .select("stripe_customer_id")
        .eq("id", parentId)
        .maybeSingle()) as unknown as {
        data: Pick<ProfilesParentRow, "stripe_customer_id"> | null;
      };
      const customerId = parentLookup.data?.stripe_customer_id ?? null;

      if (customerId) {
        const subLookup = (await admin
          .from("subscriptions")
          .select("stripe_sub_id")
          .eq("parent_id", parentId)
          .maybeSingle()) as unknown as {
          data: Pick<SubscriptionsRow, "stripe_sub_id"> | null;
        };
        const subId = subLookup.data?.stripe_sub_id ?? null;

        if (subId) {
          try {
            const { getStripe } = await import("@/lib/stripe/client");
            const stripe = getStripe();
            if (stripe) {
              try {
                await stripe.subscriptions.cancel(subId);
              } catch {
                // best-effort; do not block deletion
              }
            }
          } catch {
            // import failed; ignore
          }
        }
      }
    } catch {
      // ignore Stripe-related lookup failures
    }
  }

  // Collect child ids first to scope cascading deletes.
  const childIdsResult = (await admin
    .from("profiles_child")
    .select("id")
    .eq("parent_id", parentId)) as unknown as {
    data: { id: string }[] | null;
    error: { message: string } | null;
  };

  if (childIdsResult.error) {
    return NextResponse.json(
      { ok: false, error: childIdsResult.error.message },
      { status: 500 },
    );
  }

  const childIds = (childIdsResult.data ?? []).map((c) => c.id);

  // Step 2: child_badges and child_progress.
  if (childIds.length > 0) {
    const badgesDel = await admin
      .from("child_badges")
      .delete()
      .in("child_id", childIds);
    if (badgesDel.error) {
      return NextResponse.json(
        { ok: false, error: badgesDel.error.message },
        { status: 500 },
      );
    }

    const progressDel = await admin
      .from("child_progress")
      .delete()
      .in("child_id", childIds);
    if (progressDel.error) {
      return NextResponse.json(
        { ok: false, error: progressDel.error.message },
        { status: 500 },
      );
    }
  }

  // Step 3: profiles_child for the parent.
  const childrenDel = await admin
    .from("profiles_child")
    .delete()
    .eq("parent_id", parentId);
  if (childrenDel.error) {
    return NextResponse.json(
      { ok: false, error: childrenDel.error.message },
      { status: 500 },
    );
  }

  // Step 4: events for the parent.
  const eventsDel = await admin
    .from("events")
    .delete()
    .eq("parent_id", parentId);
  if (eventsDel.error) {
    return NextResponse.json(
      { ok: false, error: eventsDel.error.message },
      { status: 500 },
    );
  }

  // Step 5: subscriptions for the parent.
  const subsDel = await admin
    .from("subscriptions")
    .delete()
    .eq("parent_id", parentId);
  if (subsDel.error) {
    return NextResponse.json(
      { ok: false, error: subsDel.error.message },
      { status: 500 },
    );
  }

  // Step 6: profiles_parent row.
  const parentDel = await admin
    .from("profiles_parent")
    .delete()
    .eq("id", parentId);
  if (parentDel.error) {
    return NextResponse.json(
      { ok: false, error: parentDel.error.message },
      { status: 500 },
    );
  }

  // Step 7: auth.users row via admin API.
  const { error: authDeleteError } = await admin.auth.admin.deleteUser(
    parentId,
  );
  if (authDeleteError) {
    return NextResponse.json(
      { ok: false, error: authDeleteError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
