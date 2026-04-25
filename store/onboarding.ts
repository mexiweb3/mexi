"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;
export type OnboardingAvatar = "a1" | "a2" | "a3" | "a4" | "a5" | "a6";
export type OnboardingKeyboardBrand = "yamaha" | "casio" | "otro" | "ninguno";

export type OnboardingState = {
  step: OnboardingStep;
  parentEmail: string | null;
  childName: string;
  childAge: number | null;
  childAvatar: OnboardingAvatar | null;
  keyboardBrand: OnboardingKeyboardBrand | null;
  midiAttempted: boolean;
  set: (partial: Partial<OnboardingState>) => void;
  reset: () => void;
};

const initial: Pick<
  OnboardingState,
  | "step"
  | "parentEmail"
  | "childName"
  | "childAge"
  | "childAvatar"
  | "keyboardBrand"
  | "midiAttempted"
> = {
  step: 1,
  parentEmail: null,
  childName: "",
  childAge: null,
  childAvatar: null,
  keyboardBrand: null,
  midiAttempted: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      set: (partial) => set((s) => ({ ...s, ...partial })),
      reset: () => set({ ...initial }),
    }),
    {
      name: "pianitos.onboarding",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as unknown as Storage)
      ),
      partialize: (state) => ({
        step: state.step,
        parentEmail: state.parentEmail,
        childName: state.childName,
        childAge: state.childAge,
        childAvatar: state.childAvatar,
        keyboardBrand: state.keyboardBrand,
        midiAttempted: state.midiAttempted,
      }),
      version: 1,
    }
  )
);
