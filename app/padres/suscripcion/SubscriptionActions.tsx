"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";

const STRIPE_AVAILABLE: boolean = Boolean(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim().length > 0,
);

type Props = {
  isPremium: boolean;
};

export function SubscriptionActions({ isPremium }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    if (!STRIPE_AVAILABLE) return;
    setLoading("checkout");
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ price: "monthly" }),
      });
      if (res.status === 401) {
        router.push("/ingresar?next=/padres/suscripcion");
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(
          data.error === "stripe_not_configured"
            ? "Stripe aun no esta configurado."
            : "No pudimos abrir el pago. Intenta de nuevo.",
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("No pudimos abrir el pago. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }, [router]);

  const openPortal = useCallback(async () => {
    if (!STRIPE_AVAILABLE) return;
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
      if (res.status === 401) {
        router.push("/ingresar?next=/padres/suscripcion");
        return;
      }
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(
          data.error === "stripe_not_configured"
            ? "Stripe aun no esta configurado."
            : "No pudimos abrir el portal. Intenta de nuevo.",
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("No pudimos abrir el portal. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }, [router]);

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      {isPremium ? (
        <button
          type="button"
          onClick={openPortal}
          disabled={!STRIPE_AVAILABLE || loading !== null}
          aria-disabled={!STRIPE_AVAILABLE || loading !== null}
          className={cn(
            "kid-button w-full sm:w-auto",
            (!STRIPE_AVAILABLE || loading !== null) &&
              "cursor-not-allowed opacity-60",
          )}
        >
          {STRIPE_AVAILABLE
            ? loading === "portal"
              ? "Abriendo portal..."
              : "Administrar suscripcion"
            : "Disponible cuando configures Stripe"}
        </button>
      ) : (
        <button
          type="button"
          onClick={startCheckout}
          disabled={!STRIPE_AVAILABLE || loading !== null}
          aria-disabled={!STRIPE_AVAILABLE || loading !== null}
          className={cn(
            "kid-button w-full sm:w-auto",
            (!STRIPE_AVAILABLE || loading !== null) &&
              "cursor-not-allowed opacity-60",
          )}
        >
          {STRIPE_AVAILABLE
            ? loading === "checkout"
              ? "Abriendo pago..."
              : "Mejorar a Premium"
            : "Disponible cuando configures Stripe"}
        </button>
      )}

      {error ? (
        <p
          role="alert"
          className="self-center rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default SubscriptionActions;
