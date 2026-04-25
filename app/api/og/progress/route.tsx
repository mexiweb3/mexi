import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const CACHE_HEADER =
  "public, max-age=300, s-maxage=300, stale-while-revalidate=86400";

const SIZE = { width: 1200, height: 630 } as const;

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

function sanitizeName(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, MAX_NAME_LENGTH);
}

export function GET(request: NextRequest): ImageResponse {
  const { searchParams } = new URL(request.url);

  const childName = sanitizeName(searchParams.get("child"));
  const lessons = clampInt(searchParams.get("lessons"), MAX_LESSONS);
  const stars = clampInt(searchParams.get("stars"), MAX_STARS);
  const badges = clampInt(searchParams.get("badges"), MAX_BADGES);

  const headline = childName
    ? `${childName} esta tocando piano.`
    : "Tu primer teclado.";
  const subline = childName ? null : "Pianitos · App de teclado para ninos.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#fff7e6",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#331e00",
        }}
      >
        {/* Brand stripe top-left */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 520,
            height: 520,
            backgroundColor: "#ffb01f",
            borderRadius: 9999,
            opacity: 0.9,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -60,
            left: 320,
            width: 220,
            height: 220,
            backgroundColor: "#ffd87a",
            borderRadius: 9999,
            opacity: 0.6,
            display: "flex",
          }}
        />

        {/* Centered card */}
        <div
          style={{
            position: "relative",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            width: 1040,
            padding: "64px 72px",
            backgroundColor: "#ffffff",
            borderRadius: 48,
            border: "8px solid #ffd87a",
            boxShadow: "0 20px 0 0 #ffe9b8",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 8,
              color: "#995800",
              textTransform: "uppercase",
            }}
          >
            Pianitos
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              marginTop: 18,
              fontSize: childName ? 84 : 96,
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#331e00",
            }}
          >
            {childName ? (
              <>
                <span style={{ color: "#cc7600" }}>{childName}</span>
                <span style={{ marginLeft: 18 }}>esta tocando piano.</span>
              </>
            ) : (
              <span>{headline}</span>
            )}
          </div>

          {subline ? (
            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 32,
                fontWeight: 600,
                color: "#663b00",
              }}
            >
              {subline}
            </div>
          ) : null}

          {/* Stat chips */}
          <div
            style={{
              display: "flex",
              marginTop: 48,
              gap: 20,
            }}
          >
            <Chip label={`${lessons} lecciones`} />
            <Chip label={`${stars} estrellas`} />
            <Chip label={`${badges} medallas`} />
          </div>

          {/* Footer mark bottom-right */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 56,
              fontSize: 24,
              fontWeight: 700,
              color: "#995800",
              letterSpacing: 2,
            }}
          >
            pianitos.app
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        "Cache-Control": CACHE_HEADER,
      },
    }
  );
}

function Chip({ label }: { label: string }): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff7e6",
        border: "4px solid #ffd87a",
        color: "#995800",
        fontSize: 36,
        fontWeight: 800,
        padding: "18px 32px",
        borderRadius: 9999,
      }}
    >
      {label}
    </div>
  );
}
