import type { Metadata, Viewport } from "next";
import "./globals.css";

import { AudioMidiBridges } from "@/components/analytics/AudioMidiBridges";
import { PlausibleScript } from "@/components/analytics/PlausibleScript";
import { PwaRegister } from "@/components/PwaRegister";
import { FeedbackWidget } from "@/components/feedback/FeedbackWidget";
import { getAppUrl } from "@/lib/url";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Pianitos · Tu primer teclado, ahora con maestro propio",
    template: "%s · Pianitos",
  },
  description:
    "App divertida para que niñas y niños aprendan a tocar el teclado en casa. Valida con su instrumento real vía MIDI.",
  applicationName: "Pianitos",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-512.svg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pianitos",
  },
  openGraph: {
    type: "website",
    locale: "es_419",
    url: appUrl,
    siteName: "Pianitos",
    title: "Pianitos · Tu primer teclado, ahora con maestro propio",
    description:
      "Lecciones cortas para niñas y niños. Valida con su teclado real vía MIDI USB.",
    images: [
      {
        url: "/api/og/landing",
        width: 1200,
        height: 630,
        alt: "Pianitos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pianitos · Tu primer teclado, ahora con maestro propio",
    description:
      "Lecciones cortas para niñas y niños. Valida con su teclado real vía MIDI USB.",
    images: ["/api/og/landing"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
        <AudioMidiBridges />
        <FeedbackWidget />
        <PlausibleScript />
      </body>
    </html>
  );
}
