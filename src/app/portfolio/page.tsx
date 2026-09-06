import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { business } from "@/lib/config/site";
import { getProjects } from "@/lib/content/provider";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/sections/PageHero";
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
            <SectionLabel index="01" ground="dark">
              Featured
            </SectionLabel>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
            <Reveal
              as="figure"
              className="relative aspect-[4/3] overflow-hidden rounded-sm lg:col-span-8"
            >
              <Image
                src={featured.image.src}
                alt={featured.image.alt}
                fill
                sizes="(min-width: 1024px) 62vw, 100vw"
                quality={74}
                className="object-cover object-center"
              />
            </Reveal>

            <Reveal delay={STAGGER} className="lg:col-span-4">
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
            <SectionLabel index="02">Recent works</SectionLabel>
            <h2 className="mt-6 max-w-[20ch] text-h3">
              Access, repair and maintenance across commercial buildings.
            </h2>
          </Reveal>

          {/*
            Uneven by design — the source library is portrait-heavy and a
            uniform grid would waste it. The offset on the second column is
            a composition device, not data.
          */}
          <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
            {rest.map((project, i) => (
              <Reveal
                as="li"
                key={project.id}
                delay={Math.min(i * STAGGER, 0.24)}
                className={i % 3 === 1 ? "lg:mt-16" : undefined}
              >
                {/* The destination is the PROJECT, never the service
                    page. That redirect was the client's actual complaint:
                    a visitor who clicked a photograph of finished work was
                    taken to a sales page about the service instead. */}
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex flex-col gap-5"
                >
                  <span
                    className={
                      project.span === "wide"
                        ? "relative block aspect-[4/3] overflow-hidden rounded-sm bg-ink-raised"
                        : "relative block aspect-[3/4] overflow-hidden rounded-sm bg-ink-raised"
                    }
                  >
                    <Image
                      src={project.image.src}
                      /* Decorative: the card link is named by the project
                         title below it. */
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                      quality={72}
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                    />

                    {/* Only when there is genuinely more to see. */}
                    {project.gallery.length > 0 ? (
                      <span className="eyebrow absolute right-3 bottom-3 rounded-xs bg-ink/80 px-2.5 py-1.5 text-bone backdrop-blur-sm">
                        {project.gallery.length + 1} photos
                      </span>
                    ) : null}
                  </span>

                  <span className="flex flex-col gap-3 border-t border-hairline-light pt-4">
                    <span data-project-category className="eyebrow text-moss">
                      {project.serviceCategory}
                    </span>

                    <span className="flex items-start justify-between gap-4">
                      <span className="font-display text-h5 font-semibold transition-colors group-hover:text-green">
                        {project.title}
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-moss transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-green"
                      />
                    </span>

                    {/* Clamped, not truncated in the data: the card gives
                        the gist, the project page gives the whole thing. */}
                    <span className="line-clamp-3 text-body text-moss">
                      {project.summary}
                    </span>
                  </span>
                </Link>
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
