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
 * FULL-SCREEN: the Studio is wrapped in a fixed, top-layer container so
 * it covers the site header and footer, which the shared root layout
 * renders around every route.
 *
 * The obvious alternative — moving the site chrome into an `(site)` route
 * group so /studio gets a bare layout — was tried and REVERTED: with the
 * root route inside a group, Next 16 stops resolving the custom
 * not-found for unmatched URLs and silently serves its built-in 404. A
 * working custom 404 is a hard QA requirement (QA-CHECKLIST.md #8), and
 * losing it to tidy up an internal, authenticated tool is a bad trade.
 * Verified by testing not-found at both the root and inside the group.
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

  return (
    <div className="fixed inset-0 z-100 bg-pure">
      <NextStudio config={config} />
    </div>
  );
}
