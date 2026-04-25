"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Avatar } from "@/components/onboarding/Avatar";
import { cn } from "@/lib/cn";
import {
  type ChildProfile,
  createChildProfile,
  deleteChildProfile,
  listChildProfiles,
} from "@/lib/persistence/childProfile";
import { canAddProfile, profileQuota, type Plan } from "@/lib/profiles/quota";
import { useChildProfile } from "@/store/childProfile";
import type {
  OnboardingAvatar,
  OnboardingKeyboardBrand,
} from "@/store/onboarding";

type Props = {
  initial: ReadonlyArray<ChildProfile>;
  plan: Plan;
};

const AVATAR_OPTIONS: ReadonlyArray<OnboardingAvatar> = [
  "a1",
  "a2",
  "a3",
  "a4",
  "a5",
  "a6",
];

const BRAND_OPTIONS: ReadonlyArray<{
  value: OnboardingKeyboardBrand;
  label: string;
}> = [
  { value: "yamaha", label: "Yamaha" },
  { value: "casio", label: "Casio" },
  { value: "otro", label: "Otro" },
  { value: "ninguno", label: "Ninguno" },
];

const MIN_AGE = 5;
const MAX_AGE = 14;
const CONFIRM_TEXT = "Eliminar";

export function ProfilesClient({ initial, plan }: Props) {
  const router = useRouter();
  const activeChild = useChildProfile((s) => s.activeChild);
  const setActiveChild = useChildProfile((s) => s.setActiveChild);

  const [profiles, setProfiles] = useState<ChildProfile[]>(() => [...initial]);
  const [hydrated, setHydrated] = useState<boolean>(initial.length > 0);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If initial is empty (demo mode parity), hydrate from local storage on mount.
  useEffect(() => {
    if (hydrated) return;
    let cancelled = false;
    void (async () => {
      try {
        const rows = await listChildProfiles();
        if (!cancelled) {
          setProfiles(rows);
          setHydrated(true);
        }
      } catch {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  const quota = profileQuota(plan);
  const usedCount = profiles.length;
  const canAdd = canAddProfile(plan, usedCount);

  const refreshList = useCallback(async () => {
    const rows = await listChildProfiles();
    setProfiles(rows);
  }, []);

  const handleMakeActive = useCallback(
    (profile: ChildProfile) => {
      setActiveChild({
        id: profile.id,
        name: profile.name,
        age: profile.age,
        avatar: profile.avatar,
        keyboardBrand: profile.keyboardBrand,
      });
      router.push("/nino/inicio");
    },
    [router, setActiveChild],
  );

  const handleConfirmDelete = useCallback(
    async (id: string) => {
      setBusy(true);
      setErrorMessage(null);
      try {
        await deleteChildProfile(id);
        if (activeChild?.id === id) {
          setActiveChild(null);
        }
        await refreshList();
        setPendingDeleteId(null);
      } catch {
        setErrorMessage("No pudimos eliminar el perfil. Intenta de nuevo.");
      } finally {
        setBusy(false);
      }
    },
    [activeChild?.id, refreshList, setActiveChild],
  );

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <header className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/padres"
            className="text-sm font-bold text-brand-700 underline underline-offset-4 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md"
          >
            Volver
          </Link>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
              plan === "premium"
                ? "bg-brand-600 text-white"
                : "bg-neutral-200 text-neutral-800",
            )}
          >
            {plan === "premium" ? "Premium" : "Free"}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-neutral-900">
          Perfiles de ninos
        </h1>
        <p className="mt-1 text-sm text-neutral-700">
          {usedCount} de {quota} {quota === 1 ? "usado" : "usados"}
        </p>
      </header>

      {errorMessage ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      ) : null}

      <ul className="space-y-3">
        {profiles.map((profile) => {
          const isActive = activeChild?.id === profile.id;
          const isPending = pendingDeleteId === profile.id;
          return (
            <li
              key={profile.id}
              className={cn(
                "rounded-2xl border bg-white p-3 shadow-sm",
                isActive
                  ? "border-brand-300 ring-2 ring-brand-300"
                  : "border-neutral-200",
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar id={profile.avatar} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-bold text-neutral-900">
                      {profile.name}
                    </p>
                    {isActive ? (
                      <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                        Perfil activo
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {profile.age} anos
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleMakeActive(profile)}
                  disabled={busy}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
                    isActive
                      ? "bg-brand-100 text-brand-800"
                      : "bg-brand-600 text-white hover:bg-brand-700",
                    busy && "opacity-60",
                  )}
                >
                  {isActive ? "En uso" : "Hacer activo"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPendingDeleteId(isPending ? null : profile.id)
                  }
                  disabled={busy}
                  className={cn(
                    "rounded-xl border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200",
                    busy && "opacity-60",
                  )}
                >
                  Eliminar
                </button>
              </div>

              {isPending ? (
                <DeleteConfirm
                  busy={busy}
                  onCancel={() => setPendingDeleteId(null)}
                  onConfirm={() => void handleConfirmDelete(profile.id)}
                />
              ) : null}
            </li>
          );
        })}
        {profiles.length === 0 && hydrated ? (
          <li className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm text-neutral-700">
            Aun no hay perfiles. Agrega el primero abajo.
          </li>
        ) : null}
      </ul>

      <section className="mt-6">
        {canAdd ? (
          showAddForm ? (
            <AddProfileForm
              busy={busy}
              onCancel={() => setShowAddForm(false)}
              onCreate={async (input) => {
                setBusy(true);
                setErrorMessage(null);
                try {
                  await createChildProfile(input);
                  await refreshList();
                  setShowAddForm(false);
                } catch {
                  setErrorMessage(
                    "No pudimos crear el perfil. Intenta de nuevo.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full rounded-2xl border-2 border-dashed border-brand-400 bg-white px-4 py-4 text-base font-bold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
            >
              Agregar perfil
            </button>
          )
        ) : plan === "free" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">
              Mejora a Premium para tener hasta 3 perfiles
            </p>
            <Link
              href="/precios"
              className="mt-2 inline-block rounded-xl bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
            >
              Ver Premium
            </Link>
          </div>
        ) : (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-4 text-base font-bold text-neutral-500"
          >
            Llegaste al limite de 3 perfiles
          </button>
        )}
      </section>
    </main>
  );
}

type AddProfileFormProps = {
  busy: boolean;
  onCancel: () => void;
  onCreate: (input: {
    name: string;
    age: number;
    avatar: OnboardingAvatar;
    keyboardBrand: OnboardingKeyboardBrand | null;
  }) => Promise<void>;
};

function AddProfileForm({ busy, onCancel, onCreate }: AddProfileFormProps) {
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<number>(7);
  const [avatar, setAvatar] = useState<OnboardingAvatar>("a1");
  const [brand, setBrand] = useState<OnboardingKeyboardBrand | "">("");

  const trimmedName = name.trim();
  const ageValid = Number.isFinite(age) && age >= MIN_AGE && age <= MAX_AGE;
  const canSubmit = trimmedName.length > 0 && ageValid && !busy;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    void onCreate({
      name: trimmedName,
      age,
      avatar,
      keyboardBrand: brand === "" ? null : brand,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-brand-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-lg font-bold text-neutral-900">Nuevo perfil</h2>

      <label className="mt-3 block">
        <span className="text-sm font-bold text-neutral-800">Nombre</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          required
          className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
          placeholder="Nombre del nino"
        />
      </label>

      <label className="mt-3 block">
        <span className="text-sm font-bold text-neutral-800">
          Edad ({MIN_AGE}-{MAX_AGE})
        </span>
        <input
          type="number"
          min={MIN_AGE}
          max={MAX_AGE}
          value={age}
          onChange={(e) => {
            const next = Number(e.target.value);
            setAge(Number.isFinite(next) ? next : MIN_AGE);
          }}
          required
          className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </label>

      <fieldset className="mt-3">
        <legend className="text-sm font-bold text-neutral-800">Avatar</legend>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {AVATAR_OPTIONS.map((id) => {
            const selected = avatar === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setAvatar(id)}
                aria-pressed={selected}
                className={cn(
                  "rounded-xl p-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
                  selected
                    ? "ring-2 ring-brand-500"
                    : "ring-1 ring-transparent hover:ring-neutral-200",
                )}
              >
                <Avatar id={id} size={44} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-3 block">
        <span className="text-sm font-bold text-neutral-800">
          Marca de teclado (opcional)
        </span>
        <select
          value={brand}
          onChange={(e) => {
            const value = e.target.value;
            if (
              value === "" ||
              value === "yamaha" ||
              value === "casio" ||
              value === "otro" ||
              value === "ninguno"
            ) {
              setBrand(value);
            }
          }}
          className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value="">Sin especificar</option>
          {BRAND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
            !canSubmit && "opacity-60",
          )}
        >
          Crear perfil
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

type DeleteConfirmProps = {
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteConfirm({ busy, onCancel, onConfirm }: DeleteConfirmProps) {
  const [text, setText] = useState<string>("");
  const matches = text === CONFIRM_TEXT;

  const inputId = useMemo(
    () => `confirm-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
      <p className="text-sm text-red-900">
        Esta accion no se puede deshacer. Para confirmar, escribe{" "}
        <span className="font-bold">{CONFIRM_TEXT}</span> abajo.
      </p>
      <label htmlFor={inputId} className="sr-only">
        Confirmar eliminacion
      </label>
      <input
        id={inputId}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoComplete="off"
        className="mt-2 w-full rounded-xl border border-red-300 bg-white px-3 py-2 text-base focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-300"
        placeholder={CONFIRM_TEXT}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!matches || busy}
          className={cn(
            "rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300",
            (!matches || busy) && "opacity-60",
          )}
        >
          Confirmar eliminacion
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-800 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default ProfilesClient;
