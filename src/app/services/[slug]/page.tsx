import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { business, services, getService } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema, serviceSchema } from "@/lib/seo/structured-data";
import { PageHeader } from "@/components/sections/PageHeader";
import { FinalCta } from "@/components/sections/FinalCta";
import { RelatedServices } from "@/components/service/RelatedServices";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((service) => ({ slug: service.slug }));
}

/**
 * Description used for metadata and Service schema until Sanity supplies
 * per-service copy. Written from the service name only — no capability,
 * accreditation or coverage claim beyond what the client has confirmed.
 */
function describeService(name: string): string {
  return `${name} delivered by rope access on commercial buildings across ${business.coverage}. ${business.name} — ${business.slogan}.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.name,
    description: describeService(service.name),
    path: `/services/${service.slug}`,
  });
}

/**
 * PHASE 3 builds the full reusable service template on this route:
 * ServiceHero, ServiceOverview, CommonWorks, gallery, FAQ, RelatedServices —
 * all driven by the Sanity `service` document. The URL contract is fixed now
 * so the legacy Wix redirects in next.config.ts stay valid.
 */
export default async function ServicePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) notFound();

  const description = describeService(service.name);
  const schema = serviceSchema(service.slug, description);

  return (
    <>
      <PageHeader
        eyebrow={`${service.index} — Service`}
        title={service.name}
        intro={`${service.name} delivered by rope access, without scaffolding or powered access, on occupied commercial buildings across ${business.coverage}.`}
      />

      <RelatedServices currentSlug={service.slug} />

      <FinalCta />

      {schema ? <JsonLd data={schema} /> : null}
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
