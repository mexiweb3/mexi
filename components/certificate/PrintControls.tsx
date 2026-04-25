"use client";

import { useCallback } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";

export type PrintControlsProps = {
  className?: string;
};

export function PrintControls({ className }: PrintControlsProps) {
  const onPrint = useCallback(() => {
    if (typeof window === "undefined") return;
    window.print();
  }, []);

  return (
    <div
      className={cn(
        "screen-only mx-auto mb-4 flex w-full max-w-[1000px] flex-col gap-3 rounded-2xl bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrint}
          className="kid-button"
          aria-label="Imprimir diploma"
        >
          Imprimir
        </button>
        <Link
          href="/padres"
          className="kid-button-secondary"
          aria-label="Volver al panel de padres"
        >
          Volver al panel
        </Link>
      </div>
      <p className="text-xs text-brand-800 sm:text-right sm:text-sm">
        Tip: en el dialogo de impresion, elige Horizontal y guarda como PDF si
        quieres.
      </p>
    </div>
  );
}

export default PrintControls;
