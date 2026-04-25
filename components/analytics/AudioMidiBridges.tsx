"use client";

import { AudioUnlockBridge } from "./AudioUnlockBridge";
import { MidiAnalyticsBridge } from "./MidiAnalyticsBridge";

/**
 * Bundles the audio-unlock + MIDI-connected analytics bridges into a single
 * client component so the root layout only needs to mount one extra element.
 *
 * Both bridges fire their event at most once per page load and are SSR-safe.
 */
export function AudioMidiBridges(): JSX.Element {
  return (
    <>
      <AudioUnlockBridge />
      <MidiAnalyticsBridge />
    </>
  );
}

export default AudioMidiBridges;
