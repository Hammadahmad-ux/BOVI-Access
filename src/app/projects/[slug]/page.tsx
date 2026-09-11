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
import { GalleryProvider, GalleryThumb } from "@/components/ui/Gallery";
import { STAGGER } from "@/lib/animations/motion";
import { cn } from "@/lib/utils/cn";

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
  every photograph at the left of a wide column with dead space beside
  it. 1024px is three 320px columns plus two 2rem gaps — the client's
  latest note is that these should sit "closer in size to the Related
  Services cards", so the frame is now ~320px on a laptop or desktop, the
  same as a service photograph and close to a Related Services card. The
  cap is inert below `lg`, where a phone stays near full width.
*/
const GALLERY_PHOTO_FRAME = "aspect-[4/5]";

/*
  DESKTOP COLUMN COUNT IS DRIVEN BY HOW MANY PHOTOGRAPHS THE PROJECT HAS,
  NOT HARDCODED FOR ONE PROJECT.

  The client found a 4-photograph project ("External Pipe Repair", added
  by Renan in Studio) rendering 3-then-1: the grid below was capped at
  three columns regardless of count. The fix keys both the column count
  and the row's own max-width off `gallery.length`, clamped to 4 — one
  photo is a single compact frame, two or three keep the existing
  ~320px-per-cell width this grid was tuned to (closer to a Related
  Services card), and four sit in one uncapped row that still lands in
  the same ~280-320px range because it divides the page container itself
  rather than a fixed cap. Five or more reuse the four-column row and
  simply wrap — CSS grid does that for free, so nothing above four needs
  its own case.

  Tailwind's v4 scanner needs literal class strings, not
  `` `lg:grid-cols-${n}` `` — hence the lookup table rather than
  string interpolation.
*/
const GALLERY_LAYOUT_BY_COUNT: Record<
  number,
  { grid: string; sizes: string }
> = {
  1: {
    grid: "lg:max-w-[320px] lg:grid-cols-1",
    sizes: "(min-width: 1024px) 320px, 100vw",
  },
  2: {
    grid: "lg:max-w-[672px] lg:grid-cols-2",
    sizes: "(min-width: 1024px) 320px, (min-width: 640px) 46vw, 100vw",
  },
  3: {
    grid: "lg:max-w-[1024px] lg:grid-cols-3",
    sizes: "(min-width: 1024px) 320px, (min-width: 640px) 46vw, 100vw",
  },
  4: {
    // No max-width cap: the row fills the page Container (max 1440,
    // 2.5rem gutters), which divides four equal columns to roughly the
    // same ~280-320px cell width as the capped rows above.
    grid: "lg:grid-cols-4",
    sizes: "(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 100vw",
  },
};

function galleryLayout(count: number) {
  return GALLERY_LAYOUT_BY_COUNT[Math.min(Math.max(count, 1), 4)];
}

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

  // The lightbox pages through every photograph on this project, in the
  // order they appear in the grid.
  const galleryItems = project.gallery.map((photo, i) => ({
    image: photo,
    label: `${project.title}, photograph ${i + 1}`,
    caption: <span className="text-bone">{project.title}</span>,
  }));

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
              Column count and row width both come from `galleryLayout()`
              above, keyed off how many photographs this project actually
              has — never a fixed three. A project with four photographs
              (Renan added one to "External Pipe Repair" in Studio) used
              to leave the fourth stranded alone on its own row; it now
              gets its own four-up, one-row case instead of wrapping the
              three-column grid.

              Click-to-enlarge comes with the smaller frame rather than
              after it: shrinking a photograph of a repair works only if
              the detail behind it is still reachable. Opening any one
              pages through the whole set — same gallery lightbox as the
              service pages.
            */}
            <GalleryProvider items={galleryItems}>
              <ul
                className={cn(
                  "mt-10 grid gap-6 sm:grid-cols-2 lg:mt-12 lg:gap-8",
                  galleryLayout(project.gallery.length).grid,
                )}
              >
                {project.gallery.map((photo, i) => (
                  <Reveal
                    as="li"
                    key={photo.src}
                    delay={Math.min(i * STAGGER, 0.24)}
                  >
                    <GalleryThumb
                      index={i}
                      frameClassName={GALLERY_PHOTO_FRAME}
                      sizes={galleryLayout(project.gallery.length).sizes}
                    />
                  </Reveal>
                ))}
              </ul>
            </GalleryProvider>
          </Container>
        </section>
      ) : null}

      {service ? (
        <RelatedServices
          currentSlug=""
          slugs={[service.slug, ...service.relatedServices].slice(0, 4)}
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
