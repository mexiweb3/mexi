import { NextResponse } from "next/server";

import { stripeEnv } from "@/lib/stripe/env";
import { supabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    supabase: supabaseEnv.isConfigured,
    stripe: stripeEnv.isConfigured,
    email: Boolean(process.env.RESEND_API_KEY),
  });
}
