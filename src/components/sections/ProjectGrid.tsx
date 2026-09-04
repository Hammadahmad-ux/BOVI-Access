import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { projects } from "@/lib/content/home";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STAGGER } from "@/lib/animations/motion";
import { cn } from "@/lib/utils/cn";

/**
 * Homepage section 06 — projects as proof.
 *
 * CONTENT: no project title, client, location, value or date has been
 * verified (CONTENT-RULES.md §2), so each card carries the service
 * category and nothing else. There is deliberately no empty title slot to
 * fill later — the photograph is the evidence, and the category is the
 * only fact the image provenance actually supports.
 *
 * DESTINATION: cards link to /services/<slug>, not to a project page.
 * Project detail pages do not exist and cannot exist until Renan supplies
 * verified project data, so the service page is the honest — and useful —
 * destination for someone who just recognised their own building problem.
 *
 * COMPOSITION: one landscape (6 of 12 columns) and two portraits (3 each),
 * with the portraits stepped progressively down the page. Three equal
 * cards would read as a template, and the uneven widths let the one
 * genuine landscape frame dominate as the section's anchor.
 *
 * The landscape is 6 columns rather than the 7–8 a two-row arrangement
 * would want: keeping all three frames on one row means the whole set is
 * seen at once and there is no dead quadrant left over from an odd item
 * count. The offsets, not a second row, are what break the baseline.
 *
 * MOTION: hover and focus states are pure CSS on the link's `group`, so
 * this stays a Server Component — no client bundle is shipped for a 3%
 * image scale. Only the entrance reveal is client-side.
 */

/** Union comes from the content module, so a new span there fails here. */
type ProjectSpan = (typeof projects)[number]["span"];

/**
 * Frame shape is driven by the content module's `span`, not by position.
 * Both aspect ratios are the sources' own (1600x1200 and 1000x1333 /
 * 1200x1600), so `object-cover` has nothing to crop today while still
 * protecting the layout if the CMS later supplies an off-ratio image.
 */
type Shape = { frame: string; column: string; sizes: string };

const SHAPE: Record<ProjectSpan, Shape> = {
  wide: {
    frame: "aspect-[4/3]",
    column: "sm:col-span-2 lg:col-span-6",
    sizes: "(min-width: 1440px) 668px, (min-width: 1024px) 47vw, 100vw",
  },
  tall: {
    frame: "aspect-[3/4]",
    column: "lg:col-span-3",
    sizes:
      "(min-width: 1440px) 322px, (min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw",
  },
};

/**
 * The vertical stagger. Position-keyed rather than data-keyed because it
 * is a composition decision, not a property of the project. Wrapped with
 * a modulo so a fourth entry from the CMS rejoins the rhythm instead of
 * landing flush.
 */
const OFFSET = [
  "",
  "lg:mt-16",
  // A smaller step at `sm` too, so the two portraits never read as a
  // matched pair on tablet.
  "sm:mt-12 lg:mt-32",
];

export function ProjectGrid() {
  return (
    <section className="bg-bone text-ink">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionLabel index="06">Projects</SectionLabel>
          <h2 className="mt-6">Recent works</h2>
        </Reveal>

        <ul className="mt-14 grid items-start gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:mt-20 lg:grid-cols-12">
          {projects.map((project, index) => {
            const shape = SHAPE[project.span];

            return (
              <Reveal
                key={project.id}
                as="li"
                y={18}
                delay={index * STAGGER}
                className={cn(shape.column, OFFSET[index % OFFSET.length])}
              >
                <Link
                  href={`/services/${project.serviceSlug}`}
                  className="group block"
                >
                  <div
                    className={cn(
                      "relative w-full overflow-hidden rounded-sm bg-ink/5",
                      shape.frame,
                    )}
                  >
                    <Image
                      src={project.image.src}
                      // Decorative here: the image is inside the card
                      // link, whose accessible name is already the
                      // service category. A verbatim alt would be
                      // prepended to that name and read twice.
                      alt=""
                      fill
                      quality={72}
                      sizes={shape.sizes}
                      className={cn(
                        "object-cover object-center transition-transform duration-700 ease-out",
                        "group-hover:scale-[1.03] group-focus-visible:scale-[1.03]",
                      )}
                    />
                  </div>

                  {/* Hairline, then the category — the same rule language
                      the rest of the page uses to separate, rather than a
                      caption box under the image. */}
                  <div className="mt-5 flex items-start justify-between gap-6 border-t border-hairline-light pt-4">
                    <h3
                      className={cn(
                        "text-h5 leading-[1.2] tracking-[-0.01em]",
                        "transition-transform duration-300 ease-out",
                        "group-hover:translate-x-1 group-focus-visible:translate-x-1",
                      )}
                    >
                      {project.serviceCategory}
                    </h3>
                    <ArrowUpRight
                      aria-hidden="true"
                      className={cn(
                        "mt-1 size-4 shrink-0 text-moss",
                        "transition duration-300 ease-out",
                        "group-hover:-translate-y-1 group-hover:translate-x-1.5 group-hover:text-green",
                        "group-focus-visible:-translate-y-1 group-focus-visible:translate-x-1.5 group-focus-visible:text-green",
                      )}
                    />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </ul>

        {/* A full-width rule closes the deliberately ragged bottom edge of
            the grid and gives the tertiary link something to hang from. */}
        <div className="mt-14 border-t border-hairline-light pt-6 lg:mt-16">
          <ArrowLink href="/portfolio">View all projects</ArrowLink>
        </div>
      </Container>
    </section>
  );
}
