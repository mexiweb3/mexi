import Link from "next/link";

export default function TerminosPage() {
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
          Términos y condiciones
        </h1>
        <p className="mt-4 text-brand-700">
          Última actualización: 25 de abril de 2026.
        </p>

        <article className="mt-10 space-y-10 text-brand-800">
          <section>
            <h2 className="text-2xl font-bold text-brand-900">1. Aceptación</h2>
            <p className="mt-3">
              Al crear una cuenta o utilizar Pianitos, usted declara haber leído y aceptado
              estos términos. Si no está de acuerdo, por favor no utilice el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              2. Descripción del servicio
            </h2>
            <p className="mt-3">
              Pianitos es una aplicación educativa para que niñas y niños de 7 a 12 años
              aprendan a tocar el teclado. El servicio incluye lecciones interactivas, un
              teclado virtual, conexión MIDI y un panel de progreso para padres.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              3. Cuenta del padre y consentimiento sobre el niño
            </h2>
            <p className="mt-3">
              Solo personas adultas pueden crear una cuenta. Al hacerlo, usted declara ser
              el padre, la madre o el representante legal del menor, y otorga su
              consentimiento para que el niño utilice Pianitos bajo su supervisión. Usted
              es responsable de la actividad realizada desde la cuenta familiar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              4. Suscripción y pagos
            </h2>
            <p className="mt-3">
              El plan Premium se cobra por mes o por año a través de Stripe. Pianitos no
              almacena los datos de la tarjeta. Las suscripciones se renuevan
              automáticamente al final de cada periodo, salvo que usted las cancele antes.
              Los precios pueden incluir o excluir impuestos según la jurisdicción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">5. Cancelación</h2>
            <p className="mt-3">
              Puede cancelar la suscripción en cualquier momento desde el panel de la
              cuenta del padre o madre. La cancelación tiene efecto al final del periodo
              ya pagado. No realizamos reembolsos parciales por periodos no utilizados,
              salvo cuando lo exija la ley aplicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              6. Conducta aceptable
            </h2>
            <p className="mt-3">
              Usted se compromete a no utilizar Pianitos para fines ilegales, a no intentar
              acceder a cuentas ajenas, a no realizar ingeniería inversa del servicio y a
              no introducir software malicioso. Podemos suspender la cuenta ante un uso
              indebido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              7. Propiedad intelectual
            </h2>
            <p className="mt-3">
              Todo el contenido de Pianitos (lecciones, ilustraciones, audio, código y
              marca) está protegido por derechos de autor y marcas registradas. Se otorga
              una licencia personal, limitada y revocable para uso doméstico y educativo
              dentro de la familia que contrata el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              8. Limitación de responsabilidad
            </h2>
            <p className="mt-3">
              El servicio se ofrece &ldquo;tal cual&rdquo; y &ldquo;según disponibilidad&rdquo;. En la medida
              permitida por la ley, Pianitos no será responsable por daños indirectos,
              incidentales o consecuentes derivados del uso del servicio. Nuestra
              responsabilidad total no excederá el monto pagado por usted en los doce
              meses anteriores al hecho que origine el reclamo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">
              9. Ley aplicable
            </h2>
            <p className="mt-3">
              Estos términos se rigen por la ley de la jurisdicción donde Pianitos tenga
              su domicilio fiscal (a definir antes del lanzamiento comercial). Cualquier
              controversia será resuelta por los tribunales competentes de dicha
              jurisdicción, sin perjuicio de los derechos del consumidor previstos en la
              ley local.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-brand-900">10. Modificaciones</h2>
            <p className="mt-3">
              Podemos actualizar estos términos para reflejar mejoras del servicio o
              cambios legales. Si el cambio es significativo, se lo notificaremos por
              email con al menos 30 días de anticipación. El uso continuado del servicio
              después de la fecha de entrada en vigor implicará la aceptación de los
              nuevos términos.
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
