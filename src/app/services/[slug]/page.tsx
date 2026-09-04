import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServicePage, servicePages } from "@/lib/content/services";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  JsonLd,
  breadcrumbSchema,
  serviceSchema,
} from "@/lib/seo/structured-data";
import { PageHero } from "@/components/sections/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { ServiceBody } from "@/components/service/ServiceBody";
import { ServiceFaqSection } from "@/components/service/ServiceFaq";
import { RelatedServices } from "@/components/service/RelatedServices";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return servicePages.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServicePage(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.heroTitle,
    description: service.seoDescription,
    path: `/services/${service.slug}`,
    ogImage: service.heroMedia.src,
  });
}

/**
 * The service page — ONE template for all eight services.
 *
 * Everything that differs between pages is data in
 * src/lib/content/services.ts, whose shape mirrors the Sanity `service`
 * document field for field. Phase 4 swaps the provider; this file and the
 * section components do not change.
 *
 * The URL contract (`slug`) comes from src/lib/config/site.ts rather than
 * the content module, because it also drives the legacy Wix redirect map
 * in next.config.ts — see ROUTES.md.
 */
export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getServicePage(slug);

  if (!service) notFound();

  return (
    <>
      <PageHero
        eyebrow={service.eyebrow}
        title={service.heroTitle}
        lead={service.intro}
        media={service.heroMedia}
        height="tall"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
      />

      <ServiceBody service={service} />

      {/* Renders nothing until verified FAQ content exists. */}
      <ServiceFaqSection faq={service.faq} />

      <RelatedServices
        currentSlug={service.slug}
        slugs={service.relatedServices}
      />

      <FinalCta />

      <JsonLd data={serviceSchema(service.slug, service.seoDescription) ?? {}} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ])}
      />
    </>
  );
}
