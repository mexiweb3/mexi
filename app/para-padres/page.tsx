import Link from "next/link";

const childData: ReadonlyArray<string> = [
  "Nombre de pila (puede ser un apodo).",
  "Edad del niño o niña.",
  "Avatar elegido dentro de la app.",
];

const childDataNever: ReadonlyArray<string> = [
  "Email, número de teléfono o dirección.",
  "Foto, voz o video del menor.",
  "Ubicación, contactos o redes sociales.",
];

const parentData: ReadonlyArray<string> = [
  "Email del padre o madre, usado para iniciar sesión y enviar recibos.",
  "Fecha y dirección IP del consentimiento parental, como prueba legal.",
  "Datos de pago procesados por Stripe. Pianitos no almacena el número de tarjeta.",
];

const privacyMeasures: ReadonlyArray<string> = [
  "Sin trackers publicitarios ni redes sociales de terceros.",
  "Analítica con Plausible, sin cookies y sin perfilado.",
  "Sin chat, comentarios ni contenido entre usuarios.",
  "Servidores en Estados Unidos y Europa, con cifrado en tránsito y en reposo.",
];

const compliance: ReadonlyArray<string> = [
  "COPPA (Estados Unidos): cumplimos con el aviso y el consentimiento verificable del padre o madre.",
  "GDPR-K (Unión Europea y Reino Unido): consentimiento parental para menores de 16 años.",
  "LGPD (Brasil): tratamiento de datos de menores con base en el mejor interés y consentimiento parental.",
  "Doble opt-in por email para confirmar que la persona que crea la cuenta es realmente el padre o madre.",
];

export default function ParaPadresPage() {
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
          Información para padres
        </h1>
        <p className="mt-4 text-lg text-brand-800">
          Esta página resume, en lenguaje claro, qué es Pianitos y cómo cuidamos los datos
          de su familia. Si tiene cualquier duda, escríbanos.
        </p>

        <article className="mt-12 space-y-12">
          <section>
            <h2 className="text-2xl font-extrabold text-brand-900">Qué hacemos</h2>
            <p className="mt-3 text-brand-800">
              Pianitos es una app educativa que enseña a niñas y niños de 7 a 12 años a
              tocar el teclado en casa. Las lecciones son cortas, guiadas y se pueden
              practicar con un teclado USB real o con el teclado en pantalla.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-brand-900">
              Qué datos guardamos del niño
            </h2>
            <p className="mt-3 text-brand-800">Solo lo mínimo para personalizar la práctica:</p>
            <ul className="mt-4 space-y-2 text-brand-800">
              {childData.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-brand-600">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-semibold text-brand-900">Nunca pedimos al menor:</p>
            <ul className="mt-3 space-y-2 text-brand-800">
              {childDataNever.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-brand-600">
                    -
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-brand-900">
              Qué datos guardamos del padre o madre
            </h2>
            <ul className="mt-4 space-y-2 text-brand-800">
              {parentData.map((item) => (
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
            <h2 className="text-2xl font-extrabold text-brand-900">
              Cómo protegemos la privacidad
            </h2>
            <ul className="mt-4 space-y-2 text-brand-800">
              {privacyMeasures.map((item) => (
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
            <h2 className="text-2xl font-extrabold text-brand-900">
              Cómo borrar la cuenta
            </h2>
            <p className="mt-3 text-brand-800">
              Puede borrar su cuenta y todos los datos asociados desde el panel de la
              cuenta del padre o madre, en{" "}
              <Link
                href="/padres/cuenta"
                aria-disabled="true"
                className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
              >
                /padres/cuenta
              </Link>
              . El borrado es definitivo y se completa en menos de 30 días. También puede
              solicitarlo por email a{" "}
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
            <h2 className="text-2xl font-extrabold text-brand-900">Cumplimiento</h2>
            <ul className="mt-4 space-y-2 text-brand-800">
              {compliance.map((item) => (
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
            <h2 className="text-2xl font-extrabold text-brand-900">Contacto</h2>
            <p className="mt-3 text-brand-800">
              Escríbanos a{" "}
              <a
                href="mailto:hola@pianitos.app"
                className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
              >
                hola@pianitos.app
              </a>{" "}
              para cualquier pregunta sobre privacidad, cuentas o pagos. Respondemos en
              menos de 48 horas hábiles.
            </p>
          </section>
        </article>

        <div className="mt-16 flex flex-wrap gap-6 text-brand-800">
          <Link href="/privacidad" className="font-semibold hover:text-brand-600">
            Política de privacidad
          </Link>
          <Link href="/terminos" className="font-semibold hover:text-brand-600">
            Términos y condiciones
          </Link>
          <Link href="/precios" className="font-semibold hover:text-brand-600">
            Precios
          </Link>
        </div>
      </section>
    </main>
  );
}
