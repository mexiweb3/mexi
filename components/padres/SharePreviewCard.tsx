import { cn } from "@/lib/cn";

type Props = {
  childName: string;
  stars: number;
  badges: number;
  lessons: number;
  className?: string;
};

function Chip({ label }: { label: string }): JSX.Element {
  return (
    <span className="inline-flex items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700 sm:text-sm">
      {label}
    </span>
  );
}

export function SharePreviewCard({
  childName,
  stars,
  badges,
  lessons,
  className,
}: Props): JSX.Element {
  const safeName = childName.trim().slice(0, 30) || "Tu primer teclado";
  const showHighlight = childName.trim().length > 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border-4 border-brand-200 bg-white p-5 shadow-[0_6px_0_0_#ffe9b8] sm:p-6",
        className
      )}
      aria-label="Vista previa del enlace compartido"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-brand-400/90 sm:h-48 sm:w-48"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-2 top-16 h-16 w-16 rounded-full bg-brand-200/70 sm:h-20 sm:w-20"
      />

      <div className="relative">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-brand-700 sm:text-xs">
          Pianitos
        </p>
        <h3 className="mt-2 text-2xl font-black leading-tight text-brand-900 sm:text-3xl">
          {showHighlight ? (
            <>
              <span className="text-brand-600">{safeName}</span>{" "}
              <span>esta tocando piano.</span>
            </>
          ) : (
            <span>Tu primer teclado.</span>
          )}
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip label={`${lessons} lecciones`} />
          <Chip label={`${stars} estrellas`} />
          <Chip label={`${badges} medallas`} />
        </div>

        <div className="mt-5 flex justify-end">
          <span className="text-xs font-bold tracking-wider text-brand-700">
            pianitos.app
          </span>
        </div>
      </div>
    </div>
  );
}
