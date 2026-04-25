import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/client";
import { getPriceId, stripeEnv } from "@/lib/stripe/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ProfilesParentRow } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutBody = {
  price?: unknown;
};

function isPlan(value: unknown): value is "monthly" | "yearly" {
  return value === "monthly" || value === "yearly";
}

export async function POST(req: Request) {
  let body: CheckoutBody = {};
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json(
      { error: "invalid_body" },
      { status: 400 },
    );
  }

  if (!isPlan(body.price)) {
    return NextResponse.json(
      { error: "invalid_price" },
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

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!stripeEnv.isConfigured) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const priceId = getPriceId(body.price);
  if (!priceId) {
    return NextResponse.json(
      { error: "price_not_configured" },
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

  const admin = getSupabaseAdmin();

  // Look up parent row to find / persist stripe_customer_id.
  const parentLookup = (await admin
    .from("profiles_parent")
    .select("id, email, display_name, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle()) as unknown as {
    data: Pick<
      ProfilesParentRow,
      "id" | "email" | "display_name" | "stripe_customer_id"
    > | null;
    error: { message: string } | null;
  };

  if (parentLookup.error) {
    return NextResponse.json(
      { error: "profile_lookup_failed" },
      { status: 500 },
    );
  }

  const parentEmail = parentLookup.data?.email ?? user.email ?? undefined;
  const parentName = parentLookup.data?.display_name ?? undefined;
  let customerId = parentLookup.data?.stripe_customer_id ?? null;

  if (!customerId) {
    const created = await stripe.customers.create({
      email: parentEmail,
      name: parentName ?? undefined,
      metadata: { parent_id: user.id },
    });
    customerId = created.id;
    const update = (await admin
      .from("profiles_parent")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id)) as unknown as { error: { message: string } | null };
    if (update.error) {
      // Non-fatal: checkout can continue, but log via response header.
    }
  }

  const appUrl = getAppUrl();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { parent_id: user.id },
      },
      metadata: { parent_id: user.id },
      allow_promotion_codes: true,
      locale: "es-419",
      success_url: `${appUrl}/padres?upgraded=1`,
      cancel_url: `${appUrl}/precios`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "checkout_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!session.url) {
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
