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

export type UpgradeNudgeProps = {
  parentName?: string;
  childName: string;
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
  heading: {
    color: COLORS.ink,
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: "30px",
    margin: "0 0 16px",
  } as const,
  paragraph: {
    color: COLORS.ink,
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 16px",
  } as const,
  benefitsSection: {
    backgroundColor: COLORS.cream,
    borderRadius: "12px",
    margin: "16px 0 24px",
    padding: "16px 20px",
  } as const,
  benefitsTitle: {
    color: COLORS.ink,
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    margin: "0 0 12px",
    textTransform: "uppercase" as const,
  },
  benefit: {
    color: COLORS.ink,
    fontSize: "15px",
    lineHeight: "22px",
    margin: "0 0 8px",
  } as const,
  buttonWrap: {
    margin: "8px 0 24px",
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
  smallNote: {
    color: COLORS.muted,
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 8px",
    textAlign: "center" as const,
  },
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

export default function UpgradeNudge({
  parentName,
  childName,
  appUrl,
}: UpgradeNudgeProps) {
  const greeting = parentName ? `Hola ${parentName}` : "Hola";
  const pricingUrl = `${appUrl}/precios`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{childName} esta listo para mas lecciones de Pianitos.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>
            {childName} esta listo para mas.
          </Heading>
          <Text style={styles.paragraph}>
            {greeting}, {childName} ya esta dominando el primer modulo. El
            siguiente paso es el modulo 2, donde aparecen el ritmo, las dos
            manos juntas y la primera cancion completa. Esa parte se desbloquea
            con Premium.
          </Text>

          <Section style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Que incluye Premium</Text>
            <Text style={styles.benefit}>
              1. Modulo 2 completo: ritmo, manos juntas y mas canciones.
            </Text>
            <Text style={styles.benefit}>
              2. Nuevas insignias y retos para mantener la motivacion.
            </Text>
            <Text style={styles.benefit}>
              3. Reportes detallados de progreso para padres.
            </Text>
            <Text style={styles.benefit}>
              4. Acceso anticipado a las proximas lecciones que vayamos
              publicando.
            </Text>
          </Section>

          <Section style={styles.buttonWrap}>
            <Button href={pricingUrl} style={styles.button}>
              Ver Premium
            </Button>
          </Section>

          <Text style={styles.smallNote}>
            Sin compromiso. Puedes cancelar cuando quieras.
          </Text>

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
