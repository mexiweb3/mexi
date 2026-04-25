"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  /**
   * Optional name of the active child to personalize the body copy.
   * If absent, the banner uses a neutral "Tu nino" fallback.
   */
  childName?: string;
};

/**
 * Post-payment success banner shown on /padres after a Stripe checkout
 * completes (URL `?upgraded=1`). Mobile-first, max-w-md.
 *
 * Note: this is the polished UX banner, distinct from the lightweight
 * analytics-only `UpgradeBadge` in components/analytics/UpgradeBadge.tsx,
 * which fires the `subscription_active` event. Both can coexist; pick the
 * right one for each surface.
 */
export function UpgradeSuccessBanner({ childName }: Props): JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [hidden, setHidden] = useState<boolean>(false);

  const upgraded = params?.get("upgraded") === "1";

  const dismiss = useCallback(() => {
    setHidden(true);
    if (!params) return;
    const next = new URLSearchParams(params.toString());
    next.delete("upgraded");
    const query = next.toString();
    const target = query.length > 0 ? `${pathname}?${query}` : pathname;
    router.replace(target ?? "/padres");
  }, [params, pathname, router]);

  if (!upgraded || hidden) return null;

  const displayName = childName && childName.trim().length > 0 ? childName : "Tu nino";

  return (
    <section
      role="status"
      aria-live="polite"
      className="mx-auto mt-4 w-full max-w-md rounded-3xl border-4 border-green-300 bg-green-50 p-5 text-green-900 shadow-[0_6px_0_0_#a7f3d0]"
    >
      <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">
        Bienvenido a Premium
      </h2>
      <p className="mt-2 text-sm leading-snug sm:text-base">
        Acabas de desbloquear todas las lecciones, las canciones y los
        certificados. {displayName} ya puede empezar el modulo 2.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href="/nino/inicio"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-green-600 px-5 py-3 text-sm font-extrabold text-white shadow-[0_4px_0_0_#047857] hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
        >
          Ver todas las lecciones
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-green-300 bg-white px-5 py-3 text-sm font-extrabold text-green-800 hover:bg-green-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300"
        >
          Cerrar
        </button>
      </div>
    </section>
  );
}

export default UpgradeSuccessBanner;
