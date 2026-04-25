import Link from "next/link";
import PianoStage from "@/components/piano/PianoStage";

const keyboardLegend: ReadonlyArray<{ keys: string; note: string }> = [
  { keys: "A", note: "Do" },
  { keys: "S", note: "Re" },
  { keys: "D", note: "Mi" },
  { keys: "F", note: "Fa" },
  { keys: "G", note: "Sol" },
  { keys: "H", note: "La" },
  { keys: "J", note: "Si" },
  { keys: "K", note: "Do (siguiente)" },
];

export default function TecladoPage() {
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

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-5xl">
          El piano de prueba
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-brand-800">
          Toca con el ratón, los dedos, el teclado de la computadora… o conecta tu teclado
          USB.
        </p>

        <div className="mt-10 rounded-[2.5rem] border-2 border-brand-200 bg-white p-6 shadow-[0_8px_0_0_#ffd87a] sm:p-10">
          <PianoStage labelMode="es" octaves={2} />
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-brand-900">Mapa del teclado</h2>
          <p className="mt-2 text-brand-800">
            Si prefieres usar el teclado de la computadora, estas son las teclas:
          </p>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {keyboardLegend.map(({ keys, note }) => (
              <li
                key={keys}
                className="flex items-center justify-between rounded-2xl border-2 border-brand-200 bg-white px-4 py-3"
              >
                <span className="rounded-lg bg-brand-100 px-3 py-1 font-mono text-base font-bold text-brand-900">
                  {keys}
                </span>
                <span className="font-semibold text-brand-800">{note}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-brand-700">
            Las teclas negras (sostenidos) se tocan con la fila de arriba: W, E, T, Y, U.
          </p>
        </section>
      </section>
    </main>
  );
}
