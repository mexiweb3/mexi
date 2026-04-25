"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";

const STRIPE_AVAILABLE: boolean = Boolean(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim().length > 0,
);

const IS_DEV: boolean = process.env.NODE_ENV !== "production";

type Plan = "monthly" | "yearly";

type Props = {
  /** Visible label override per plan. */
  label?: string;
  /** Which Stripe price to use. */
  plan?: Plan;
  /** Style as the secondary CTA. */
  variant?: "primary" | "secondary";
};

export function PricingActions({
  label = "Probar 7 dias gratis",
  plan = "monthly",
  variant = "primary",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    if (!STRIPE_AVAILABLE) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ price: plan }),
      });
      if (res.status === 401) {
        router.push(`/ingresar?next=/precios`);
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
      setLoading(false);
    }
  }, [plan, router]);

  const buttonClass =
    variant === "secondary" ? "kid-button-secondary" : "kid-button";

  return (
    <div className="mt-10 w-full">
      <button
        type="button"
        onClick={startCheckout}
        disabled={!STRIPE_AVAILABLE || loading}
        aria-disabled={!STRIPE_AVAILABLE || loading}
        className={cn(
          buttonClass,
          "w-full",
          (!STRIPE_AVAILABLE || loading) && "cursor-not-allowed opacity-60",
        )}
      >
        {STRIPE_AVAILABLE
          ? loading
            ? "Abriendo pago..."
            : label
          : "Disponible pronto"}
      </button>
      {!STRIPE_AVAILABLE ? (
        <p className="mt-3 text-center text-sm font-medium text-brand-700">
          Disponible pronto.
        </p>
      ) : null}
      {!STRIPE_AVAILABLE && IS_DEV ? (
        <p className="mt-1 text-center text-xs text-brand-600">
          Configurar Stripe en .env.local
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default PricingActions;
