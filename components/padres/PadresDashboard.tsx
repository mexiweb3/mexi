"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { Avatar } from "@/components/onboarding/Avatar";
import { UpgradeBadge } from "@/components/analytics/UpgradeBadge";
import { UpgradeSuccessBanner } from "@/components/padres/UpgradeSuccessBanner";
import { AccountSettingsLink } from "@/components/padres/AccountSettingsLink";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { supabaseEnv } from "@/lib/supabase/env";
import {
  listChildProfiles,
  type ChildProfile,
} from "@/lib/persistence/childProfile";
import { useChildProfile } from "@/store/childProfile";

type Props = {
  initialEmail: string | null;
  initialPlan: "free" | "premium";
  serverChildren: ReadonlyArray<ChildProfile>;
};

const DEMO_PARENT_KEY = "pianitos.demoParent";
const ONBOARDING_KEY = "pianitos.onboarding";
const DEMO_CHILDREN_KEY = "pianitos.demoChildren";
const ACTIVE_CHILD_KEY = "pianitos.activeChild";

function readDemoParentEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_PARENT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "email" in parsed &&
      typeof (parsed as { email: unknown }).email === "string"
    ) {
      return (parsed as { email: string }).email;
    }
    return null;
  } catch {
    return null;
  }
}

export function PadresDashboard({
  initialEmail,
  initialPlan,
  serverChildren,
}: Props) {
  const router = useRouter();
  const setActiveChild = useChildProfile((s) => s.setActiveChild);

  const [email, setEmail] = useState<string | null>(initialEmail);
  const [children, setChildren] = useState<ReadonlyArray<ChildProfile>>(
    serverChildren
  );
  const [signingOut, setSigningOut] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      const list = await listChildProfiles();
      setChildren(list);
    } catch {
      // ignore — keep current state
    }
  }, []);

  useEffect(() => {
    // Hydrate from local sources when running in demo mode (no Supabase) or
    // when the server pass returned nothing meaningful.
    if (!email) {
      setEmail(readDemoParentEmail());
    }
    if (serverChildren.length === 0) {
      void refresh();
    }
  }, [email, serverChildren.length, refresh]);

  function openChild(child: ChildProfile) {
    setActiveChild({
      id: child.id,
      name: child.name,
      age: child.age,
      avatar: child.avatar,
      keyboardBrand: child.keyboardBrand,
    });
    router.push("/nino/inicio");
  }

  async function signOut() {
    setSigningOut(true);
    try {
      if (supabaseEnv.isConfigured) {
        const supabase = getSupabaseBrowser();
        if (supabase) {
          try {
            await supabase.auth.signOut();
          } catch {
            // ignore
          }
        }
      }
      if (typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(DEMO_PARENT_KEY);
          window.localStorage.removeItem(ONBOARDING_KEY);
          window.localStorage.removeItem(DEMO_CHILDREN_KEY);
          window.localStorage.removeItem(ACTIVE_CHILD_KEY);
        } catch {
          // ignore
        }
      }
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="sticky top-0 z-10 border-b-2 border-brand-100 bg-brand-50/95 backdrop-blur supports-[backdrop-filter]:bg-brand-50/80">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4 sm:max-w-2xl">
          <Link
            href="/"
            className="text-base font-extrabold tracking-tight text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
          >
            Pianitos
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Padres
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md px-4 py-6 sm:max-w-2xl sm:py-10">
        <UpgradeBadge />
        <UpgradeSuccessBanner childName={children[0]?.name} />
        <section
          aria-label="Resumen de cuenta"
          className="rounded-3xl border-4 border-brand-200 bg-white p-5 shadow-[0_6px_0_0_#ffd87a]"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Hola
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
            {email ?? "Padre o madre"}
          </h1>
          <span
            className={cn(
              "mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
              initialPlan === "premium"
                ? "bg-brand-500 text-white"
                : "bg-brand-100 text-brand-700"
            )}
          >
            Tu plan: {initialPlan === "premium" ? "Premium" : "Gratis"}
          </span>
        </section>

        <section
          aria-label="Progreso semanal"
          className="mt-5 rounded-3xl border-2 border-brand-200 bg-white p-5"
        >
          <h2 className="text-lg font-extrabold text-brand-900">
            Progreso semanal
          </h2>
          <p className="mt-1 text-sm text-brand-700">
            Resumen de los ultimos 7 dias.
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-brand-50 p-3">
              <dt className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Lecciones
              </dt>
              <dd className="mt-1 text-2xl font-extrabold text-brand-900">0</dd>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3">
              <dt className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Estrellas
              </dt>
              <dd className="mt-1 text-2xl font-extrabold text-brand-900">0</dd>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3">
              <dt className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Minutos
              </dt>
              <dd className="mt-1 text-2xl font-extrabold text-brand-900">0</dd>
            </div>
          </dl>
        </section>

        <section
          aria-label="Perfiles de ninos"
          className="mt-5 rounded-3xl border-2 border-brand-200 bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-brand-900">
              Perfiles de ninos
            </h2>
            <Link
              href="/onboarding/1"
              className="text-sm font-bold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
            >
              Anadir
            </Link>
          </div>

          {children.length === 0 ? (
            <p className="mt-4 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
              Aun no hay perfiles. Crea uno desde el recorrido inicial.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-3">
              {children.map((child) => (
                <li
                  key={child.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border-2 border-brand-100 bg-brand-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="block h-12 w-12 overflow-hidden rounded-full ring-2 ring-brand-200">
                      <Avatar id={child.avatar} size={48} />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-base font-extrabold text-brand-900">
                        {child.name}
                      </span>
                      <span className="text-xs text-brand-700">
                        {child.age} anos
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openChild(child)}
                    className="kid-button-secondary !min-h-[48px] !px-4 !py-2 !text-sm"
                  >
                    Ver
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6">
          <Link
            href="/precios"
            className="kid-button block w-full text-center"
          >
            Mejorar a Premium
          </Link>
        </section>

        <div className="mt-8 flex flex-col items-center gap-3">
          <AccountSettingsLink />
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className={cn(
              "text-sm font-bold text-brand-700 underline underline-offset-4 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md",
              signingOut && "opacity-70"
            )}
          >
            {signingOut ? "Cerrando sesion..." : "Cerrar sesion"}
          </button>
        </div>
      </div>
    </main>
  );
}
