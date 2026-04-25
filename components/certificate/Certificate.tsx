import type { ModuleNumber } from "@/lib/certificates/eligibility";

export type CertificateProps = {
  childName: string;
  moduleNumber: ModuleNumber;
  moduleTitle: string;
  totalStars: number;
  awardedAt: string;
  certificateId: string;
};

function formatDateLatam(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear().toString().padStart(4, "0");
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
}

function StarShape({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M12 2.5l2.96 6.0 6.62.96-4.79 4.67 1.13 6.59L12 17.6l-5.92 3.12 1.13-6.59L2.42 9.46l6.62-.96L12 2.5z"
        fill={filled ? "#f59300" : "#fff7e6"}
        stroke="#995800"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CornerOrnament({ rotate }: { rotate: number }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="64"
      height="64"
      aria-hidden="true"
      role="presentation"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path
        d="M4 4 H40 M4 4 V40 M4 12 H32 M12 4 V32"
        fill="none"
        stroke="#cc7600"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="4" cy="4" r="3" fill="#f59300" />
    </svg>
  );
}

const CERTIFICATE_PRINT_CSS = `
@page { size: A4 landscape; margin: 0; }
@media print {
  html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
  .screen-only { display: none !important; }
  .certificate-frame {
    box-shadow: none !important;
    margin: 0 auto !important;
    page-break-inside: avoid;
  }
}
`;

export function Certificate({
  childName,
  moduleNumber,
  moduleTitle,
  totalStars,
  awardedAt,
  certificateId,
}: CertificateProps) {
  const dateLabel = formatDateLatam(awardedAt);
  const maxStarsDisplayed = 15;
  const starCount = Math.max(0, Math.min(maxStarsDisplayed, totalStars));
  const stars = Array.from({ length: maxStarsDisplayed }).map((_, i) => i < starCount);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CERTIFICATE_PRINT_CSS }} />
      <div
        className="certificate-frame"
        role="region"
        aria-label="Diploma de pianista"
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          background: "#fff7e6",
          color: "#331e00",
          border: "8px double #cc7600",
          borderRadius: "12px",
          boxShadow: "0 12px 40px rgba(51, 30, 0, 0.15)",
          padding: "32px 28px",
          position: "relative",
          fontFamily:
            'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "12px",
            border: "1px solid #f59300",
            borderRadius: "8px",
            pointerEvents: "none",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
          }}
        >
          <CornerOrnament rotate={0} />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
          }}
        >
          <CornerOrnament rotate={90} />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
          }}
        >
          <CornerOrnament rotate={180} />
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
          }}
        >
          <CornerOrnament rotate={270} />
        </div>

        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "24px 16px",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#995800",
              margin: 0,
            }}
          >
            Pianitos
          </p>

          <h1
            style={{
              fontSize: "clamp(1.75rem, 5vw, 3rem)",
              lineHeight: 1.1,
              margin: "12px 0 4px 0",
              color: "#663b00",
              fontWeight: 800,
            }}
          >
            Diploma de pianista
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "#995800",
              margin: "0 0 24px 0",
              fontWeight: 600,
            }}
          >
            Modulo {moduleNumber}: {moduleTitle}
          </p>

          <p
            style={{
              fontSize: "1rem",
              color: "#663b00",
              margin: "0 0 8px 0",
            }}
          >
            Otorgado a
          </p>

          <p
            style={{
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              fontWeight: 800,
              color: "#cc7600",
              margin: "0 0 16px 0",
              wordBreak: "break-word",
            }}
          >
            {childName}
          </p>

          <p
            style={{
              fontSize: "1.05rem",
              color: "#331e00",
              maxWidth: "640px",
              margin: "0 auto 20px auto",
              lineHeight: 1.5,
            }}
          >
            por completar el {moduleTitle} con dedicacion, escuchando bien y
            tocando con carino cada leccion del Modulo {moduleNumber}.
          </p>

          <div
            aria-label={`Total de estrellas obtenidas: ${totalStars}`}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "4px",
              margin: "16px auto",
              maxWidth: "520px",
            }}
          >
            {stars.map((filled, i) => (
              <StarShape key={i} filled={filled} />
            ))}
          </div>

          <p
            style={{
              fontSize: "0.95rem",
              color: "#995800",
              margin: "4px 0 28px 0",
              fontWeight: 600,
            }}
          >
            {totalStars} estrellas en total
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "16px",
              marginTop: "20px",
              borderTop: "1px solid #ffd87a",
              paddingTop: "16px",
              fontSize: "0.85rem",
              color: "#663b00",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Pianitos</p>
              <p style={{ margin: 0 }}>{dateLabel}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Codigo</p>
              <p
                style={{
                  margin: 0,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  letterSpacing: "0.08em",
                }}
              >
                {certificateId}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Certificate;
