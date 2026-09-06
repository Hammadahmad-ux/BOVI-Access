import Image from "next/image";
import { featuredProject } from "@/lib/content/home";
import { getHomepage, getProjects } from "@/lib/content/provider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STAGGER } from "@/lib/animations/motion";

/**
 * Homepage featured project.
 *
 * DESIGNED AROUND AN ABSENCE. No project name, client, location, value or
 * date has been verified (CONTENT-RULES.md §2), so there is deliberately no
 * metadata table — a spec list with empty or invented rows is precisely the
 * failure this section is shaped to avoid. The photograph and the heading
 * carry the block. The service category is the only fact shown, and it comes
 * from the photograph's own provenance.
 *
 * `View project` resolves to /portfolio, not a project detail page. No detail
 * route exists because no project has been verified, so /portfolio is the
 * genuine destination — not a placeholder standing in for a future one.
 *
 * Composition: the photograph runs off the RIGHT gutter from lg up, with the
 * copy vertically centred beside it. It bleeds right rather than left so it
 * does not echo the sticky image on the service index immediately above.
 */

/**
 * Media frame. Left and right margins are set separately rather than via
 * `mx`, so the lg reset (`lg:ml-0`) cannot collide with the persisting right
 * bleed — two different properties, no cascade-order dependency.
 *
 * Desktop keeps the source's native 3:4 so the full-height rope lines are
 * never cropped. Below lg the frame is squarer, because a full-bleed 3:4 at
 * tablet width would stand taller than the viewport.
 */
const mediaFrame =
  "relative aspect-[4/5] overflow-hidden bg-ink " +
  "-ml-(--spacing-gutter) -mr-(--spacing-gutter) " +
  "md:-ml-(--spacing-gutter-lg) md:-mr-(--spacing-gutter-lg) " +
  "lg:col-span-7 lg:ml-0 lg:aspect-[3/4]";

export async function FeaturedProject() {
  const [home, projects] = await Promise.all([getHomepage(), getProjects()]);

  /*
    Renan picks the featured project in Studio. Only its PHOTOGRAPH and
    SERVICE CATEGORY are taken from it — the heading and the supporting
    paragraph stay in code, because they are the section's designed argument
    rather than project metadata.

    That restraint is the same one the section was built around: no project
    name, client, location, value or date is shown, because none has been
    verified (CONTENT-RULES.md §2). Selecting a project here does not change
    that; it changes which photograph carries the block.

    Nothing selected, or a selection that no longer resolves, falls back to
    the verified local frame.
  */
  const selected = home.featuredProjectId
    ? projects.find((project) => project.id === home.featuredProjectId)
    : undefined;

  const image = selected?.image ?? featuredProject.image;
  const serviceCategory =
    selected?.serviceCategory ?? featuredProject.serviceCategory;

  // Goes to the JOB, not to /portfolio and not to a service page. The
  // fallback names the project its own photograph came from, so the link
  // is still specific when nothing is selected in Studio.
  const projectSlug = selected?.slug ?? featuredProject.projectSlug;

  return (
    <section
      data-ground="dark"
      aria-labelledby="featured-project-heading"
      className="border-t border-hairline-dark bg-ink-raised text-bone"
    >
      <Container className="py-20 lg:py-28">
        <SectionLabel index="03" ground="dark">
          Featured Project
        </SectionLabel>

        <div className="mt-6 grid gap-12 border-t border-hairline-dark pt-12 lg:mt-8 lg:grid-cols-12 lg:items-center lg:gap-x-16 lg:pt-16">
          <Reveal className="lg:col-span-5">
            {/* Green marker echoes the hero trust rail. green-bright, not
                green: this is small text on a dark ground. */}
            <p className="eyebrow flex items-center gap-2.5 text-green-bright">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 bg-green-bright"
              />
              {serviceCategory}
            </p>

            {/* Measure capped at 20ch so the heading still breaks
                editorially in the wide single-column tablet layout.
                `text-wrap: balance` is already global — see globals.css. */}
            <h2 id="featured-project-heading" className="mt-6 max-w-[20ch]">
              {featuredProject.heading}
            </h2>

            <p className="mt-7 max-w-[46ch] text-body-lg text-mist">
              {featuredProject.body}
            </p>

            <ArrowLink href={`/projects/${projectSlug}`} ground="dark" className="mt-8">
              View project
            </ArrowLink>
          </Reveal>

          <Reveal as="figure" delay={STAGGER} y={28} className={mediaFrame}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              quality={72}
              className="object-cover"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
