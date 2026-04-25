import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { isAdminEmail } from "@/lib/admin/auth";
import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<JSX.Element> {
  // When Supabase is not configured we still render the page, which will
  // surface its own "Acceso restringido" fallback. This keeps the admin route
  // navigable in demo / preview environments without exposing data.
  if (supabaseEnv.isConfigured) {
    const supabase = getSupabaseServer();
    if (!supabase) {
      redirect("/");
    } else {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email ?? null;
        if (!isAdminEmail(email)) {
          redirect("/");
        }
      } catch {
        redirect("/");
      }
    }
  }

  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="border-b-2 border-brand-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-base font-extrabold tracking-tight text-brand-700">
            Pianitos · Admin
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Interno
          </span>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
        {children}
      </div>
    </main>
  );
}
