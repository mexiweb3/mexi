import Link from "next/link";

import { BetaCodeForm } from "@/components/beta/BetaCodeForm";
import { isInviteRequired } from "@/lib/beta/invite";

export const metadata = {
  title: "Beta de Pianitos",
  description: "Codigo de invitacion para la beta cerrada de Pianitos.",
};

export default function BetaPage() {
  const required = isInviteRequired();
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border-4 border-brand-200 bg-white p-6 shadow-[0_8px_0_0_#ffd87a]">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
          Beta cerrada
        </p>
        <h1 className="mt-1 text-3xl font-extrabold leading-tight text-brand-900">
          Bienvenido a Pianitos
        </h1>
        <p className="mt-2 text-base text-brand-800">
          {required
            ? "Tienes un codigo de invitacion? Ingresa abajo y te llevamos a crear tu cuenta."
            : "Estamos abiertos. Crea tu cuenta cuando quieras."}
        </p>

        <div className="mt-6">
          <BetaCodeForm required={required} />
        </div>

        <div className="mt-6 text-sm text-brand-700">
          {required ? (
            <p>
              Aun no tienes invitacion?{" "}
              <a className="underline" href="mailto:hola@pianitos.app">
                Escribenos
              </a>{" "}
              y te avisamos cuando entre la siguiente tanda.
            </p>
          ) : (
            <Link className="font-semibold underline" href="/registro">
              Ir directamente a crear cuenta
            </Link>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-brand-700">
        Pianitos respeta la privacidad de los menores. Lee la{" "}
        <Link className="underline" href="/privacidad">
          politica de privacidad
        </Link>{" "}
        y la pagina{" "}
        <Link className="underline" href="/para-padres">
          para padres
        </Link>
        .
      </p>
    </main>
  );
}
