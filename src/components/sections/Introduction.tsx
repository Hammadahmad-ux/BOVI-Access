import Image from "next/image";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { introduction } from "@/lib/content/home";

/**
 * Homepage section 01 — the positioning statement that follows the hero.
 *
 * The composition hangs everything from a single hairline datum running the
 * full container width. That rule is the section's only ornament; the
 * architectural register is meant to come from alignment and empty space,
 * not from added marks.
 *
 * DOM order IS the mobile order (label, heading, photograph, copy, link).
 * The desktop two-column arrangement is done purely with explicit grid
 * placement rather than `order-*`, so reading order stays correct for screen
 * readers and keyboard users at every width.
 *
 * The heading is deliberately left in sentence case. Uppercase is reserved
 * for the hero H1 and the closing CTA — a 55-character sentence set in
 * uppercase Archivo at the h2 step would compete with the hero directly
 * above it rather than follow it.
 *
 * The photograph is portrait (1200x1600) and is given a tall 4:5 box so it
 * runs down well past the heading. The left column therefore ends higher
 * than the right — that asymmetry is the point.
 *
 * The ArrowLink sits directly under the heading rather than being pinned to
 * the bottom of the column. Pinning it aligned the two columns' closing
 * lines, but it left a ~500px gap between the heading and the link, which
 * reads as a rendering fault rather than as negative space. Short column,
 * tall column, clean break.
 */
export function Introduction() {
  return (
    <section className="bg-bone text-ink">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-y-12 border-t border-hairline-light pt-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-16 lg:pt-14">
          <Reveal className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <SectionLabel index="01">{introduction.eyebrow}</SectionLabel>
            {/* Measure is looser on mobile: 15ch at the small end of the h2
                clamp leaves a near-empty right margin and risks one-word
                lines, which DESIGN.md treats as a failure. */}
            <h2 className="mt-6 max-w-[20ch] lg:mt-8 lg:max-w-[15ch]">
              {introduction.heading}
            </h2>
            <div className="mt-10 lg:mt-12">
              <ArrowLink href="/about">About BOVI</ArrowLink>
            </div>
          </Reveal>

          <Reveal
            as="figure"
            delay={0.1}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-sm lg:col-span-6 lg:col-start-7 lg:row-start-2"
          >
            <Image
              src={introduction.image.src}
              alt={introduction.image.alt}
              fill
              quality={72}
              sizes="(min-width: 1440px) 660px, (min-width: 1024px) 46vw, 100vw"
              className="object-cover object-center"
            />
          </Reveal>

          {/* Lead paragraph in ink, supporting paragraph in moss — one step
              of hierarchy inside the copy block, without a second heading. */}
          <div className="max-w-[46ch] space-y-5 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-start">
            {introduction.body.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? "text-body-lg text-ink"
                    : "text-body text-moss"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

        </div>
      </Container>
    </section>
  );
}
