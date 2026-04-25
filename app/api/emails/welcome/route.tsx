import { NextResponse } from "next/server";

import Welcome from "@/emails/Welcome";
import { sendEmail } from "@/lib/email/send";
import { getAppUrl } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TODO: protect this endpoint in production. Right now it is open because the
// signup flow needs to fire the welcome email before a session is established.
// Replace with a signed token (e.g. Supabase service-role JWT or HMAC of email)
// once the signup webhook is in place.

type WelcomeBody = {
  parentEmail?: unknown;
  parentName?: unknown;
};

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(req: Request) {
  let body: WelcomeBody = {};
  try {
    body = (await req.json()) as WelcomeBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }

  if (!isString(body.parentEmail)) {
    return NextResponse.json(
      { ok: false, error: "invalid_parent_email" },
      { status: 400 },
    );
  }

  const parentName = isString(body.parentName) ? body.parentName : undefined;
  const appUrl = getAppUrl();

  const result = await sendEmail({
    to: body.parentEmail,
    subject: "Bienvenido a Pianitos",
    react: <Welcome parentName={parentName} appUrl={appUrl} />,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
