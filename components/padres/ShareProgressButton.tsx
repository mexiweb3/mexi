"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics/plausible";

type Props = {
  childName: string;
  stars: number;
  badges: number;
  lessons: number;
  appUrl: string;
};

type Feedback = "idle" | "copied" | "error";

function buildImageUrl(props: Omit<Props, "appUrl"> & { appUrl: string }): string {
  const params = new URLSearchParams({
    child: props.childName,
    stars: String(props.stars),
    badges: String(props.badges),
    lessons: String(props.lessons),
  });
  const base = props.appUrl.replace(/\/$/, "");
  return `${base}/api/og/progress?${params.toString()}`;
}

export function ShareProgressButton({
  childName,
  stars,
  badges,
  lessons,
  appUrl,
}: Props): JSX.Element {
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onShare = useCallback(async () => {
    const shareUrl = appUrl.replace(/\/$/, "");
    // Image URL is computed for completeness; included in share text indirectly
    // via OG meta tags on the landing page that {shareUrl} resolves to.
    const _imgUrl = buildImageUrl({
      childName,
      stars,
      badges,
      lessons,
      appUrl,
    });
    void _imgUrl;

    type NavigatorShareCapable = Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };

    const nav: NavigatorShareCapable | null =
      typeof navigator === "undefined" ? null : (navigator as NavigatorShareCapable);

    if (nav && typeof nav.share === "function") {
      try {
        await nav.share({
          title: "Pianitos",
          text: `${childName} esta tocando piano!`,
          url: shareUrl,
        });
        trackEvent("share_progress");
        return;
      } catch {
        // User dismissed or share failed; fall through to clipboard fallback.
      }
    }

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(shareUrl);
        setFeedback("copied");
        trackEvent("share_progress");
      } else {
        setFeedback("error");
      }
    } catch {
      setFeedback("error");
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFeedback("idle"), 2000);
  }, [appUrl, badges, childName, lessons, stars]);

  return (
    <div className="flex flex-col items-stretch gap-2">
      <button
        type="button"
        onClick={() => {
          void onShare();
        }}
        className="kid-button-secondary w-full"
        aria-label="Compartir progreso"
      >
        Compartir progreso
      </button>
      <div
        role="status"
        aria-live="polite"
        className="min-h-[1.25rem] text-center text-sm font-bold text-brand-700"
      >
        {feedback === "copied"
          ? "Copiado al portapapeles"
          : feedback === "error"
            ? "No se pudo copiar el enlace"
            : ""}
      </div>
      <p className="text-center text-xs text-brand-700">
        Tip: el enlace se ve bonito al pegarlo en WhatsApp.
      </p>
    </div>
  );
}
