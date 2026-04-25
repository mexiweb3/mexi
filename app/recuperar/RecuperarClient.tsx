"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/cn";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/supabase/env";

const schema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electronico.")
    .email("Ingresa un correo electronico valido."),
});

type FormValues = z.infer<typeof schema>;

export function RecuperarClient() {
  const [serverMessage, setServerMessage] = useState<
    | { kind: "ok" }
    | { kind: "error"; message: string }
    | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerMessage(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setServerMessage({
          kind: "error",
          message: "Supabase no esta configurado.",
        });
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${getAppUrl()}/auth/callback`,
      });
      if (error) {
        setServerMessage({
          kind: "error",
          message: "No pudimos enviar el correo. Intenta nuevamente.",
        });
        return;
      }
      setServerMessage({ kind: "ok" });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-label="Formulario de recuperacion de contrasena"
      className="mt-6 space-y-6 rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-[0_6px_0_0_#ffd87a] sm:p-8"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-brand-900">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
          className={cn(
            "mt-2 block w-full rounded-2xl border-2 border-brand-200 bg-brand-50 px-4 py-3 text-base text-brand-900 placeholder:text-brand-700/60 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-200",
            errors.email && "border-red-300 focus:border-red-400 focus:ring-red-200"
          )}
        />
        {errors.email?.message ? (
          <p
            id="email-error"
            role="alert"
            className="mt-2 text-sm font-semibold text-red-600"
          >
            {errors.email.message}
          </p>
        ) : null}
      </div>

      {serverMessage?.kind === "error" ? (
        <p
          role="alert"
          className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {serverMessage.message}
        </p>
      ) : null}

      {serverMessage?.kind === "ok" ? (
        <p
          role="status"
          className="rounded-2xl border-2 border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
        >
          Listo, revisa tu correo para continuar.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={cn("kid-button w-full", submitting && "opacity-60")}
      >
        {submitting ? "Enviando..." : "Enviar enlace"}
      </button>
    </form>
  );
}
