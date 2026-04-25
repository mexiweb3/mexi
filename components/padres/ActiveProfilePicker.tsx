"use client";

import Link from "next/link";
import { useCallback } from "react";

import { Avatar } from "@/components/onboarding/Avatar";
import { cn } from "@/lib/cn";
import type { ChildProfile } from "@/lib/persistence/childProfile";
import { canAddProfile, type Plan } from "@/lib/profiles/quota";
import { useChildProfile } from "@/store/childProfile";

type Props = {
  profiles: ReadonlyArray<ChildProfile>;
  activeId: string | null;
  /**
   * Optional: when provided, controls whether the "+" tile is shown.
   * Defaults to "free" so the tile only renders if currentCount < 1.
   */
  plan?: Plan;
  className?: string;
};

/**
 * Compact horizontal pill row of avatar tiles. Tapping a tile sets the
 * active child in the local store. A trailing "+" tile links to the full
 * Perfiles management page when adding more is allowed. Mobile-first with
 * snap-x scrolling.
 */
export function ActiveProfilePicker({
  profiles,
  activeId,
  plan = "free",
  className,
}: Props) {
  const setActiveChild = useChildProfile((s) => s.setActiveChild);

  const handleSelect = useCallback(
    (profile: ChildProfile) => {
      setActiveChild({
        id: profile.id,
        name: profile.name,
        age: profile.age,
        avatar: profile.avatar,
        keyboardBrand: profile.keyboardBrand,
      });
    },
    [setActiveChild],
  );

  const showAdd = canAddProfile(plan, profiles.length);

  return (
    <div className={cn("w-full", className)}>
      <div
        className="-mx-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-1"
        role="tablist"
        aria-label="Perfil activo"
      >
        {profiles.map((profile) => {
          const isActive = profile.id === activeId;
          return (
            <button
              key={profile.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(profile)}
              className={cn(
                "flex shrink-0 snap-start flex-col items-center gap-1 rounded-2xl border bg-white px-3 py-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
                isActive
                  ? "border-brand-300 ring-2 ring-brand-300"
                  : "border-neutral-200 hover:border-neutral-300",
              )}
            >
              <Avatar id={profile.avatar} size={48} />
              <span className="max-w-[5rem] truncate text-xs font-bold text-neutral-900">
                {profile.name}
              </span>
            </button>
          );
        })}

        {showAdd ? (
          <Link
            href="/padres/perfiles"
            className="flex shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-400 bg-white px-4 py-2 text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
            aria-label="Agregar perfil"
          >
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold"
            >
              +
            </span>
            <span className="text-xs font-bold">Agregar</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default ActiveProfilePicker;
