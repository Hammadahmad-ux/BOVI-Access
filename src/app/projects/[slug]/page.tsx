import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProject,
  getPublishedProjects,
  getServices,
} from "@/lib/content/provider";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/structured-data";
import { PageHero } from "@/components/sections/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { RelatedServices } from "@/components/service/RelatedServices";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { STAGGER } from "@/lib/animations/motion";

type Params = { slug: string };

/**
 * Project detail.
 *
 * ---------------------------------------------------------------------
 * THIS ROUTE NOW SERVES. It used to generate nothing, because no project
 * had a verified name and inventing one to make a URL is exactly what
 * CONTENT-RULES.md §1 forbids.
 *
 * What changed is not the rule but the titles: each project is now named
 * for the WORK ("External Pipe Repair"), which is true of the
 * photographs and needs no client, address or date to stand up. Those
 * three remain optional and empty, and every block below renders only
 * when its field actually has a value — so a project with no location,
 * no date and no scope produces a complete page with no empty labels and
 * no gaps where a section would have been.
 *
 * A slug that matches no project still calls notFound().
 * ---------------------------------------------------------------------
 */
export const revalidate = 3600;

/*
  THE SAME PHOTOGRAPH FRAME AS A SERVICE PAGE.

  The client opened a project and found the photographs "too big" — the
  same complaint he made about the service pages, and the same fix. This
  gallery ran the full content width in two columns, so at 1440 each
  frame rendered 664x830: nearly as tall as the viewport, one photograph
  per screen.

  The cap goes on the GRID, not on each cell: capping cells would strand
  every photograph at the left of a 664px column with 264px of dead
  space beside it. 1264px is three 400px columns plus two 2rem gaps, so
  a service photograph and a project photograph are the same 400x500 on
  a 1440 laptop, and the cap is inert below that.
*/
const GALLERY_PHOTO_FRAME = "aspect-[4/5]";
const GALLERY_PHOTO_SIZES =
  "(min-width: 1024px) 400px, (min-width: 640px) 46vw, 100vw";

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
    // Derived from the project's own content — never assembled from
    // keywords, and never claiming a location or client.
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    path: `/projects/${slug}`,
    ogImage: project.ogImage?.src ?? project.image.src,
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

  const allServices = await getServices();
  const service = allServices.find((s) => s.slug === project.serviceSlug);

  /*
    Which bands render at all. There used to be a running numeral
    assigned here as well, so a page whose metadata is empty — which is
    every project today — still opened at 01 rather than 02. The numerals
    are gone from the section labels, so only the presence checks remain.
  */
  const hasDetails = Boolean(project.location || project.completionDate);
  const hasScope = Boolean(project.scope?.length);

  return (
    <>
      <PageHero
        eyebrow={project.serviceCategory}
        title={project.title}
        lead={project.summary}
        media={project.image}
        height="tall"
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/portfolio" },
          { label: project.title },
        ]}
      />

      {/* ---------------- Details ----------------
          Rendered ONLY when there is something to put in it. The service
          category alone does not earn a section: it is already the hero
          eyebrow and the last breadcrumb, and a whole band of page
          holding one row that repeats what is directly above it reads as
          a template with the data missing. None of these projects has a
          verified location, date or scope yet, so today this is skipped
          entirely — and it appears the moment Renan fills one in. */}
      {hasDetails || hasScope ? (
        <section className="bg-bone">
          <Container className="py-20 lg:py-28">
            {hasDetails ? (
              <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                <Reveal className="lg:col-span-4">
                  <SectionLabel>Details</SectionLabel>
                </Reveal>

                {/* Every row renders only when the field actually has a
                    value, so a project never shows an empty label. */}
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
            ) : null}

            {hasScope ? (
              <div
                className={
                  hasDetails
                    ? "mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16"
                    : "grid gap-12 lg:grid-cols-12 lg:gap-16"
                }
              >
                <Reveal className="lg:col-span-4">
                  <SectionLabel>Scope</SectionLabel>
                </Reveal>
                <ul className="lg:col-span-7 lg:col-start-6">
                  {project.scope?.map((item) => (
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
      ) : null}

      {/* ---------------- Photographs ----------------
          The point of the whole page, and what the client asked for:
          more photographs of the actual job. Rendered only when the
          project HAS more than its hero shot — a project with an empty
          gallery ends after the details rather than showing a heading
          over nothing. */}
      {project.gallery.length > 0 ? (
        <section className="bg-bone">
          <Container
            className={
              hasDetails || hasScope
                ? "pb-20 lg:pb-28"
                : "py-20 lg:py-28"
            }
          >
            <Reveal>
              <SectionLabel>
                Photographs
              </SectionLabel>
            </Reveal>

            {/*
              Three columns once the frames are capped, where the old
              full-width layout ran two. Every one of these sets is three
              photographs, so two columns now leaves the third alone in
              its own row with two thirds of the band empty beside it —
              tolerable when a cell WAS the column, glaring once a cell
              is 400px in a 1344px field.

              Click-to-enlarge comes with the smaller frame rather than
              after it: shrinking a photograph of a repair to 400px only
              works if the detail behind it is still reachable. Same
              component as the service pages and the projects grid.
            */}
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:max-w-[1264px] lg:grid-cols-3 lg:gap-8">
              {project.gallery.map((photo, i) => (
                <Reveal
                  as="li"
                  key={photo.src}
                  delay={Math.min(i * STAGGER, 0.24)}
                >
                  <ZoomableImage
                    image={photo}
                    label={`${project.title}, photograph ${i + 1}`}
                    frameClassName={GALLERY_PHOTO_FRAME}
                    sizes={GALLERY_PHOTO_SIZES}
                    caption={<span className="text-bone">{project.title}</span>}
                  />
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {service ? (
        <RelatedServices
          currentSlug=""
          slugs={[service.slug, ...service.relatedServices].slice(0, 3)}
          all={allServices}
        />
      ) : null}

      <FinalCta />

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/portfolio" },
          {
            name: project.title,
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
