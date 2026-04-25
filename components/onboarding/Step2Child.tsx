"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/cn";
import { useOnboardingStore } from "@/store/onboarding";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Escribe el nombre del nino o nina.")
    .max(30, "Maximo 30 caracteres."),
  age: z
    .number({ invalid_type_error: "Selecciona la edad." })
    .int()
    .min(5, "Edad minima: 5.")
    .max(14, "Edad maxima: 14."),
});

type FormValues = z.infer<typeof schema>;

const AGES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

export function Step2Child() {
  const router = useRouter();
  const childName = useOnboardingStore((s) => s.childName);
  const childAge = useOnboardingStore((s) => s.childAge);
  const setStore = useOnboardingStore((s) => s.set);

  useEffect(() => {
    setStore({ step: 2 });
  }, [setStore]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: childName ?? "",
      age: childAge ?? (undefined as unknown as number),
    },
  });

  const onSubmit = handleSubmit((values) => {
    setStore({
      childName: values.name.trim(),
      childAge: values.age,
      step: 3,
    });
    router.push("/onboarding/3");
  });

  function back() {
    setStore({ step: 1 });
    router.push("/onboarding/1");
  }

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        Paso 2 de 5
      </p>
      <h1 className="mt-2 text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
        Cuentanos sobre tu hijo o hija
      </h1>
      <p className="mt-3 rounded-2xl border-2 border-brand-200 bg-brand-100/60 px-4 py-3 text-sm text-brand-800">
        Solo guardamos su nombre y edad. Nunca pedimos foto, voz ni email del nino.
      </p>

      <form
        noValidate
        onSubmit={onSubmit}
        aria-label="Datos del nino"
        className="mt-6 space-y-5"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-brand-900">
            Nombre del nino
          </label>
          <input
            id="name"
            type="text"
            autoComplete="off"
            inputMode="text"
            autoFocus
            maxLength={30}
            aria-invalid={Boolean(errors.name) || undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
            className={cn(
              "mt-2 block w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-4 text-lg text-brand-900 placeholder:text-brand-700/50 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-200",
              errors.name &&
                "border-red-300 focus:border-red-400 focus:ring-red-200"
            )}
            placeholder="Por ejemplo: Sofia"
          />
          {errors.name?.message ? (
            <p
              id="name-error"
              role="alert"
              className="mt-2 text-sm font-semibold text-red-600"
            >
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-bold text-brand-900">
            Edad
          </label>
          <select
            id="age"
            aria-invalid={Boolean(errors.age) || undefined}
            aria-describedby={errors.age ? "age-error" : undefined}
            {...register("age", { valueAsNumber: true })}
            defaultValue={childAge ?? ""}
            className={cn(
              "mt-2 block w-full rounded-2xl border-2 border-brand-200 bg-white px-4 py-4 text-lg text-brand-900 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-200",
              errors.age &&
                "border-red-300 focus:border-red-400 focus:ring-red-200"
            )}
          >
            <option value="" disabled>
              Selecciona la edad
            </option>
            {AGES.map((a) => (
              <option key={a} value={a}>
                {a} anos
              </option>
            ))}
          </select>
          {errors.age?.message ? (
            <p
              id="age-error"
              role="alert"
              className="mt-2 text-sm font-semibold text-red-600"
            >
              {errors.age.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={back}
            className="kid-button-secondary w-full sm:w-auto sm:flex-1"
          >
            Atras
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn("kid-button w-full sm:flex-[2]", isSubmitting && "opacity-60")}
          >
            Siguiente
          </button>
        </div>
      </form>
    </section>
  );
}
