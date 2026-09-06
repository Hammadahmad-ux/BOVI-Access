/**
 * BOVI ACCESS — Homepage content.
 *
 * ---------------------------------------------------------------------
 * TEMPORARY CONTENT SOURCE — Phase 4 replaces this with Sanity.
 *
 * This module exists so Homepage sections consume CONTENT through a typed
 * boundary rather than hardcoding copy in JSX. When the `homepage` and
 * `service` documents go live, this file is swapped for a Sanity query
 * returning the same shapes — no section component changes.
 *
 * Business FACTS live in src/lib/config/site.ts, not here. This file holds
 * editorial copy and image assignments only.
 * ---------------------------------------------------------------------
 *
 * CONTENT DISCIPLINE (see CONTENT-RULES.md)
 * Every string below is either a description of what the work IS, or copy
 * supplied in the client brief. Nothing here asserts a statistic, an
 * accreditation, a client, a project name, a location or a date.
 *
 * Every `alt` describes what is actually visible in the photograph. It
 * never asserts that the image shows a specific service, client or place.
 */

import type { ImageAsset } from "@/lib/content/types";

export type { ImageAsset };

export type ServiceContent = {
  slug: string;
  /** One line describing the work itself. Never a capability boast. */
  description: string;
  image: ImageAsset;
  /**
   * True when the image is a general BOVI rope-access photograph rather
   * than one showing this specific service — because no genuine imagery
   * of this service exists yet. Tracked so the gap stays visible.
   * See client-assets/ASSET-INVENTORY.md § Gaps.
   */
  imageIsGeneric?: boolean;
};

/* ------------------------------------------------------------------ */
/* Introduction                                                        */
/* ------------------------------------------------------------------ */

export const introduction = {
  eyebrow: "BOVI Access",
  heading: "Professional access where traditional methods fall short.",
  body: [
    "BOVI Access provides specialist high-level access, repair and maintenance solutions for commercial buildings, using rope-access methods to reach difficult areas efficiently and with minimal disruption.",
    "Facades, rooflines and other elevations are reached without scaffolding or extended road closures — reducing programme time, cost and disruption to tenants and building operations.",
  ],
  image: {
    src: "/images/home/introduction.jpg",
    alt: "A BOVI Access technician working on rope at a glazed elevation, with a city skyline behind",
    width: 1200,
    height: 1600,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const servicesIntro = {
  heading: "Specialist works, delivered at height.",
  body: "Core disciplines covering the maintenance, cleaning and repair of commercial building envelopes.",
} as const;

/** Keyed by the slug in src/lib/config/site.ts. Order comes from there. */
export const serviceContent: readonly ServiceContent[] = [
  {
    slug: "commercial-window-cleaning",
    description:
      "Scheduled and reactive glazing cleans to high-rise and hard-to-reach elevations.",
    image: {
      src: "/images/services/commercial-window-cleaning.jpg",
      alt: "Three BOVI Access technicians descending the glazed facade of a high-rise tower on ropes",
      width: 1400,
      height: 1867,
    },
  },
  {
    slug: "brickwork-repointing",
    description:
      "Localised masonry repair and repointing to elevations, without scaffold.",
    image: {
      src: "/images/services/brickwork-repointing.jpg",
      alt: "Rope lines rigged to a brick chimney stack against a clear sky",
      width: 1400,
      height: 1867,
    },
  },
  {
    slug: "gutter-cleaning",
    description:
      "Clearance and inspection of gutters, hoppers and roofline drainage.",
    image: {
      src: "/images/services/gutter-cleaning.jpg",
      alt: "A roof gutter filled with fallen leaves alongside orange brickwork",
      width: 1400,
      height: 1404,
    },
  },
  {
    slug: "drainage-external-pipe-repairs",
    description:
      "Repair, replacement and clearing of external pipework and soil stacks.",
    image: {
      src: "/images/services/drainage-external-pipe-repairs.jpg",
      alt: "External soil stacks running the full height of a brick lightwell, seen from below",
      width: 1400,
      height: 1869,
    },
  },
  {
    slug: "mastic-sealant",
    description:
      "Renewal of perimeter and movement joints to address water ingress.",
    image: {
      src: "/images/services/mastic-sealant.jpg",
      alt: "A BOVI Access technician on rope applying sealant from a cordless gun into a vertical joint in a brick elevation",
      width: 1400,
      height: 1867,
    },
  },
  {
    slug: "pressure-washing-doff-cleaning",
    description:
      "Controlled low-pressure and steam cleaning for masonry, stone and cladding.",
    image: {
      src: "/images/services/pressure-washing-doff-cleaning.jpg",
      alt: "A BOVI Access technician descending a dark, weathered masonry elevation on rope",
      width: 1400,
      height: 1867,
    },
    imageIsGeneric: true,
  },
];

export function getServiceContent(slug: string): ServiceContent | undefined {
  return serviceContent.find((s) => s.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Featured project                                                    */
/* ------------------------------------------------------------------ */

/**
 * NO project name, client, location, value or date is shown — none has
 * been verified. Only the service category, which is known from the
 * photograph's provenance. See CONTENT-RULES.md §2.
 */
export const featuredProject = {
  serviceCategory: "Commercial Window Cleaning",
  /**
   * The project these photographs actually come from, so the block links
   * to that job rather than to the services page. Same building, same
   * visit as /images/projects/commercial-glazing-clean/*.
   */
  projectSlug: "commercial-glazing-clean",
  heading: "Full-height elevation access, without scaffold.",
  body: "Rope access allows every level of an elevation to be reached from the roof down, so glazing, masonry and roofline works can be completed on an occupied building without a scaffold licence or a road closure.",
  image: {
    src: "/images/home/featured-project.jpg",
    alt: "Rope lines running the full height of a modern apartment building elevation",
    width: 1500,
    height: 2000,
  },
} as const;

/* ------------------------------------------------------------------ */
/* Why BOVI                                                            */
/* ------------------------------------------------------------------ */

/**
 * Method and approach only. "RAMS-Led Delivery" is tracked as a claim
 * pending written confirmation — CONTENT-RULES.md §4.
 */
export const whyBovi = {
  heading: "Qualified, insured and planned properly.",
  body: "A specialist access team, direct accountability, and documentation issued before anyone leaves the ground.",
  rows: [
    {
      index: "01",
      title: "Rope Access Capability",
      body: "Rope access is our primary method, not an add-on to general contracting.",
    },
    {
      index: "02",
      title: "Planned Works",
      body: "Works are programmed in advance and scheduled around building operations.",
    },
    {
      index: "03",
      title: "RAMS-Led Delivery",
      body: "Site-specific risk assessments and method statements issued before works begin.",
    },
    {
      index: "04",
      title: "Minimal Disruption",
      body: "No scaffold and a smaller site footprint, so buildings stay operational throughout.",
    },
    {
      index: "05",
      title: "Commercial Property Focus",
      body: "Built around how property and facilities teams procure and manage works.",
    },
    {
      index: "06",
      title: "High-Level Access",
      body: "Facades, rooflines and elevations that conventional access cannot reach efficiently.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Who we work with                                                    */
/* ------------------------------------------------------------------ */

export const audiences = {
  heading: "Built around how property teams actually procure works.",
  items: [
    {
      key: "A",
      title: "Property Managers",
      body: "Planned maintenance and reactive callouts across managed blocks.",
    },
    {
      key: "B",
      title: "Facilities Managers",
      body: "Access works scheduled around occupancy and building operations.",
    },
    {
      key: "C",
      title: "Commercial Property Owners",
      body: "Envelope condition, repair and long-term asset protection.",
    },
    {
      key: "D",
      title: "Contractors",
      body: "Specialist access support for main and principal contractors.",
    },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

/**
 * The three shown on the Homepage. The full set — and the reason no
 * project carries a name, location or date — lives in
 * src/lib/content/projects.ts.
 */
export { homepageProjects as projects } from "@/lib/content/projects";

/* ------------------------------------------------------------------ */
/* Coverage                                                            */
/* ------------------------------------------------------------------ */

export const coverage = {
  /** Rendered as two hard-broken lines. Never expanded to named areas. */
  lines: ["London &", "The South East"],
  body: "BOVI Access supports commercial property and maintenance projects across London and surrounding areas.",
} as const;
