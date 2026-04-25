import type { Metadata } from "next";
import Link from "next/link";

import { SharePreviewCard } from "@/components/padres/SharePreviewCard";
import { getAppUrl } from "@/lib/supabase/env";

type SearchParams = {
  child?: string | string[];
  lessons?: string | string[];
  stars?: string | string[];
  badges?: string | string[];
};

type RouteParams = {
  childId: string;
};

const MAX_NAME_LENGTH = 30;
const MAX_LESSONS = 10;
const MAX_STARS = 30;
const MAX_BADGES = 5;

function pickFirst(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  if (typeof value === "string") return value;
  return null;
}

function clampInt(raw: string | null, max: number): number {
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  if (parsed > max) return max;
  return parsed;
}

function sanitizeName(raw: string | null): string {
  if (!raw) return "";
  return raw.trim().slice(0, MAX_NAME_LENGTH);
}

function buildOgImageUrl(searchParams: SearchParams): string {
  const child = sanitizeName(pickFirst(searchParams.child));
  const lessons = clampInt(pickFirst(searchParams.lessons), MAX_LESSONS);
  const stars = clampInt(pickFirst(searchParams.stars), MAX_STARS);
  const badges = clampInt(pickFirst(searchParams.badges), MAX_BADGES);

  const params = new URLSearchParams();
  if (child) params.set("child", child);
  params.set("lessons", String(lessons));
  params.set("stars", String(stars));
  params.set("badges", String(badges));

  return `${getAppUrl()}/api/og/progress?${params.toString()}`;
}

export function generateMetadata({
  searchParams,
}: {
  params: RouteParams;
  searchParams: SearchParams;
}): Metadata {
  const child = sanitizeName(pickFirst(searchParams.child));
  const title = child
    ? `${child} esta tocando piano · Pianitos`
    : "Mira el avance en Pianitos";
  const description = child
    ? `Mira el avance de ${child} en Pianitos.`
    : "Asi se aprende a tocar el teclado en Pianitos.";

  const imageUrl = buildOgImageUrl(searchParams);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function SharedProgressPage({
  searchParams,
}: {
  params: RouteParams;
  searchParams: SearchParams;
}) {
  const child = sanitizeName(pickFirst(searchParams.child));
  const lessons = clampInt(pickFirst(searchParams.lessons), MAX_LESSONS);
  const stars = clampInt(pickFirst(searchParams.stars), MAX_STARS);
  const badges = clampInt(pickFirst(searchParams.badges), MAX_BADGES);

  const displayName = child || "una nueva pianista";

  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
        >
          Pianitos
        </Link>
        <Link
          href="/para-padres"
          className="text-sm font-semibold text-brand-800 hover:text-brand-600 sm:text-base"
        >
          Para padres
        </Link>
      </header>

      <section className="mx-auto w-full max-w-md px-4 pb-16 pt-2 sm:max-w-2xl sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-brand-700">
          Vista compartida
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight text-brand-900 sm:text-4xl">
          Mira el avance de {displayName}
        </h1>
        <p className="mt-3 text-base text-brand-800 sm:text-lg">
          Esta es una vista compartida. Regreso a Pianitos.
        </p>

        <div className="mt-6">
          <SharePreviewCard
            childName={child}
            stars={stars}
            badges={badges}
            lessons={lessons}
          />
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-3">
          <Link
            href="/registro"
            className="kid-button block w-full text-center"
          >
            Empezar mi propio camino
          </Link>
          <Link
            href="/"
            className="text-center text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
          >
            Conocer Pianitos
          </Link>
        </div>
      </section>
    </main>
  );
}
