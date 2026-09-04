import type { Metadata } from "next";
import { business, siteUrl } from "@/lib/config/site";

/**
 * SEO metadata helpers.
 *
 * Every production route must supply a real title and description. A page
 * that ships without them is a QA failure (QA-CHECKLIST.md #5, #6).
 */

type PageMetaInput = {
  /** Page title WITHOUT the brand suffix — the template adds it. */
  title: string;
  description: string;
  /** Path only, e.g. "/services". Used for the canonical URL. */
  path: string;
  /** Absolute or root-relative OG image. Falls back to the site default. */
  ogImage?: string;
  noIndex?: boolean;
  /**
   * Set on the HOMEPAGE only.
   *
   * The root layout's `title.template` appends "| BOVI Access" to child
   * segments, but the root page.tsx shares the root layout's segment, so
   * the template does not apply to it and the homepage would otherwise
   * ship with no brand in its <title>. This appends the brand explicitly.
   * (Guarded by the title assertion in e2e/foundation.spec.ts.)
   */
  brandInTitle?: boolean;
};

export const DEFAULT_OG_IMAGE = "/images/hero/hero-still.jpg";

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  brandInTitle = false,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const image = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);

  return {
    title: brandInTitle
      ? { absolute: `${title} | ${business.name}` }
      : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: business.name,
      title: `${title} | ${business.name}`,
      description,
      url,
      images: [{ url: image }],
      locale: "en_GB",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${business.name}`,
      description,
      images: [image],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
