/**
 * Environment access and validation.
 *
 * Two rules shape this file:
 *
 * 1. **The site must build and run with NO credentials at all.** Sanity
 *    and Resend are both optional at build time. Without them the site
 *    serves verified local content and the enquiry form tells the visitor
 *    to call or email — it does not crash, and it does not pretend.
 *
 * 2. **Server secrets never reach the client.** Anything prefixed
 *    NEXT_PUBLIC_ is public by definition; never put a secret behind it.
 *    The server-only getters below throw if the value is missing, so a
 *    misconfigured deployment fails loudly at the point of use rather
 *    than silently sending nothing.
 */

export const isProduction = process.env.NODE_ENV === "production";

/* ------------------------------------------------------------------ */
/* Sanity                                                              */
/* ------------------------------------------------------------------ */

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production",
  apiVersion: "2026-09-04",
  /**
   * The single switch between CMS mode and local-content mode. Every
   * content provider checks this; nothing else should branch on env.
   */
  get isConfigured(): boolean {
    return this.projectId.length > 0;
  },
} as const;

/** Server-only. Enables draft/preview reads. Optional. */
export function sanityReadToken(): string | undefined {
  return process.env.SANITY_API_READ_TOKEN?.trim() || undefined;
}

/* ------------------------------------------------------------------ */
/* Resend / enquiry email                                              */
/* ------------------------------------------------------------------ */

export const emailConfig = {
  get apiKey(): string | undefined {
    return process.env.RESEND_API_KEY?.trim() || undefined;
  },
  get to(): string | undefined {
    return process.env.CONTACT_TO_EMAIL?.trim() || undefined;
  },
  get from(): string | undefined {
    return process.env.CONTACT_FROM_EMAIL?.trim() || undefined;
  },
  /**
   * True only when every value needed to actually deliver an enquiry is
   * present. The API route returns a clear, honest failure when false —
   * it never reports success for an email it could not send.
   */
  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.to && this.from);
  },
} as const;

/* ------------------------------------------------------------------ */
/* Site                                                                */
/* ------------------------------------------------------------------ */

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.boviaccess.co.uk";

/**
 * Reports which optional integrations are live. Used by the deployment
 * documentation check and by /studio's setup screen — so the state of the
 * deployment is discoverable rather than guessed at.
 */
export function integrationStatus() {
  return {
    cms: sanityConfig.isConfigured,
    cmsDrafts: Boolean(sanityReadToken()),
    email: emailConfig.isConfigured,
  } as const;
}
