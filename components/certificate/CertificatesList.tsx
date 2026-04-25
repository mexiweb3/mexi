"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import {
  listChildProfiles,
  type ChildProfile,
} from "@/lib/persistence/childProfile";
import { getLessonProgress } from "@/lib/persistence/progress";
import {
  getModuleTitle,
  moduleStatus,
  type ModuleNumber,
  type ModuleStatus,
} from "@/lib/certificates/eligibility";

type ChildSummary = {
  child: ChildProfile;
  module1: ModuleStatus;
  module2: ModuleStatus;
};

const MODULES: readonly ModuleNumber[] = [1, 2];

export function CertificatesList() {
  const [loading, setLoading] = useState<boolean>(true);
  const [summaries, setSummaries] = useState<ReadonlyArray<ChildSummary>>([]);

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const children = await listChildProfiles();
        const rows: ChildSummary[] = await Promise.all(
          children.map(async (child) => {
            const progress = await getLessonProgress(child.id);
            return {
              child,
              module1: moduleStatus(progress, 1),
              module2: moduleStatus(progress, 2),
            };
          }),
        );
        if (!cancelled) {
          setSummaries(rows);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSummaries([]);
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-base text-brand-800" role="status" aria-live="polite">
        Cargando diplomas...
      </p>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="rounded-2xl bg-white/80 p-6 shadow-sm">
        <p className="text-base text-brand-900">
          Aun no hay ninos en tu cuenta. Crea un perfil para empezar a coleccionar
          diplomas.
        </p>
        <Link href="/padres" className="kid-button mt-4 inline-flex">
          Ir al panel
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {summaries.map(({ child, module1, module2 }) => (
        <li
          key={child.id}
          className="rounded-2xl bg-white/90 p-5 shadow-sm sm:p-6"
        >
          <h2 className="mb-4 text-xl font-extrabold text-brand-900">
            {child.name}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {MODULES.map((moduleNumber) => {
              const status = moduleNumber === 1 ? module1 : module2;
              const title = getModuleTitle(moduleNumber);
              const href = `/padres/certificados/${child.id}/${moduleNumber}`;
              return (
                <ModuleCard
                  key={moduleNumber}
                  moduleNumber={moduleNumber}
                  title={title}
                  status={status}
                  href={href}
                />
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}

type ModuleCardProps = {
  moduleNumber: ModuleNumber;
  title: string;
  status: ModuleStatus;
  href: string;
};

function ModuleCard({ moduleNumber, title, status, href }: ModuleCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-xl border-2 p-4",
        status.complete
          ? "border-brand-400 bg-brand-50"
          : "border-brand-100 bg-white",
      )}
    >
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
          Modulo {moduleNumber}
        </p>
        <h3 className="text-lg font-extrabold text-brand-900">{title}</h3>
      </header>
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-900">
        <div>
          <dt className="text-xs font-semibold uppercase text-brand-700">
            Lecciones
          </dt>
          <dd className="text-base font-bold">
            {status.lessonsCompleted} / {status.totalLessons}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-brand-700">
            Estrellas
          </dt>
          <dd className="text-base font-bold">{status.totalStars}</dd>
        </div>
      </dl>
      {status.complete ? (
        <Link
          href={href}
          className="kid-button mt-1 inline-flex w-full justify-center sm:w-auto"
          aria-label={`Ver diploma del Modulo ${moduleNumber}`}
        >
          Ver diploma
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="kid-button-secondary mt-1 inline-flex w-full cursor-not-allowed justify-center opacity-60 sm:w-auto"
          aria-disabled="true"
        >
          Aun no listo
        </button>
      )}
    </article>
  );
}

export default CertificatesList;
