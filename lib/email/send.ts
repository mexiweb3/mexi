import "server-only";

import type { ReactElement } from "react";
import { render } from "@react-email/render";

import { getResend } from "@/lib/email/client";
import { emailEnv } from "@/lib/email/env";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  replyTo?: string;
};

export type SendEmailResult = {
  ok: boolean;
  error?: string;
};

/**
 * Generic email send. Renders the React Email JSX to HTML + plain text and
 * dispatches via Resend. When Resend is not configured, logs the would-be
 * subject to the console and resolves with `{ ok: true }` so demo flows keep
 * working without surfacing a failure to the user. Never throws.
 */
export async function sendEmail({
  to,
  subject,
  react,
  replyTo,
}: SendEmailInput): Promise<SendEmailResult> {
  const resend = getResend();

  if (!resend) {
    console.log(`[email] would send: ${subject}`);
    return { ok: true };
  }

  try {
    const html = await render(react);
    const text = await render(react, { plainText: true });

    const { error } = await resend.emails.send({
      from: emailEnv.from,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : "unknown_error";
      console.error(`[email] send failed: ${subject} — ${message}`);
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    console.error(`[email] send threw: ${subject} — ${message}`);
    return { ok: false, error: message };
  }
}
