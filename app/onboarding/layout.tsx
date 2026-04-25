"use client";

import Link from "next/link";

import { StepProgress } from "@/components/onboarding/StepProgress";
import { useOnboardingStore } from "@/store/onboarding";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const step = useOnboardingStore((s) => s.step);

  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="sticky top-0 z-10 border-b-2 border-brand-100 bg-brand-50/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-brand-50/80">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <Link
            href="/"
            className="text-base font-extrabold tracking-tight text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
          >
            Pianitos
          </Link>
          <StepProgress current={step} />
          <span aria-hidden="true" className="w-[64px] text-right text-xs font-semibold text-brand-700">
            {step}/5
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6 sm:py-10">{children}</div>
    </main>
  );
}
