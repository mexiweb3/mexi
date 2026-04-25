"use client";

import { useCallback, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { UpgradeModal } from "@/components/paywall/UpgradeModal";

type UpgradeReason = "lesson" | "profiles" | "songs";

type Props = {
  /** True when the wrapped content requires a paid plan. */
  premium: boolean;
  /** True when the current user has an active premium subscription. */
  userIsPremium: boolean;
  /** Reason shown inside the upgrade modal. */
  reason?: UpgradeReason;
  /** The protected content. */
  children: ReactNode;
  /** Optional title shown over the blurred placeholder. */
  title?: string;
  className?: string;
};

const PLACEHOLDER_TITLES: Record<UpgradeReason, string> = {
  lesson: "Esta leccion es Premium",
  profiles: "Sumar mas perfiles es Premium",
  songs: "La biblioteca de canciones es Premium",
};

const PLACEHOLDER_DESCRIPTIONS: Record<UpgradeReason, string> = {
  lesson:
    "Activa Premium para seguir aprendiendo con las lecciones del Modulo 2.",
  profiles:
    "Activa Premium para crear perfiles para cada nina o nino de la casa.",
  songs:
    "Activa Premium para tocar canciones de la biblioteca con guia paso a paso.",
};

/**
 * Wraps premium content with a friendly blurred placeholder + unlock button.
 *
 * - If the content is not premium OR the user already has Premium, the
 *   children render as-is with no overhead.
 * - Otherwise we render a soft, kid-friendly placeholder. The actual children
 *   are rendered behind a blur+overlay so screen readers can still find them
 *   while sighted users see a clear upsell.
 */
export function PremiumGate({
  premium,
  userIsPremium,
  reason = "lesson",
  children,
  title,
  className,
}: Props) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  if (!premium || userIsPremium) {
    return <>{children}</>;
  }

  const headline = title ?? PLACEHOLDER_TITLES[reason];
  const description = PLACEHOLDER_DESCRIPTIONS[reason];

  return (
    <div className={cn("relative isolate", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none select-none opacity-50 blur-sm"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border-2 border-brand-200 bg-white/95 p-6 text-center shadow-[0_6px_0_0_#ffd87a] backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
            Pianitos Premium
          </p>
          <h3 className="mt-1 text-xl font-extrabold text-brand-900 sm:text-2xl">
            {headline}
          </h3>
          <p className="mt-2 text-sm text-brand-800">{description}</p>
          <button
            type="button"
            onClick={handleOpen}
            className="kid-button mt-5 w-full"
          >
            Desbloquear
          </button>
        </div>
      </div>

      <UpgradeModal open={open} onClose={handleClose} reason={reason} />
    </div>
  );
}

export default PremiumGate;
