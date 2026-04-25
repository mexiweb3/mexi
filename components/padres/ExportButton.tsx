"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/cn";

type Props = {
  configured: boolean;
};

type DemoParent = {
  id: string;
  email: string;
  displayName: string | null;
  locale: string;
  plan: "free" | "premium";
  createdAt: string;
  consentSignedAt: string | null;
};

type DemoChild = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  keyboardBrand: string | null;
  createdAt: string;
};

type DemoProgress = {
  childId: string;
  lessonId: string;
  stars: number | null;
  bestScore: number | null;
  completedAt: string | null;
  totalTimeSec: number;
  attempts: number;
};

type DemoBadge = {
  childId: string;
  badgeId: string;
  awardedAt: string;
};

type DemoExport = {
  exportedAt: string;
  parent: DemoParent;
  children: DemoChild[];
  progress: DemoProgress[];
  badges: DemoBadge[];
  subscription: null;
  events: never[];
};

const DEMO_PARENT_KEY = "pianitos.demoParent";
const DEMO_CHILDREN_KEY = "pianitos.demoChildren";
const DEMO_PROGRESS_KEY = "pianitos.demoProgress";
const DEMO_BADGES_KEY = "pianitos.demoBadges";

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function todayStamp(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear().toString().padStart(4, "0");
  const mm = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd = d.getUTCDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function buildDemoExport(): DemoExport {
  const rawParent = readJson(DEMO_PARENT_KEY);
  let parent: DemoParent = {
    id: "demo-parent",
    email: "",
    displayName: null,
    locale: "es",
    plan: "free",
    createdAt: new Date().toISOString(),
    consentSignedAt: null,
  };
  if (rawParent && typeof rawParent === "object") {
    const rec = rawParent as Record<string, unknown>;
    parent = {
      id: typeof rec.id === "string" ? rec.id : "demo-parent",
      email: typeof rec.email === "string" ? rec.email : "",
      displayName:
        typeof rec.displayName === "string" ? rec.displayName : null,
      locale: typeof rec.locale === "string" ? rec.locale : "es",
      plan: rec.plan === "premium" ? "premium" : "free",
      createdAt:
        typeof rec.createdAt === "string"
          ? rec.createdAt
          : new Date().toISOString(),
      consentSignedAt:
        typeof rec.consentSignedAt === "string" ? rec.consentSignedAt : null,
    };
  }

  const children: DemoChild[] = [];
  const rawChildren = readJson(DEMO_CHILDREN_KEY);
  if (Array.isArray(rawChildren)) {
    for (const item of rawChildren) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      if (
        typeof rec.id === "string" &&
        typeof rec.name === "string" &&
        typeof rec.age === "number" &&
        typeof rec.avatar === "string"
      ) {
        children.push({
          id: rec.id,
          name: rec.name,
          age: rec.age,
          avatar: rec.avatar,
          keyboardBrand:
            typeof rec.keyboardBrand === "string" ? rec.keyboardBrand : null,
          createdAt:
            typeof rec.createdAt === "string"
              ? rec.createdAt
              : new Date().toISOString(),
        });
      }
    }
  }

  const progress: DemoProgress[] = [];
  const rawProgress = readJson(DEMO_PROGRESS_KEY);
  if (Array.isArray(rawProgress)) {
    for (const item of rawProgress) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      if (
        typeof rec.childId === "string" &&
        typeof rec.lessonId === "string"
      ) {
        const stars = typeof rec.stars === "number" ? rec.stars : null;
        const bestScore =
          typeof rec.bestScore === "number" ? rec.bestScore : null;
        const completedAt =
          typeof rec.lastCompletedAt === "string"
            ? rec.lastCompletedAt
            : typeof rec.completedAt === "string"
              ? rec.completedAt
              : null;
        const totalTimeSec =
          typeof rec.durationSec === "number"
            ? rec.durationSec
            : typeof rec.totalTimeSec === "number"
              ? rec.totalTimeSec
              : 0;
        const attempts =
          typeof rec.attempts === "number" ? rec.attempts : 0;
        progress.push({
          childId: rec.childId,
          lessonId: rec.lessonId,
          stars,
          bestScore,
          completedAt,
          totalTimeSec,
          attempts,
        });
      }
    }
  }

  const badges: DemoBadge[] = [];
  const rawBadges = readJson(DEMO_BADGES_KEY);
  if (Array.isArray(rawBadges)) {
    for (const item of rawBadges) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      if (
        typeof rec.childId === "string" &&
        typeof rec.badgeId === "string" &&
        typeof rec.awardedAt === "string"
      ) {
        badges.push({
          childId: rec.childId,
          badgeId: rec.badgeId,
          awardedAt: rec.awardedAt,
        });
      }
    }
  }

  return {
    exportedAt: new Date().toISOString(),
    parent,
    children,
    progress,
    badges,
    subscription: null,
    events: [],
  };
}

function triggerDownload(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportButton({ configured }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!configured) {
        const payload = buildDemoExport();
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json",
        });
        triggerDownload(blob, `pianitos-export-${todayStamp()}.json`);
        return;
      }

      const res = await fetch("/api/account/export", {
        method: "GET",
        credentials: "same-origin",
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Inicia sesion para descargar tus datos.");
          return;
        }
        if (res.status === 503) {
          setError("El servicio no esta disponible en este momento.");
          return;
        }
        setError("No pudimos preparar la descarga. Intenta de nuevo.");
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") ?? "";
      const match = /filename="?([^"]+)"?/i.exec(cd);
      const filename = match?.[1] ?? `pianitos-export-${todayStamp()}.json`;
      triggerDownload(blob, filename);
    } catch {
      setError("No pudimos preparar la descarga. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [configured]);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          void onClick();
        }}
        disabled={loading}
        aria-busy={loading}
        className={cn(
          "kid-button w-full sm:w-auto",
          loading && "cursor-wait opacity-70",
        )}
      >
        {loading ? "Preparando..." : "Descargar mis datos (JSON)"}
      </button>
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default ExportButton;
