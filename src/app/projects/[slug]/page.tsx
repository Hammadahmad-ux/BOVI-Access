import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProject, getPublishedProjects } from "@/lib/content/provider";
import { getServicePage } from "@/lib/content/services";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/structured-data";
import { PageHero } from "@/components/sections/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { RelatedServices } from "@/components/service/RelatedServices";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

type Params = { slug: string };

/**
 * Project detail.
 *
 * ---------------------------------------------------------------------
 * THIS ROUTE CURRENTLY GENERATES NO PAGES — AND THAT IS CORRECT.
 *
 * `publishedProjects` is empty because no BOVI project has a verified
 * name, client, location, date or scope. Publishing a project page would
 * mean inventing at least a title and a slug, which CONTENT-RULES.md §1
 * forbids outright.
 *
 * So the template exists, fully built, and waits. In Phase 4 Sanity
 * returns real `project` documents, `publishedProjects` stops being
 * empty, and these pages start serving with no further work. Nothing here
 * is a placeholder; it is architecture with no data yet.
 *
 * Until then any /projects/<anything> request falls through to notFound(),
 * which renders the custom 404 — the honest outcome.
 * ---------------------------------------------------------------------
 */
export const revalidate = 3600;

export async function generateStaticParams(): Promise<Params[]> {
  const published = await getPublishedProjects();
  return published.map((project) => ({ slug: project.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  return buildMetadata({
    title: project.title ?? project.serviceCategory,
    description:
      project.summary ??
      `${project.serviceCategory} delivered by rope access on a commercial building.`,
    path: `/projects/${slug}`,
    ogImage: project.image.src,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) notFound();

  const service = getServicePage(project.serviceSlug);

  return (
    <>
      <PageHero
        eyebrow={project.serviceCategory}
        title={project.title ?? project.serviceCategory}
        lead={project.summary}
        media={project.image}
        height="tall"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/portfolio" },
          { label: project.title ?? project.serviceCategory },
        ]}
      />

      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <SectionLabel index="01">Details</SectionLabel>
            </Reveal>

            {/* Every row renders only when the field actually has a value,
                so an unverified project never shows an empty label. */}
            <dl className="lg:col-span-7 lg:col-start-6">
              <Row label="Service" value={project.serviceCategory} />
              {project.location ? (
                <Row label="Location" value={project.location} />
              ) : null}
              {project.completionDate ? (
                <Row label="Completed" value={project.completionDate} />
              ) : null}
            </dl>
          </div>

          {project.scope?.length ? (
            <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
              <Reveal className="lg:col-span-4">
                <SectionLabel index="02">Scope</SectionLabel>
              </Reveal>
              <ul className="lg:col-span-7 lg:col-start-6">
                {project.scope.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 border-t border-hairline-light py-5 last:border-b"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 bg-green"
                    />
                    <span className="text-body-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Container>
      </section>

      <Reveal as="figure" className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/9]">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="100vw"
          quality={74}
          className="object-cover object-center"
        />
      </Reveal>

      {service ? (
        <RelatedServices
          currentSlug=""
          slugs={[service.slug, ...service.relatedServices].slice(0, 3)}
        />
      ) : null}

      <FinalCta />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/portfolio" },
          {
            name: project.title ?? project.serviceCategory,
            path: `/projects/${slug}`,
          },
        ])}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-8 gap-y-1 border-t border-hairline-light py-5 last:border-b">
      <dt className="eyebrow w-32 shrink-0 text-moss">{label}</dt>
      <dd className="text-body-lg">{value}</dd>
    </div>
  );
}
