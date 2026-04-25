"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics/plausible";

type UpgradeReason = "lesson" | "profiles" | "songs";

type Props = {
  open: boolean;
  onClose: () => void;
  reason?: UpgradeReason;
};

const STRIPE_PUBLISHABLE_KEY: string | undefined =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const STRIPE_AVAILABLE: boolean = Boolean(
  STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY.trim().length > 0,
);

const HEADLINES: Record<UpgradeReason, string> = {
  lesson: "Esta leccion es Premium",
  profiles: "Sumar mas perfiles es Premium",
  songs: "La biblioteca de canciones es Premium",
};

const SUBCOPY: Record<UpgradeReason, string> = {
  lesson:
    "Continua la aventura del Modulo 2 con todas las lecciones desbloqueadas.",
  profiles:
    "Crea perfiles para cada nina o nino de la casa, con su propio progreso.",
  songs:
    "Toca tus canciones favoritas con guia paso a paso, a tu propio ritmo.",
};

const BENEFITS: ReadonlyArray<string> = [
  "Lecciones del Modulo 2 completas",
  "Biblioteca de canciones para tocar",
  "Hasta 3 perfiles de niño",
  "Certificados al terminar cada modulo",
];

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function UpgradeModal({ open, onClose, reason = "lesson" }: Props) {
  const router = useRouter();
  const labelId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const headline = useMemo(() => HEADLINES[reason], [reason]);
  const subcopy = useMemo(() => SUBCOPY[reason], [reason]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Fire paywall_seen exactly when the modal opens.
  useEffect(() => {
    if (!open) return;
    trackEvent("paywall_seen", { reason: reason ?? "unknown" });
  }, [open, reason]);

  // Save / restore focus and trap focus inside the dialog.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current =
      (document.activeElement as HTMLElement | null) ?? null;
    const dialog = dialogRef.current;
    if (dialog) {
      const focusables = dialog.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTORS,
      );
      const first = focusables[0];
      first?.focus();
    }
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // ESC + tab trap.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const startCheckout = useCallback(async () => {
    if (!STRIPE_AVAILABLE) return;
    trackEvent("checkout_started", { plan: "monthly" });
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ price: "monthly" }),
      });
      if (res.status === 401) {
        router.push("/ingresar?next=/precios");
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
  }, [router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      aria-hidden={false}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-brand-900/60"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        className={cn(
          "relative z-[101] w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl",
          "sm:rounded-3xl sm:p-8",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-brand-600">
              Pianitos Premium
            </p>
            <h2
              id={labelId}
              className="mt-1 text-2xl font-extrabold text-brand-900 sm:text-3xl"
            >
              {headline}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-12 w-12 min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-brand-50 text-2xl font-bold text-brand-800 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>

        <p id={descriptionId} className="mt-3 text-base text-brand-800">
          {subcopy}
        </p>

        <ul className="mt-5 space-y-2 text-brand-800">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-300 text-xs font-bold text-brand-900"
              >
                +
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {error ? (
          <p
            className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startCheckout}
            disabled={!STRIPE_AVAILABLE || loading}
            aria-disabled={!STRIPE_AVAILABLE || loading}
            className={cn(
              "kid-button w-full sm:flex-1",
              (!STRIPE_AVAILABLE || loading) &&
                "cursor-not-allowed opacity-60",
            )}
          >
            {STRIPE_AVAILABLE
              ? loading
                ? "Abriendo pago..."
                : "Probar 7 dias gratis"
              : "Disponible cuando configures Stripe"}
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/precios");
            }}
            className="kid-button-secondary w-full sm:w-auto"
          >
            Ver planes
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-brand-700">
          Cancela cuando quieras desde la cuenta del padre o madre.
        </p>
      </div>
    </div>
  );
}

export default UpgradeModal;
