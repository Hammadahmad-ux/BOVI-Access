import type { NextConfig } from "next";
import { services } from "./src/lib/config/site";

/**
 * Legacy Wix URL preservation.
 *
 * Redirects are generated from the single `legacyUrl` field on each service
 * in src/lib/config/site.ts, so a legacy path can never drift out of sync
 * with the route it points at.
 *
 * Rules:
 *   - 308 permanent, to pass link equity.
 *   - Every legacy path is registered both with and without its trailing
 *     slash, because the Wix URLs were published with one.
 *   - Redirects point DIRECTLY at the final destination. No chains.
 *
 * See ROUTES.md for the full audit and the outstanding legacy URL work.
 */
function legacyRedirects() {
  return services
    .filter((service) => service.legacyUrl)
    .flatMap((service) => {
      const destination = `/services/${service.slug}`;
      const withSlash = service.legacyUrl as string;
      const withoutSlash = withSlash.replace(/\/$/, "");

      return [
        { source: withSlash, destination, permanent: true },
        { source: withoutSlash, destination, permanent: true },
      ];
    });
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...legacyRedirects(),
      // /projects is the human-guessable form of the projects index; the
      // canonical route is /portfolio.
      { source: "/projects", destination: "/portfolio", permanent: true },
    ];
  },

  images: {
    /**
     * TEST BUILDS ONLY. The Playwright suite runs the site under `next
     * start`, whose image optimizer is a single process. Sweeping every
     * route across seven viewports in parallel already strained it; once
     * the project and homepage photography moved to the Sanity CDN, the
     * cold upstream fetches wedged the optimizer and took the whole server
     * down — every later `page.goto` then timed out waiting for `load`.
     *
     * Production runs on Vercel's edge optimizer and is unaffected. With
     * `E2E_NO_IMAGE_OPT=1` (set by playwright.config.ts's webServer)
     * `next/image` serves sources untouched for the test build, so the
     * browser fetches them straight from Sanity's CDN — which already
     * does format negotiation and width capping (see src/lib/sanity/
     * image.ts). Image DELIVERY is still asserted directly by
     * homepage.spec.ts and projects.spec.ts.
     */
    unoptimized: process.env.E2E_NO_IMAGE_OPT === "1",
    // AVIF first, WebP second, original as the final fallback.
    formats: ["image/avif", "image/webp"],
    // Next 16 only honours quality values declared here; anything else
    // silently falls back to the default. 72 is what the sections request.
    qualities: [72, 75],
    // Sanity's image CDN — enabled ahead of the Phase 4 CMS integration.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
    ],
  },

  typedRoutes: true,
};

export default nextConfig;
