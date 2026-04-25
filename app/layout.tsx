import type { Metadata, Viewport } from "next";
import "./globals.css";

import { PwaRegister } from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "Pianitos · Tu primer teclado, ahora con maestro propio",
  description:
    "App divertida para que niñas y niños aprendan a tocar el teclado en casa. Valida con su instrumento real vía MIDI.",
  applicationName: "Pianitos",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffb01f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-419">
      <body className="font-sans antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
