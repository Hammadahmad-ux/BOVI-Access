/**
 * BOVI ACCESS — canonical site configuration.
 *
 * This is the single source of truth for business-critical data that appears
 * in more than one place (contact details, navigation, the service index).
 * Nothing in this file may be duplicated as a literal inside a component.
 *
 * Route-typed hrefs: `Route` comes from Next's typedRoutes. It resolves
 * against the real route table, so a nav entry pointing at a page that
 * does not exist is a COMPILE error, not a broken link found in QA. It
 * also admits protocol URLs (tel:, mailto:, https:), which is why the
 * contact hrefs below type cleanly.
 *
 * FACT DISCIPLINE: every value here is either (a) supplied directly by the
 * client, or (b) structural. No statistic, accreditation, award, client name
 * or coverage claim may be added here without written confirmation from
 * Renan. See CONTENT-RULES.md.
 */

import type { Route } from "next";

export type NavItem = {
  label: string;
  href: Route;
};

export type ServiceSummary = {
  /** Stable identifier used for ordering and CMS cross-reference. */
  slug: string;
  /** Display name. */
  name: string;
  /** Two-digit index rendered as the editorial numeral (01, 02, ...). */
  index: string;
  /** Whether this appears in the six-item primary Homepage service index. */
  primary: boolean;
  /**
   * Legacy Wix URL this service replaces, if one exists. Drives the redirect
   * map in next.config.ts. `null` means no legacy equivalent is known.
   */
  legacyUrl: string | null;
};

/* ------------------------------------------------------------------ */
/* Business identity                                                   */
/* ------------------------------------------------------------------ */

export const business = {
  name: "BOVI Access",
  legalName: "BOVI Access",
  slogan: "Access without Limits",
  /** Short descriptor used in metadata and structured data. */
  descriptor: "Commercial Rope Access & External Maintenance",
  /** Displayed phone number, in the client's preferred UK format. */
  phoneDisplay: "07990 377780",
  /** E.164 form — the ONLY value permitted in a tel: href. */
  phoneHref: "tel:+447990377780",
  /**
   * WhatsApp deep link for the floating contact button.
   *
   * `wa.me` takes the number in international form with NO plus sign, no
   * spaces and no leading zero — the digits of `phoneHref` above. Keep
   * the two in step: e2e/whatsapp.spec.ts asserts the rendered href
   * matches this exactly, so a number changed in one place and not the
   * other fails the suite rather than silently sending enquiries nowhere.
   */
  whatsappHref: "https://wa.me/447990377780",
  emailDisplay: "info@boviaccess.co.uk",
  emailHref: "mailto:info@boviaccess.co.uk",
  /** Coverage as approved by the client. Do not narrow to named boroughs. */
  coverage: "London & the South East",
} as const;

/* ------------------------------------------------------------------ */
/* Deployment                                                          */
/* ------------------------------------------------------------------ */

/**
 * Canonical origin, used for canonical tags, Open Graph and sitemap URLs.
 * Overridden per-environment; the production default is the client's domain.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.boviaccess.co.uk";

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

/**
 * Primary navigation. Every entry MUST resolve to a real route — dead or
 * placeholder nav items are a hard QA failure (QA-CHECKLIST.md #15).
 */
export const primaryNav: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/portfolio" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNav: readonly NavItem[] = [
  ...primaryNav,
  { label: "Privacy Policy", href: "/privacy" },
] as const;

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

/**
 * The service index. Order is meaningful — it drives the numbered editorial
 * rows on the Homepage and the /services overview.
 *
 * Legacy URLs are the two confirmed live Wix paths. Others are `null` until
 * the full legacy URL audit is completed (see ROUTES.md).
 */
export const services = [
  {
    slug: "commercial-window-cleaning",
    name: "Commercial Window Cleaning",
    index: "01",
    primary: true,
    legacyUrl: "/CommercialWindowCleaning-FacadeCleaning/",
  },
  {
    slug: "brickwork-repointing",
    name: "Brickwork & Repointing",
    index: "02",
    primary: true,
    legacyUrl: null,
  },
  {
    slug: "gutter-cleaning",
    name: "Gutter Cleaning",
    index: "03",
    primary: true,
    legacyUrl: null,
  },
  {
    slug: "drainage-external-pipe-repairs",
    name: "Drainage & External Pipe Repairs",
    index: "04",
    primary: true,
    legacyUrl: null,
  },
  {
    slug: "mastic-sealant",
    name: "Mastic & Sealant",
    index: "05",
    primary: true,
    legacyUrl: null,
  },
  {
    slug: "pressure-washing-doff-cleaning",
    name: "Pressure Washing / DOFF Cleaning",
    index: "06",
    primary: true,
    legacyUrl: "/PressureWashingandDOFFcleaning/",
  },
  {
    slug: "roof-roofline-repairs",
    name: "Roof & Roofline Repairs",
    index: "07",
    primary: false,
    legacyUrl: null,
  },
  {
    slug: "lightning-protection",
    name: "Lightning Protection",
    index: "08",
    primary: false,
    legacyUrl: null,
  },
] as const satisfies readonly ServiceSummary[];

/**
 * Literal union of every service slug.
 *
 * `satisfies` above keeps the slugs as literals instead of widening them
 * to `string`. That matters because typedRoutes resolves
 * `/services/${slug}` against the real route table — with a widened
 * `string` the template literal stops being a valid Route and every
 * service link becomes a type error.
 */
export type ServiceSlug = (typeof services)[number]["slug"];

export const primaryServices = services.filter((s) => s.primary);

export function getService(slug: string): ServiceSummary | undefined {
  return services.find((s) => s.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Audiences                                                           */
/* ------------------------------------------------------------------ */

export const audiences = [
  "Property Managers",
  "Facilities Managers",
  "Commercial Property Owners",
  "Contractors",
] as const;

/* ------------------------------------------------------------------ */
/* Trust claims — VERIFICATION REQUIRED BEFORE LAUNCH                   */
/* ------------------------------------------------------------------ */

/**
 * These three claims appear in prior BOVI material but have NOT been
 * re-confirmed by Renan for this build.
 *
 * `verified: false` is a build-time signal, not a runtime one — the claims
 * still render, because they are the client's own existing copy. The flag
 * exists so this file is the one place a pre-launch check has to look.
 *
 * DO NOT strengthen this wording, and DO NOT add entries. Adding an
 * accreditation, insurance figure or year count that the client has not
 * stated in writing is a content-rules violation.
 */
export const trustClaims = [
  { label: "IRATA LEVEL 3", verified: false },
  { label: "FULLY INSURED", verified: false },
  { label: "18+ YEARS AT HEIGHT", verified: false },
] as const;

export const unverifiedTrustClaims = trustClaims.filter((c) => !c.verified);
