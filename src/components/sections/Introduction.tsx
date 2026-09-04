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
 * COMPOSITION, and the reason it changed.
 *
 * The photograph used to sit in columns 7-12 of a second row, mirroring
 * the copy above it. That left columns 1-6 of that row completely empty —
 * a ~890x600px void under the heading that read as a rendering fault
 * rather than as negative space, because nothing anchored it.
 *
 * The fix is structural, not cosmetic: the media now spans columns 4-12
 * (three quarters of the width) and its row gap is tightened, so it reads
 * as an editorial media block anchoring the section instead of a small
 * attachment hanging off the right column. What remains empty is a
 * three-column margin, which is a margin — the shape a reader expects.
 *
 * The aspect also changes with the breakpoint: 4:5 portrait while the
 * image is narrow on mobile, 16:10 once it is wide enough that a tall
 * crop would push the following section off the screen.
 */
export function Introduction() {
  return (
    <section className="bg-bone text-ink">
      <Container className="py-20 lg:py-28">
        {/* gap-y is deliberately tighter than gap-x: the media should sit
            close under the copy it belongs to, not float away from it. */}
        <div className="grid gap-y-10 border-t border-hairline-light pt-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12 lg:pt-14">
          <Reveal className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
            <SectionLabel index="01">{introduction.eyebrow}</SectionLabel>
            {/* Measure is looser on mobile: 15ch at the small end of the h2
                clamp leaves a near-empty right margin and risks one-word
                lines, which DESIGN.md treats as a failure. */}
            <h2 className="mt-6 max-w-[20ch] lg:mt-8 lg:max-w-[15ch]">
              {introduction.heading}
            </h2>
          </Reveal>

          {/* Lead paragraph in ink, supporting paragraph in moss — one step
              of hierarchy inside the copy block, without a second heading. */}
          <div className="max-w-[46ch] space-y-5 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-end">
            {introduction.body.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0 ? "text-body-lg text-ink" : "text-body text-moss"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Its own cell rather than part of the heading group, so the
              DOM order is heading -> copy -> link -> image. That is the
              right reading order on mobile: the link should follow the
              copy it concludes, not interrupt it. On desktop it returns
              to the foot of the heading column. */}
          {/* Row 2, beside the media rather than under the heading.
              Sharing the heading's cell made the two overlap; moving it
              here both fixes that and gives the otherwise-empty left of
              the media row something to hold, so the link anchors the
              composition instead of trailing off the heading. */}
          <div className="lg:col-span-3 lg:col-start-1 lg:row-start-2 lg:self-start">
            <ArrowLink href="/about">About BOVI</ArrowLink>
          </div>

          <Reveal
            as="figure"
            delay={0.1}
            className="relative aspect-[4/5] w-full overflow-hidden rounded-sm sm:aspect-[3/2] lg:col-span-9 lg:col-start-4 lg:row-start-2 lg:aspect-[16/10]"
          >
            <Image
              src={introduction.image.src}
              alt={introduction.image.alt}
              fill
              quality={72}
              sizes="(min-width: 1024px) 72vw, 100vw"
              /* The technician sits in the upper-left of the frame; a
                 centred crop pushes them out at wide aspects. */
              className="object-cover object-[35%_35%]"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
