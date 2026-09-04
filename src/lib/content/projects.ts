import type { ImageAsset } from "@/lib/content/types";
import type { ServiceSlug } from "@/lib/config/site";

/**
 * BOVI ACCESS — project records.
 *
 * ---------------------------------------------------------------------
 * TEMPORARY CONTENT SOURCE — Phase 4 replaces this with Sanity.
 *
 * The shape mirrors the `project` document in sanity/schemaTypes/index.ts.
 * Note which fields are OPTIONAL there and empty here:
 *
 *   title, slug, location, summary, scope, completionDate
 *
 * None of those has been verified for any BOVI job. No project name, no
 * client, no address, no date, no value. Inventing any of them is a
 * content-rules violation (CONTENT-RULES.md §1), so this module carries
 * only what the photographs themselves prove: the service category, taken
 * from the source folder recorded in client-assets/ASSET-INVENTORY.md.
 *
 * Consequences, deliberately:
 *   - Project cards are category-led and link to the SERVICE page, which
 *     is the honest destination.
 *   - /projects/[slug] exists as architecture but generates no pages,
 *     because there is no verified project to give a URL to.
 *   - The portfolio shows no filters, because filters imply a catalogue.
 * ---------------------------------------------------------------------
 */

export type ProjectRecord = {
  id: string;
  /** Verified from the photograph's provenance. Always present. */
  serviceCategory: string;
  serviceSlug: ServiceSlug;
  image: ImageAsset;
  /** Drives the uneven editorial grid. Not metadata. */
  span: "wide" | "tall";

  /* --- Unverified. Present for the Sanity shape; never populated here. --- */
  title?: string;
  slug?: string;
  location?: string;
  summary?: string;
  scope?: readonly string[];
  completionDate?: string;
};

export const projects: readonly ProjectRecord[] = [
  {
    id: "project-01",
    serviceCategory: "Commercial Window Cleaning",
    serviceSlug: "commercial-window-cleaning",
    span: "wide",
    image: {
      src: "/images/home/project-01.jpg",
      alt: "Rope lines rigged down a brick and glass elevation",
      width: 1600,
      height: 1200,
    },
  },
  {
    id: "project-02",
    serviceCategory: "Brickwork & Repointing",
    serviceSlug: "brickwork-repointing",
    span: "tall",
    image: {
      src: "/images/home/project-02.jpg",
      alt: "Rope rigging hardware anchored beside a brick parapet and slate roof",
      width: 1000,
      height: 1333,
    },
  },
  {
    id: "project-03",
    serviceCategory: "Lightning Protection",
    serviceSlug: "lightning-protection",
    span: "tall",
    image: {
      src: "/images/home/project-03.jpg",
      alt: "A BOVI Access technician on rope above a street, with a red London bus passing below",
      width: 1200,
      height: 1600,
    },
  },
  {
    id: "project-04",
    serviceCategory: "Commercial Window Cleaning",
    serviceSlug: "commercial-window-cleaning",
    span: "tall",
    image: {
      src: "/images/home/project-04.jpg",
      alt: "Rope lines running the full height of a modern brick apartment elevation",
      width: 1200,
      height: 1600,
    },
  },
  {
    id: "project-05",
    serviceCategory: "Drainage & External Pipe Repairs",
    serviceSlug: "drainage-external-pipe-repairs",
    span: "tall",
    image: {
      src: "/images/home/project-05.jpg",
      alt: "External soil stacks and rope lines rising through a narrow brick lightwell",
      width: 1170,
      height: 1561,
    },
  },
  {
    id: "project-06",
    serviceCategory: "Lightning Protection",
    serviceSlug: "lightning-protection",
    span: "tall",
    image: {
      src: "/images/home/project-06.jpg",
      alt: "A conductor tape run fixed vertically up a red brick elevation against cloud",
      width: 1200,
      height: 1600,
    },
  },
];

/** The three shown on the Homepage. */
export const homepageProjects = projects.slice(0, 3);

/**
 * No project has a verified name, so none has a URL. /projects/[slug]
 * therefore generates nothing. Phase 4 returns real slugs from Sanity and
 * the detail template starts serving without further change.
 */
export function getProjectBySlug(slug: string): ProjectRecord | undefined {
  return projects.find((p) => p.slug === slug);
}

export const publishedProjects: readonly ProjectRecord[] = projects.filter(
  (p) => Boolean(p.slug),
);
