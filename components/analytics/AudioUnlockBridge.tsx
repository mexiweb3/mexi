"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics/plausible";

/**
 * Fires `audio_unlocked` exactly once on the first user gesture (pointerdown
 * or keydown) anywhere in the document. Uses `once: true` so the listeners
 * detach automatically after the first invocation.
 *
 * SSR-safe: relies on `useEffect` so it never runs during prerender.
 */
export function AudioUnlockBridge(): null {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let fired = false;
    const handler = () => {
      if (fired) return;
      fired = true;
      trackEvent("audio_unlocked");
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };

    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, []);

  return null;
}

export default AudioUnlockBridge;
