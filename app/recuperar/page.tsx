import Link from "next/link";

import { RecuperarClient } from "./RecuperarClient";
import { supabaseEnv } from "@/lib/supabase/env";

export default function RecuperarPage() {
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
          Volver a ingresar
        </Link>
      </header>

      <section className="mx-auto max-w-md px-6 pb-20 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Recuperar contrasena
        </h1>
        <p className="mt-3 text-brand-800">
          Ingresa el correo de tu cuenta y te enviaremos un enlace para crear
          una nueva contrasena.
        </p>

        {demoMode ? (
          <div
            role="status"
            className="mt-6 rounded-3xl border-2 border-yellow-300 bg-yellow-50 p-6 text-sm text-yellow-900"
          >
            <p className="font-semibold">Modo demo</p>
            <p className="mt-1">Disponible cuando configures Supabase.</p>
          </div>
        ) : (
          <RecuperarClient />
        )}
      </section>
    </main>
  );
}
