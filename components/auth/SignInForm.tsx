"use client";

import { forwardRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/cn";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { supabaseEnv } from "@/lib/supabase/env";

const schema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electronico.")
    .email("Ingresa un correo electronico valido."),
  password: z.string().min(1, "Ingresa tu contrasena."),
});

type FormValues = z.infer<typeof schema>;

const DEMO_KEY = "pianitos.demoParent";

type DemoParent = {
  email: string;
  consentSignedAt: string;
};

function readDemoParent(): DemoParent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DemoParent>;
    if (typeof parsed.email !== "string") return null;
    if (typeof parsed.consentSignedAt !== "string") return null;
    return { email: parsed.email, consentSignedAt: parsed.consentSignedAt };
  } catch {
    return null;
  }
}

export function SignInForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const supabase = getSupabaseBrowser();

      if (!supabase || !supabaseEnv.isConfigured) {
        const demo = readDemoParent();
        if (demo && demo.email.toLowerCase() === values.email.toLowerCase()) {
          router.push("/padres");
          return;
        }
        setServerError("Cuenta no encontrada en modo demo.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setServerError(translateAuthError(error.message));
        return;
      }

      router.push("/padres");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Algo salio mal. Intenta nuevamente."
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-label="Formulario de ingreso"
      className="mt-10 space-y-6 rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-[0_6px_0_0_#ffd87a] sm:p-8"
    >
      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        error={errors.email?.message}
        {...register("email")}
      />

      <Field
        id="password"
        label="Contrasena"
        type="password"
        autoComplete="current-password"
        placeholder="Tu contrasena"
        error={errors.password?.message}
        {...register("password")}
      />

      {serverError ? (
        <p
          role="alert"
          className="rounded-2xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={cn("kid-button w-full", submitting && "opacity-60")}
      >
        {submitting ? "Ingresando..." : "Ingresar"}
      </button>

      <div className="flex flex-col items-center gap-2 text-sm text-brand-700">
        <Link
          href="/recuperar"
          className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
        >
          Olvidaste tu contrasena?
        </Link>
        <p>
          No tienes cuenta?{" "}
          <Link
            href="/registro"
            className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, error, className, ...rest },
  ref
) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-brand-900">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "mt-2 block w-full rounded-2xl border-2 border-brand-200 bg-brand-50 px-4 py-3 text-base text-brand-900 placeholder:text-brand-700/60 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-200",
          error && "border-red-300 focus:border-red-400 focus:ring-red-200",
          className
        )}
        {...rest}
      />
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-sm font-semibold text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});

function translateAuthError(message: string): string {
  const lowered = message.toLowerCase();
  if (lowered.includes("invalid login") || lowered.includes("invalid credentials")) {
    return "Correo o contrasena incorrectos.";
  }
  if (lowered.includes("email not confirmed")) {
    return "Tu correo aun no ha sido confirmado. Revisa tu bandeja de entrada.";
  }
  if (lowered.includes("rate")) {
    return "Demasiados intentos. Espera un momento e intenta nuevamente.";
  }
  return "No pudimos ingresar. Intenta nuevamente.";
}
