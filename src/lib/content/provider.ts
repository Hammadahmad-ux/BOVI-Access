import "server-only";

import { sanityConfig } from "@/lib/config/env";
import { sanityFetch } from "@/lib/sanity/client";
import { imageAssetFrom, type SanityImage } from "@/lib/sanity/image";
import type { ImageAsset } from "@/lib/content/types";
import type { ServicePage, ServiceFaq } from "@/lib/content/services";
import { servicePages as localServices } from "@/lib/content/services";
import type { ProjectRecord } from "@/lib/content/projects";
import { projects as localProjects } from "@/lib/content/projects";
import * as localHome from "@/lib/content/home";
import { business, services as serviceIndex, type ServiceSlug } from "@/lib/config/site";

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
  seoDescription?: string;
};

/**
 * Portable Text is flattened to one plain string per block with
 * `pt::text()`. The service template renders paragraphs, not rich text —
 * there is no bold, no links and no headings inside a service overview —
 * so carrying the full block structure to the client would ship a
 * serialiser the design never uses.
 *
 * NOTE: these queries are written but UNVERIFIED — no Sanity project
 * exists yet to run them against. Re-check them against real data during
 * the first CMS smoke test (DEPLOYMENT.md §4).
 */
const SERVICE_QUERY = `*[_type == "service" && defined(slug.current)]{
  "slug": slug.current,
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
  "seoDescription": seo.seoDescription
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

  const heroMedia = imageAssetFrom(cms.heroMedia, local.heroMedia);

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
    relatedServices: cms.relatedServices?.length
      ? cms.relatedServices.filter((slug): slug is ServiceSlug =>
          serviceIndex.some((s) => s.slug === slug),
        )
      : local.relatedServices,
    seoDescription: cms.seoDescription?.trim() || local.seoDescription,
  };
}

export async function getServices(): Promise<ServicePage[]> {
  if (!sanityConfig.isConfigured) return [...localServices];

  const cms = await sanityFetch<SanityService[]>(SERVICE_QUERY, {
    tags: ["service"],
  });

  return localServices.map((local) =>
    mergeService(
      local,
      cms?.find((doc) => doc.slug === local.slug),
    ),
  );
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

export async function getHomepage(): Promise<HomepageContent> {
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
}

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
