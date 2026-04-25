import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pianitos · Tu primer teclado, ahora con maestro propio",
  description:
    "App divertida para que niñas y niños aprendan a tocar el teclado en casa. Valida con su instrumento real vía MIDI.",
  applicationName: "Pianitos",
  themeColor: "#ffb01f",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-419">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
