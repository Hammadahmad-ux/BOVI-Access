import type { Metadata, Viewport } from "next";
import { Archivo, Barlow } from "next/font/google";
import "./globals.css";

import { business, siteUrl } from "@/lib/config/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
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
        {/*
          Motion server-renders its entrance states as inline opacity:0, so
          with scripting disabled the page would ship visually blank even
          though the markup is complete. Every animated element carries
          data-reveal; this restores them when JS never runs.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        {/*
          `data-site-chrome` marks the public-site furniture that /studio
          strips. One attribute rather than a list of selectors, so a
          future floating element cannot be forgotten and end up sitting
          over the editor.
        */}
        <a
          data-site-chrome
          href="#main"
          className="sr-only-focusable bg-ink px-4 py-3 text-bone"
        >
          Skip to main content
        </a>

        <Header />

        {/* tabIndex -1 so the skip link actually moves focus here rather
            than leaving it on <body>. */}
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>

        <Footer />

        {/* Mounted here so every public route gets it, including any
            route added later. Secondary to "Request a Quote" by design. */}
        <WhatsAppButton />

        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
