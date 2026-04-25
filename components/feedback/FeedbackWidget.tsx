"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { usePathname } from "next/navigation";
import { MessageCircleHeart, X } from "lucide-react";

import { cn } from "@/lib/cn";

const MAX_MESSAGE = 1000;
const MIN_MESSAGE = 10;
const THANKS_MS = 4000;

type SubmitState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "success" }
  | { kind: "error"; message: string };

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleId = useId();
  const descId = useId();

  const hidden = useMemo(() => {
    if (!pathname) return false;
    return pathname.includes("/nino/leccion/");
  }, [pathname]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    // Return focus to the floating button after close.
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  // Esc to close + focus trap.
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Initial focus on the textarea.
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute("data-focus-skip"));
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault();
          last?.focus();
        }
      } else {
        if (active === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Lock body scroll while open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      // If trigger isn't there (e.g. unmount race), restore previous focus.
      if (!triggerRef.current && previouslyFocused) {
        previouslyFocused.focus?.();
      }
    };
  }, [open, closeDialog]);

  // Cleanup any pending success timer on unmount.
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleOpen = useCallback(() => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    setSubmitState({ kind: "idle" });
    setOpen(true);
    // eslint-disable-next-line no-console
    console.debug("[feedback] widget opened");
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = message.trim();
      if (trimmed.length < MIN_MESSAGE) {
        setSubmitState({
          kind: "error",
          message: `El mensaje debe tener al menos ${MIN_MESSAGE} caracteres.`,
        });
        return;
      }
      if (trimmed.length > MAX_MESSAGE) {
        setSubmitState({
          kind: "error",
          message: `El mensaje no debe pasar de ${MAX_MESSAGE} caracteres.`,
        });
        return;
      }

      setSubmitState({ kind: "sending" });

      try {
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            email: email.trim(),
            context:
              typeof window !== "undefined" ? window.location.pathname : "",
          }),
        });

        if (!res.ok) {
          if (res.status === 429) {
            setSubmitState({
              kind: "error",
              message: "Demasiados envios. Intenta de nuevo en un minuto.",
            });
          } else if (res.status === 400) {
            setSubmitState({
              kind: "error",
              message: "Revisa el mensaje o el email e intenta otra vez.",
            });
          } else {
            setSubmitState({
              kind: "error",
              message: "No pudimos enviar tu mensaje. Intenta de nuevo.",
            });
          }
          return;
        }

        setSubmitState({ kind: "success" });
        setMessage("");
        setEmail("");
        // eslint-disable-next-line no-console
        console.debug("[feedback] submitted ok");

        successTimeoutRef.current = setTimeout(() => {
          successTimeoutRef.current = null;
          closeDialog();
        }, THANKS_MS);
      } catch {
        setSubmitState({
          kind: "error",
          message: "Falla de red. Revisa tu conexion e intenta de nuevo.",
        });
      }
    },
    [closeDialog, email, message]
  );

  const handleBackdropKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      // Backdrop is non-interactive; keyboard handled by document listener.
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
      }
    },
    [closeDialog]
  );

  if (hidden) return null;

  const remaining = MAX_MESSAGE - message.length;
  const sending = submitState.kind === "sending";
  const success = submitState.kind === "success";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-label="Enviar feedback"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "fixed bottom-3 right-3 z-40 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-brand-400 text-brand-900 shadow-[0_6px_0_0_#cc7600] transition-transform",
          "hover:bg-brand-300 active:translate-y-1 active:shadow-[0_2px_0_0_#cc7600]",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300",
          // Avoid overlap with PWA install pill (also bottom-right): nudge up on small+ screens.
          "sm:bottom-20 sm:right-4 sm:h-16 sm:w-16"
        )}
      >
        <MessageCircleHeart aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
          onKeyDown={handleBackdropKeyDown}
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={cn(
              "w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl",
              "sm:rounded-3xl sm:p-6"
            )}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 id={titleId} className="text-xl font-bold text-brand-900">
                Cuentanos como te va
              </h2>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Cerrar"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-brand-700",
                  "hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
                )}
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <p id={descId} className="mb-4 text-sm text-brand-700">
              Tu mensaje llega directo al equipo. Nos ayuda a mejorar la app durante la beta.
            </p>

            {success ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-2xl bg-brand-50 p-4 text-center text-base font-semibold text-brand-900"
              >
                Gracias por escribirnos. Lo leemos cuanto antes.
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <label
                  htmlFor="feedback-message"
                  className="mb-1 block text-sm font-semibold text-brand-900"
                >
                  Mensaje
                </label>
                <textarea
                  ref={textareaRef}
                  id="feedback-message"
                  name="message"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value.slice(0, MAX_MESSAGE))
                  }
                  required
                  minLength={MIN_MESSAGE}
                  maxLength={MAX_MESSAGE}
                  rows={4}
                  placeholder="Que te gusto, que mejorarias, que falla..."
                  className={cn(
                    "w-full resize-y rounded-2xl border-2 border-brand-200 bg-white p-3 text-base text-brand-900",
                    "placeholder:text-brand-400 focus-visible:border-brand-400 focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-brand-300"
                  )}
                />
                <div className="mt-1 flex justify-between text-xs text-brand-700">
                  <span>{`${MIN_MESSAGE} caracteres minimo`}</span>
                  <span aria-live="polite">{`${remaining} restantes`}</span>
                </div>

                <label
                  htmlFor="feedback-email"
                  className="mt-4 mb-1 block text-sm font-semibold text-brand-900"
                >
                  Email (opcional)
                </label>
                <input
                  id="feedback-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="por si quieres que te respondamos"
                  className={cn(
                    "w-full rounded-2xl border-2 border-brand-200 bg-white p-3 text-base text-brand-900",
                    "placeholder:text-brand-400 focus-visible:border-brand-400 focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-brand-300"
                  )}
                />

                {submitState.kind === "error" ? (
                  <p
                    role="alert"
                    className="mt-3 rounded-xl bg-red-50 p-2 text-sm font-semibold text-red-700"
                  >
                    {submitState.message}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="kid-button-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={sending || message.trim().length < MIN_MESSAGE}
                    className={cn(
                      "kid-button",
                      (sending || message.trim().length < MIN_MESSAGE) &&
                        "cursor-not-allowed opacity-60"
                    )}
                  >
                    {sending ? "Enviando..." : "Enviar"}
                  </button>
                </div>

                <p className="mt-3 text-center text-xs text-brand-700">
                  No guardamos datos del nino.
                </p>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
