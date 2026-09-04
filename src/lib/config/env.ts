/**
 * Environment access.
 *
 * Server-only secrets are read lazily and never re-exported to the client.
 * Anything prefixed NEXT_PUBLIC_ is public by definition — never put a
 * secret behind that prefix.
 */

/** True only in a real production deployment. */
export const isProduction = process.env.NODE_ENV === "production";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2026-09-04",
  /** Studio and live content are unavailable until a projectId is supplied. */
  get isConfigured() {
    return this.projectId.length > 0;
  },
} as const;

/**
 * Server-only. Throws if read in a client bundle, which is the intent —
 * a build error is preferable to a leaked key.
 */
export function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required server environment variable: ${name}. See .env.example.`,
    );
  }
  return value;
}
