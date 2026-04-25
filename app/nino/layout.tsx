"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/onboarding/Avatar";
import { useChildProfile } from "@/store/childProfile";

export default function NinoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const activeChild = useChildProfile((s) => s.activeChild);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Guard against pre-hydration mismatch: zustand persist hydrates after mount.
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !activeChild) {
      router.replace("/onboarding/1");
    }
  }, [hydrated, activeChild, router]);

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-brand-50 text-brand-900">
        <div
          aria-hidden="true"
          className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4 py-6"
        >
          <span className="h-12 w-12 animate-bounceSoft rounded-full bg-brand-200" />
        </div>
      </main>
    );
  }

  if (!activeChild) {
    // Redirecting; render nothing useful in the meantime.
    return null;
  }

  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="sticky top-0 z-10 border-b-2 border-brand-100 bg-brand-50/95 backdrop-blur supports-[backdrop-filter]:bg-brand-50/80">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-3 sm:max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="block h-10 w-10 overflow-hidden rounded-full ring-2 ring-brand-200">
              <Avatar id={activeChild.avatar} size={40} />
            </span>
            <span className="text-base font-extrabold text-brand-900">
              {activeChild.name}
            </span>
          </div>
          <Link
            href="/padres"
            aria-label="Salir del modo nino"
            className="rounded-xl border-2 border-brand-200 bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
          >
            Volver
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6 sm:max-w-2xl sm:py-10">
        {children}
      </div>
    </main>
  );
}
