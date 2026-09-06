import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, getServices } from "@/lib/content/provider";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/lib/seo/structured-data";
import { PageHero } from "@/components/sections/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { ServiceBody } from "@/components/service/ServiceBody";
import { ServiceFaqSection } from "@/components/service/ServiceFaq";
import { RelatedServices } from "@/components/service/RelatedServices";

type Params = { slug: string };

/**
 * Which service pages are pre-rendered at build time: every service the
 * provider knows about, local and Sanity alike.
 *
 * This used to read the LOCAL list only, on the reasoning that slugs are
 * a URL contract. The contract part is still true and still enforced —
 * the eight original slugs live in src/lib/config/site.ts and drive the
 * legacy Wix redirect map, and no CMS edit can move or remove them. But
 * treating the local list as the ONLY source meant a service Renan
 * created in Studio had no route at all, which is the capability he
 * actually asked for.
 *
 * `dynamicParams` stays at its default of true, so a service published
 * AFTER the last build still resolves: the slug is rendered on demand,
 * cached, and revalidated by the publish webhook. Renan does not need a
 * redeploy. A slug that matches no service still calls notFound().
 */
export async function generateStaticParams(): Promise<Params[]> {
  const services = await getServices();
  return services.map((service) => ({ slug: service.slug }));
}

/** Rebuild service pages hourly, or on demand via the Sanity webhook. */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};

  return buildMetadata({
    // Renan can override the search-result title per service. Blank falls
    // back to the page heading rather than to anything generated.
    title: service.seoTitle || service.heroTitle,
    description: service.seoDescription,
    path: `/services/${service.slug}`,
    // Explicit social image, else the page's own photograph, else the
    // site default that buildMetadata supplies.
    ogImage: service.ogImage?.src ?? service.heroMedia?.src,
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
  const [service, allServices] = await Promise.all([
    getService(slug),
    getServices(),
  ]);

  if (!service) notFound();

  const faq = faqSchema(service.faq);

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
        all={allServices}
      />

      <FinalCta />

      <JsonLd data={serviceSchema(service.slug, service.seoDescription) ?? {}} />
      {/* Emitted only when the service has verified FAQ content. */}
      {faq ? <JsonLd data={faq} /> : null}
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
