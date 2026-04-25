/**
 * Tiny app URL helper.
 *
 * Returns `process.env.NEXT_PUBLIC_APP_URL` (trailing slash trimmed) or
 * `http://localhost:3000` as the dev fallback. Safe to call from both server
 * and browser bundles.
 */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  const value = trimmed.length > 0 ? trimmed : "http://localhost:3000";
  return value.replace(/\/+$/, "");
}
