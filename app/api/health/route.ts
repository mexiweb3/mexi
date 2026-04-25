import { NextResponse } from "next/server";

import { supabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    supabase: supabaseEnv.isConfigured,
  });
}
