"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  OnboardingAvatar,
  OnboardingKeyboardBrand,
} from "@/store/onboarding";

export type ActiveChild = {
  id: string;
  name: string;
  age: number;
  avatar: OnboardingAvatar;
  keyboardBrand: OnboardingKeyboardBrand | null;
};

type ChildProfileStore = {
  activeChild: ActiveChild | null;
  setActiveChild: (child: ActiveChild | null) => void;
};

export const useChildProfile = create<ChildProfileStore>()(
  persist(
    (set) => ({
      activeChild: null,
      setActiveChild: (child) => set({ activeChild: child }),
    }),
    {
      name: "pianitos.activeChild",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as unknown as Storage)
      ),
      partialize: (state) => ({ activeChild: state.activeChild }),
      version: 1,
    }
  )
);
