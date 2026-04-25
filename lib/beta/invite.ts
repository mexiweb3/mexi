const VALID_CODES = (process.env.NEXT_PUBLIC_BETA_CODES ?? "")
  .split(",")
  .map((c) => c.trim().toUpperCase())
  .filter(Boolean);

const REQUIRE_INVITE = (process.env.NEXT_PUBLIC_REQUIRE_INVITE ?? "").toLowerCase() === "true";

export function isInviteRequired(): boolean {
  return REQUIRE_INVITE && VALID_CODES.length > 0;
}

export function isValidInvite(code: string | null | undefined): boolean {
  if (!isInviteRequired()) return true;
  if (!code) return false;
  return VALID_CODES.includes(code.trim().toUpperCase());
}

export const INVITE_STORAGE_KEY = "pianitos.betaInvite";
