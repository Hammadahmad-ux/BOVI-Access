import { createClient } from "next-sanity";
import { sanityConfig } from "@/lib/config/env";

/**
 * Read-only Sanity client.
 *
 * NOT YET ACTIVE: no Sanity project has been created for BOVI, so
 * `sanityConfig.isConfigured` is false and this module must not be imported
 * by a rendering path yet. It exists so Phase 4 is a wiring job, not a
 * design job.
 *
 * `useCdn: false` because content is fetched in React Server Components and
 * revalidated by tag — the CDN would only add staleness.
 */
export const sanityClient = createClient({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  apiVersion: sanityConfig.apiVersion,
  useCdn: false,
  perspective: "published",
});
