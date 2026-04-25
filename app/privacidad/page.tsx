import Link from "next/link";

const dataCollected: ReadonlyArray<string> = [
  "Datos del padre o madre: email, contraseña cifrada, fecha y dirección IP del consentimiento, registros de pago a través de Stripe.",
  "Datos del menor: nombre de pila, edad y avatar elegido. No recolectamos foto, voz, dirección ni datos de contacto del niño.",
  "Datos de uso: lecciones completadas, tiempo de práctica y eventos técnicos necesarios para mejorar el servicio.",
];

const legalBasis: ReadonlyArray<string> = [
  "Consentimiento explícito del padre o madre, otorgado al crear la cuenta.",
  "Ejecución del contrato cuando el servicio es de pago.",
  "Interés legítimo para prevenir fraude y mantener la seguridad de la plataforma.",
];

const userRights: ReadonlyArray<string> = [
  "Acceder a los datos personales que tenemos sobre usted o su hijo.",
  "Rectificar datos inexactos o incompletos.",
  "Solicitar la eliminación de la cuenta y de los datos asociados.",
  "Oponerse al tratamiento o solicitar la portabilidad de los datos.",
  "Retirar el consentimiento parental en cualquier momento.",
];

const transfers: ReadonlyArray<string> = [
  "Supabase (Estados Unidos y Unión Europea): base de datos y autenticación.",
  "Stripe (Estados Unidos): procesamiento de pagos y facturación.",
  "Resend (Estados Unidos): envío de emails transaccionales.",
  "Vercel (Estados Unidos): alojamiento y entrega de la aplicación.",
];

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-brand-700">
          Pianitos
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-brand-800 hover:text-brand-600 sm:text-base"
        >
          Volver al inicio
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl">
          Política de privacidad
        </h1>
        <p className="mt-4 text-brand-700">
          Última actualización: 25 de abril de 2026.
        </p>

        <article className="mt-10 space-y-10 text-brand-800">
          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              1. Responsable del tratamiento
            </h2>
            <p className="mt-3">
              El responsable del tratamiento de los datos es Pianitos (en adelante, &ldquo;Pianitos&rdquo;
              o &ldquo;nosotros&rdquo;). Para cualquier solicitud relacionada con esta política, escríbanos
              a{" "}
              <a
                href="mailto:hola@pianitos.app"
                className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
              >
                hola@pianitos.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">2. Datos que recolectamos</h2>
            <ul className="mt-3 space-y-2">
              {dataCollected.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-brand-600">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">3. Base legal</h2>
            <ul className="mt-3 space-y-2">
              {legalBasis.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-brand-600">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              4. Derechos del titular
            </h2>
            <p className="mt-3">
              Como titular de los datos, o como representante legal del menor, usted puede:
            </p>
            <ul className="mt-3 space-y-2">
              {userRights.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-brand-600">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, envíe un email a{" "}
              <a
                href="mailto:hola@pianitos.app"
                className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
              >
                hola@pianitos.app
              </a>{" "}
              desde la cuenta del padre o madre.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              5. Transferencias internacionales
            </h2>
            <p className="mt-3">
              Pianitos utiliza proveedores de tecnología que pueden almacenar o procesar
              datos fuera del país de residencia del usuario:
            </p>
            <ul className="mt-3 space-y-2">
              {transfers.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-brand-600">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Estos proveedores cuentan con cláusulas contractuales tipo y certificaciones
              de seguridad reconocidas internacionalmente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">6. Retención</h2>
            <p className="mt-3">
              Conservamos los datos mientras la cuenta esté activa. Si elimina la cuenta,
              borramos los datos personales en un plazo máximo de 30 días, salvo aquellos
              que debamos conservar por obligaciones legales o contables (por ejemplo,
              recibos de pago durante el periodo exigido por la ley fiscal aplicable).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              7. Seguridad y menores
            </h2>
            <p className="mt-3">
              Aplicamos cifrado en tránsito y en reposo, control de accesos por roles y
              auditorías periódicas. La cuenta del menor solo se crea con el consentimiento
              verificable del padre o madre. No mostramos publicidad, no vendemos datos y
              no permitimos chat ni comunicación entre usuarios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">8. Contacto</h2>
            <p className="mt-3">
              Para preguntas, quejas o ejercer derechos, escríbanos a{" "}
              <a
                href="mailto:hola@pianitos.app"
                className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
              >
                hola@pianitos.app
              </a>
              .
            </p>
          </section>
        </article>

        <p className="mt-12 rounded-2xl border-2 border-brand-300 bg-white p-5 text-sm font-semibold text-brand-800">
          Esta plantilla es un punto de partida. Antes de cobrar dinero real, debe ser
          revisada por un abogado.
        </p>
      </section>
    </main>
  );
}
