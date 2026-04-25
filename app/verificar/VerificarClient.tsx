"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/supabase/env";

export function VerificarClient({ email }: { email: string }) {
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const onResend = async () => {
    if (!email) {
      setStatus({
        kind: "error",
        message:
          "Falta el correo. Vuelve a registrarte para recibir un nuevo enlace.",
      });
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setStatus({
        kind: "error",
        message: "Supabase no esta configurado.",
      });
      return;
    }

    setStatus({ kind: "sending" });
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${getAppUrl()}/verificar` },
    });

    if (error) {
      setStatus({
        kind: "error",
        message: "No pudimos reenviar el correo. Intenta nuevamente.",
      });
      return;
    }
    setStatus({ kind: "ok" });
  };

  const sending = status.kind === "sending";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onResend}
        disabled={sending}
        className={cn("kid-button-secondary w-full", sending && "opacity-60")}
      >
        {sending ? "Reenviando..." : "Reenviar correo"}
      </button>

      {status.kind === "ok" ? (
        <p
          role="status"
          className="rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
        >
          Listo, te enviamos un nuevo enlace.
        </p>
      ) : null}

      {status.kind === "error" ? (
        <p
          role="alert"
          className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
