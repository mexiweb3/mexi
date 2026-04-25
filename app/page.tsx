import Link from "next/link";
import { Keyboard, Sparkles, LineChart } from "lucide-react";

const lessonsModule1: ReadonlyArray<string> = [
  "¡Hola, teclado!",
  "Mis amigas las teclas blancas",
  "Toda la familia Do-Si",
  "Mis cinco dedos pianistas",
  "Mi primera melodía",
];

const lessonsModule2: ReadonlyArray<string> = [
  "El pulso del corazón",
  "Notas largas, notas cortas",
  "Manos al teclado",
  "Mi segunda canción",
  "¡Mi primer concierto!",
];

const howItWorks: ReadonlyArray<{
  icon: typeof Keyboard;
  title: string;
  body: string;
}> = [
  {
    icon: Keyboard,
    title: "Conecta tu teclado por USB",
    body: "Pianitos detecta tu teclado MIDI al instante. Si todavía no tienes uno, igual puedes practicar con la pantalla.",
  },
  {
    icon: Sparkles,
    title: "El niño practica en lecciones de 5 minutos",
    body: "Sesiones cortas y guiadas, con un compañero en pantalla que celebra cada nota correcta.",
  },
  {
    icon: LineChart,
    title: "Tú ves su progreso real cada semana",
    body: "Un resumen claro para padres: qué lecciones completó, qué canciones aprendió y dónde necesita ayuda.",
  },
];

const faqs: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "¿Sirve sin teclado físico?",
    a: "Sí. Puedes empezar con el teclado en pantalla y conectar uno real cuando quieras. Lo recomendamos para que el niño desarrolle bien el oído y la postura.",
  },
  {
    q: "¿Mi hijo necesita saber leer música?",
    a: "No. Pianitos enseña desde cero, con colores y letras antes que con partituras. La lectura llega de a poco, sin presión.",
  },
  {
    q: "¿Qué datos guardan del niño?",
    a: "Solo nombre de pila, edad y avatar. Nunca pedimos email, foto, voz ni dirección del menor. Los detalles están en /para-padres.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-brand-700">
          Pianitos
        </Link>
        <nav className="flex items-center gap-3 text-sm font-semibold text-brand-800 sm:gap-6 sm:text-base">
          <Link href="/precios" className="hover:text-brand-600">
            Precios
          </Link>
          <Link href="/para-padres" className="hover:text-brand-600">
            Para padres
          </Link>
          <Link href="/ingresar" className="hover:text-brand-600">
            Ingresar
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-6 sm:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-brand-900 sm:text-5xl lg:text-6xl">
              Tu primer teclado, ahora con maestro propio.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-brand-800 sm:text-xl">
              Pianitos enseña a niñas y niños de 7 a 12 años a tocar su teclado real, con
              lecciones cortas y un compañero que celebra cada acierto.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link href="/teclado" className="kid-button">
                Probar el teclado
              </Link>
              <Link href="/registro" className="kid-button-secondary">
                Crear cuenta gratis
              </Link>
            </div>
            <p className="mt-6 text-sm font-medium text-brand-700">
              Sin anuncios. Sin chat. Sin recolectar datos del niño.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[5/4] w-full rounded-[3rem] bg-gradient-to-br from-brand-200 via-brand-300 to-brand-400 shadow-[0_20px_0_0_#cc7600]" />
            <div className="absolute inset-6 rounded-[2.25rem] bg-white/80 backdrop-blur-sm">
              <div className="flex h-full items-end gap-1 p-6">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      i % 7 === 2 || i % 7 === 6
                        ? "h-2/3 w-6 rounded-b-md bg-brand-900"
                        : "h-full w-8 rounded-b-xl border-2 border-brand-300 bg-white"
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-brand-800">
            Tres pasos simples para que tu hijo empiece esta misma tarde.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {howItWorks.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border-2 border-brand-100 bg-brand-50 p-6 shadow-[0_6px_0_0_#ffd87a]"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-300 text-brand-900">
                  <Icon size={28} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-brand-900">{title}</h3>
                <p className="mt-2 text-brand-800">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
            Currículo
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-brand-800">
            Diez lecciones para empezar. El módulo 1 es gratis para siempre.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-brand-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-brand-900">Módulo 1</h3>
                <span className="rounded-full bg-brand-300 px-3 py-1 text-sm font-bold text-brand-900">
                  Gratis
                </span>
              </div>
              <ol className="mt-4 space-y-2 text-brand-800">
                {lessonsModule1.map((title, i) => (
                  <li key={title} className="flex gap-3">
                    <span className="font-bold text-brand-600">{i + 1}.</span>
                    <span>{title}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border-2 border-brand-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-brand-900">Módulo 2</h3>
                <span className="rounded-full bg-brand-700 px-3 py-1 text-sm font-bold text-white">
                  Premium
                </span>
              </div>
              <ol className="mt-4 space-y-2 text-brand-800">
                {lessonsModule2.map((title, i) => (
                  <li key={title} className="flex gap-3">
                    <span className="font-bold text-brand-600">{i + 6}.</span>
                    <span>{title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">Precios</h2>
          <p className="mt-3 max-w-2xl text-lg text-brand-800">
            Empieza gratis. Pasa a Premium cuando tu hijo esté listo para más.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-brand-200 bg-brand-50 p-8 shadow-[0_6px_0_0_#ffd87a]">
              <h3 className="text-2xl font-extrabold text-brand-900">Gratis</h3>
              <p className="mt-2 text-brand-800">Para empezar sin compromiso.</p>
              <p className="mt-6 text-4xl font-extrabold text-brand-900">$0</p>
              <ul className="mt-6 space-y-2 text-brand-800">
                <li>Una cuenta de padre o madre</li>
                <li>Un perfil de niño</li>
                <li>Lecciones 1 a 5 (Módulo 1)</li>
              </ul>
              <Link href="/registro" className="kid-button-secondary mt-8 w-full">
                Crear cuenta gratis
              </Link>
            </div>
            <div className="rounded-3xl border-2 border-brand-400 bg-white p-8 shadow-[0_6px_0_0_#cc7600]">
              <h3 className="text-2xl font-extrabold text-brand-900">Premium</h3>
              <p className="mt-2 text-brand-800">Acceso completo para toda la familia.</p>
              <p className="mt-6 text-4xl font-extrabold text-brand-900">
                $9.99 USD
                <span className="text-lg font-semibold text-brand-700"> / mes</span>
              </p>
              <p className="text-brand-700">o $69 USD al año</p>
              <ul className="mt-6 space-y-2 text-brand-800">
                <li>Todo lo de Gratis</li>
                <li>Lecciones 6 en adelante</li>
                <li>Biblioteca de canciones</li>
                <li>Hasta 3 perfiles de niño</li>
                <li>7 días de prueba gratuita</li>
              </ul>
              <Link href="/precios" className="kid-button mt-8 w-full">
                Ver detalles
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl border-2 border-brand-200 bg-white p-5 open:shadow-[0_4px_0_0_#ffd87a]"
              >
                <summary className="cursor-pointer list-none text-lg font-bold text-brand-900">
                  {q}
                </summary>
                <p className="mt-3 text-brand-800">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-brand-100 bg-brand-50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-brand-700">Pianitos · 2026</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-brand-800">
            <Link href="/privacidad" className="hover:text-brand-600">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-brand-600">
              Términos
            </Link>
            <Link href="/para-padres" className="hover:text-brand-600">
              Para padres
            </Link>
            <Link href="/precios" className="hover:text-brand-600">
              Precios
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
