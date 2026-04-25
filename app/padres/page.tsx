import { PadresDashboard } from "@/components/padres/PadresDashboard";
import {
  type ChildProfile,
} from "@/lib/persistence/childProfile";
import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import type { ChildAvatar, KeyboardBrand } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type RawChildRow = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  keyboard_brand: string | null;
};

function isAvatar(v: string): v is ChildAvatar {
  return (
    v === "a1" ||
    v === "a2" ||
    v === "a3" ||
    v === "a4" ||
    v === "a5" ||
    v === "a6"
  );
}

function isKeyboardBrand(v: string | null): v is KeyboardBrand {
  return (
    v === "yamaha" || v === "casio" || v === "otro" || v === "ninguno"
  );
}

function toChildProfile(row: RawChildRow): ChildProfile | null {
  if (!isAvatar(row.avatar)) return null;
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    avatar: row.avatar,
    keyboardBrand:
      row.keyboard_brand !== null && isKeyboardBrand(row.keyboard_brand)
        ? row.keyboard_brand
        : null,
  };
}

async function loadFromSupabase(): Promise<{
  email: string | null;
  plan: "free" | "premium";
  children: ReadonlyArray<ChildProfile>;
}> {
  if (!supabaseEnv.isConfigured) {
    return { email: null, plan: "free", children: [] };
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { email: null, plan: "free", children: [] };
  }

  try {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) {
      return { email: null, plan: "free", children: [] };
    }

    // Note: supabase-js v2.46 typings infer table rows as `never` against the
    // hand-written Database type (missing __InternalSupabase brand). We cast
    // the runtime results to local row shapes and narrow them safely.
    const parentQuery = supabase
      .from("profiles_parent")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle() as unknown as Promise<{
      data: { plan: "free" | "premium" } | null;
    }>;

    const childQuery = supabase
      .from("profiles_child")
      .select("id, name, age, avatar, keyboard_brand")
      .eq("parent_id", user.id)
      .order("created_at", { ascending: true }) as unknown as Promise<{
      data: RawChildRow[] | null;
    }>;

    const [{ data: parentRow }, { data: childRows }] = await Promise.all([
      parentQuery,
      childQuery,
    ]);

    const plan: "free" | "premium" =
      parentRow?.plan === "premium" ? "premium" : "free";

    const children: ChildProfile[] = (childRows ?? [])
      .map(toChildProfile)
      .filter((c): c is ChildProfile => c !== null);

    return {
      email: user.email ?? null,
      plan,
      children,
    };
  } catch {
    return { email: null, plan: "free", children: [] };
  }
}

export default async function PadresPage() {
  const { email, plan, children } = await loadFromSupabase();
  return (
    <PadresDashboard
      initialEmail={email}
      initialPlan={plan}
      serverChildren={children}
    />
  );
}
