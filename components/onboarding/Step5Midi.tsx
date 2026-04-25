"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cable, Power, Music2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics/plausible";
import { useOnboardingStore } from "@/store/onboarding";
import { useChildProfile } from "@/store/childProfile";
import { createChildProfile } from "@/lib/persistence/childProfile";

type Instruction = {
  icon: typeof Cable;
  text: string;
};

const INSTRUCTIONS: ReadonlyArray<Instruction> = [
  { icon: Cable, text: "Enchufa el cable USB del teclado a la computadora." },
  { icon: Power, text: "Enciende el teclado." },
  { icon: Music2, text: "Toca cualquier tecla para probar." },
];

export function Step5Midi() {
  const router = useRouter();
  const setStore = useOnboardingStore((s) => s.set);
  const reset = useOnboardingStore((s) => s.reset);
  const setActiveChild = useChildProfile((s) => s.setActiveChild);

  const childName = useOnboardingStore((s) => s.childName);
  const childAge = useOnboardingStore((s) => s.childAge);
  const childAvatar = useOnboardingStore((s) => s.childAvatar);
  const keyboardBrand = useOnboardingStore((s) => s.keyboardBrand);

  const [submitting, setSubmitting] = useState<"connect" | "later" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStore({ step: 5 });
  }, [setStore]);

  function back() {
    setStore({ step: 4 });
    router.push("/onboarding/4");
  }

  async function persistAndContinue(target: "/teclado?from=onboarding" | "/nino/inicio") {
    setError(null);

    if (!childName.trim() || childAge == null || !childAvatar) {
      setError(
        "Faltan datos del perfil. Vuelve a los pasos anteriores para completarlos."
      );
      return;
    }

    setSubmitting(target.startsWith("/teclado") ? "connect" : "later");
    try {
      const profile = await createChildProfile({
        name: childName.trim(),
        age: childAge,
        avatar: childAvatar,
        keyboardBrand: keyboardBrand,
      });
      setActiveChild({
        id: profile.id,
        name: profile.name,
        age: profile.age,
        avatar: profile.avatar,
        keyboardBrand: profile.keyboardBrand,
      });
      trackEvent("child_profile_created", {
        keyboardBrand: (profile.keyboardBrand ?? "ninguno").toString().toLowerCase(),
      });
      if (target.startsWith("/teclado")) {
        setStore({ midiAttempted: true });
      } else {
        reset();
      }
      router.push(target);
    } catch {
      setError(
        "No pudimos guardar el perfil. Intenta de nuevo en un momento."
      );
      setSubmitting(null);
    }
  }

  function connectNow() {
    void persistAndContinue("/teclado?from=onboarding");
  }

  function later() {
    void persistAndContinue("/nino/inicio");
  }

  const isBusy = submitting !== null;

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Paso 5 de 5
      </p>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
        Conectemos tu teclado
      </h1>
      <p className="mt-3 text-sm text-brand-800">
        Si tienes un teclado USB cerca, podemos detectarlo ahora. Si no, no hay
        problema: lo conectamos cuando quieras.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={connectNow}
          disabled={isBusy}
          aria-busy={submitting === "connect" || undefined}
          className={cn("kid-button w-full", isBusy && "opacity-70")}
        >
          {submitting === "connect" ? "Guardando..." : "Conectar mi teclado ahora"}
        </button>
        <button
          type="button"
          onClick={later}
          disabled={isBusy}
          aria-busy={submitting === "later" || undefined}
          className={cn("kid-button-secondary w-full", isBusy && "opacity-70")}
        >
          {submitting === "later" ? "Guardando..." : "Lo conecto despues"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}

      <ol
        aria-label="Como conectar tu teclado"
        className="mt-8 grid grid-cols-1 gap-3 rounded-3xl border-2 border-brand-200 bg-white p-4 sm:p-5"
      >
        {INSTRUCTIONS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-brand-800"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"
              >
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <span className="pt-1">
                <span className="font-bold text-brand-900">{idx + 1}.</span>{" "}
                {step.text}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={back}
          disabled={isBusy}
          className="kid-button-secondary w-full sm:w-auto sm:flex-1"
        >
          Atras
        </button>
      </div>
    </section>
  );
}
