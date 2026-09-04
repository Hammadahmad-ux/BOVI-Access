import type { ImageAsset } from "@/lib/content/types";
import { services as serviceIndex, type ServiceSummary } from "@/lib/config/site";

/**
 * BOVI ACCESS — service page content.
 *
 * ---------------------------------------------------------------------
 * TEMPORARY CONTENT SOURCE — Phase 4 replaces this with Sanity.
 *
 * The shape below deliberately mirrors the `service` document in
 * sanity/schemaTypes/index.ts field for field, so the swap is a change of
 * provider, not a redesign:
 *
 *   name  slug  legacyUrl  eyebrow  heroTitle  intro  heroMedia
 *   overview  commonWorks[]  delivery  suitableFor[]  faq[]
 *   relatedServices[]  seo
 *
 * Every page under /services/[slug] is rendered by ONE template
 * (src/components/service/*) driven by this data. There are no
 * hand-written service pages.
 * ---------------------------------------------------------------------
 *
 * CONTENT DISCIPLINE (CONTENT-RULES.md)
 * Copy describes WHAT THE WORK IS. It never claims a capability, an
 * accreditation, a guarantee, a timescale, a price, or an outcome. No
 * service asserts regulatory compliance or certification. Where BOVI's
 * role is access rather than the specialist discipline itself, the copy
 * says so plainly.
 *
 * `faq` is intentionally empty everywhere: no verified question-and-answer
 * content has been supplied. The template renders nothing when it is empty
 * rather than inventing filler.
 */

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServicePageContent = {
  slug: string;
  /** Small label above the H1. */
  eyebrow: string;
  /** H1. Usually the service name, occasionally expanded. */
  heroTitle: string;
  /** One or two sentences under the H1. */
  intro: string;
  heroMedia: ImageAsset;
  /**
   * True when heroMedia is a general BOVI rope-access photograph rather
   * than one that demonstrably shows this service. Keeps the gap visible
   * in code — see client-assets/ASSET-INVENTORY.md §7.
   */
  mediaIsGeneric?: boolean;
  /** Body paragraphs for the overview section. */
  overview: readonly string[];
  /** "What we deliver" — concrete, checkable items. */
  commonWorks: readonly string[];
  /** How the work is accessed and delivered. */
  delivery: readonly string[];
  /** Property types this service typically suits. */
  suitableFor: readonly string[];
  /** Rendered only when non-empty. No filler FAQs. */
  faq: readonly ServiceFaq[];
  /** Slugs. 2–3, deliberately varied per service. */
  relatedServices: readonly string[];
  seoDescription: string;
};

const content: readonly ServicePageContent[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "commercial-window-cleaning",
    eyebrow: "Service 01",
    heroTitle: "Commercial Window Cleaning",
    intro:
      "Scheduled and reactive glazing cleans to high-rise and hard-to-reach elevations, delivered by rope access without scaffold or powered access.",
    heroMedia: {
      src: "/images/services/commercial-window-cleaning.jpg",
      alt: "Three BOVI Access technicians descending the glazed facade of a high-rise tower on ropes",
      width: 1400,
      height: 1867,
    },
    overview: [
      "Glazing on tall or awkward elevations is often the hardest part of a building to keep clean. Cradles are not always available, scaffold is disproportionate for a clean, and powered access needs ground space that a city site rarely has.",
      "Rope access reaches the full height of an elevation from anchor points at roof level, so glazing can be cleaned on an occupied building without closing a road or booking a scaffold licence.",
    ],
    commonWorks: [
      "High-level and high-rise window cleaning",
      "Curtain walling and glazed facade cleaning",
      "Atria and internal glazed elevations where access allows",
      "Frames, reveals and cill cleaning alongside the glass",
      "Post-construction and sparkle cleans",
      "Scheduled cleaning programmes and reactive callouts",
    ],
    delivery: [
      "Anchor points and rigging are assessed before any rope goes on the building.",
      "Works are programmed around occupancy so tenants and building operations are not interrupted.",
      "Ground-level exclusion zones are kept as small as the work allows.",
    ],
    suitableFor: [
      "Managed residential and mixed-use blocks",
      "Commercial offices and headquarters buildings",
      "Retail and leisure elevations",
      "Buildings without cradle or BMU provision",
    ],
    faq: [],
    relatedServices: [
      "pressure-washing-doff-cleaning",
      "mastic-sealant",
      "gutter-cleaning",
    ],
    seoDescription:
      "Commercial window cleaning by rope access — high-rise glazing, curtain walling and facade cleaning on occupied buildings, without scaffold.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "brickwork-repointing",
    eyebrow: "Service 02",
    heroTitle: "Brickwork & Repointing",
    intro:
      "Localised masonry repair and repointing to elevations, chimney stacks and parapets, reached by rope access rather than scaffold.",
    heroMedia: {
      src: "/images/services/brickwork-repointing.jpg",
      alt: "Rope lines rigged to a brick chimney stack against a clear sky",
      width: 1400,
      height: 1867,
    },
    overview: [
      "Failed pointing is usually localised — a chimney stack, a parapet, a band of weathered mortar on one elevation. Scaffolding a whole building to reach it is slow and expensive.",
      "Rope access lets the affected area be reached directly, so a defect can be surveyed and repaired in the same visit without the programme and cost of a full scaffold.",
    ],
    commonWorks: [
      "Localised repointing to elevations and parapets",
      "Chimney stack repointing and repair",
      "Replacement of spalled or damaged bricks",
      "Mortar joint raking out and making good",
      "Close-up inspection of masonry defects",
      "Making good around penetrations and fixings",
    ],
    delivery: [
      "The elevation is inspected at close range first, so the extent of the work is known before it is priced.",
      "Materials are matched to the existing mortar and brick as closely as the building allows.",
      "Debris is controlled at height rather than managed from the ground.",
    ],
    suitableFor: [
      "Period and traditional masonry buildings",
      "Managed blocks with parapet or chimney defects",
      "Buildings where scaffold is impractical or disproportionate",
    ],
    faq: [],
    relatedServices: [
      "mastic-sealant",
      "pressure-washing-doff-cleaning",
      "roof-roofline-repairs",
    ],
    seoDescription:
      "Localised brickwork repair and repointing at height by rope access — elevations, parapets and chimney stacks, without full scaffold.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "gutter-cleaning",
    eyebrow: "Service 03",
    heroTitle: "Gutter Cleaning",
    intro:
      "Clearance and visual inspection of gutters, hoppers and roofline drainage on buildings where the roofline is difficult to reach safely.",
    heroMedia: {
      src: "/images/services/gutter-cleaning.jpg",
      alt: "A roof gutter filled with fallen leaves alongside orange brickwork",
      width: 1400,
      height: 1404,
    },
    overview: [
      "A blocked gutter is a small problem that becomes an expensive one. Water backs up over the fascia, tracks down the elevation, and shows up inside as staining long after the cause started.",
      "Clearing at roof level is straightforward when the roofline can be reached safely. Rope access reaches gutter runs on tall or awkward buildings without towers or a cherry picker.",
    ],
    commonWorks: [
      "Clearance of gutters, valleys and hoppers",
      "Clearing downpipe heads and outlets",
      "Removal of vegetation and debris from roofline drainage",
      "Visual inspection of gutter runs and joints",
      "Reporting of defects found during clearance",
      "Scheduled seasonal clearance",
    ],
    delivery: [
      "Debris is bagged and removed rather than dropped.",
      "Anything found during clearance — a split joint, a failed bracket, standing water — is reported with photographs.",
      "Repeat clearance can be programmed seasonally where leaf fall is the cause.",
    ],
    suitableFor: [
      "Managed residential blocks",
      "Commercial and industrial units",
      "Buildings with long or high-level gutter runs",
      "Sites where towers or MEWPs cannot be positioned",
    ],
    faq: [],
    relatedServices: [
      "roof-roofline-repairs",
      "drainage-external-pipe-repairs",
      "commercial-window-cleaning",
    ],
    seoDescription:
      "High-level gutter cleaning and inspection by rope access — clearance of gutters, hoppers and roofline drainage on commercial buildings.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "drainage-external-pipe-repairs",
    eyebrow: "Service 04",
    heroTitle: "Drainage & External Pipe Repairs",
    intro:
      "Repair, replacement and clearing of external pipework and soil stacks on elevations and lightwells that are difficult to reach.",
    heroMedia: {
      src: "/images/services/drainage-external-pipe-repairs.jpg",
      alt: "External soil stacks running the full height of a brick lightwell, seen from below",
      width: 1400,
      height: 1869,
    },
    overview: [
      "External soil stacks and rainwater pipes often run the full height of a building, frequently down a lightwell or a tight rear elevation where there is no room for access equipment.",
      "Rope access reaches the whole run from the roof down, so a leaking joint or a blocked section can be reached at the point it has failed rather than from the nearest available platform.",
    ],
    commonWorks: [
      "Clearing blockages in external soil and rainwater stacks",
      "Replacing failed or damaged sections of pipework",
      "Renewing brackets, clips and fixings",
      "Sealing and making good pipe joints",
      "Replacing downpipe shoes and offsets",
      "Close-up inspection of pipe runs and staining",
    ],
    delivery: [
      "The full run is inspected so the actual failure point is found, not just the visible symptom.",
      "Works are carried out from rope, so lightwells and rear elevations do not need to be opened up for equipment.",
      "Where a defect is beyond the scope of a repair, it is reported rather than patched.",
    ],
    suitableFor: [
      "Managed blocks with external soil stacks",
      "Buildings with enclosed lightwells or rear courts",
      "Commercial premises with high-level rainwater goods",
    ],
    faq: [],
    relatedServices: [
      "gutter-cleaning",
      "mastic-sealant",
      "roof-roofline-repairs",
    ],
    seoDescription:
      "External pipe and drainage repairs at height by rope access — soil stacks, rainwater goods and lightwell pipework on commercial buildings.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "mastic-sealant",
    eyebrow: "Service 05",
    heroTitle: "Mastic & Sealant",
    intro:
      "Renewal of perimeter and movement joints on facades and around openings, to address water ingress at the building envelope.",
    heroMedia: {
      src: "/images/services/mastic-sealant.jpg",
      // Deliberately generic: no genuine photograph of mastic work exists.
      // The alt describes the photograph, not the service.
      alt: "A BOVI Access technician working on rope beside a glazed elevation",
      width: 1400,
      height: 1867,
    },
    mediaIsGeneric: true,
    overview: [
      "Sealant is the part of a facade that fails first and is noticed last. Joints around windows, panel interfaces and movement joints all have a service life shorter than the building around them.",
      "Renewing them is straightforward work made difficult only by height. Rope access reaches a single failing joint on the eighth floor without treating it as a scaffold job.",
    ],
    commonWorks: [
      "Renewal of perimeter joints around windows and doors",
      "Movement joint sealant replacement",
      "Panel and cladding interface joints",
      "Removal of failed or perished sealant",
      "Sealing around penetrations and fixings",
      "Localised repairs following an ingress investigation",
    ],
    delivery: [
      "Existing sealant is cut out rather than sealed over, so the new joint bonds to a sound substrate.",
      "Joints are inspected at close range first — sealant is often blamed for ingress that has another cause.",
      "Works are carried out from rope, so single joints can be reached without scaffolding an elevation.",
    ],
    suitableFor: [
      "Curtain-walled and panelled commercial buildings",
      "Managed blocks with recurring ingress at window perimeters",
      "Buildings with high-level movement joints",
    ],
    faq: [],
    relatedServices: [
      "commercial-window-cleaning",
      "brickwork-repointing",
      "drainage-external-pipe-repairs",
    ],
    seoDescription:
      "Mastic and sealant renewal at height by rope access — perimeter joints, movement joints and facade interfaces on commercial buildings.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "pressure-washing-doff-cleaning",
    eyebrow: "Service 06",
    heroTitle: "Pressure Washing & DOFF Cleaning",
    intro:
      "Controlled low-pressure and steam cleaning for masonry, stone and cladding on elevations that cannot be reached from the ground.",
    heroMedia: {
      src: "/images/services/pressure-washing-doff-cleaning.jpg",
      // Deliberately generic: no genuine photograph of DOFF work exists.
      alt: "A BOVI Access technician descending a dark, weathered masonry elevation on rope",
      width: 1400,
      height: 1867,
    },
    mediaIsGeneric: true,
    overview: [
      "Soiling on a facade is rarely uniform. Staining runs from a failed gutter, biological growth sits on the shaded elevation, and the street frontage picks up traffic film.",
      "Cleaning at height means matching the method to the surface — a low-pressure steam system for softer masonry and stone, higher pressure only where the substrate can take it.",
    ],
    commonWorks: [
      "Low-pressure steam cleaning to masonry and stone",
      "Facade and cladding washing",
      "Removal of biological growth from elevations",
      "Cleaning of soffits, canopies and high-level detail",
      "Removal of staining below failed rainwater goods",
      "Pre-inspection cleaning ahead of repair works",
    ],
    delivery: [
      "The substrate is assessed before a method is chosen — pressure that is safe on concrete is not safe on soft stone.",
      "A test patch is agreed before a full elevation is cleaned.",
      "Water use and run-off are controlled so the ground floor and public realm are not affected.",
    ],
    suitableFor: [
      "Masonry and stone commercial elevations",
      "Clad and panelled buildings",
      "Managed blocks with staining or biological growth at height",
    ],
    faq: [],
    relatedServices: [
      "brickwork-repointing",
      "commercial-window-cleaning",
      "gutter-cleaning",
    ],
    seoDescription:
      "Pressure washing and DOFF steam cleaning at height by rope access — controlled facade, masonry and cladding cleaning on commercial buildings.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "roof-roofline-repairs",
    eyebrow: "Service 07",
    heroTitle: "Roof & Roofline Repairs",
    intro:
      "Inspection and localised repair at roof level and along the roofline, on buildings where getting there safely is the hard part.",
    heroMedia: {
      src: "/images/services/roof-roofline-repairs.jpg",
      alt: "A steep slate roof and spire seen from rope level, with open landscape beyond",
      width: 1400,
      height: 1867,
    },
    overview: [
      "Roofline defects are usually small and specific — a slipped slate, a failed flashing, a length of fascia that has come away. The cost is almost entirely in reaching them.",
      "Rope access reaches the roofline directly, which makes it practical to inspect a suspected defect and repair it in the same visit.",
    ],
    commonWorks: [
      "Close-up inspection of roof coverings and roofline",
      "Replacement of slipped or broken slates and tiles",
      "Localised flashing and verge repairs",
      "Fascia, soffit and bargeboard repairs",
      "Securing loose roofline components",
      "Photographic condition reporting",
    ],
    delivery: [
      "Inspection comes first and is reported with photographs, so a repair is agreed on evidence.",
      "Work is localised — this is repair and maintenance, not roof replacement.",
      "Where a defect is outside the scope of a localised repair, it is reported rather than patched over.",
    ],
    suitableFor: [
      "Managed blocks with steep or awkward roofs",
      "Buildings with high-level roofline detail",
      "Sites where roof access is otherwise difficult",
    ],
    faq: [],
    relatedServices: ["gutter-cleaning", "brickwork-repointing", "lightning-protection"],
    seoDescription:
      "Roof and roofline inspection and localised repair by rope access — slates, flashings, fascias and roofline detail on commercial buildings.",
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "lightning-protection",
    eyebrow: "Service 08",
    heroTitle: "Lightning Protection",
    intro:
      "Rope-access support for lightning protection systems — reaching conductor tape, down conductors and roof-level components on tall elevations.",
    heroMedia: {
      src: "/images/services/lightning-protection.jpg",
      alt: "Lightning protection conductor tape fixed vertically to a brick elevation",
      width: 1400,
      height: 1867,
    },
    overview: [
      "A lightning protection system runs the full height of a building, which makes almost every part of it a working-at-height problem.",
      "BOVI Access provides the access. Conductor tape, down conductors, fixings and roof-level components can all be reached by rope, so the system can be inspected, maintained or reinstated without scaffolding the elevation.",
      "Where testing, certification or design sits with a specialist lightning protection engineer, BOVI works alongside them rather than in place of them.",
    ],
    commonWorks: [
      "Rope access to conductor tape and down conductors",
      "Refixing and replacing failed clips and fixings",
      "Reinstating displaced or damaged conductor runs",
      "Access support for inspection and testing by others",
      "Close-up photographic survey of system components",
      "Access for roof-level component works",
    ],
    delivery: [
      "Access is planned around the route the system takes, not just the elevation.",
      "Where the work involves testing or certification, BOVI's role is access and installation support alongside the responsible specialist.",
      "Findings are reported with photographs so the responsible party can act on them.",
    ],
    suitableFor: [
      "Tall commercial and residential buildings",
      "Buildings with exposed conductor runs",
      "Sites where a specialist needs access to a system at height",
    ],
    faq: [],
    relatedServices: ["roof-roofline-repairs", "brickwork-repointing", "mastic-sealant"],
    seoDescription:
      "Rope-access support for lightning protection systems — reaching conductor tape, down conductors and roof-level components at height.",
  },
];

/** Joined view: the URL/ordering contract from config plus the page copy. */
export type ServicePage = ServiceSummary & ServicePageContent;

export function getServicePage(slug: string): ServicePage | undefined {
  const summary = serviceIndex.find((s) => s.slug === slug);
  const page = content.find((c) => c.slug === slug);
  if (!summary || !page) return undefined;
  return { ...summary, ...page };
}

/** Every service that has both a URL contract and page copy, in order. */
export const servicePages: readonly ServicePage[] = serviceIndex
  .map((s) => getServicePage(s.slug))
  .filter((s): s is ServicePage => Boolean(s));
