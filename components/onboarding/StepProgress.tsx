"use client";

import { cn } from "@/lib/cn";

type StepProgressProps = {
  current: 1 | 2 | 3 | 4 | 5;
  total?: number;
};

export function StepProgress({ current, total = 5 }: StepProgressProps) {
  const dots = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <ol
      aria-label={`Paso ${current} de ${total}`}
      className="flex items-center justify-center gap-2 sm:gap-3"
    >
      {dots.map((n) => {
        const isCurrent = n === current;
        const isCompleted = n < current;
        return (
          <li
            key={n}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "rounded-full transition-all",
              isCurrent
                ? "h-3.5 w-3.5 bg-brand-500 ring-2 ring-brand-200"
                : isCompleted
                  ? "h-2.5 w-2.5 bg-brand-400"
                  : "h-2.5 w-2.5 bg-brand-100"
            )}
          >
            <span className="sr-only">
              {isCurrent
                ? `Paso actual ${n}`
                : isCompleted
                  ? `Paso ${n} completado`
                  : `Paso ${n} pendiente`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
