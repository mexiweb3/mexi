"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

import { BADGE_CATALOG } from "@/lib/badges/catalog";
import { listAwardedBadges } from "@/lib/persistence/progress";
import { useChildProfile } from "@/store/childProfile";
import { BadgeCard } from "@/components/rewards/BadgeCard";
import { Mascot } from "@/components/mascot/Mascot";

export default function LogrosPage() {
  const activeChild = useChildProfile((s) => s.activeChild);
  const [awarded, setAwarded] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!activeChild?.id) {
      setLoaded(true);
      return;
    }
    listAwardedBadges(activeChild.id)
      .then((ids) => {
        if (!cancelled) {
          setAwarded(new Set(ids));
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activeChild?.id]);

  const total = BADGE_CATALOG.length;
  const obtained = awarded.size;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/nino/inicio"
          className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-brand-700 hover:bg-brand-50"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          Volver
        </Link>
        <span className="text-sm font-semibold text-brand-700">
          {loaded ? `${obtained} / ${total}` : "..."}
        </span>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Mascot state={obtained > 0 ? "celebrating" : "idle"} size={72} />
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Tus medallas</h1>
          <p className="text-sm text-brand-700">
            {obtained === 0
              ? "Cada leccion te puede dar una medalla. Empezamos?"
              : obtained === total
                ? "Las tienes todas. Eres una estrella."
                : "Sigue tocando para conseguir las que faltan."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BADGE_CATALOG.map((b) => (
          <BadgeCard key={b.id} badge={b} awarded={awarded.has(b.id)} />
        ))}
      </div>
    </div>
  );
}
