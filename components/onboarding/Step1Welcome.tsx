"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useOnboardingStore } from "@/store/onboarding";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { supabaseEnv } from "@/lib/supabase/env";

export function Step1Welcome() {
  const router = useRouter();
  const parentEmail = useOnboardingStore((s) => s.parentEmail);
  const setStore = useOnboardingStore((s) => s.set);

  // Sync the current step into the store whenever this page is shown.
  useEffect(() => {
    setStore({ step: 1 });
  }, [setStore]);

  // If logged in and no email cached, hydrate from supabase silently.
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      if (!supabaseEnv.isConfigured) return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      try {
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email ?? null;
        if (email && !cancelled) {
          setStore({ parentEmail: email });
        }
      } catch {
        // ignore
      }
    }
    if (!parentEmail) {
      void hydrate();
    }
    return () => {
      cancelled = true;
    };
  }, [parentEmail, setStore]);

  function start() {
    setStore({ step: 2 });
    router.push("/onboarding/2");
  }

  return (
    <section className="flex flex-col items-center text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Paso 1 de 5
      </p>
      <h1 className="mt-3 text-3xl font-extrabold leading-tight text-brand-900 sm:text-4xl">
        Hola! Vamos a aprender piano juntos.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-brand-800 sm:text-lg">
        Este recorrido toma cerca de un minuto. Vamos a configurar el perfil de tu
        hijo o hija para que la experiencia sea suya.
      </p>

      {parentEmail ? (
        <p className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 shadow-[0_4px_0_0_#ffd87a] border-2 border-brand-200">
          Bienvenido de nuevo, {parentEmail}
        </p>
      ) : null}

      <div className="mt-10 w-full">
        <button
          type="button"
          onClick={start}
          className="kid-button w-full"
          autoFocus
        >
          Empezar
        </button>
      </div>

      <p className="mt-6 text-xs text-brand-700">
        Sin anuncios. Sin chat. Sin recolectar datos del nino.
      </p>
    </section>
  );
}
