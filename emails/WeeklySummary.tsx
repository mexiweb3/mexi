import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type WeeklySummaryLesson = {
  title: string;
  stars: 0 | 1 | 2 | 3;
};

export type WeeklySummaryBadge = {
  name: string;
  description: string;
};

export type WeeklySummaryProps = {
  parentName?: string;
  childName: string;
  weekStart: string;
  weekEnd: string;
  lessonsCompleted: WeeklySummaryLesson[];
  totalMinutes: number;
  newBadges: WeeklySummaryBadge[];
  appUrl: string;
};

const COLORS = {
  cream: "#fff7e6",
  primary: "#ffb01f",
  ink: "#1f1500",
  muted: "#7a5b1f",
  white: "#ffffff",
} as const;

const styles = {
  body: {
    backgroundColor: COLORS.cream,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: "24px 0",
  } as const,
  container: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    margin: "0 auto",
    maxWidth: "480px",
    padding: "32px 24px",
  } as const,
  greeting: {
    color: COLORS.muted,
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
  },
  heading: {
    color: COLORS.ink,
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: "30px",
    margin: "0 0 12px",
  } as const,
  stats: {
    color: COLORS.ink,
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "22px",
    margin: "0 0 20px",
  } as const,
  paragraph: {
    color: COLORS.ink,
    fontSize: "15px",
    lineHeight: "22px",
    margin: "0 0 16px",
  } as const,
  sectionTitle: {
    color: COLORS.ink,
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    margin: "0 0 12px",
    textTransform: "uppercase" as const,
  },
  card: {
    backgroundColor: COLORS.cream,
    borderRadius: "12px",
    margin: "0 0 16px",
    padding: "16px 20px",
  } as const,
  lessonRow: {
    color: COLORS.ink,
    fontSize: "15px",
    lineHeight: "22px",
    margin: "0 0 6px",
  } as const,
  badgeRow: {
    color: COLORS.ink,
    fontSize: "15px",
    lineHeight: "22px",
    margin: "0 0 6px",
  } as const,
  badgeDesc: {
    color: COLORS.muted,
    fontSize: "13px",
    lineHeight: "18px",
    margin: "0 0 10px",
  } as const,
  buttonWrap: {
    margin: "8px 0 8px",
    textAlign: "center" as const,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: "999px",
    color: COLORS.ink,
    display: "inline-block",
    fontSize: "16px",
    fontWeight: 700,
    padding: "14px 28px",
    textDecoration: "none",
  } as const,
  hr: {
    borderColor: COLORS.cream,
    margin: "24px 0 16px",
  } as const,
  footer: {
    color: COLORS.muted,
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 8px",
  } as const,
};

function starsToText(stars: 0 | 1 | 2 | 3): string {
  if (stars === 0) return "Sin estrellas";
  if (stars === 1) return "1 estrella";
  return `${stars} estrellas`;
}

function formatRange(weekStart: string, weekEnd: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("es", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(d);
  };
  return `${fmt(weekStart)} - ${fmt(weekEnd)}`;
}

export default function WeeklySummary({
  parentName,
  childName,
  weekStart,
  weekEnd,
  lessonsCompleted,
  totalMinutes,
  newBadges,
  appUrl,
}: WeeklySummaryProps) {
  const greeting = parentName ? `Hola ${parentName}` : "Hola";
  const dashboardUrl = `${appUrl}/padres`;
  const range = formatRange(weekStart, weekEnd);
  const hasActivity = lessonsCompleted.length > 0;

  return (
    <Html lang="es">
      <Head />
      <Preview>
        {hasActivity
          ? `${childName} completo ${lessonsCompleted.length} lecciones esta semana.`
          : `Esta semana fue tranquila para ${childName}.`}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.greeting}>{greeting} - Resumen semanal</Text>
          <Heading style={styles.heading}>{childName} esta avanzando.</Heading>

          {hasActivity ? (
            <>
              <Text style={styles.stats}>
                {lessonsCompleted.length}{" "}
                {lessonsCompleted.length === 1 ? "leccion" : "lecciones"} -{" "}
                {totalMinutes} {totalMinutes === 1 ? "minuto" : "minutos"} esta
                semana.
              </Text>

              <Section style={styles.card}>
                <Text style={styles.sectionTitle}>
                  Lecciones completadas ({range})
                </Text>
                {lessonsCompleted.map((lesson, idx) => (
                  <Text key={idx} style={styles.lessonRow}>
                    {lesson.title} - {starsToText(lesson.stars)}
                  </Text>
                ))}
              </Section>

              {newBadges.length > 0 ? (
                <Section style={styles.card}>
                  <Text style={styles.sectionTitle}>
                    Nuevas insignias ({newBadges.length})
                  </Text>
                  {newBadges.map((badge, idx) => (
                    <div key={idx}>
                      <Text style={styles.badgeRow}>{badge.name}</Text>
                      <Text style={styles.badgeDesc}>{badge.description}</Text>
                    </div>
                  ))}
                </Section>
              ) : null}

              <Section style={styles.buttonWrap}>
                <Button href={dashboardUrl} style={styles.button}>
                  Ver progreso completo
                </Button>
              </Section>
            </>
          ) : (
            <>
              <Text style={styles.paragraph}>
                Esta semana fue tranquila. Listos para retomar?
              </Text>
              <Text style={styles.paragraph}>
                Una sesion corta de cinco minutos ya suma. Cuando {childName}
                {" "}vuelva al teclado, lo esperamos.
              </Text>
              <Section style={styles.buttonWrap}>
                <Button href={dashboardUrl} style={styles.button}>
                  Continuar con Pianitos
                </Button>
              </Section>
            </>
          )}

          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Recibes este correo porque tienes una cuenta de Pianitos.
          </Text>
          <Text style={styles.footer}>
            Pianitos &middot;{" "}
            <a href={`${appUrl}/privacidad`} style={{ color: COLORS.muted }}>
              Privacidad
            </a>{" "}
            &middot;{" "}
            <a href={`${appUrl}/terminos`} style={{ color: COLORS.muted }}>
              Terminos
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
