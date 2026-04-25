"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ensureAudio, playMidi } from "@/lib/audio/engine";
import { useMidiStore } from "@/store/midi";

type Props = {
  children: (active: number[]) => ReactNode;
};

export default function KeyboardMidiBridge({ children }: Props) {
  const lastEvent = useMidiStore((s) => s.lastEvent);
  const [active, setActive] = useState<number[]>([]);
  const activeSetRef = useRef<Set<number>>(new Set());
  const lastEventRef = useRef(lastEvent);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent === lastEventRef.current) return;
    lastEventRef.current = lastEvent;

    if (lastEvent.type === "noteOn") {
      void ensureAudio().then(() => {
        playMidi(lastEvent.midi, undefined, lastEvent.velocity);
      });
      if (!activeSetRef.current.has(lastEvent.midi)) {
        activeSetRef.current.add(lastEvent.midi);
        setActive(Array.from(activeSetRef.current));
      }
    } else if (lastEvent.type === "noteOff") {
      if (activeSetRef.current.delete(lastEvent.midi)) {
        setActive(Array.from(activeSetRef.current));
      }
    }
  }, [lastEvent]);

  return <>{children(active)}</>;
}
