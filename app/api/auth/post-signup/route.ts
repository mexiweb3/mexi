import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import Welcome from "@/emails/Welcome";
import { sendEmail } from "@/lib/email/send";
import { getAppUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Post-signup hook.
 *
 * Called by the SignUpForm AFTER `supabase.auth.signUp()` resolves
 * successfully. Intentionally callable without an authenticated session
 * because, when email confirmation is required, the user has no session yet.
 *
 * Best-effort: when Resend is not configured, `sendEmail` no-ops and we still
 * return `{ ok: true }` so the signup flow never gets blocked by email.
 */

const Body = z.object({
  email: z.string().trim().email().max(254),
  name: z.string().trim().min(1).max(120).optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_body", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, name } = parsed.data;
  const appUrl = getAppUrl();

  try {
    await sendEmail({
      to: email,
      subject: "Bienvenido a Pianitos",
      react: Welcome({ parentName: name, appUrl }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    console.error(`[post-signup] welcome email threw: ${message}`);
  }

  return NextResponse.json({ ok: true });
}
