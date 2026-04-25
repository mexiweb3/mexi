import { notFound } from "next/navigation";

import { Step1Welcome } from "@/components/onboarding/Step1Welcome";
import { Step2Child } from "@/components/onboarding/Step2Child";
import { Step3Avatar } from "@/components/onboarding/Step3Avatar";
import { Step4Keyboard } from "@/components/onboarding/Step4Keyboard";
import { Step5Midi } from "@/components/onboarding/Step5Midi";

type Params = { step: string };

export function generateStaticParams(): Params[] {
  return [{ step: "1" }, { step: "2" }, { step: "3" }, { step: "4" }, { step: "5" }];
}

export default function OnboardingStepPage({ params }: { params: Params }) {
  const n = Number(params.step);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    notFound();
  }

  switch (n) {
    case 1:
      return <Step1Welcome />;
    case 2:
      return <Step2Child />;
    case 3:
      return <Step3Avatar />;
    case 4:
      return <Step4Keyboard />;
    case 5:
      return <Step5Midi />;
    default:
      notFound();
  }
}
