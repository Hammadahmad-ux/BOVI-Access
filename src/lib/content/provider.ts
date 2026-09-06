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
 * A half-filled Sanity document must not blank out a page: if Renan has
 * not written an overview yet, the verified local copy still renders.
 * This is what makes the CMS safe to hand over.
 */
function mergeService(local: ServicePage, cms?: SanityService): ServicePage {
  if (!cms) return local;

  const heroMedia = imageAssetFrom(cms.heroMedia) ?? local.heroMedia;

  // Gallery entries without alt text are dropped by `imageAssetFrom`
  // rather than shipped unlabelled, so a CMS gallery can come back
  // shorter than it is in Studio — and an all-invalid gallery falls back
  // to the local one instead of emptying the page.
  const gallery = cms.gallery
    ?.map((image) => imageAssetFrom(image))
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
    gallery: gallery?.length ? gallery : local.gallery,
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
  const docs = cms ?? [];

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
  featured?: boolean;
  completionDate?: string;
};

const PROJECT_QUERY = `*[_type == "project"] | order(featured desc, completionDate desc, _createdAt desc){
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
  completionDate
}`;

function mapProject(doc: SanityProject): ProjectRecord | null {
  const image = imageAssetFrom(doc.heroImage);
  // A project with no usable image cannot be rendered honestly, so it is
  // dropped rather than shown as an empty card.
  if (!image) return null;

  const serviceSlug = serviceIndex.find(
    (s) => s.slug === doc.serviceSlug,
  )?.slug;
  if (!serviceSlug) return null;

  return {
    id: doc._id,
    serviceCategory:
      doc.serviceName ??
      serviceIndex.find((s) => s.slug === serviceSlug)?.name ??
      "",
    serviceSlug,
    span: image.width >= image.height ? "wide" : "tall",
    image,
    title: doc.title,
    slug: doc.slug,
    location: doc.location,
    summary: doc.summary,
    scope: doc.scope,
    completionDate: doc.completionDate,
  };
}

export async function getProjects(): Promise<ProjectRecord[]> {
  if (!sanityConfig.isConfigured) return [...localProjects];

  const cms = await sanityFetch<SanityProject[]>(PROJECT_QUERY, {
    tags: ["project"],
  });

  // No CMS projects yet? Keep showing the verified local photography
  // rather than an empty portfolio.
  const mapped = (cms ?? []).map(mapProject).filter(Boolean) as ProjectRecord[];
  return mapped.length > 0 ? mapped : [...localProjects];
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
    featuredProjectId: cms.featuredProjectId ?? null,
    selectedProjectIds: cms.selectedProjectIds ?? [],
  };
})

/* ------------------------------------------------------------------ */
/* Site settings                                                       */
/* ------------------------------------------------------------------ */

export type SiteSettings = {
  phoneDisplay: string;
  phoneHref: string;
  emailDisplay: string;
  emailHref: string;
  /** Only rendered when the client has actually supplied it. */
  address: string | null;
  companyNumber: string | null;
  socialLinks: readonly { platform: string; url: string }[];
  footerText: string | null;
  quoteCta: string;
  defaultSeoDescription: string | null;
  defaultOgImage: ImageAsset | null;
};

type SanitySiteSettings = {
  phone?: string;
  phoneE164?: string;
  email?: string;
  address?: string;
  companyNumber?: string;
  socialLinks?: { platform?: string; url?: string }[];
  footerText?: string;
  quoteCTA?: string;
  seoDescription?: string;
  ogImage?: SanityImage;
};

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  phone, phoneE164, email, address, companyNumber,
  socialLinks[]{platform, url},
  footerText, quoteCTA,
  "seoDescription": seo.seoDescription,
  "ogImage": seo.ogImage
}`;

export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    phoneDisplay: business.phoneDisplay,
    phoneHref: business.phoneHref,
    emailDisplay: business.emailDisplay,
    emailHref: business.emailHref,
    // Deliberately null: no address or company number has been supplied.
    // CONTENT-RULES.md §1 — never fabricate either.
    address: null,
    companyNumber: null,
    socialLinks: [],
    footerText: null,
    quoteCta: "Request a Quote",
    defaultSeoDescription: null,
    defaultOgImage: null,
  };

  if (!sanityConfig.isConfigured) return fallback;

  const cms = await sanityFetch<SanitySiteSettings>(SITE_SETTINGS_QUERY, {
    tags: ["siteSettings"],
  });
  if (!cms) return fallback;

  const e164 = cms.phoneE164?.replace(/\s+/g, "");

  return {
    phoneDisplay: cms.phone?.trim() || fallback.phoneDisplay,
    phoneHref: e164 ? `tel:${e164}` : fallback.phoneHref,
    emailDisplay: cms.email?.trim() || fallback.emailDisplay,
    emailHref: cms.email?.trim()
      ? `mailto:${cms.email.trim()}`
      : fallback.emailHref,
    address: cms.address?.trim() || null,
    companyNumber: cms.companyNumber?.trim() || null,
    socialLinks: (cms.socialLinks ?? [])
      .filter((link) => link.platform && link.url)
      .map((link) => ({ platform: link.platform!, url: link.url! })),
    footerText: cms.footerText?.trim() || null,
    quoteCta: cms.quoteCTA?.trim() || fallback.quoteCta,
    defaultSeoDescription: cms.seoDescription?.trim() || null,
    defaultOgImage: imageAssetFrom(cms.ogImage),
  };
}
