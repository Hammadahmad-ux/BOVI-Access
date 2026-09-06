import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { business } from "@/lib/config/site";
import { getProjects } from "@/lib/content/provider";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { ProjectPreview } from "@/components/projects/ProjectPreview";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { STAGGER } from "@/lib/animations/motion";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description: `Selected access, repair and maintenance work by ${business.name} on commercial buildings across ${business.coverage}.`,
  path: "/portfolio",
  ogImage: "/images/portfolio/hero.jpg",
});

/**
 * Projects — a gallery of completed work.
 *
 * REBUILT at the client's request. It used to show six loose photographs
 * labelled with a service category, each linking to the SERVICE page: "it
 * redirects to the service pages rather than actually showing photos of
 * completed work. I'd prefer it to work more like a simple project
 * gallery/case study section." He also noticed two Lightning Protection
 * entries, which was the same fault seen from the front — the list was
 * images grouped by category, not jobs.
 *
 * Now every card is one job: its own photographs, its own short
 * description of what those photographs show, and its own page at
 * /projects/<slug>. No card links to a service page any more.
 *
 * Still no project names, clients, locations or dates, because none has
 * been verified. The titles say what the work WAS — see the note at the
 * top of src/lib/content/projects.ts.
 *
 * There are deliberately NO filters. Six projects do not need them, and
 * filters imply a catalogue deep enough to justify the chrome.
 */
export const revalidate = 3600;

export default async function PortfolioPage() {
  const projects = await getProjects();

  // The lead item is chosen by the `featured` flag, not by array position,
  // so re-ordering the list — or Renan ticking a different project in
  // Studio — cannot silently change which one leads the page.
  const featured = projects.find((project) => project.featured) ?? projects[0];
  const rest = projects.filter((project) => project.id !== featured?.id);

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title={["Work at height.", "Seen from the ground."]}
        lead="Selected examples of access, repair and maintenance work across commercial properties."
        media={{
          src: "/images/portfolio/hero.jpg",
          alt: "A tall angular glazed tower photographed from street level against a clear sky",
          width: 1600,
          height: 2133,
        }}
        height="tall"
      />

      {/* ---------------- Featured ---------------- */}
      <section data-ground="dark" className="bg-ink text-bone">
        <Container className="py-20 lg:py-28">
          <Reveal>
            <SectionLabel ground="dark">
              Featured
            </SectionLabel>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
            <Reveal
              as="figure"
              className="relative aspect-[4/3] overflow-hidden rounded-sm lg:col-span-7"
            >
              <Image
                src={featured.image.src}
                alt={featured.image.alt}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                quality={74}
                className="object-cover object-center"
              />
            </Reveal>

            {/*
              Bottom-aligned to the photograph, then lifted 48px off that
              baseline. The client: "there's a little too much empty space
              above it… maybe around 40–60px higher." At 1440 the copy sat
              265px below the top of the image, and the row is set
              `items-end` so the slack all collects above it.

              A margin rather than a translate, so the lift is part of the
              layout: the text block is shorter than the photograph at
              every desktop width, so the row height does not change and
              nothing below moves. Full centring would have lifted it
              130px, which is past what he asked for.
            */}
            <Reveal delay={STAGGER} className="lg:col-span-5 lg:mb-12">
              <p
                data-project-category
                className="eyebrow flex items-center gap-2.5 text-green-bright"
              >
                <span aria-hidden="true" className="size-1.5 bg-green-bright" />
                {featured.serviceCategory}
              </p>
              {/* The project's own title and description, not a stock line
                  about rope access. The heading here used to read "without
                  scaffold", which is an absolute claim about a job nobody
                  has verified the constraints of. */}
              <h2 className="mt-5 max-w-[16ch] text-h3">{featured.title}</h2>
              <p className="mt-5 max-w-[44ch] text-body text-mist">
                {featured.summary}
              </p>
              <div className="mt-7">
                <ArrowLink href={`/projects/${featured.slug}`} ground="dark">
                  View project
                </ArrowLink>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ---------------- Grid ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <Reveal>
            <SectionLabel>Recent works</SectionLabel>
            <h2 className="mt-6 max-w-[20ch] text-h3">
              Access, repair and maintenance across commercial buildings.
            </h2>
          </Reveal>

          {/*
            ALIGNED, uniform, and sized to grow.

            This grid used to stagger every second column down 64px and
            switch each card between a 4:3 and a 3:4 frame depending on
            the source photograph's orientation. Both were deliberate —
            and both are exactly what the client saw: "some of the project
            cards are slightly misaligned and the project photos are quite
            large."

            So: one ratio for every card, no offsets, and four columns at
            xl instead of three, which is what makes the previews smaller
            without cropping them harder. He plans to add more projects,
            and this holds its shape at 6, 12 or 18.
          */}
          <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 xl:grid-cols-4">
            {rest.map((project, i) => (
              <Reveal
                as="li"
                key={project.id}
                delay={Math.min(i * STAGGER, 0.24)}
                /*
                  A FADE, NOT A RISE.

                  The client: "the project cards/images are starting at
                  different heights on desktop. Is this intentional as
                  part of the design?" At rest they were already exact —
                  every card in row one sits at the same pixel, on the
                  deployed site as well as locally. The offset was the
                  ENTRANCE: Reveal's default 22px travel, staggered 80ms
                  per card, so for the first ~800ms a row climbs into
                  place as a visible staircase. That is what he saw, and
                  a staircase held for most of a second reads as layout,
                  not as animation.

                  The stagger stays — the cards still arrive in sequence
                  — but as opacity alone, so no card is ever vertically
                  offset from the one beside it.
                */
                y={0}
                className="flex flex-col gap-5"
              >
                {/* The photograph opens the photograph. */}
                <ProjectPreview
                  image={project.image}
                  title={project.title}
                  category={project.serviceCategory}
                  photoCount={project.gallery.length + 1}
                />

                {/*
                  Fixed vertical rhythm so cards line up across a row: the
                  title is held at two lines whether it needs one or two,
                  and the summary is clamped. Without both, a long title
                  pushes its neighbour's description out of line — the
                  other half of the misalignment.
                */}
                <div className="flex flex-col gap-2.5 border-t border-hairline-light pt-4">
                  <span data-project-category className="eyebrow text-moss">
                    {project.serviceCategory}
                  </span>

                  {/* The title opens the job. */}
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex min-h-[2.6em] items-start justify-between gap-4"
                  >
                    <span className="line-clamp-2 font-display text-h5 font-semibold transition-colors group-hover:text-green">
                      {project.title}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-moss transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-green"
                    />
                  </Link>

                  {/* Clamped on the listing only. The project page carries
                      the whole thing. */}
                  <p className="line-clamp-3 text-body text-moss">
                    {project.summary}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>

          <p className="mt-14 max-w-[56ch] text-body text-moss">
            Client names, addresses and dates are not published here. If you
            need references for a specific type of building or works, ask and
            we will provide what the client has agreed we can share.
          </p>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
