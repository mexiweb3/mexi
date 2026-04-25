/**
 * Admin email allowlist. Server- and client-safe.
 *
 * Reads `ADMIN_EMAILS` (comma-separated). When the env is unset, missing, or
 * empty, every check returns false — no implicit admins.
 */

function parseAdminEmails(): ReadonlyArray<string> {
  const raw = process.env.ADMIN_EMAILS;
  if (typeof raw !== "string" || raw.trim().length === 0) return [];
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0);
}

const ADMIN_EMAILS: ReadonlyArray<string> = parseAdminEmails();

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (ADMIN_EMAILS.length === 0) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function getAdminEmails(): ReadonlyArray<string> {
  return ADMIN_EMAILS;
}
