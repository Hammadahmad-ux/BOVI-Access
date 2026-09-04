import type { Metadata, Viewport } from "next";
import { Archivo, Barlow } from "next/font/google";
import "./globals.css";

import { business, siteUrl } from "@/lib/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd, organizationSchema } from "@/lib/seo/structured-data";

/**
 * Archivo is variable across 100-900, so a single face covers the display
 * scale from the eyebrow through to the 107px H1.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${business.name} | ${business.descriptor}`,
    // Every child route supplies a bare title; the brand suffix is added here.
    template: `%s | ${business.name}`,
  },
  description: `${business.descriptor} for commercial buildings across ${business.coverage}. ${business.slogan}.`,
  applicationName: business.name,
  openGraph: {
    type: "website",
    siteName: business.name,
    locale: "en_GB",
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101211",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={`${archivo.variable} ${barlow.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only-focusable z-100 m-3 bg-ink px-4 py-3 text-bone">
          Skip to main content
        </a>

        <Header />

        <main id="main" className="flex-1">
          {children}
        </main>

        <Footer />

        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
