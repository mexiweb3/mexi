"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import {
  useOnboardingStore,
  type OnboardingKeyboardBrand,
} from "@/store/onboarding";

type Option = {
  id: OnboardingKeyboardBrand;
  title: string;
  description: string;
};

const OPTIONS: ReadonlyArray<Option> = [
  {
    id: "yamaha",
    title: "Yamaha PSR",
    description: "La serie comun de Yamaha con teclas de tamano completo.",
  },
  {
    id: "casio",
    title: "Casio",
    description: "Cualquier teclado Casio con salida USB-MIDI.",
  },
  {
    id: "otro",
    title: "Otro teclado",
    description: "Cualquier otra marca con conexion USB.",
  },
  {
    id: "ninguno",
    title: "Aun no tengo",
    description: "Practicamos con el teclado de la pantalla por ahora.",
  },
];

export function Step4Keyboard() {
  const router = useRouter();
  const stored = useOnboardingStore((s) => s.keyboardBrand);
  const setStore = useOnboardingStore((s) => s.set);

  const [selected, setSelected] = useState<OnboardingKeyboardBrand | null>(
    stored
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStore({ step: 4 });
  }, [setStore]);

  function pick(id: OnboardingKeyboardBrand) {
    setSelected(id);
    setError(null);
  }

  function next() {
    if (!selected) {
      setError("Elige una opcion para continuar.");
      return;
    }
    setStore({ keyboardBrand: selected, step: 5 });
    router.push("/onboarding/5");
  }

  function back() {
    setStore({ step: 3 });
    router.push("/onboarding/3");
  }

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Paso 4 de 5
      </p>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
        Que teclado tienen en casa?
      </h1>
      <p className="mt-3 text-sm text-brand-800">
        Esto nos ayuda a darte mejores consejos. Puedes cambiarlo despues.
      </p>

      <div
        role="radiogroup"
        aria-label="Marca de teclado"
        className="mt-6 grid grid-cols-1 gap-3"
      >
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => pick(opt.id)}
              className={cn(
                "flex min-h-[80px] w-full items-center justify-between rounded-3xl border-4 bg-white px-5 py-4 text-left transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
                isSelected
                  ? "border-brand-500 shadow-[0_6px_0_0_#cc7600]"
                  : "border-brand-100 shadow-[0_4px_0_0_#ffd87a] hover:border-brand-200"
              )}
            >
              <span className="flex flex-col">
                <span className="text-lg font-extrabold text-brand-900">
                  {opt.title}
                </span>
                <span className="mt-1 text-sm text-brand-700">
                  {opt.description}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                  isSelected
                    ? "border-brand-500 bg-brand-500"
                    : "border-brand-200 bg-white"
                )}
              >
                {isSelected ? (
                  <span className="block h-2.5 w-2.5 rounded-full bg-white" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={back}
          className="kid-button-secondary w-full sm:w-auto sm:flex-1"
        >
          Atras
        </button>
        <button
          type="button"
          onClick={next}
          className={cn("kid-button w-full sm:flex-[2]", !selected && "opacity-70")}
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
