import { isAdminEmail } from "@/lib/admin/auth";
import { getSupabaseServer } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";
import type {
  EventsRow,
  Json,
  ProfilesChildRow,
  ChildProgressRow,
  SubscriptionsRow,
} from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Metrics = {
  parentsTotal: number | null;
  childrenTotal: number | null;
  lessonsLast7d: number | null;
  activationD7Pct: number | null;
  premiumConversionPct: number | null;
};

type EventPreview = {
  id: number;
  type: string;
  createdAt: string;
  parentId: string | null;
  payloadPreview: string;
};

const EMPTY_METRICS: Metrics = {
  parentsTotal: null,
  childrenTotal: null,
  lessonsLast7d: null,
  activationD7Pct: null,
  premiumConversionPct: null,
};

function formatNumber(n: number | null): string {
  if (n === null) return "—";
  return new Intl.NumberFormat("es-MX").format(n);
}

function formatPercent(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(1)}%`;
}

function previewPayload(payload: Json): string {
  if (payload === null || payload === undefined) return "";
  try {
    const text = typeof payload === "string" ? payload : JSON.stringify(payload);
    return text.length > 80 ? `${text.slice(0, 77)}...` : text;
  } catch {
    return "";
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().replace("T", " ").slice(0, 19);
  } catch {
    return iso;
  }
}

async function loadMetrics(): Promise<{
  metrics: Metrics;
  events: ReadonlyArray<EventPreview>;
  configured: boolean;
  isAdmin: boolean;
}> {
  if (!supabaseEnv.isConfigured) {
    return {
      metrics: EMPTY_METRICS,
      events: [],
      configured: false,
      isAdmin: false,
    };
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return {
      metrics: EMPTY_METRICS,
      events: [],
      configured: false,
      isAdmin: false,
    };
  }

  let isAdmin = false;
  try {
    const { data } = await supabase.auth.getUser();
    isAdmin = isAdminEmail(data.user?.email ?? null);
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    return {
      metrics: EMPTY_METRICS,
      events: [],
      configured: true,
      isAdmin: false,
    };
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // supabase-js typings against the hand-written Database emit `never` for
  // insert/update intersections, so we cast the runtime results to local
  // shapes and narrow them safely.
  const parentsCountQuery = supabase
    .from("profiles_parent")
    .select("id", { count: "exact", head: true }) as unknown as Promise<{
    count: number | null;
  }>;

  const childrenCountQuery = supabase
    .from("profiles_child")
    .select("id", { count: "exact", head: true }) as unknown as Promise<{
    count: number | null;
  }>;

  const lessonsLast7dQuery = supabase
    .from("child_progress")
    .select("child_id", { count: "exact", head: true })
    .gte("completed_at", since) as unknown as Promise<{
    count: number | null;
  }>;

  const childrenForActivationQuery = supabase
    .from("profiles_child")
    .select("id, parent_id, created_at")
    .order("created_at", { ascending: true }) as unknown as Promise<{
    data: Pick<ProfilesChildRow, "id" | "parent_id" | "created_at">[] | null;
  }>;

  const m1l1ProgressQuery = supabase
    .from("child_progress")
    .select("child_id, lesson_id, completed_at")
    .eq("lesson_id", "m1l1") as unknown as Promise<{
    data: Pick<ChildProgressRow, "child_id" | "lesson_id" | "completed_at">[] | null;
  }>;

  const subscriptionsQuery = supabase
    .from("subscriptions")
    .select("parent_id, status", { count: "exact" })
    .eq("status", "active") as unknown as Promise<{
    data: Pick<SubscriptionsRow, "parent_id" | "status">[] | null;
    count: number | null;
  }>;

  const recentEventsQuery = supabase
    .from("events")
    .select("id, type, created_at, parent_id, payload")
    .order("created_at", { ascending: false })
    .limit(50) as unknown as Promise<{
    data: Pick<
      EventsRow,
      "id" | "type" | "created_at" | "parent_id" | "payload"
    >[] | null;
  }>;

  const [
    parentsRes,
    childrenRes,
    lessonsRes,
    childrenForActivationRes,
    m1l1Res,
    subsRes,
    eventsRes,
  ] = await Promise.all([
    parentsCountQuery.catch(() => ({ count: null })),
    childrenCountQuery.catch(() => ({ count: null })),
    lessonsLast7dQuery.catch(() => ({ count: null })),
    childrenForActivationQuery.catch(() => ({ data: null })),
    m1l1ProgressQuery.catch(() => ({ data: null })),
    subscriptionsQuery.catch(() => ({ data: null, count: null })),
    recentEventsQuery.catch(() => ({ data: null })),
  ]);

  const parentsTotal = parentsRes.count ?? null;
  const childrenTotal = childrenRes.count ?? null;
  const lessonsLast7d = lessonsRes.count ?? null;

  // Activation D7: % of parents whose first child completed lesson m1l1
  // within 24 hours of profile creation.
  let activationD7Pct: number | null = null;
  if (
    childrenForActivationRes.data !== null &&
    m1l1Res.data !== null &&
    parentsTotal !== null &&
    parentsTotal > 0
  ) {
    const firstChildByParent = new Map<
      string,
      { id: string; createdAt: number }
    >();
    for (const row of childrenForActivationRes.data) {
      if (firstChildByParent.has(row.parent_id)) continue;
      firstChildByParent.set(row.parent_id, {
        id: row.id,
        createdAt: new Date(row.created_at).getTime(),
      });
    }

    const completedByChild = new Map<string, number>();
    for (const row of m1l1Res.data) {
      if (!row.completed_at) continue;
      const ts = new Date(row.completed_at).getTime();
      const existing = completedByChild.get(row.child_id);
      if (existing === undefined || ts < existing) {
        completedByChild.set(row.child_id, ts);
      }
    }

    let activated = 0;
    let denominator = 0;
    for (const [, child] of firstChildByParent) {
      denominator += 1;
      const completedAt = completedByChild.get(child.id);
      if (completedAt === undefined) continue;
      if (completedAt - child.createdAt <= 24 * 60 * 60 * 1000) {
        activated += 1;
      }
    }
    if (denominator > 0) {
      activationD7Pct = (activated / denominator) * 100;
    }
  }

  // Premium conversion: active subscriptions / total parents.
  let premiumConversionPct: number | null = null;
  const activeSubs = subsRes.count ?? null;
  if (
    activeSubs !== null &&
    parentsTotal !== null &&
    parentsTotal > 0
  ) {
    premiumConversionPct = (activeSubs / parentsTotal) * 100;
  }

  const events: EventPreview[] = (eventsRes.data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    createdAt: row.created_at,
    parentId: row.parent_id,
    payloadPreview: previewPayload(row.payload),
  }));

  return {
    metrics: {
      parentsTotal,
      childrenTotal,
      lessonsLast7d,
      activationD7Pct,
      premiumConversionPct,
    },
    events,
    configured: true,
    isAdmin: true,
  };
}

export default async function AdminMetricsPage(): Promise<JSX.Element> {
  const { metrics, events, configured, isAdmin } = await loadMetrics();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold leading-tight text-brand-900 sm:text-3xl">
          Metricas internas
        </h1>
        <p className="mt-2 text-sm text-brand-700">
          Resumen general del producto. Datos en vivo, sin PII.
        </p>
      </div>

      {!configured || !isAdmin ? (
        <div
          role="alert"
          className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900"
        >
          Acceso restringido. Configura Supabase y agrega tu correo a
          ADMIN_EMAILS para ver los datos.
        </div>
      ) : null}

      <section
        aria-label="Indicadores principales"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Tile label="Cuentas creadas" value={formatNumber(metrics.parentsTotal)} />
        <Tile
          label="Perfiles de nino"
          value={formatNumber(metrics.childrenTotal)}
        />
        <Tile
          label="Lecciones completadas (7 dias)"
          value={formatNumber(metrics.lessonsLast7d)}
        />
        <Tile
          label="Activacion D7"
          value={formatPercent(metrics.activationD7Pct)}
          hint="Padres cuyo primer perfil termino m1l1 en menos de 24 horas."
        />
        <Tile
          label="Conversion a Premium"
          value={formatPercent(metrics.premiumConversionPct)}
          hint="Suscripciones activas / total de cuentas."
        />
      </section>

      <section
        aria-label="Eventos recientes"
        className="rounded-3xl border-2 border-brand-200 bg-white p-4 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-brand-900">
            Eventos recientes
          </h2>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Ultimos {events.length}
          </span>
        </div>
        <div className="mt-4 -mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-brand-100 text-xs uppercase tracking-wider text-brand-700">
                <th scope="col" className="px-3 py-2 font-bold">
                  ID
                </th>
                <th scope="col" className="px-3 py-2 font-bold">
                  Tipo
                </th>
                <th scope="col" className="px-3 py-2 font-bold">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-2 font-bold">
                  Padre
                </th>
                <th scope="col" className="px-3 py-2 font-bold">
                  Payload
                </th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-brand-700"
                  >
                    Sin eventos para mostrar.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="border-b border-brand-100 align-top"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-brand-800">
                      {ev.id}
                    </td>
                    <td className="px-3 py-2 font-bold text-brand-900">
                      {ev.type}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-brand-700">
                      {formatDate(ev.createdAt)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-brand-700">
                      {ev.parentId ?? "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-brand-700 break-all">
                      {ev.payloadPreview}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

type TileProps = {
  label: string;
  value: string;
  hint?: string;
};

function Tile({ label, value, hint }: TileProps): JSX.Element {
  return (
    <div className="rounded-3xl border-2 border-brand-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold text-brand-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-brand-700">{hint}</p> : null}
    </div>
  );
}
