import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/ingresar?error=${encodeURIComponent(errorDescription)}`
    );
  }

  if (!supabaseEnv.isConfigured) {
    return NextResponse.redirect(
      `${origin}/ingresar?error=${encodeURIComponent(
        "Supabase no esta configurado."
      )}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/ingresar?error=${encodeURIComponent(
        "Falta el codigo de confirmacion."
      )}`
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.redirect(
      `${origin}/ingresar?error=${encodeURIComponent(
        "Supabase no esta configurado."
      )}`
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/ingresar?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/padres`);
}
