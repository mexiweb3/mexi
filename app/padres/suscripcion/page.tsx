import Link from "next/link";

import { SubscriptionActions } from "@/app/padres/suscripcion/SubscriptionActions";
import {
  getActiveSubscriptionForParent,
  isPremiumStatus,
} from "@/lib/stripe/plan";
import { stripeEnv } from "@/lib/stripe/env";
import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  trialing: "En periodo de prueba",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  unpaid: "Pago pendiente",
  incomplete: "Incompleta",
  incomplete_expired: "Expirada",
  paused: "Pausada",
};

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return null;
  }
}

type LoadResult = {
  email: string | null;
  isPremium: boolean;
  status: string | null;
  periodEnd: string | null;
  cancelAt: string | null;
};

async function loadSubscription(): Promise<LoadResult> {
  if (!supabaseEnv.isConfigured) {
    return {
      email: null,
      isPremium: false,
      status: null,
      periodEnd: null,
      cancelAt: null,
    };
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return {
      email: null,
      isPremium: false,
      status: null,
      periodEnd: null,
      cancelAt: null,
    };
  }
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) {
    return {
      email: null,
      isPremium: false,
      status: null,
      periodEnd: null,
      cancelAt: null,
    };
  }
  const sub = await getActiveSubscriptionForParent(user.id);
  return {
    email: user.email ?? null,
    isPremium: isPremiumStatus(sub?.status ?? null),
    status: sub?.status ?? null,
    periodEnd: sub?.periodEnd ?? null,
    cancelAt: sub?.cancelAt ?? null,
  };
}

export default async function SuscripcionPage() {
  const { email, isPremium, status, periodEnd, cancelAt } =
    await loadSubscription();
  const periodEndLabel = formatDate(periodEnd);
  const cancelAtLabel = formatDate(cancelAt);

  return (
    <main className="min-h-screen bg-brand-50 text-brand-900">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tight text-brand-700"
        >
          Pianitos
        </Link>
        <Link
          href="/padres"
          className="text-sm font-semibold text-brand-800 hover:text-brand-600 sm:text-base"
        >
          Volver a padres
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-20 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Tu suscripcion
        </h1>
        <p className="mt-3 max-w-2xl text-base text-brand-800">
          Aqui puedes ver el estado de tu plan y administrarlo cuando quieras.
        </p>

        {!stripeEnv.isConfigured ? (
          <div className="mt-6 rounded-2xl border-2 border-brand-200 bg-white p-4 text-sm text-brand-800">
            <p className="font-semibold text-brand-900">Modo demo</p>
            <p className="mt-1">
              Stripe aun no esta configurado. Las acciones de pago se activaran
              cuando definas las variables de entorno.
            </p>
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-[0_6px_0_0_#ffd87a] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-600">
                Plan actual
              </p>
              <p className="mt-1 text-2xl font-extrabold text-brand-900">
                {isPremium ? "Premium" : "Gratis"}
              </p>
              {email ? (
                <p className="mt-1 text-sm text-brand-700">{email}</p>
              ) : null}
            </div>
            <span
              className={
                isPremium
                  ? "rounded-full bg-brand-700 px-3 py-1 text-sm font-bold text-white"
                  : "rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-800"
              }
            >
              {isPremium ? "Activa" : "Sin pago"}
            </span>
          </div>

          {status ? (
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-brand-600">
                  Estado
                </dt>
                <dd className="mt-1 text-base font-semibold text-brand-900">
                  {statusLabel(status)}
                </dd>
              </div>
              {periodEndLabel ? (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-brand-600">
                    Proxima renovacion
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-brand-900">
                    {periodEndLabel}
                  </dd>
                </div>
              ) : null}
              {cancelAtLabel ? (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-brand-600">
                    Se cancela el
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-brand-900">
                    {cancelAtLabel}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-base text-brand-800">
              Aun no tienes una suscripcion activa. Activa Premium para
              desbloquear todas las lecciones, perfiles y la biblioteca de
              canciones.
            </p>
          )}

          <SubscriptionActions isPremium={isPremium} />
        </div>

        <p className="mt-8 text-sm text-brand-700">
          ¿Quieres ver los precios y beneficios?{" "}
          <Link
            href="/precios"
            className="font-semibold text-brand-800 underline hover:text-brand-600"
          >
            Ver planes
          </Link>
        </p>
      </section>
    </main>
  );
}
