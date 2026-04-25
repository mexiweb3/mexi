"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { trackEvent } from "@/lib/analytics/plausible";

/**
 * Small green "Tu cuenta es Premium." banner shown once on /padres?upgraded=1
 * after a successful Stripe checkout. Fires `subscription_active` exactly once
 * per page load when the search param is present.
 *
 * Mount inside the parents dashboard. SSR-safe.
 */
export function UpgradeBadge(): JSX.Element | null {
  const params = useSearchParams();
  const upgraded = params?.get("upgraded") === "1";

  const [dismissed, setDismissed] = useState<boolean>(false);
  const firedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!upgraded) return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackEvent("subscription_active", { source: "checkout_success" });
  }, [upgraded]);

  if (!upgraded || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto mt-4 flex w-full max-w-md items-start justify-between gap-3 rounded-2xl border-2 border-green-300 bg-green-50 px-4 py-3 text-sm font-bold text-green-800 sm:max-w-2xl"
    >
      <span>Tu cuenta es Premium.</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso"
        className="ml-2 inline-flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-full bg-white text-base font-extrabold text-green-800 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
      >
        <span aria-hidden="true">x</span>
      </button>
    </div>
  );
}

export default UpgradeBadge;
