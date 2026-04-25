import { notFound } from "next/navigation";

import { CertificateViewer } from "@/components/certificate/CertificateViewer";
import {
  isModuleNumber,
  type ModuleNumber,
} from "@/lib/certificates/eligibility";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diploma de pianista",
};

type Params = {
  childId: string;
  moduleNumber: string;
};

export default function CertificatePage({ params }: { params: Params }) {
  const parsed = Number(params.moduleNumber);
  if (!Number.isInteger(parsed) || !isModuleNumber(parsed)) {
    notFound();
  }
  const moduleNumber: ModuleNumber = parsed;
  const childId = params.childId;
  if (!childId || typeof childId !== "string") {
    notFound();
  }

  return <CertificateViewer childId={childId} moduleNumber={moduleNumber} />;
}
