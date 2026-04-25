import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/client";
import { stripeEnv } from "@/lib/stripe/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ProfilesParentRow } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
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

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  const admin = getSupabaseAdmin();
  const parentLookup = (await admin
    .from("profiles_parent")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle()) as unknown as {
    data: Pick<ProfilesParentRow, "stripe_customer_id"> | null;
    error: { message: string } | null;
  };

  const customerId = parentLookup.data?.stripe_customer_id ?? null;
  if (!customerId) {
    return NextResponse.json(
      { error: "no_customer" },
      { status: 404 },
    );
  }

  const appUrl = getAppUrl();
  let session: Stripe.BillingPortal.Session;
  try {
    session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/padres`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "portal_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
