"use client";

import { forwardRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/analytics/plausible";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { getAppUrl, supabaseEnv } from "@/lib/supabase/env";

const schema = z
  .object({
    email: z
      .string()
      .min(1, "Ingresa tu correo electronico.")
      .email("Ingresa un correo electronico valido."),
    password: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres."),
    passwordConfirm: z.string().min(1, "Confirma la contrasena."),
    consent: z.literal(true, {
      errorMap: () => ({
        message: "Necesitamos tu consentimiento para continuar.",
      }),
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Las contrasenas no coinciden.",
  });

type FormValues = z.infer<typeof schema>;

const DEMO_KEY = "pianitos.demoParent";

export function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      consent: false as unknown as true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSubmitting(true);

    try {
      const supabase = getSupabaseBrowser();

      if (!supabase || !supabaseEnv.isConfigured) {
        // Demo mode: persist locally and continue.
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            DEMO_KEY,
            JSON.stringify({
              email: values.email,
              consentSignedAt: new Date().toISOString(),
            })
          );
        }
        trackEvent("signup_completed");
        trackEvent("consent_signed");
        router.push("/onboarding/1");
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${getAppUrl()}/verificar`,
        },
      });

      if (error) {
        setServerError(translateAuthError(error.message));
        return;
      }

      trackEvent("signup_completed");
      trackEvent("consent_signed");

      // Best-effort consent record. Does not block flow.
      try {
        await fetch("/api/consent", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ signedAt: new Date().toISOString() }),
        });
      } catch {
        // Ignore: user may not yet have a session if confirmation is required.
      }

      // Best-effort welcome email. Does not block flow.
      void fetch("/api/auth/post-signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      }).catch(() => {});

      router.push(`/verificar?email=${encodeURIComponent(values.email)}`);
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
      aria-label="Formulario de registro"
      className="mt-10 space-y-6 rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-[0_6px_0_0_#ffd87a] sm:p-8"
    >
      <Field
        id="email"
        label="Email del padre o madre"
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
        autoComplete="new-password"
        placeholder="Minimo 8 caracteres"
        error={errors.password?.message}
        {...register("password")}
      />

      <Field
        id="passwordConfirm"
        label="Confirmar contrasena"
        type="password"
        autoComplete="new-password"
        placeholder="Repite la contrasena"
        error={errors.passwordConfirm?.message}
        {...register("passwordConfirm")}
      />

      <label className="flex items-start gap-3 text-sm text-brand-800">
        <input
          type="checkbox"
          {...register("consent")}
          className="mt-1 h-5 w-5 rounded border-2 border-brand-300 text-brand-600 focus:ring-brand-300"
        />
        <span>
          Soy el padre, madre o tutor legal y doy mi consentimiento para que el
          menor a mi cargo use Pianitos. He leido la{" "}
          <Link
            href="/privacidad"
            className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
          >
            politica de privacidad
          </Link>{" "}
          y los{" "}
          <Link
            href="/terminos"
            className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
          >
            terminos
          </Link>
          .
        </span>
      </label>
      {errors.consent?.message ? (
        <p className="text-sm font-semibold text-red-600" role="alert">
          {errors.consent.message}
        </p>
      ) : null}

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
        {submitting ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-brand-700">
        Ya tienes cuenta?{" "}
        <Link
          href="/ingresar"
          className="font-semibold underline decoration-brand-300 underline-offset-4 hover:text-brand-600"
        >
          Ingresar
        </Link>
      </p>
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
  if (
    lowered.includes("already registered") ||
    lowered.includes("already exists")
  ) {
    return "Ya existe una cuenta con ese correo. Intenta ingresar.";
  }
  if (lowered.includes("invalid") && lowered.includes("email")) {
    return "El correo no es valido.";
  }
  if (lowered.includes("password")) {
    return "La contrasena no cumple los requisitos minimos.";
  }
  if (lowered.includes("rate")) {
    return "Demasiados intentos. Espera un momento e intenta nuevamente.";
  }
  return "No pudimos crear la cuenta. Intenta nuevamente.";
}
