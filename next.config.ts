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
    // AVIF first, WebP second, original as the final fallback.
    formats: ["image/avif", "image/webp"],
    // Sanity's image CDN — enabled ahead of the Phase 4 CMS integration.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
    ],
  },

  typedRoutes: true,
};

export default nextConfig;
