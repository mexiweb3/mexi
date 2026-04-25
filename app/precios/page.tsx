import Link from "next/link";

const freeFeatures: ReadonlyArray<string> = [
  "Cuenta para padre o madre",
  "Un perfil de niño",
  "Lecciones 1 a 5 (Módulo 1 completo)",
  "Teclado virtual y conexión MIDI",
  "Resumen semanal de progreso",
];

const premiumFeatures: ReadonlyArray<string> = [
  "Todo lo incluido en el plan Gratis",
  "Lecciones 6 en adelante",
  "Biblioteca de canciones",
  "Certificados al terminar cada módulo",
  "Hasta 3 perfiles de niño",
  "Modo sin conexión (PWA)",
  "Soporte prioritario por email",
];

export default function PreciosPage() {
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

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl">
          Precios simples para familias
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-800">
          Empieza gratis. Sin tarjeta. Si tu hijo se entusiasma con las primeras
          lecciones, pasa a Premium cuando quieras.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border-2 border-brand-200 bg-white p-8 shadow-[0_6px_0_0_#ffd87a]">
            <h2 className="text-2xl font-extrabold text-brand-900">Gratis</h2>
            <p className="mt-2 text-brand-800">
              Para conocer Pianitos sin compromiso.
            </p>
            <p className="mt-6 text-5xl font-extrabold text-brand-900">$0</p>
            <p className="text-brand-700">para siempre</p>
            <ul className="mt-8 space-y-3 text-brand-800">
              {freeFeatures.map((f) => (
                <li key={f} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-brand-600">
                    +
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/registro" className="kid-button-secondary mt-10 w-full">
              Crear cuenta gratis
            </Link>
          </div>

          <div className="rounded-3xl border-2 border-brand-400 bg-white p-8 shadow-[0_6px_0_0_#cc7600]">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-brand-900">Premium</h2>
              <span className="rounded-full bg-brand-700 px-3 py-1 text-sm font-bold text-white">
                Recomendado
              </span>
            </div>
            <p className="mt-2 text-brand-800">Acceso completo para toda la familia.</p>
            <p className="mt-6 text-5xl font-extrabold text-brand-900">
              $9.99 USD
              <span className="text-xl font-semibold text-brand-700"> / mes</span>
            </p>
            <p className="text-brand-700">o $69 USD al año (ahorras dos meses)</p>
            <ul className="mt-8 space-y-3 text-brand-800">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-brand-600">
                    +
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              aria-disabled="true"
              disabled
              className="kid-button mt-10 w-full cursor-not-allowed opacity-60"
            >
              Probar 7 días gratis
            </button>
            <p className="mt-3 text-center text-sm font-medium text-brand-700">
              Disponible pronto.
            </p>
          </div>
        </div>

        <p className="mt-12 max-w-2xl text-sm text-brand-700">
          Los precios están en dólares estadounidenses. Puedes cancelar cuando quieras
          desde la cuenta del padre o madre.
        </p>
      </section>
    </main>
  );
}
