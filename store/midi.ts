import { useEffect } from "react";
import { create } from "zustand";
import { midiEngine, type MidiEvent, type MidiState } from "@/lib/midi/engine";

type MidiStore = {
  state: MidiState;
  lastEvent: MidiEvent | null;
  setState: (s: MidiState) => void;
  pushEvent: (e: MidiEvent) => void;
};

export const useMidiStore = create<MidiStore>((set) => ({
  state: {
    supported: false,
    permission: "unknown",
    inputs: [],
    activeInputId: null,
  },
  lastEvent: null,
  setState: (s) => set({ state: s }),
  pushEvent: (e) => set({ lastEvent: e }),
}));

export function useMidiInit(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { setState, pushEvent } = useMidiStore.getState();

    const unsubscribeState = midiEngine.subscribe((s) => {
      setState(s);
    });
    const unsubscribeEvent = midiEngine.onEvent((e) => {
      pushEvent(e);
    });

    void midiEngine.start();

    return () => {
      unsubscribeState();
      unsubscribeEvent();
    };
  }, []);
}
