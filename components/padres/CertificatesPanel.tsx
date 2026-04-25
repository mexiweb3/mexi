import Link from "next/link";

/**
 * Server-safe panel that points parents to the diplomas section.
 *
 * NOTE: This component is intended to be dropped into the padres dashboard or
 * the cuenta page. Because /app/padres/cuenta/page.tsx and
 * /components/padres/PadresDashboard.tsx are owned by other contributors, this
 * panel is exported standalone so the dashboard owner can place it above the
 * ExportButton (or wherever fits the layout) without changes from this PR.
 *
 * Suggested usage:
 *   import { CertificatesPanel } from "@/components/padres/CertificatesPanel";
 *   ...
 *   <CertificatesPanel />
 */
export function CertificatesPanel() {
  return (
    <section
      aria-labelledby="certificates-panel-heading"
      className="rounded-2xl border-2 border-brand-200 bg-white/90 p-5 shadow-sm sm:p-6"
    >
      <h2
        id="certificates-panel-heading"
        className="text-lg font-extrabold text-brand-900 sm:text-xl"
      >
        Diplomas
      </h2>
      <p className="mt-2 text-sm text-brand-800 sm:text-base">
        Para cada nino podras descargar e imprimir el diploma del modulo cuando
        lo termine.
      </p>
      <Link
        href="/padres/certificados"
        className="kid-button mt-4 inline-flex w-full justify-center sm:w-auto"
        aria-label="Ver diplomas de pianista"
      >
        Ver diplomas
      </Link>
    </section>
  );
}

export default CertificatesPanel;
