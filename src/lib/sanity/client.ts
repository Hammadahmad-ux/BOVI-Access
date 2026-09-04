import "server-only";
import { createClient } from "next-sanity";
import { sanityConfig, sanityReadToken, isProduction } from "@/lib/config/env";

/**
 * Read-only Sanity client.
 *
 * Returns `null` when no project is configured, so callers degrade to
 * local content instead of throwing. That is what keeps the site
 * buildable and runnable with no credentials at all.
 */
const client = sanityConfig.isConfigured
  ? createClient({
      projectId: sanityConfig.projectId,
      dataset: sanityConfig.dataset,
      apiVersion: sanityConfig.apiVersion,
      // Content is fetched in React Server Components and revalidated by
      // tag from the publish webhook, so the CDN would only add staleness.
      useCdn: false,
      perspective: "published",
      token: sanityReadToken(),
    })
  : null;

type FetchOptions = {
  /**
   * Cache tags. The Sanity webhook at /api/revalidate revalidates these
   * by document type, so publishing updates the live site without a
   * redeploy. See DEPLOYMENT.md § Revalidation.
   */
  tags: string[];
  params?: Record<string, unknown>;
};

/**
 * Fetch with graceful failure.
 *
 * A CMS outage or a malformed query must not take the website down: the
 * error is logged server-side and `null` is returned, which every
 * provider treats as "fall back to local content".
 */
export async function sanityFetch<T>(
  query: string,
  { tags, params = {} }: FetchOptions,
): Promise<T | null> {
  if (!client) return null;

  try {
    return await client.fetch<T>(query, params, {
      next: { tags, revalidate: isProduction ? 3600 : 0 },
    });
  } catch (error) {
    // Message only — never the payload, which may contain draft content.
    console.error(
      `[sanity] query failed (${tags.join(",")}):`,
      error instanceof Error ? error.message : "unknown error",
    );
    return null;
  }
}
