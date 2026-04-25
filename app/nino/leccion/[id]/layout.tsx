import type { ReactNode } from "react";

/**
 * Focus mode layout: removes the standard /nino chrome to keep the child's
 * attention on the lesson. Renders a full-bleed warm background.
 */
export default function LessonFocusLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-brand-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}
