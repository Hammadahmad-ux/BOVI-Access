import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { projects as localProjects } from "@/lib/content/home";
import { getHomepage, getProjects } from "@/lib/content/provider";
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
 * COMPOSITION: three frames on one row, aligned along a single top
 * edge. They used to be stepped 64px and 128px down the page — an
 * editorial device to break the baseline — and the client asked for them
 * level, on the grounds that the same symmetry reads as professional.
 * He is right about this section in particular: with every project
 * currently `tall` the three frames are identical in size, so the steps
 * read as three cards that failed to line up rather than as a
 * composition.
 *
 * The widths still vary when the set can carry it: a `wide` lead takes 6
 * of 12 columns against 3 each for the portraits beside it. That is what
 * keeps the row from reading as a template now that the offsets are
 * gone, and `items-start` holds the top edge whether or not the frames
 * end up the same height.
 *
 * MOTION: hover and focus states are pure CSS on the link's `group`, so
 * this stays a Server Component — no client bundle is shipped for a 3%
 * image scale. Only the entrance reveal is client-side.
 */

/** Union comes from the content module, so a new span there fails here. */
type ProjectSpan = (typeof localProjects)[number]["span"];

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

export async function ProjectGrid() {
  const [home, all] = await Promise.all([getHomepage(), getProjects()]);

  /*
    Renan chooses which projects appear here, in Studio, in his own order.
    The composition expects THREE frames — one landscape anchor and two
    stepped portraits — so the selection is capped at three rather than
    allowed to reflow the grid into something it was not designed for.
    Choosing more in Studio simply means the first three show.

    An empty or unresolvable selection falls back to the verified local
    set, which is what renders today.
  */
  const selected = home.selectedProjectIds
    .map((id) => all.find((project) => project.id === id))
    .filter((project): project is (typeof all)[number] => Boolean(project))
    .slice(0, 3);

  const projects = selected.length > 0 ? selected : localProjects;

  /*
    The composition is a landscape anchor plus two stepped portraits —
    6 + 3 + 3 of twelve columns. That only adds up when the set actually
    contains a landscape frame, and it will not always: the library is
    portrait-heavy, and Renan now picks these projects himself in Studio.
    Without a landscape lead the row used to come out 3 + 3 + 3, leaving a
    quarter of the grid empty.

    So the anchored layout is used when the set can carry it, and three
    equal columns when it cannot. The stepped offsets do the work of
    breaking the baseline either way.
  */
  const anchored = projects.length === 3 && projects[0]?.span === "wide";

  return (
    <section className="bg-bone text-ink">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionLabel>Projects</SectionLabel>
          <h2 className="mt-6">Recent works</h2>
        </Reveal>

        <ul className="mt-14 grid items-start gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:mt-20 lg:grid-cols-12">
          {projects.map((project, index) => {
            const shape = SHAPE[project.span];

            return (
              <Reveal
                key={project.id}
                as="li"
                /*
                  A fade, not a rise — the same reason the /portfolio grid
                  uses one. Travel plus a per-card delay means the row
                  climbs into place as a staircase for most of a second,
                  which is the very thing this section was just levelled
                  to stop showing.
                */
                y={0}
                delay={index * STAGGER}
                className={anchored ? shape.column : "lg:col-span-4"}
              >
                {/* The PROJECT, not the service page. A visitor clicking a
                    photograph of finished work expects to see that job. */}
                <Link href={`/projects/${project.slug}`} className="group block">
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
                      // project title. A verbatim alt would be prepended
                      // to that name and read twice.
                      alt=""
                      fill
                      quality={72}
                      sizes={
                        anchored
                          ? shape.sizes
                          : "(min-width: 1024px) 31vw, (min-width: 640px) 45vw, 100vw"
                      }
                      className={cn(
                        "object-cover object-center transition-transform duration-700 ease-out",
                        "group-hover:scale-[1.03] group-focus-visible:scale-[1.03]",
                      )}
                    />
                  </div>

                  {/* Hairline, then the category — the same rule language
                      the rest of the page uses to separate, rather than a
                      caption box under the image. */}
                  <div className="mt-5 border-t border-hairline-light pt-4">
                    <p className="eyebrow text-moss">
                      {project.serviceCategory}
                    </p>
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-6">
                    <h3
                      className={cn(
                        "text-h5 leading-[1.2] tracking-[-0.01em]",
                        "transition-transform duration-300 ease-out",
                        "group-hover:translate-x-1 group-focus-visible:translate-x-1",
                      )}
                    >
                      {project.title}
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
