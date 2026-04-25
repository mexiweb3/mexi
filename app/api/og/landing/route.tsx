import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };
const CACHE = "public, max-age=600, s-maxage=600, stale-while-revalidate=86400";

export async function GET(): Promise<Response> {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px 96px",
          backgroundColor: "#fff7e6",
          color: "#1f1500",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 360,
            height: 18,
            backgroundColor: "#ffb01f",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 6,
            color: "#995800",
            textTransform: "uppercase",
          }}
        >
          PIANITOS
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontSize: 88,
            fontWeight: 900,
            lineHeight: 1.05,
            maxWidth: 980,
          }}
        >
          Tu primer teclado, ahora con maestro propio.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 32,
            fontWeight: 600,
            color: "#7a5b1f",
            maxWidth: 980,
          }}
        >
          Lecciones cortas para ninas y ninos. Valida con su teclado real.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 80,
            display: "flex",
            fontSize: 26,
            fontWeight: 800,
            color: "#995800",
          }}
        >
          pianitos.app
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: { "Cache-Control": CACHE },
    },
  );
}
