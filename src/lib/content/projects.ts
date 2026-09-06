import type { ImageAsset } from "@/lib/content/types";
import type { ServiceSlug } from "@/lib/config/site";

/**
 * BOVI ACCESS — project records.
 *
 * ---------------------------------------------------------------------
 * WHAT CHANGED, AND WHY
 *
 * These used to be six loose photographs with a service category and no
 * name, and the cards linked to the SERVICE page. The client's words:
 * "it redirects to the service pages rather than actually showing photos
 * of completed work. I'd prefer it to work more like a simple project
 * gallery/case study section." He also spotted the obvious symptom — two
 * Lightning Protection entries on one page, because the list was six
 * images across four categories rather than six jobs.
 *
 * Each entry below is now ONE JOB, with several photographs from that
 * same job and a short description of what the photographs show.
 *
 * WHAT IS STILL NOT HERE, AND WHY
 *
 * No client name. No address. No location. No date. No contract value.
 * No testimonial. None of it has been verified, and CONTENT-RULES.md §1
 * forbids inventing any of it. `location`, `completionDate` and `scope`
 * remain optional in the type and empty here; the templates render only
 * the fields that actually have values, so adding them later in Sanity
 * needs no code change.
 *
 * The TITLES are therefore service-led and descriptive — "External Pipe
 * Repair", not "Canary Wharf Tower Restoration". They say what the work
 * was, which is the part we can stand behind.
 *
 * GROUPING WAS VERIFIED BY EYE, not by folder name. Every set below was
 * checked as a contact sheet to confirm the frames are the same building.
 * One candidate project was cut in half doing this: the sealant frames in
 * the general folder turned out to be TWO different sites, so only the
 * one with the work plainly visible survived. Provenance per project is
 * in client-assets/ASSET-INVENTORY.md § Project groupings.
 * ---------------------------------------------------------------------
 */

export type ProjectRecord = {
  id: string;
  /**
   * Descriptive, service-led, and true of the photographs. REQUIRED —
   * a project without one cannot be linked to or titled honestly, so the
   * provider drops CMS documents that lack it rather than rendering a
   * card with no name.
   */
  title: string;
  /** REQUIRED. Every project has a real detail page at /projects/<slug>. */
  slug: string;
  /** Verified from the photograph's provenance. */
  serviceCategory: string;
  serviceSlug: ServiceSlug;
  /** Two or three sentences describing what the photographs show. */
  summary: string;
  /** The card and page-hero photograph. */
  image: ImageAsset;
  /** Further photographs FROM THE SAME JOB. May be empty. */
  gallery: readonly ImageAsset[];
  /** Drives the uneven editorial grid. Not metadata. */
  span: "wide" | "tall";
  /** Lead item on the Projects page. Exactly one. */
  featured?: boolean;

  /* --- Unverified for every job below. Populate from Sanity or not at all. --- */
  location?: string;
  scope?: readonly string[];
  completionDate?: string;

  /** Optional SEO overrides. Blank falls back to the project's own copy. */
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: ImageAsset;
};

/**
 * ORDER IS THE PAGE ORDER. Drainage leads: the client has said his first
 * jobs were drainage and pipe repairs, and it is the set with the
 * clearest before/during evidence in the library.
 */
export const projects: readonly ProjectRecord[] = [
  {
    id: "external-pipe-repair",
    title: "External Pipe Repair",
    slug: "external-pipe-repair",
    serviceCategory: "Drainage & External Pipe Repairs",
    serviceSlug: "drainage-external-pipe-repairs",
    featured: true,
    span: "tall",
    summary:
      "Cast iron soil and rainwater stacks running the full height of a narrow lightwell, reached on rope for inspection and repair. Soil pipe repairs at this height can reduce the need for scaffolding where a lightwell leaves little room to erect it.",
    image: {
      src: "/images/projects/external-pipe-repair/main.jpg",
      alt: "A rope access technician working on cast iron soil pipework high in a narrow lightwell",
      width: 1200,
      height: 1600,
    },
    gallery: [
      {
        src: "/images/projects/external-pipe-repair/01.jpg",
        alt: "Soil and rainwater stacks running the full height of a glazed brick lightwell, seen from below",
        width: 900,
        height: 1202,
      },
      {
        src: "/images/projects/external-pipe-repair/02.jpg",
        alt: "Brickwork stained and corroded below a pipe joint",
        width: 900,
        height: 1202,
      },
      {
        src: "/images/projects/external-pipe-repair/03.jpg",
        alt: "A gloved hand holding a section of cast iron pipe at height",
        width: 900,
        height: 1202,
      },
    ],
  },
  {
    id: "gutter-downpipe-clearance",
    title: "Gutter & Downpipe Clearance",
    slug: "gutter-downpipe-clearance",
    serviceCategory: "Gutter Cleaning",
    serviceSlug: "gutter-cleaning",
    span: "tall",
    summary:
      "Gutters, hopper heads and downpipes cleared on a residential block — including an outlet blocked solid with leaf litter, and a downpipe with a plant growing out of it. Roofline drainage can be reached directly from above where the roof allows it.",
    image: {
      src: "/images/projects/gutter-downpipe-clearance/main.jpg",
      alt: "A rope access technician working at the roofline of a brick residential block",
      width: 1170,
      height: 1174,
    },
    gallery: [
      {
        src: "/images/projects/gutter-downpipe-clearance/01.jpg",
        alt: "A hopper head packed with leaf litter and silt beneath a downpipe",
        width: 900,
        height: 1948,
      },
      {
        src: "/images/projects/gutter-downpipe-clearance/02.jpg",
        alt: "The same hopper head cleared, with the outlet open again",
        width: 900,
        height: 1948,
      },
      {
        src: "/images/projects/gutter-downpipe-clearance/03.jpg",
        alt: "A gloved hand holding a plant pulled out of a downpipe, the street below in view",
        width: 900,
        height: 903,
      },
    ],
  },
  {
    id: "brickwork-repointing-works",
    title: "Brickwork Repointing",
    slug: "brickwork-repointing-works",
    serviceCategory: "Brickwork & Repointing",
    serviceSlug: "brickwork-repointing",
    span: "tall",
    summary:
      "Weathered chimney stacks and parapet brickwork with eroded and missing mortar joints, rigged and worked from rope. Isolated high-level masonry often suits rope access, where scaffolding a whole elevation would be disproportionate to the repair.",
    image: {
      src: "/images/projects/brickwork-repointing-works/main.jpg",
      alt: "A tall brick chimney stack rigged with ropes against a clear sky",
      width: 1300,
      height: 1733,
    },
    gallery: [
      {
        src: "/images/projects/brickwork-repointing-works/01.jpg",
        alt: "Close view of a brick parapet with eroded mortar joints and a rope running down the face",
        width: 900,
        height: 1200,
      },
      {
        src: "/images/projects/brickwork-repointing-works/02.jpg",
        alt: "Weathered brickwork with cracked and missing mortar beside a stone coping",
        width: 900,
        height: 1200,
      },
      {
        src: "/images/projects/brickwork-repointing-works/03.jpg",
        alt: "A brick chimney stack and roof slope seen from rope level",
        width: 1100,
        height: 825,
      },
    ],
  },
  {
    id: "lightning-protection-works",
    title: "Lightning Protection Works",
    slug: "lightning-protection-works",
    serviceCategory: "Lightning Protection",
    serviceSlug: "lightning-protection",
    span: "tall",
    // BOVI provides the ACCESS; testing and certification sit with a
    // specialist engineer. The service page says so and this must not
    // quietly claim more than that.
    summary:
      "Conductor tape running the full height of a brick elevation, with saddle fixings set into the mortar joints, reached on rope from roof level down. BOVI provides the access; testing and certification sit with a specialist lightning protection engineer.",
    image: {
      src: "/images/projects/lightning-protection-works/main.jpg",
      alt: "A rope access technician descending a red brick elevation above a street",
      width: 1300,
      height: 1733,
    },
    gallery: [
      {
        src: "/images/projects/lightning-protection-works/01.jpg",
        alt: "A conductor run rising the full height of a brick elevation against the sky",
        width: 900,
        height: 1200,
      },
      {
        src: "/images/projects/lightning-protection-works/02.jpg",
        alt: "Conductor tape fixed vertically to brickwork below a roof edge",
        width: 900,
        height: 1200,
      },
      {
        src: "/images/projects/lightning-protection-works/03.jpg",
        alt: "Close view of a saddle fixing holding conductor tape to a mortar joint",
        width: 900,
        height: 1200,
      },
    ],
  },
  {
    id: "mastic-sealant-renewal",
    title: "Mastic & Sealant Renewal",
    slug: "mastic-sealant-renewal",
    serviceCategory: "Mastic & Sealant",
    serviceSlug: "mastic-sealant",
    span: "tall",
    summary:
      "Vertical movement joints resealed on a brick and panel elevation, with sealant applied from rope and backer rod fitted first. Individual joints can be reached at height rather than treating a whole elevation as a scaffold job.",
    image: {
      src: "/images/projects/mastic-sealant-renewal/main.jpg",
      alt: "A rope access technician applying sealant from a cordless gun into a vertical joint in brickwork",
      width: 1300,
      height: 1733,
    },
    gallery: [
      {
        src: "/images/projects/mastic-sealant-renewal/01.jpg",
        alt: "Two rope access technicians working the joints of a brick and panel elevation, backer rod on the harness",
        width: 900,
        height: 1200,
      },
    ],
  },
  {
    id: "commercial-glazing-clean",
    title: "Commercial Glazing Clean",
    slug: "commercial-glazing-clean",
    serviceCategory: "Commercial Window Cleaning",
    serviceSlug: "commercial-window-cleaning",
    span: "tall",
    summary:
      "Glazing, frames and cills cleaned across the full height of an apartment block elevation, worked from anchor points at roof level. Suits buildings where cradle access is unavailable or ground space for powered access is limited.",
    image: {
      src: "/images/projects/commercial-glazing-clean/main.jpg",
      alt: "A rope access technician cleaning glazing on a brick apartment block, a green bucket clipped to the harness",
      width: 1300,
      height: 1733,
    },
    gallery: [
      {
        src: "/images/projects/commercial-glazing-clean/01.jpg",
        alt: "A technician on rope beside a window on a brick elevation",
        width: 900,
        height: 1200,
      },
      {
        src: "/images/projects/commercial-glazing-clean/02.jpg",
        alt: "A technician descending between windows and metal cladding panels",
        width: 900,
        height: 1200,
      },
      {
        src: "/images/projects/commercial-glazing-clean/03.jpg",
        alt: "Rope lines running the full height of an apartment block elevation, seen from the ground",
        width: 900,
        height: 1200,
      },
    ],
  },
];

/** The three shown on the Homepage. */
export const homepageProjects = projects.slice(0, 3);

export function getProjectBySlug(slug: string): ProjectRecord | undefined {
  return projects.find((p) => p.slug === slug);
}

/**
 * Every project now has a verified title and a slug, so every one has a
 * detail page. This used to be empty by design; it no longer is.
 */
export const publishedProjects: readonly ProjectRecord[] = projects;
