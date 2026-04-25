import { NextResponse, type NextRequest } from "next/server";

import { getAppUrl } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 30;
const MAX_LESSONS = 10;
const MAX_STARS = 30;
const MAX_BADGES = 5;

function clampInt(raw: string | null, max: number): number {
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  if (parsed > max) return max;
  return parsed;
}

function sanitizeName(raw: string | null): string {
  if (!raw) return "";
  return raw.trim().slice(0, MAX_NAME_LENGTH);
}

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const child = sanitizeName(searchParams.get("child"));
  const lessons = clampInt(searchParams.get("lessons"), MAX_LESSONS);
  const stars = clampInt(searchParams.get("stars"), MAX_STARS);
  const badges = clampInt(searchParams.get("badges"), MAX_BADGES);

  const appUrl = getAppUrl();
  const shareUrl = appUrl;

  const params = new URLSearchParams();
  if (child) params.set("child", child);
  params.set("lessons", String(lessons));
  params.set("stars", String(stars));
  params.set("badges", String(badges));

  const imageUrl = `${appUrl}/api/og/progress?${params.toString()}`;

  return NextResponse.json({ shareUrl, imageUrl });
}
