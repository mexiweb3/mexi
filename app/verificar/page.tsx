import Link from "next/link";

import { VerificarClient } from "./VerificarClient";
import { supabaseEnv } from "@/lib/supabase/env";

type SearchParams = {
  email?: string | string[];
};

export default function VerificarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const rawEmail = searchParams.email;
  const email = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail ?? "";
  const demoMode = !supabaseEnv.isConfigured;

  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-brand-700"
        >
          Pianitos
        </Link>
        <Link
          href="/ingresar"
          className="text-sm font-semibold text-brand-800 hover:text-brand-600 sm:text-base"
        >
          Ir a ingresar
        </Link>
      </header>

      <section className="mx-auto max-w-md px-6 pb-20 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Confirma tu correo
        </h1>

        {demoMode ? (
          <div className="mt-6 space-y-4 rounded-3xl border-2 border-yellow-300 bg-yellow-50 p-6 text-sm text-yellow-900">
            <p className="font-semibold">Modo demo</p>
            <p>
              No se envio ningun correo porque Supabase aun no esta configurado.
              Puedes continuar directamente al onboarding.
            </p>
            <Link href="/onboarding/1" className="kid-button w-full">
              Continuar al onboarding
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4 rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-[0_6px_0_0_#ffd87a]">
            <p className="text-brand-800">
              Revisa tu correo en{" "}
              <span className="font-bold text-brand-900">
                {email || "tu bandeja de entrada"}
              </span>{" "}
              y pulsa el enlace de confirmacion. Una vez verificado, vuelve
              aqui para ingresar.
            </p>
            <VerificarClient email={email} />
            <p className="text-sm text-brand-700">
              Ya confirmaste tu cuenta?{" "}
              <Link
                href="/ingresar"
                className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
              >
                Ingresar
              </Link>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
