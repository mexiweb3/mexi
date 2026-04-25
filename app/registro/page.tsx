import Link from "next/link";

export default function RegistroPage() {
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

      <section className="mx-auto max-w-md px-6 pb-20 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl">
          Crear cuenta
        </h1>
        <p className="mt-3 text-brand-800">
          Esta cuenta es para el padre, la madre o el representante legal. Más tarde podrá
          crear el perfil del niño.
        </p>

        <form
          aria-label="Formulario de registro"
          className="mt-10 space-y-6 rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-[0_6px_0_0_#ffd87a] sm:p-8"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-brand-900">
              Email del padre o madre
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              disabled
              className="mt-2 block w-full rounded-2xl border-2 border-brand-200 bg-brand-50 px-4 py-3 text-base text-brand-900 placeholder:text-brand-700/60 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-brand-900">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              disabled
              className="mt-2 block w-full rounded-2xl border-2 border-brand-200 bg-brand-50 px-4 py-3 text-base text-brand-900 placeholder:text-brand-700/60 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:cursor-not-allowed"
            />
          </div>

          <label className="flex items-start gap-3 text-sm text-brand-800">
            <input
              type="checkbox"
              name="parentalConsent"
              disabled
              className="mt-1 h-5 w-5 rounded border-2 border-brand-300 text-brand-600 focus:ring-brand-300 disabled:cursor-not-allowed"
            />
            <span>
              Soy el padre/madre y doy mi consentimiento para que mi hijo(a) menor de edad
              use Pianitos.
            </span>
          </label>

          <button
            type="submit"
            aria-disabled="true"
            disabled
            className="kid-button w-full cursor-not-allowed opacity-60"
          >
            Crear cuenta
          </button>

          <p className="text-center text-sm font-medium text-brand-700">
            Pronto disponible. Por ahora puedes probar el teclado en{" "}
            <Link href="/teclado" className="font-bold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-600">
              /teclado
            </Link>
            .
          </p>
        </form>

        <p className="mt-8 text-center text-sm text-brand-700">
          Al crear la cuenta aceptas nuestros{" "}
          <Link href="/terminos" className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600">
            términos
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600">
            política de privacidad
          </Link>
          .
        </p>

        <p className="mt-4 text-center text-sm text-brand-700">
          ¿Ya tienes cuenta?{" "}
          <Link href="/ingresar" className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600">
            Ingresar
          </Link>
        </p>
      </section>
    </main>
  );
}
