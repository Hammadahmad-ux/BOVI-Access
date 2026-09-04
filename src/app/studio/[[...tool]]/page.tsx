import type { Metadata } from "next";
import { sanityConfig } from "@/lib/config/env";
import { StudioSetupNotice } from "@/components/studio/StudioSetupNotice";

/**
 * Sanity Studio, mounted at /studio.
 *
 * The route is ALWAYS present so the URL is stable for the client, but
 * the Studio itself only loads when a project ID is configured. Without
 * one, `sanity`'s config would throw at module scope and take the whole
 * route — and the build — down. The dynamic import below is what keeps
 * that failure impossible.
 *
 * NOTE: `npm install sanity` may overwrite this file with its own
 * scaffold, which imports the config eagerly and removes the guard. If
 * the build starts failing without credentials, that is why.
 *
 * /studio is disallowed in robots.ts and excluded from the sitemap.
 */
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  if (!sanityConfig.isConfigured) {
    return <StudioSetupNotice />;
  }

  // Imported lazily and only when configured — see the note above.
  const [{ NextStudio }, { default: config }] = await Promise.all([
    import("next-sanity/studio"),
    import("../../../../sanity.config"),
  ]);

  return <NextStudio config={config} />;
}
