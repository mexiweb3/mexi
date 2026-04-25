"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Certificate } from "@/components/certificate/Certificate";
import { PrintControls } from "@/components/certificate/PrintControls";
import {
  getModuleLessonIds,
  getModuleTitle,
  makeCertificateId,
  moduleStatus,
  type ModuleNumber,
} from "@/lib/certificates/eligibility";
import {
  listChildProfiles,
  type ChildProfile,
} from "@/lib/persistence/childProfile";
import {
  getLessonProgress,
  type LessonProgressEntry,
} from "@/lib/persistence/progress";

export type CertificateViewerProps = {
  childId: string;
  moduleNumber: ModuleNumber;
};

type LoadState =
  | { kind: "loading" }
  | { kind: "child-not-found" }
  | {
      kind: "not-eligible";
      child: ChildProfile;
    }
  | {
      kind: "eligible";
      child: ChildProfile;
      totalStars: number;
      awardedAt: string;
      certificateId: string;
    };

function pickAwardedAt(
  progress: Record<string, LessonProgressEntry>,
  lessonIds: readonly string[],
): string {
  let latestMs = 0;
  for (const id of lessonIds) {
    const entry = progress[id];
    if (!entry) continue;
    const ms = Date.parse(entry.lastCompletedAt);
    if (Number.isFinite(ms) && ms > latestMs) {
      latestMs = ms;
    }
  }
  if (latestMs > 0) return new Date(latestMs).toISOString();
  return new Date().toISOString();
}

export function CertificateViewer({
  childId,
  moduleNumber,
}: CertificateViewerProps) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load(): Promise<void> {
      try {
        const children = await listChildProfiles();
        const child = children.find((c) => c.id === childId) ?? null;
        if (!child) {
          if (!cancelled) setState({ kind: "child-not-found" });
          return;
        }
        const progress = await getLessonProgress(childId);
        const status = moduleStatus(progress, moduleNumber);
        if (!status.complete) {
          if (!cancelled) setState({ kind: "not-eligible", child });
          return;
        }
        const lessonIds = getModuleLessonIds(moduleNumber);
        const awardedAt = pickAwardedAt(progress, lessonIds);
        const certificateId = makeCertificateId(
          childId,
          moduleNumber,
          awardedAt,
        );
        if (!cancelled) {
          setState({
            kind: "eligible",
            child,
            totalStars: status.totalStars,
            awardedAt,
            certificateId,
          });
        }
      } catch {
        if (!cancelled) setState({ kind: "child-not-found" });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [childId, moduleNumber]);

  if (state.kind === "loading") {
    return (
      <p
        className="mx-auto max-w-3xl px-4 py-10 text-center text-base text-brand-800"
        role="status"
        aria-live="polite"
      >
        Cargando diploma...
      </p>
    );
  }

  if (state.kind === "child-not-found") {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-10 text-center">
        <h1 className="text-2xl font-extrabold text-brand-900">
          No encontramos a este nino
        </h1>
        <p className="mt-2 text-base text-brand-800">
          Puede que el perfil haya sido eliminado o que estes en otra cuenta.
        </p>
        <Link
          href="/padres/certificados"
          className="kid-button mt-6 inline-flex"
        >
          Volver a diplomas
        </Link>
      </section>
    );
  }

  if (state.kind === "not-eligible") {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-10 text-center">
        <h1 className="text-2xl font-extrabold text-brand-900">
          Casi listo
        </h1>
        <p className="mt-3 text-base text-brand-800">
          Este diploma estara listo cuando {state.child.name} complete el modulo{" "}
          {moduleNumber}.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/padres/certificados"
            className="kid-button-secondary"
          >
            Volver a diplomas
          </Link>
          <Link href="/nino/inicio" className="kid-button">
            Ir a las lecciones
          </Link>
        </div>
      </section>
    );
  }

  const moduleTitle = getModuleTitle(moduleNumber);

  return (
    <main className="mx-auto w-full px-3 py-6 sm:px-6 sm:py-8">
      <PrintControls />
      <Certificate
        childName={state.child.name}
        moduleNumber={moduleNumber}
        moduleTitle={moduleTitle}
        totalStars={state.totalStars}
        awardedAt={state.awardedAt}
        certificateId={state.certificateId}
      />
    </main>
  );
}

export default CertificateViewer;
