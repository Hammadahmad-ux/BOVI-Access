import { business, siteUrl, services } from "@/lib/config/site";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * Structured data.
 *
 * Only facts the client has supplied are emitted. There is deliberately no
 * aggregateRating, review, award or foundingDate — inventing those is
 * schema spam and a content-rules violation (CONTENT-RULES.md).
 */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: business.name,
    url: siteUrl,
    logo: absoluteUrl("/brand/bovi-access-lockup-on-light.png"),
    description: `${business.descriptor}. ${business.slogan}.`,
    telephone: business.phoneHref.replace("tel:", ""),
    email: business.emailDisplay,
    areaServed: business.coverage,
  };
}

export function serviceSchema(slug: string, description: string) {
  const service = services.find((s) => s.slug === slug);
  if (!service) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description,
    serviceType: service.name,
    areaServed: business.coverage,
    provider: {
      "@type": "Organization",
      name: business.name,
      url: siteUrl,
    },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Renders a JSON-LD script tag. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
