import Link from "next/link";

import { SignUpForm } from "@/components/auth/SignUpForm";
import { supabaseEnv } from "@/lib/supabase/env";

export default function RegistroPage() {
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
          href="/"
          className="text-sm font-semibold text-brand-800 hover:text-brand-600 sm:text-base"
        >
          Volver al inicio
        </Link>
      </header>

      <section className="mx-auto max-w-md px-6 pb-20 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Crear cuenta de padre o madre
        </h1>
        <p className="mt-3 text-brand-800">
          Esta cuenta es del padre, madre o tutor legal. Estas creando la
          cuenta en nombre del menor a tu cargo. Los datos del nino o nina
          (nombre, edad, avatar) se piden en el siguiente paso.
        </p>

        <SignUpForm />

        {demoMode ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border-2 border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900"
          >
            <p className="font-semibold">Modo demo</p>
            <p className="mt-1">
              Las cuentas no se persisten todavia. Igual puedes recorrer toda
              la app.{" "}
              <Link
                href="/onboarding/1"
                className="font-bold underline decoration-yellow-500 underline-offset-4 hover:text-yellow-700"
              >
                Continuar al onboarding
              </Link>
              .
            </p>
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-brand-700">
          Al crear la cuenta aceptas nuestros{" "}
          <Link
            href="/terminos"
            className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
          >
            terminos
          </Link>{" "}
          y la{" "}
          <Link
            href="/privacidad"
            className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
          >
            politica de privacidad
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
