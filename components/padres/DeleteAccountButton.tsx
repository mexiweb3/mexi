"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { supabaseEnv } from "@/lib/supabase/env";

type Props = {
  configured: boolean;
};

const REQUIRED_WORD = "BORRAR";

const PIANITOS_KEYS: ReadonlyArray<string> = [
  "pianitos.demoParent",
  "pianitos.onboarding",
  "pianitos.demoChildren",
  "pianitos.activeChild",
  "pianitos.demoProgress",
  "pianitos.demoBadges",
];

function clearAllPianitosKeys(): void {
  if (typeof window === "undefined") return;
  try {
    for (const key of PIANITOS_KEYS) {
      window.localStorage.removeItem(key);
    }
    // Belt and suspenders: also strip any other key that begins with "pianitos."
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("pianitos.")) {
        toRemove.push(k);
      }
    }
    for (const k of toRemove) {
      window.localStorage.removeItem(k);
    }
  } catch {
    // ignore
  }
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  const nodes = container.querySelectorAll<HTMLElement>(selectors);
  return Array.from(nodes).filter(
    (n) => !n.hasAttribute("aria-hidden") && n.offsetParent !== null,
  );
}

export function DeleteAccountButton({ configured }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const closeDialog = useCallback(() => {
    if (submitting) return;
    setOpen(false);
    setConfirmText("");
    setError(null);
    // restore focus to the trigger
    window.setTimeout(() => {
      triggerRef.current?.focus();
    }, 0);
  }, [submitting]);

  // Esc + body scroll lock + initial focus
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDialog();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the input on open
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeDialog]);

  const handleDialogKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const container = dialogRef.current;
      if (!container) return;
      const focusables = getFocusable(container);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [],
  );

  const onConfirm = useCallback(async () => {
    if (confirmText !== REQUIRED_WORD) return;
    setSubmitting(true);
    setError(null);

    try {
      if (!configured) {
        clearAllPianitosKeys();
        router.push("/");
        router.refresh();
        return;
      }

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ confirm: REQUIRED_WORD }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(
          data.error ?? "No pudimos borrar la cuenta. Intenta de nuevo.",
        );
        setSubmitting(false);
        return;
      }

      // Sign out the supabase session, then wipe local keys, then navigate.
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
      clearAllPianitosKeys();
      router.push("/");
      router.refresh();
    } catch {
      setError("No pudimos borrar la cuenta. Intenta de nuevo.");
      setSubmitting(false);
    }
  }, [confirmText, configured, router]);

  const submitDisabled = confirmText !== REQUIRED_WORD || submitting;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-2xl border-2 border-red-300 bg-red-600 px-5 py-3 text-base font-extrabold text-white shadow-[0_4px_0_0_#b91c1c] transition active:translate-y-[2px] active:shadow-[0_2px_0_0_#b91c1c] hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 sm:w-auto",
        )}
      >
        Borrar mi cuenta
      </button>

      {open ? (
        <div
          aria-hidden={false}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-4 sm:items-center"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closeDialog}
            className="absolute inset-0 cursor-default"
            tabIndex={-1}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onKeyDown={handleDialogKeyDown}
            className="relative w-full max-w-md rounded-3xl border-4 border-red-200 bg-white p-5 shadow-[0_8px_0_0_#fecaca] sm:p-6"
          >
            <h3
              id={titleId}
              className="text-xl font-extrabold leading-tight text-red-700"
            >
              Borrar cuenta de forma permanente
            </h3>
            <p id={descId} className="mt-3 text-sm text-brand-800">
              Esto borrara permanentemente la cuenta, los perfiles del nino,
              todo el progreso y cualquier suscripcion activa. Esta accion no
              se puede deshacer.
            </p>

            <label
              htmlFor="confirm-borrar"
              className="mt-5 block text-sm font-bold text-brand-900"
            >
              Para continuar, escribe{" "}
              <span className="font-extrabold text-red-700">{REQUIRED_WORD}</span>
              :
            </label>
            <input
              ref={inputRef}
              id="confirm-borrar"
              name="confirm"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              inputMode="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={submitting}
              aria-invalid={
                confirmText.length > 0 && confirmText !== REQUIRED_WORD
              }
              className="mt-2 block w-full rounded-2xl border-2 border-brand-200 bg-white px-3 py-3 text-base font-bold text-brand-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
            />

            {error ? (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDialog}
                disabled={submitting}
                className={cn(
                  "kid-button-secondary w-full sm:w-auto",
                  submitting && "cursor-not-allowed opacity-60",
                )}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  void onConfirm();
                }}
                disabled={submitDisabled}
                aria-disabled={submitDisabled}
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-2xl border-2 border-red-300 bg-red-600 px-5 py-3 text-base font-extrabold text-white shadow-[0_4px_0_0_#b91c1c] transition active:translate-y-[2px] active:shadow-[0_2px_0_0_#b91c1c] hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 sm:w-auto",
                  submitDisabled && "cursor-not-allowed opacity-60",
                )}
              >
                {submitting ? "Borrando..." : "Borrar para siempre"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default DeleteAccountButton;
