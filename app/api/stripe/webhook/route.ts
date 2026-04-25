import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/client";
import { stripeEnv } from "@/lib/stripe/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseEnv } from "@/lib/supabase/env";
import type {
  ParentPlan,
  ProfilesParentRow,
  SubscriptionsInsert,
} from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVE_STATUSES: ReadonlySet<string> = new Set([
  "active",
  "trialing",
]);
const FREE_STATUSES: ReadonlySet<string> = new Set([
  "canceled",
  "past_due",
  "unpaid",
  "incomplete_expired",
]);

function toIsoFromUnix(value: number | null | undefined): string | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return new Date(value * 1000).toISOString();
}

async function resolveParentId(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromMetadata = subscription.metadata?.parent_id;
  if (typeof fromMetadata === "string" && fromMetadata.length > 0) {
    return fromMetadata;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;
  if (!customerId) return null;

  const admin = getSupabaseAdmin();
  const { data } = (await admin
    .from("profiles_parent")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle()) as unknown as {
    data: Pick<ProfilesParentRow, "id"> | null;
  };
  return data?.id ?? null;
}

async function upsertSubscription(
  parentId: string,
  subscription: Stripe.Subscription,
): Promise<void> {
  const admin = getSupabaseAdmin();
  const row: SubscriptionsInsert = {
    parent_id: parentId,
    stripe_sub_id: subscription.id,
    status: subscription.status,
    current_period_end: toIsoFromUnix(subscription.current_period_end),
    cancel_at: toIsoFromUnix(subscription.cancel_at),
  };
  await admin.from("subscriptions").upsert(row, { onConflict: "parent_id" });

  const status = subscription.status;
  let nextPlan: ParentPlan | null = null;
  if (ACTIVE_STATUSES.has(status)) nextPlan = "premium";
  else if (FREE_STATUSES.has(status)) nextPlan = "free";

  if (nextPlan) {
    await admin
      .from("profiles_parent")
      .update({ plan: nextPlan })
      .eq("id", parentId);
  }
}

async function handleCheckoutCompleted(
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<void> {
  // Only subscription mode produces a usable subscription record.
  const subRef = session.subscription;
  if (!subRef) return;
  const subId = typeof subRef === "string" ? subRef : subRef.id;
  const subscription = await stripe.subscriptions.retrieve(subId);
  // Mirror the parent_id from session metadata onto the subscription metadata
  // so future subscription.* events can resolve without a customer lookup.
  const parentIdFromSession =
    session.metadata?.parent_id ?? subscription.metadata?.parent_id ?? null;
  if (parentIdFromSession && !subscription.metadata?.parent_id) {
    try {
      await stripe.subscriptions.update(subscription.id, {
        metadata: { ...subscription.metadata, parent_id: parentIdFromSession },
      });
    } catch {
      // best-effort; webhook still succeeds
    }
  }
  const parentId = parentIdFromSession ?? (await resolveParentId(subscription));
  if (!parentId) return;
  await upsertSubscription(parentId, subscription);
}

export async function POST(req: Request) {
  if (!stripeEnv.isConfigured || !stripeEnv.webhookSecret) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  if (!supabaseEnv.isConfigured || !supabaseEnv.serviceRoleKey) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      stripeEnv.webhookSecret,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "invalid_signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const parentId = await resolveParentId(subscription);
        if (parentId) {
          await upsertSubscription(parentId, subscription);
        }
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(stripe, session);
        break;
      }
      default:
        // Ignored event type — still respond 200.
        break;
    }
  } catch {
    // Swallow handler errors so Stripe doesn't retry forever on a bug.
    // Real telemetry will go through a logger once configured.
  }

  return NextResponse.json({ received: true });
}
