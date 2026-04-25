"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { Avatar } from "@/components/onboarding/Avatar";
import { useOnboardingStore, type OnboardingAvatar } from "@/store/onboarding";

const AVATARS: ReadonlyArray<OnboardingAvatar> = [
  "a1",
  "a2",
  "a3",
  "a4",
  "a5",
  "a6",
];

export function Step3Avatar() {
  const router = useRouter();
  const childAvatar = useOnboardingStore((s) => s.childAvatar);
  const childName = useOnboardingStore((s) => s.childName);
  const setStore = useOnboardingStore((s) => s.set);

  const [selected, setSelected] = useState<OnboardingAvatar | null>(
    childAvatar
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStore({ step: 3 });
  }, [setStore]);

  function pick(id: OnboardingAvatar) {
    setSelected(id);
    setError(null);
  }

  function next() {
    if (!selected) {
      setError("Elige un avatar para continuar.");
      return;
    }
    setStore({ childAvatar: selected, step: 4 });
    router.push("/onboarding/4");
  }

  function back() {
    setStore({ step: 2 });
    router.push("/onboarding/2");
  }

  const greetName = childName.trim().length > 0 ? childName.trim() : null;

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Paso 3 de 5
      </p>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
        {greetName ? `Elige un avatar para ${greetName}` : "Elige un avatar"}
      </h1>
      <p className="mt-3 text-sm text-brand-800">
        Es solo una carita divertida. No usamos fotos reales.
      </p>

      <div
        role="radiogroup"
        aria-label="Avatares disponibles"
        className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-6"
      >
        {AVATARS.map((id) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Elegir avatar ${id}`}
              onClick={() => pick(id)}
              className={cn(
                "flex min-h-[96px] min-w-[80px] items-center justify-center rounded-3xl border-4 bg-white p-2 transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
                isSelected
                  ? "scale-[1.02] border-brand-500 shadow-[0_6px_0_0_#cc7600]"
                  : "border-brand-100 shadow-[0_4px_0_0_#ffd87a] hover:border-brand-200"
              )}
            >
              <Avatar id={id} size={80} />
            </button>
          );
        })}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 text-sm font-semibold text-red-600"
        >
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
