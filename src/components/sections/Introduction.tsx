import Image from "next/image";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { introduction } from "@/lib/content/home";
import { getHomepage } from "@/lib/content/provider";

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
 * COMPOSITION
 *
 * Two columns, and only two: the entire text column on the left, the
 * photograph on the right.
 *
 * Earlier versions split heading and copy across the page and dropped the
 * media into a second row. Every one of those left a large empty cell —
 * at worst a ~890x600px void under the heading that read as a rendering
 * fault rather than as negative space. A single text column has no such
 * gap to leave: the reader moves straight down it, and the photograph
 * holds the other half of the page.
 *
 * The figure uses the source's own 3:4 ratio, so the frame is shown
 * WHOLE. The previous 16:10 box cropped most of the picture away.
 */
export async function Introduction() {
  // Copy and photograph come from Studio; the heading, eyebrow, link and
  // the whole composition stay in code. Both fields fall back to the
  // verified local content, so an empty CMS renders exactly as before.
  const home = await getHomepage();
  const body = home.introCopy;
  const image = home.introImage;

  return (
    <section className="bg-bone text-ink">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-y-10 border-t border-hairline-light pt-10 lg:grid-cols-12 lg:gap-x-12 lg:pt-14">
          {/* LEFT: the whole text column — label, heading, copy, link.
              Keeping them together means the reader moves down one column
              instead of tracking across the page, and it leaves no empty
              cell for the media row to sit beside. */}
          <div className="lg:col-span-6 lg:col-start-1">
            <Reveal>
              <SectionLabel index="01">{introduction.eyebrow}</SectionLabel>
              <h2 className="mt-6 max-w-[18ch] lg:mt-8">
                {introduction.heading}
              </h2>
            </Reveal>

            {/* Lead paragraph in ink, supporting paragraph in moss — one
                step of hierarchy inside the copy block, without a second
                heading. */}
            <div className="mt-10 max-w-[46ch] space-y-5 lg:mt-12">
              {body.map((paragraph, index) => (
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

            <div className="mt-10 lg:mt-12">
              <ArrowLink href="/about">About BOVI</ArrowLink>
            </div>
          </div>

          {/* RIGHT: the photograph, at the source's own 3:4 ratio so the
              frame is shown whole. Any other aspect would crop it — the
              earlier 16:10 treatment cut most of the picture away. */}
          <Reveal
            as="figure"
            delay={0.1}
            className="relative aspect-[3/4] w-full overflow-hidden rounded-sm lg:col-span-5 lg:col-start-8 lg:self-start"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={72}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-center"
            />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
