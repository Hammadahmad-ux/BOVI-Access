import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STAGGER } from "@/lib/animations/motion";
import type { ServicePage } from "@/lib/content/services";

/**
 * The body of every service page: overview, what we deliver, access and
 * delivery, and suitable property types.
 *
 * All eight service pages render through this one component. Variation
 * comes from the DATA — copy, imagery, related services — not from
 * bespoke layouts, so the pages stay a single designed system.
 *
 * The one composition variable is `flip`, derived from the service's
 * position in the index: alternating the media side stops eight pages
 * built from one template reading as eight copies of the same page.
 *
 * IMAGERY
 *
 * `service.gallery` is optional and comes from the same field on the
 * Sanity `service` document, so Renan can change these in Studio. The
 * template adapts to whatever it is given rather than requiring a set
 * number of photographs:
 *
 *   gallery[0]        the large "Access and delivery" image
 *   gallery[1] + [2]  the asymmetric pair under the overview
 *   (none)            the page renders exactly as it did before
 *
 * The pair needs BOTH entries. A single image dropped into a two-column
 * composition reads as a missing one, so it is not rendered at all.
 *
 * Until this pass the "Access and delivery" figure re-used `heroMedia`,
 * so every service page showed the same photograph twice. gallery[0]
 * replaces it where one exists.
 */
export function ServiceBody({ service }: { service: ServicePage }) {
  const flip = Number(service.index) % 2 === 0;

  const gallery = service.gallery ?? [];
  const deliveryMedia = gallery[0] ?? service.heroMedia;
  const pair = gallery[1] && gallery[2] ? [gallery[1], gallery[2]] : null;

  return (
    <>
      {/* ---------------- Overview ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* The heading always leads on the left. Flipping this pair
                put the body copy visually ahead of the heading it belongs
                to, which reads wrong even though the DOM order was right.
                Alternation is carried by the media block below instead. */}
            <Reveal className="lg:col-span-5 lg:col-start-1 lg:row-start-1">
              <SectionLabel index="01">Overview</SectionLabel>
              <h2 className="mt-6 max-w-[16ch] text-h3">
                {service.name}, delivered at height.
              </h2>
            </Reveal>

            <div className="flex max-w-[52ch] flex-col gap-5 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:self-center">
              {service.overview.map((paragraph, i) => (
                <p
                  key={paragraph}
                  className={
                    i === 0 ? "text-body-lg text-ink" : "text-body text-moss"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/*
            Asymmetric pair — a wider frame carrying the work, a narrower
            one carrying the context, the second dropped down the page so
            the two read as a composition rather than a row of cards.

            The offset is desktop-only: on a phone they simply stack, and
            a top margin there would just be a gap.

            Both boxes stay PORTRAIT at every width. A landscape mobile
            crop was tried and cut the heads off technicians — the source
            library is almost entirely 3:4 phone photography, so a wide
            box has to throw away most of the frame (DESIGN.md §6).
          */}
          {pair ? (
            <div className="mt-16 grid gap-6 sm:grid-cols-12 lg:mt-24 lg:gap-8">
              <Reveal
                as="figure"
                className="relative aspect-[3/4] overflow-hidden rounded-sm sm:col-span-7"
              >
                <Image
                  src={pair[0].src}
                  alt={pair[0].alt}
                  fill
                  sizes="(min-width: 640px) 46vw, 100vw"
                  quality={72}
                  className="object-cover object-center"
                />
              </Reveal>

              <Reveal
                as="figure"
                delay={STAGGER}
                className="relative aspect-[4/5] overflow-hidden rounded-sm sm:col-span-5 sm:mt-16 lg:mt-24"
              >
                <Image
                  src={pair[1].src}
                  alt={pair[1].alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  quality={72}
                  className="object-cover object-center"
                />
              </Reveal>
            </div>
          ) : null}
        </Container>
      </section>

      {/* ---------------- What we deliver ---------------- */}
      <section data-ground="dark" className="bg-ink text-bone">
        <Container className="py-20 lg:py-28">
          <Reveal>
            <SectionLabel index="02" ground="dark">
              What we deliver
            </SectionLabel>
            <h2 className="mt-6 max-w-[18ch] text-h3">
              Typical scope of works.
            </h2>
          </Reveal>

          <ul className="mt-12 grid border-t border-hairline-dark sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
            {service.commonWorks.map((work, i) => (
              <Reveal
                as="li"
                key={work}
                delay={Math.min(i * STAGGER, 0.28)}
                className="flex items-start gap-4 border-b border-hairline-dark py-6 pr-6"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 bg-green-bright"
                />
                <span className="text-body-lg">{work}</span>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------------- Access & delivery ---------------- */}
      <section data-ground="dark" className="bg-ink-raised text-bone">
        <Container className="py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <Reveal
              as="figure"
              className={
                flip
                  ? "relative aspect-[4/5] overflow-hidden rounded-sm lg:col-span-6 lg:col-start-7"
                  : "relative aspect-[4/5] overflow-hidden rounded-sm lg:col-span-6 lg:col-start-1"
              }
            >
              <Image
                src={deliveryMedia.src}
                alt={deliveryMedia.alt}
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                quality={72}
                className="object-cover object-center"
              />
            </Reveal>

            <div
              className={
                flip
                  ? "lg:col-span-5 lg:col-start-1 lg:row-start-1"
                  : "lg:col-span-5 lg:col-start-8 lg:row-start-1"
              }
            >
              <SectionLabel index="03" ground="dark">
                Access and delivery
              </SectionLabel>
              <h2 className="mt-6 max-w-[16ch] text-h3">
                How the work gets done.
              </h2>
              <ul className="mt-8 flex flex-col">
                {service.delivery.map((item) => (
                  <li
                    key={item}
                    className="border-t border-hairline-dark py-5 text-body text-mist last:border-b"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- Suitable for ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <SectionLabel index="04">Suitable for</SectionLabel>
              <h2 className="mt-6 max-w-[14ch] text-h3">
                Where this service fits.
              </h2>
            </Reveal>

            <ul className="lg:col-span-7 lg:col-start-6">
              {service.suitableFor.map((item, i) => (
                <Reveal
                  as="li"
                  key={item}
                  delay={Math.min(i * STAGGER, 0.24)}
                  className="flex items-baseline gap-5 border-t border-hairline-light py-5 last:border-b"
                >
                  <span aria-hidden="true" className="eyebrow text-green">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-body-lg">{item}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    </>
  );
}
