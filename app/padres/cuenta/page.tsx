import Link from "next/link";

import { ExportButton } from "@/components/padres/ExportButton";
import { DeleteAccountButton } from "@/components/padres/DeleteAccountButton";
import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import type { ProfilesParentRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const PLAN_LABELS: Record<ProfilesParentRow["plan"], string> = {
  free: "Gratis",
  premium: "Premium",
};

type AccountSnapshot = {
  configured: boolean;
  email: string | null;
  plan: ProfilesParentRow["plan"];
  createdAt: string | null;
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return null;
  }
}

async function loadAccount(): Promise<AccountSnapshot> {
  if (!supabaseEnv.isConfigured) {
    return { configured: false, email: null, plan: "free", createdAt: null };
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { configured: false, email: null, plan: "free", createdAt: null };
  }
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) {
      return { configured: true, email: null, plan: "free", createdAt: null };
    }

    const parentResult = (await supabase
      .from("profiles_parent")
      .select("plan, created_at")
      .eq("id", user.id)
      .maybeSingle()) as unknown as {
      data: Pick<ProfilesParentRow, "plan" | "created_at"> | null;
    };

    return {
      configured: true,
      email: user.email ?? null,
      plan: parentResult.data?.plan ?? "free",
      createdAt: parentResult.data?.created_at ?? user.created_at ?? null,
    };
  } catch {
    return { configured: true, email: null, plan: "free", createdAt: null };
  }
}

export default async function AjustesDeCuentaPage() {
  const account = await loadAccount();
  const createdAtLabel = formatDate(account.createdAt);
  const isDemoMode = !account.configured || account.email === null;

  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="sticky top-0 z-10 border-b-2 border-brand-100 bg-brand-50/95 backdrop-blur supports-[backdrop-filter]:bg-brand-50/80">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4 sm:max-w-2xl">
          <Link
            href="/"
            className="text-base font-extrabold tracking-tight text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
          >
            Pianitos
          </Link>
          <Link
            href="/padres"
            className="text-sm font-semibold text-brand-800 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
          >
            Volver
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6 sm:max-w-2xl sm:py-10">
        <h1 className="text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
          Ajustes de cuenta
        </h1>
        <p className="mt-2 text-sm text-brand-700">
          Administra tus datos, descarga una copia o cierra tu cuenta de forma
          permanente.
        </p>

        <section
          aria-label="Tu cuenta"
          className="mt-6 rounded-3xl border-2 border-brand-200 bg-white p-5 shadow-[0_6px_0_0_#ffd87a]"
        >
          <h2 className="text-lg font-extrabold text-brand-900">Tu cuenta</h2>

          {isDemoMode ? (
            <p className="mt-3 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-3 text-sm text-brand-800">
              Estas en modo demo. Tus datos viven solo en este dispositivo.
            </p>
          ) : (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Correo
                </dt>
                <dd className="mt-1 break-all text-base font-semibold text-brand-900">
                  {account.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-brand-600">
                  Plan
                </dt>
                <dd className="mt-1 text-base font-semibold text-brand-900">
                  {PLAN_LABELS[account.plan]}
                </dd>
              </div>
              {createdAtLabel ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Cuenta creada
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-brand-900">
                    {createdAtLabel}
                  </dd>
                </div>
              ) : null}
            </dl>
          )}
        </section>

        <section
          aria-label="Datos del nino"
          className="mt-5 rounded-3xl border-2 border-brand-200 bg-white p-5"
        >
          <h2 className="text-lg font-extrabold text-brand-900">
            Datos del nino
          </h2>
          <p className="mt-1 text-sm text-brand-700">
            No mostramos aqui datos sensibles. Los perfiles se administran desde
            el panel de padres.
          </p>
          <Link
            href="/padres"
            className="mt-4 inline-flex items-center text-sm font-bold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
          >
            Ver perfiles del nino
          </Link>
        </section>

        <section
          aria-label="Descargar mis datos"
          className="mt-5 rounded-3xl border-2 border-brand-200 bg-white p-5"
        >
          <h2 className="text-lg font-extrabold text-brand-900">
            Descargar mis datos
          </h2>
          <p className="mt-1 text-sm text-brand-700">
            Obten una copia en JSON con todo lo que guardamos sobre ti y los
            perfiles que creaste.
          </p>
          <div className="mt-4">
            <ExportButton configured={account.configured} />
          </div>
        </section>

        <section
          aria-label="Borrar cuenta"
          className="mt-5 rounded-3xl border-4 border-red-200 bg-white p-5 shadow-[0_6px_0_0_#fecaca]"
        >
          <h2 className="text-lg font-extrabold text-red-700">Borrar cuenta</h2>
          <p className="mt-1 text-sm text-brand-800">
            Esta accion borra de forma permanente tu cuenta, los perfiles del
            nino, todo el progreso, las insignias y cualquier suscripcion
            activa. No podras deshacerla.
          </p>
          <div className="mt-4">
            <DeleteAccountButton configured={account.configured} />
          </div>
        </section>

        <footer className="mt-10 flex flex-col items-center gap-2 text-center text-sm text-brand-700">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/privacidad"
              className="font-semibold underline-offset-4 hover:text-brand-900 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="font-semibold underline-offset-4 hover:text-brand-900 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
            >
              Terminos
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
