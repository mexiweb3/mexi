import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export type FeedbackProps = {
  message: string;
  email?: string | null;
  context?: string | null;
  receivedAt: string;
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
    padding: "28px 24px",
  } as const,
  heading: {
    color: COLORS.ink,
    fontSize: "20px",
    fontWeight: 700,
    lineHeight: "26px",
    margin: "0 0 12px",
  } as const,
  metaSection: {
    backgroundColor: COLORS.cream,
    borderRadius: "12px",
    margin: "0 0 16px",
    padding: "12px 16px",
  } as const,
  metaLabel: {
    color: COLORS.muted,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    margin: "0 0 4px",
    textTransform: "uppercase" as const,
  },
  metaValue: {
    color: COLORS.ink,
    fontSize: "14px",
    lineHeight: "20px",
    margin: "0 0 8px",
    wordBreak: "break-word" as const,
  },
  messageBox: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.cream}`,
    borderRadius: "12px",
    margin: "0 0 16px",
    padding: "16px",
  } as const,
  messageText: {
    color: COLORS.ink,
    fontSize: "15px",
    lineHeight: "22px",
    margin: 0,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
  hr: {
    borderColor: COLORS.cream,
    margin: "20px 0 12px",
  } as const,
  footer: {
    color: COLORS.muted,
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
  } as const,
};

export default function Feedback({
  message,
  email,
  context,
  receivedAt,
}: FeedbackProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Nuevo feedback de Pianitos</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Nuevo feedback de Pianitos</Heading>

          <Section style={styles.metaSection}>
            <Text style={styles.metaLabel}>Recibido</Text>
            <Text style={styles.metaValue}>{receivedAt}</Text>

            <Text style={styles.metaLabel}>Email de respuesta</Text>
            <Text style={styles.metaValue}>{email ?? "(sin email)"}</Text>

            <Text style={styles.metaLabel}>Ruta</Text>
            <Text style={styles.metaValue}>{context ?? "(sin ruta)"}</Text>
          </Section>

          <Section style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </Section>

          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            Mensaje interno enviado desde el widget de feedback de la beta cerrada.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
