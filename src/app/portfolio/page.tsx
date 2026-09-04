import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { business } from "@/lib/config/site";
import { projects } from "@/lib/content/projects";
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
 * Projects.
 *
 * Proof of work, not a blog and not a case-study catalogue.
 *
 * Every card shows the SERVICE CATEGORY and the photograph, and links to
 * the service page. No project name, client, location or date is shown
 * because none has been verified — see CONTENT-RULES.md §2 and the note at
 * the top of src/lib/content/projects.ts.
 *
 * There are deliberately NO filters. Filters imply a catalogue deep enough
 * to need them; with six verified images they would be theatre. They
 * arrive with the Sanity project records in Phase 4.
 */
export default function PortfolioPage() {
  const [featured, ...rest] = projects;

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
              <p className="eyebrow flex items-center gap-2.5 text-green-bright">
                <span aria-hidden="true" className="size-1.5 bg-green-bright" />
                {featured.serviceCategory}
              </p>
              <h2 className="mt-5 max-w-[16ch] text-h3">
                Full-height elevation access, without scaffold.
              </h2>
              <p className="mt-5 max-w-[44ch] text-body text-mist">
                Rope access reaches every level of an elevation from the roof
                down, so glazing, masonry and roofline works can be completed
                on an occupied building.
              </p>
              <div className="mt-7">
                <ArrowLink
                  href={`/services/${featured.serviceSlug}`}
                  ground="dark"
                >
                  About this service
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
                <Link
                  href={`/services/${project.serviceSlug}`}
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
                      /* Decorative: the card link is named by the service
                         category below it. */
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                      quality={72}
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                    />
                  </span>

                  <span className="flex items-start justify-between gap-4 border-t border-hairline-light pt-4">
                    <span className="font-display text-h5 font-semibold transition-colors group-hover:text-green">
                      {project.serviceCategory}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-moss transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-green"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>

          <p className="mt-14 max-w-[56ch] text-body text-moss">
            Project names, locations and dates are not published here. If you
            need references for a specific type of building or works, ask and
            we will provide what the client has agreed we can share.
          </p>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
