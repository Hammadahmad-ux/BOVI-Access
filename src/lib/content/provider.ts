import "server-only";

import { cache } from "react";

import { sanityConfig } from "@/lib/config/env";
import { sanityFetch } from "@/lib/sanity/client";
import { imageAssetFrom, type SanityImage } from "@/lib/sanity/image";
import type { ImageAsset } from "@/lib/content/types";
import type { ServicePage, ServiceFaq } from "@/lib/content/services";
import { servicePages as localServices } from "@/lib/content/services";
import type { ProjectRecord } from "@/lib/content/projects";
import { projects as localProjects } from "@/lib/content/projects";
import * as localHome from "@/lib/content/home";
import { business, services as serviceIndex } from "@/lib/config/site";

/**
 * BOVI ACCESS — content provider.
 *
 * ---------------------------------------------------------------------
 * THE ONLY PLACE THAT KNOWS WHETHER THE CMS IS CONNECTED.
 *
 * Every page calls these functions. Each one returns the SAME TYPE
 * whether the data came from Sanity or from the verified local content
 * modules, so no page or component contains a branch on
 * `sanityConfig.isConfigured`.
 *
 * Local mode is not a stub — it is the content the site ships with today,
 * written against CONTENT-RULES.md. When Renan's Sanity project is
 * configured, the same pages render his content instead, with no code
 * change. See DEPLOYMENT.md § Content mode.
 * ---------------------------------------------------------------------
 *
 * IMPORTANT: the URL contract lives in src/lib/config/site.ts, NOT in
 * Sanity. Service slugs drive the legacy Wix redirect map, so a CMS edit
 * must never be able to silently change a public URL and break an
 * inbound link. Sanity supplies the CONTENT for a known slug; it does not
 * decide which slugs exist. See ROUTES.md §2.
 */

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

type SanityService = {
  slug?: string;
  name?: string;
  order?: number;
  legacyUrl?: string;
  eyebrow?: string;
  heroTitle?: string;
  intro?: string;
  heroMedia?: SanityImage;
  gallery?: SanityImage[];
  overview?: string[];
  commonWorks?: string[];
  delivery?: string[];
  suitableFor?: string[];
  faq?: ServiceFaq[];
  relatedServices?: string[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImage;
};

/**
 * Portable Text is flattened to one plain string per block with
 * `pt::text()`. The service template renders paragraphs, not rich text —
 * there is no bold, no links and no headings inside a service overview —
 * so carrying the full block structure to the client would ship a
 * serialiser the design never uses.
 *
 * Verified against the live project (4x76hdgl / production): all eight
 * service documents return the shape below.
 */
const SERVICE_QUERY = `*[_type == "service" && defined(slug.current)]{
  "slug": slug.current,
  name,
  order,
  legacyUrl,
  eyebrow,
  heroTitle,
  intro,
  heroMedia,
  gallery,
  "overview": overview[]{"text": pt::text(@)}.text,
  commonWorks,
  "delivery": deliveryContent[]{"text": pt::text(@)}.text,
  suitableFor,
  faq[]{question, answer},
  "relatedServices": relatedServices[]->slug.current,
  "seoTitle": seo.seoTitle,
  "seoDescription": seo.seoDescription,
  "ogImage": seo.ogImage
}`;

/**
 * Merges CMS content over the local baseline field by field.
 *
 * TEXT falls back to local: a half-filled Sanity document must not blank a
 * page — if Renan has not written an overview yet, the verified local copy
 * still renders.
 *
 * IMAGES do NOT fall back. All eight services are seeded with their
 * current photography (`npm run cms:seed-media`), so once the service
 * document exists the CMS decides what renders: a hero replaced in Studio
 * replaces it, a hero removed removes it (the page opens on a dark
 * heading, exactly as the schema field says), and the gallery is exactly
 * what Studio holds — nothing gets a stale local photograph pushed under
 * it. Local imagery is only ever reached on a full CMS outage, which
 * getServices() handles by returning the whole local set.
 */
function mergeService(local: ServicePage, cms?: SanityService): ServicePage {
  if (!cms) return local;

  const heroMedia = imageAssetFrom(cms.heroMedia) ?? undefined;

  // Entries without alt text are dropped by `imageAssetFrom` rather than
  // shipped unlabelled, so a CMS gallery can come back shorter than it is
  // in Studio — that is the intended behaviour, not a reason to fall back.
  const gallery = (cms.gallery ?? [])
    .map((image) => imageAssetFrom(image))
    .filter((asset): asset is ImageAsset => asset !== null);

  return {
    ...local,
    eyebrow: cms.eyebrow?.trim() || local.eyebrow,
    heroTitle: cms.heroTitle?.trim() || local.heroTitle,
    intro: cms.intro?.trim() || local.intro,
    heroMedia,
    // If the CMS supplied its own image, the local "this is a generic
    // photo" caveat no longer applies.
    mediaIsGeneric: cms.heroMedia ? undefined : local.mediaIsGeneric,
    gallery,
    overview: cms.overview?.length ? cms.overview : local.overview,
    commonWorks: cms.commonWorks?.length ? cms.commonWorks : local.commonWorks,
    delivery: cms.delivery?.length ? cms.delivery : local.delivery,
    suitableFor: cms.suitableFor?.length ? cms.suitableFor : local.suitableFor,
    // FAQ is the exception: an empty CMS array means "no verified FAQs",
    // which is exactly what should render. Never fall back here.
    faq: cms.faq ?? local.faq,
    // Any published service may be referenced, not only the original
    // eight — otherwise a new CMS service could never be linked from an
    // existing page. Unresolvable slugs are dropped downstream, where the
    // full service list is known.
    relatedServices: cms.relatedServices?.length
      ? cms.relatedServices
      : local.relatedServices,
    seoTitle: cms.seoTitle?.trim() || local.seoTitle,
    seoDescription: cms.seoDescription?.trim() || local.seoDescription,
    ogImage: imageAssetFrom(cms.ogImage) ?? local.ogImage,
  };
}

/* ------------------------------------------------------------------ */
/* Services that exist ONLY in Sanity                                  */
/* ------------------------------------------------------------------ */

/**
 * Builds a full ServicePage from a Sanity document that has no local
 * counterpart — i.e. a service Renan created in Studio himself.
 *
 * This is the half of the CMS promise that was missing: `getServices()`
 * mapped over the LOCAL list and looked each slug up in the CMS, so a
 * document with a new slug was silently discarded. Renan could create
 * "Bird Netting", publish it, and nothing would appear anywhere.
 *
 * Returns null when the document could not render a page worth serving.
 * The bar is deliberately low (CLAUDE.md §5: an honest gap beats an
 * invented detail) — a title plus SOME body copy. Everything else is
 * optional and the template omits what is missing. What we refuse to do
 * is publish an empty URL.
 */
function servicePageFromCms(doc: SanityService): ServicePage | null {
  const slug = doc.slug?.trim();
  if (!slug) return null;

  const heroTitle = doc.heroTitle?.trim() || doc.name?.trim();
  if (!heroTitle) return null;

  const intro = doc.intro?.trim() ?? "";
  const overview = (doc.overview ?? []).map((p) => p.trim()).filter(Boolean);
  if (!intro && overview.length === 0) return null;

  const gallery = (doc.gallery ?? [])
    .map((image) => imageAssetFrom(image))
    .filter((asset): asset is ImageAsset => asset !== null);

  return {
    slug,
    name: doc.name?.trim() || heroTitle,
    // Placeholder numeral; the real one is assigned in getServices once
    // the whole list is known, so numbering can never collide with the
    // eight fixed local indices.
    index: "00",
    // A new service NEVER joins the curated Homepage six. That block is
    // a designed composition, not a list — see CLAUDE.md §9.
    primary: false,
    legacyUrl: doc.legacyUrl?.trim() || null,
    eyebrow: doc.eyebrow?.trim() || "Service",
    heroTitle,
    intro,
    heroMedia: imageAssetFrom(doc.heroMedia) ?? undefined,
    gallery,
    overview,
    commonWorks: doc.commonWorks ?? [],
    delivery: doc.delivery ?? [],
    suitableFor: doc.suitableFor ?? [],
    faq: doc.faq ?? [],
    relatedServices: doc.relatedServices ?? [],
    seoTitle: doc.seoTitle?.trim() || undefined,
    // Derived, not invented: the service's own opening sentence is a
    // truthful description. No keyword stuffing.
    seoDescription:
      doc.seoDescription?.trim() || intro || overview[0] || heroTitle,
    ogImage: imageAssetFrom(doc.ogImage) ?? undefined,
  };
}

const LOCAL_SLUGS = new Set<string>(serviceIndex.map((s) => s.slug));

/**
 * Every service the site should render, local and CMS-only together.
 *
 * ORDER is deliberate and stable:
 *
 *   1. the eight local services, in their configured order, keeping
 *      their fixed numerals 01-08;
 *   2. then CMS-only services, sorted by the `order` field Renan sets in
 *      Studio, numbered 09 upward.
 *
 * The eight are never reordered and never renumbered by a CMS edit,
 * because their numerals are part of the design and their URLs are a
 * contract with Google. A new service setting `order: 3` therefore moves
 * it relative to other NEW services, not into the middle of the original
 * set — which is what stops ordering from becoming random.
 */
export async function getServices(): Promise<ServicePage[]> {
  if (!sanityConfig.isConfigured) return [...localServices];

  const cms = await sanityFetch<SanityService[]>(SERVICE_QUERY, {
    tags: ["service"],
  });

  // Outage or malformed query (sanityFetch catches and returns null) —
  // keep the whole verified local set up, photography included. A
  // successful response is authoritative from here, images and all.
  if (cms === null) return [...localServices];

  const docs = cms;

  const merged = localServices.map((local) =>
    mergeService(
      local,
      docs.find((doc) => doc.slug === local.slug),
    ),
  );

  const additions = docs
    .filter((doc) => doc.slug && !LOCAL_SLUGS.has(doc.slug))
    .sort(
      (a, b) =>
        (a.order ?? Number.MAX_SAFE_INTEGER) -
          (b.order ?? Number.MAX_SAFE_INTEGER) ||
        (a.name ?? "").localeCompare(b.name ?? ""),
    )
    .map(servicePageFromCms)
    .filter((page): page is ServicePage => page !== null)
    .map((page, i) => ({
      ...page,
      index: String(merged.length + i + 1).padStart(2, "0"),
    }));

  return [...merged, ...additions];
}

export async function getService(
  slug: string,
): Promise<ServicePage | undefined> {
  const all = await getServices();
  return all.find((service) => service.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

type SanityProject = {
  _id: string;
  title?: string;
  slug?: string;
  serviceSlug?: string;
  serviceName?: string;
  location?: string;
  summary?: string;
  heroImage?: SanityImage;
  gallery?: SanityImage[];
  scope?: string[];
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImage;
  featured?: boolean;
  completionDate?: string;
};

const PROJECT_QUERY = `*[_type == "project"] | order(featured desc, completionDate desc, _createdAt asc){
  _id,
  title,
  "slug": slug.current,
  "serviceSlug": service->slug.current,
  "serviceName": service->name,
  location,
  summary,
  heroImage,
  gallery,
  scope,
  featured,
  completionDate,
  "seoTitle": seo.seoTitle,
  "seoDescription": seo.seoDescription,
  "ogImage": seo.ogImage
}`;

function mapProject(doc: SanityProject): ProjectRecord | null {
  const image = imageAssetFrom(doc.heroImage);
  // A project with no usable image cannot be rendered honestly, so it is
  // dropped rather than shown as an empty card.
  if (!image) return null;

  // The referenced service may itself have been created in Sanity after
  // launch. Restricting this to the original local slug union silently
  // discarded otherwise valid future projects.
  const serviceSlug = doc.serviceSlug?.trim();
  if (!serviceSlug) return null;

  // Title and slug are required by the schema, but a document can still
  // reach here mid-edit without them. A project card with no name and no
  // destination is not something to render — better to omit it until it
  // is finished than to publish a nameless tile linking nowhere.
  const title = doc.title?.trim();
  const slug = doc.slug?.trim();
  if (!title || !slug) return null;

  const serviceCategory =
    doc.serviceName?.trim() ||
    serviceIndex.find((s) => s.slug === serviceSlug)?.name ||
    "";

  return {
    id: doc._id,
    title,
    slug,
    serviceCategory,
    serviceSlug,
    span: image.width >= image.height ? "wide" : "tall",
    image,
    gallery: (doc.gallery ?? [])
      .map((entry) => imageAssetFrom(entry))
      .filter((asset): asset is ImageAsset => asset !== null),
    // Falls back to the service category rather than to an empty card.
    // Never invents anything: the category is verified, the summary is
    // simply not written yet.
    summary:
      doc.summary?.trim() ||
      `${serviceCategory} carried out by rope access on a commercial building.`,
    location: doc.location,
    scope: doc.scope,
    completionDate: doc.completionDate,
    seoTitle: doc.seoTitle?.trim() || undefined,
    seoDescription: doc.seoDescription?.trim() || undefined,
    ogImage: imageAssetFrom(doc.ogImage) ?? undefined,
  };
}

export async function getProjects(): Promise<ProjectRecord[]> {
  // Local content is an OUTAGE / UNCONFIGURED fallback only — never a
  // content fallback after Sanity has answered. Once the CMS is reachable
  // it is the single source of truth for which projects exist, so a
  // project Renan deletes in Studio actually disappears from the site
  // (portfolio, project pages, sitemap AND the homepage) instead of being
  // resurrected from the local array below. See CMS-HANDOVER.md § Projects.
  if (!sanityConfig.isConfigured) return [...localProjects];

  const cms = await sanityFetch<SanityProject[]>(PROJECT_QUERY, {
    tags: ["project"],
  });

  // `sanityFetch` returns null ONLY on a genuine outage or a malformed
  // query (it catches and logs) — never for a successful query that
  // matched nothing. That distinction is the whole point: an outage keeps
  // the verified local photography up; a successful empty response means
  // there are no published projects, and the site must show that.
  if (cms === null) return [...localProjects];

  return cms
    .map(mapProject)
    .filter((project): project is ProjectRecord => project !== null);
}

/** Only projects with a real slug get a detail URL. */
export async function getPublishedProjects(): Promise<ProjectRecord[]> {
  const all = await getProjects();
  return all.filter((project) => Boolean(project.slug));
}

export async function getProject(
  slug: string,
): Promise<ProjectRecord | undefined> {
  const all = await getProjects();
  return all.find((project) => project.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Homepage                                                            */
/* ------------------------------------------------------------------ */

export type HomepageContent = {
  heroVideoUrl: string | null;
  heroPoster: ImageAsset | null;
  heroFallback: ImageAsset | null;
  heroSupportingCopy: string;
  introCopy: readonly string[];
  introImage: ImageAsset;
  serviceAreaCopy: string;
  finalCtaCopy: string;
  featuredProjectId: string | null;
  selectedProjectIds: readonly string[];
};

type SanityHomepage = {
  heroVideoUrl?: string;
  heroPoster?: SanityImage;
  heroFallback?: SanityImage;
  heroSupportingCopy?: string;
  introCopy?: string;
  introImage?: SanityImage;
  serviceAreaCopy?: string;
  finalCtaCopy?: string;
  featuredProjectId?: string;
  selectedProjectIds?: string[];
};

const HOMEPAGE_QUERY = `*[_type == "homepage"][0]{
  heroVideoUrl,
  heroPoster,
  heroFallback,
  heroSupportingCopy,
  introCopy,
  introImage,
  serviceAreaCopy,
  finalCtaCopy,
  "featuredProjectId": featuredProject->_id,
  "selectedProjectIds": selectedProjects[]->_id
}`;

/**
 * Memoised per request. Six homepage sections read this independently
 * rather than being handed props through page.tsx, which keeps the page
 * a plain list of sections; `cache` makes that one query, not six.
 */
export const getHomepage = cache(async function getHomepage(): Promise<HomepageContent> {
  const fallback: HomepageContent = {
    heroVideoUrl: null,
    heroPoster: null,
    heroFallback: null,
    heroSupportingCopy: `Professional access, repair and maintenance solutions for commercial buildings across ${business.coverage}.`,
    introCopy: localHome.introduction.body,
    introImage: localHome.introduction.image,
    serviceAreaCopy: localHome.coverage.body,
    finalCtaCopy:
      "Tell us about the building, works required and access challenges.",
    featuredProjectId: null,
    selectedProjectIds: [],
  };

  if (!sanityConfig.isConfigured) return fallback;

  const cms = await sanityFetch<SanityHomepage>(HOMEPAGE_QUERY, {
    tags: ["homepage"],
  });
  if (!cms) return fallback;

  return {
    heroVideoUrl: cms.heroVideoUrl?.trim() || null,
    heroPoster: imageAssetFrom(cms.heroPoster),
    heroFallback: imageAssetFrom(cms.heroFallback),
    heroSupportingCopy:
      cms.heroSupportingCopy?.trim() || fallback.heroSupportingCopy,
    introCopy: cms.introCopy?.trim()
      ? cms.introCopy.split(/\n{2,}/).map((p) => p.trim())
      : fallback.introCopy,
    introImage: imageAssetFrom(cms.introImage, fallback.introImage),
    serviceAreaCopy: cms.serviceAreaCopy?.trim() || fallback.serviceAreaCopy,
    finalCtaCopy: cms.finalCtaCopy?.trim() || fallback.finalCtaCopy,
    // A deleted `featuredProject` reference resolves to null here; a
    // deleted entry in `selectedProjects` resolves to null inside the
    // array. Both are dropped so the homepage never carries a dangling
    // project id — it just has one fewer selection until Renan re-picks.
    featuredProjectId: cms.featuredProjectId ?? null,
    selectedProjectIds: (cms.selectedProjectIds ?? []).filter(Boolean),
  };
})

/* ------------------------------------------------------------------ */
/* No getSiteSettings().                                               */
/*                                                                    */
/* It read a `siteSettings` document for phone, email, address,        */
/* company number, social links, footer text, logo, the quote-button  */
/* label and site-wide SEO — but no page ever called it, so every one  */
/* of those Studio fields was a control that changed nothing. The      */
/* document type, its Studio entry and this function were removed      */
/* together. Business identity lives in src/lib/config/site.ts         */
/* (CLAUDE.md §2); Footer, structured data and metadata read it        */
/* directly. See CMS-HANDOVER.md.                                      */
/* ------------------------------------------------------------------ */
