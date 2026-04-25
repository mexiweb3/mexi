"use client";

import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics/plausible";
import { useMidiStore } from "@/store/midi";

/**
 * Subscribes to the global MIDI store and fires `midi_connected` exactly once
 * the first time `state.inputs.length > 0` becomes true. Unsubscribes after.
 *
 * Mount once near the root of the app. SSR-safe.
 */
export function MidiAnalyticsBridge(): null {
  useEffect(() => {
    let fired = false;

    // If the store already has inputs at mount time, fire immediately.
    const initial = useMidiStore.getState();
    if (initial.state.inputs.length > 0) {
      fired = true;
      trackEvent("midi_connected");
      return;
    }

    const unsubscribe = useMidiStore.subscribe((s) => {
      if (fired) return;
      if (s.state.inputs.length > 0) {
        fired = true;
        trackEvent("midi_connected");
        unsubscribe();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}

export default MidiAnalyticsBridge;
