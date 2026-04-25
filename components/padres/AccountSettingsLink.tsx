import Link from "next/link";

import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

/**
 * Small footer link that takes the parent to the account settings screen
 * (export data + delete account). Designed to be dropped into the existing
 * Padres dashboard footer area without requiring layout changes.
 */
export function AccountSettingsLink({ className }: Props) {
  return (
    <Link
      href="/padres/cuenta"
      className={cn(
        "text-sm font-bold text-brand-700 underline underline-offset-4 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:rounded-md",
        className,
      )}
    >
      Ajustes de cuenta
    </Link>
  );
}

export default AccountSettingsLink;
