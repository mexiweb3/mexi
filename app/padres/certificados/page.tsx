import Link from "next/link";

import { CertificatesList } from "@/components/certificate/CertificatesList";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diplomas de pianista",
};

export default function CertificatesIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <nav className="mb-4 text-sm">
        <Link
          href="/padres"
          className="font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          ← Volver al panel
        </Link>
      </nav>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">
          Diplomas de pianista
        </h1>
        <p className="mt-2 text-base text-brand-800">
          Cuando tu nino o nina termina todas las lecciones de un modulo, podras
          imprimir su diploma desde aqui.
        </p>
      </header>
      <CertificatesList />
    </main>
  );
}
