"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { supabaseEnv } from "@/lib/supabase/env";
import type {
  OnboardingAvatar,
  OnboardingKeyboardBrand,
} from "@/store/onboarding";

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  avatar: OnboardingAvatar;
  keyboardBrand: OnboardingKeyboardBrand | null;
};

export type CreateChildInput = {
  name: string;
  age: number;
  avatar: OnboardingAvatar;
  keyboardBrand: OnboardingKeyboardBrand | null;
};

const DEMO_KEY = "pianitos.demoChildren";

type DemoChildRecord = {
  id: string;
  name: string;
  age: number;
  avatar: OnboardingAvatar;
  keyboardBrand: OnboardingKeyboardBrand | null;
};

function isAvatar(v: unknown): v is OnboardingAvatar {
  return (
    typeof v === "string" &&
    (v === "a1" || v === "a2" || v === "a3" || v === "a4" || v === "a5" || v === "a6")
  );
}

function isKeyboardBrand(v: unknown): v is OnboardingKeyboardBrand {
  return (
    typeof v === "string" &&
    (v === "yamaha" || v === "casio" || v === "otro" || v === "ninguno")
  );
}

function readDemo(): DemoChildRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: DemoChildRecord[] = [];
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        "id" in item &&
        "name" in item &&
        "age" in item &&
        "avatar" in item
      ) {
        const rec = item as Record<string, unknown>;
        if (
          typeof rec.id === "string" &&
          typeof rec.name === "string" &&
          typeof rec.age === "number" &&
          isAvatar(rec.avatar)
        ) {
          out.push({
            id: rec.id,
            name: rec.name,
            age: rec.age,
            avatar: rec.avatar,
            keyboardBrand: isKeyboardBrand(rec.keyboardBrand)
              ? rec.keyboardBrand
              : null,
          });
        }
      }
    }
    return out;
  } catch {
    return [];
  }
}

function writeDemo(rows: DemoChildRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_KEY, JSON.stringify(rows));
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Extremely defensive fallback. Should not run in modern browsers.
  return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a child profile. Persists to Supabase if configured AND a parent
 * is logged in; otherwise stores locally under DEMO_KEY.
 */
export async function createChildProfile(
  input: CreateChildInput
): Promise<ChildProfile> {
  const supabase = supabaseEnv.isConfigured ? getSupabaseBrowser() : null;

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      if (userId) {
        const { data, error } = await supabase
          .from("profiles_child")
          .insert({
            parent_id: userId,
            name: input.name,
            age: input.age,
            avatar: input.avatar,
            keyboard_brand: input.keyboardBrand,
          })
          .select("id, name, age, avatar, keyboard_brand")
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            age: data.age,
            avatar: data.avatar,
            keyboardBrand: data.keyboard_brand,
          };
        }
        // fall through to demo storage on error
      }
    } catch {
      // fall through to demo storage
    }
  }

  const record: DemoChildRecord = {
    id: generateId(),
    name: input.name,
    age: input.age,
    avatar: input.avatar,
    keyboardBrand: input.keyboardBrand,
  };
  const all = readDemo();
  all.push(record);
  writeDemo(all);
  return record;
}

/**
 * List child profiles. Reads from Supabase when configured + signed in,
 * otherwise from local demo storage.
 */
export async function listChildProfiles(): Promise<ChildProfile[]> {
  const supabase = supabaseEnv.isConfigured ? getSupabaseBrowser() : null;

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      if (userId) {
        const { data, error } = await supabase
          .from("profiles_child")
          .select("id, name, age, avatar, keyboard_brand")
          .eq("parent_id", userId)
          .order("created_at", { ascending: true });

        if (!error && data) {
          return data.map((row) => ({
            id: row.id,
            name: row.name,
            age: row.age,
            avatar: row.avatar,
            keyboardBrand: row.keyboard_brand,
          }));
        }
      }
    } catch {
      // fall through
    }
  }

  return readDemo();
}

/**
 * Delete a child profile by id. Best-effort: if Supabase is configured and
 * signed in, deletes there; otherwise removes from local demo storage.
 */
export async function deleteChildProfile(id: string): Promise<void> {
  const supabase = supabaseEnv.isConfigured ? getSupabaseBrowser() : null;

  if (supabase) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id ?? null;
      if (userId) {
        await supabase
          .from("profiles_child")
          .delete()
          .eq("id", id)
          .eq("parent_id", userId);
      }
    } catch {
      // ignore
    }
  }

  const all = readDemo();
  const next = all.filter((c) => c.id !== id);
  if (next.length !== all.length) {
    writeDemo(next);
  }
}
