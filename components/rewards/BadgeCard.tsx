import { Star, Flame, Hand, Ear, Music2 } from "lucide-react";
import type { BadgeDef } from "@/lib/badges/catalog";
import { cn } from "@/lib/cn";

const ICONS = {
  star: Star,
  flame: Flame,
  hand: Hand,
  ear: Ear,
  metronome: Music2,
} as const;

type Props = {
  badge: BadgeDef;
  awarded: boolean;
};

export function BadgeCard({ badge, awarded }: Props) {
  const Icon = ICONS[badge.icon];
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-colors",
        awarded
          ? "border-brand-300 bg-brand-50 text-brand-900"
          : "border-brand-100 bg-white text-brand-400 opacity-60",
      )}
      aria-label={
        awarded ? `Medalla obtenida: ${badge.name}` : `Medalla por obtener: ${badge.name}`
      }
    >
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full",
          awarded ? "bg-brand-300 text-brand-900" : "bg-brand-50 text-brand-300",
        )}
      >
        <Icon className="h-8 w-8" aria-hidden />
      </div>
      <div className="text-base font-bold">{badge.name}</div>
      <p className="text-xs leading-snug">{badge.description}</p>
      {!awarded && (
        <span className="mt-1 rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
          Por obtener
        </span>
      )}
    </div>
  );
}
