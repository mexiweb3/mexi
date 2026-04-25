import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import Feedback from "@/emails/Feedback";
import { sendEmail } from "@/lib/email/send";
import { emailEnv } from "@/lib/email/env";
import { supabaseEnv } from "@/lib/supabase/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FeedbackBody = z.object({
  message: z.string().trim().min(10).max(1000),
  email: z
    .string()
    .trim()
    .max(254)
    .email()
    .or(z.literal(""))
    .optional(),
  context: z.string().trim().max(200).optional(),
});

type RateBucket = { count: number; resetAt: number };

const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

const buckets = new Map<string, RateBucket>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return request.ip ?? "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const existing = buckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (existing.count >= RATE_LIMIT) return false;
  existing.count += 1;
  return true;
}

function extractEmailAddress(raw: string): string | null {
  // Supports "Name <addr@domain>" and bare "addr@domain".
  const angle = raw.match(/<([^>]+)>/);
  const candidate = (angle?.[1] ?? raw).trim();
  if (candidate.includes("@")) return candidate;
  return null;
}

function resolveFeedbackTo(): string | null {
  const explicit = process.env.FEEDBACK_TO?.trim();
  if (explicit) return explicit;
  const fromAddr = extractEmailAddress(emailEnv.from);
  return fromAddr;
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const parsed = FeedbackBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "invalid_body", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { message } = parsed.data;
  const email = parsed.data.email && parsed.data.email.length > 0 ? parsed.data.email : null;
  const context = parsed.data.context && parsed.data.context.length > 0 ? parsed.data.context : null;
  const receivedAt = new Date().toISOString();

  // Best-effort: persist to events table.
  if (supabaseEnv.isConfigured) {
    try {
      const admin = getSupabaseAdmin();
      const { error } = await admin.from("events").insert({
        type: "feedback",
        payload: { message, email, context, ip },
      });
      if (error) {
        console.error(`[feedback] supabase insert failed: ${error.message}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown_error";
      console.error(`[feedback] supabase threw: ${msg}`);
    }
  }

  // Best-effort: send internal email.
  if (emailEnv.isConfigured) {
    const to = resolveFeedbackTo();
    if (to) {
      try {
        await sendEmail({
          to,
          subject: "Pianitos feedback",
          react: Feedback({ message, email, context, receivedAt }),
          replyTo: email ?? undefined,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown_error";
        console.error(`[feedback] email threw: ${msg}`);
      }
    } else {
      console.warn("[feedback] no destination address resolved (FEEDBACK_TO empty and RESEND_FROM has no address)");
    }
  }

  // Always log a structured line for Vercel logs.
  console.log(
    `[feedback] ${JSON.stringify({
      receivedAt,
      ip,
      context,
      hasEmail: email !== null,
      messageLength: message.length,
    })}`
  );

  return NextResponse.json({ ok: true });
}
