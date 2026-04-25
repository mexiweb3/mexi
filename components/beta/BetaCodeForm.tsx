"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { INVITE_STORAGE_KEY, isValidInvite } from "@/lib/beta/invite";

type Props = {
  required: boolean;
};

export function BetaCodeForm({ required }: Props) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!required) {
      router.push("/registro");
      return;
    }
    if (!isValidInvite(code)) {
      setError("El codigo no es valido. Revisa que este escrito correctamente.");
      return;
    }
    try {
      window.localStorage.setItem(INVITE_STORAGE_KEY, code.trim().toUpperCase());
    } catch {
      // ignore storage errors
    }
    router.push("/registro?beta=ok");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <label className="text-sm font-semibold text-brand-800">
        Codigo de invitacion
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          placeholder="PIANITOS-XXXX"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "beta-error" : undefined}
          className="mt-1 w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-3 text-base font-mono uppercase tracking-wider text-brand-900 outline-none focus:border-brand-400"
          disabled={!required}
        />
      </label>
      {error && (
        <p id="beta-error" role="alert" className="text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="kid-button">
        {required ? "Validar y continuar" : "Crear cuenta"}
      </button>
    </form>
  );
}
