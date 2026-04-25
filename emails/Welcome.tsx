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

export type WelcomeProps = {
  parentName?: string;
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
    fontSize: "26px",
    fontWeight: 700,
    lineHeight: "32px",
    margin: "0 0 16px",
  } as const,
  paragraph: {
    color: COLORS.ink,
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 16px",
  } as const,
  stepsSection: {
    backgroundColor: COLORS.cream,
    borderRadius: "12px",
    margin: "16px 0 24px",
    padding: "16px 20px",
  } as const,
  stepsTitle: {
    color: COLORS.ink,
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    margin: "0 0 12px",
    textTransform: "uppercase" as const,
  },
  step: {
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

export default function Welcome({ parentName, appUrl }: WelcomeProps) {
  const greeting = parentName ? `Hola ${parentName}` : "Hola";
  const continueUrl = `${appUrl}/onboarding/1`;

  return (
    <Html lang="es">
      <Head />
      <Preview>Bienvenido a Pianitos: empecemos en 3 pasos.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{greeting}, bienvenido a Pianitos</Heading>
          <Text style={styles.paragraph}>
            Que gusto tenerte aqui. Pianitos acompana a los ninos en sus primeras
            lecciones de piano, con un ritmo amable y mucha musica.
          </Text>

          <Section style={styles.stepsSection}>
            <Text style={styles.stepsTitle}>Para empezar</Text>
            <Text style={styles.step}>1. Crear el perfil del nino.</Text>
            <Text style={styles.step}>2. Conectar el teclado por USB.</Text>
            <Text style={styles.step}>3. Empezar la primera leccion.</Text>
          </Section>

          <Section style={styles.buttonWrap}>
            <Button href={continueUrl} style={styles.button}>
              Continuar
            </Button>
          </Section>

          <Text style={styles.paragraph}>
            Si necesitas ayuda en cualquier momento, responde este correo y te
            atendemos.
          </Text>

          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Si no creaste esta cuenta, ignora este correo.
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
