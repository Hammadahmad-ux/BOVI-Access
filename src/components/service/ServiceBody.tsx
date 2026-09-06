import { ZoomableImage } from "@/components/ui/ZoomableImage";
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
/*
  ONE FRAME FOR EVERY SERVICE PHOTOGRAPH.

  The client: the photographs "look good on phone" but are "too large on
  laptop/desktop" and "should preferably be the same size". They were
  neither. At 1440 this page rendered three figures at 780x1040, 548x685
  and 648x810 — three different sizes, the largest taller than the
  viewport.

  Now all of them share a ratio and a ceiling: 4:5, capped at 400px wide
  from `sm` up, so every photograph on a service page is 400x500 on a
  laptop or desktop no matter which slot it occupies or how many there
  are. Below `sm` the cap does not apply and the images stay full-bleed,
  because that is the presentation he said already works.

  4:5 rather than anything wider for the reason the projects grid found
  the hard way: the library is portrait phone photography, and a
  landscape crop cuts the technician out of the frame entirely.

  A future gallery image added in Studio lands in the same slots and
  inherits all of this without any code change.
*/
const SERVICE_PHOTO_FRAME = "aspect-[4/5]";
const SERVICE_PHOTO_SIZES = "(min-width: 640px) 400px, 100vw";

/**
 * The pair already sits in a two-column grid, so its cells are narrower
 * than the cap until the viewport is wide enough for the cap to bite.
 *
 * Centred in the cell once it does. Left-aligned, a 400px photograph in a
 * 656px cell put all 256px of slack on one side, which is what the client
 * saw as a photograph pushed hard against the edge with a hole beside it.
 */
const PAIR_PHOTO_WIDTH = "mx-auto sm:max-w-[400px]";

/**
 * The delivery photograph sits in a single-column grid until `lg`, so
 * without the half-width rule it rendered 400px wide at 768 next to a
 * pair of 332px ones — same page, three photographs, two sizes. Matching
 * a pair cell (half the container, less half the 1.5rem gap) keeps every
 * service photograph identical at every width from `sm` up.
 */
const DELIVERY_PHOTO_WIDTH =
  "mx-auto sm:max-w-[calc(50%-0.75rem)] lg:max-w-[400px]";

export function ServiceBody({ service }: { service: ServicePage }) {
  const flip = Number(service.index) % 2 === 0;

  const gallery = service.gallery ?? [];
  // May be undefined for a service created in Studio with no imagery yet.
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
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-24 lg:gap-8">
              {pair.map((photo, i) => (
                <Reveal
                  key={photo.src}
                  delay={i * STAGGER}
                  /* The second frame still steps down the page — that is
                     the section's rhythm and the client did not object to
                     it. What changed is that both frames are now the same
                     SIZE, which he did. */
                  className={i === 1 ? "sm:mt-16 lg:mt-24" : undefined}
                >
                  <ZoomableImage
                    image={photo}
                    label={`${service.name}, photograph ${i + 1}`}
                    frameClassName={SERVICE_PHOTO_FRAME}
                    className={PAIR_PHOTO_WIDTH}
                    sizes={SERVICE_PHOTO_SIZES}
                    caption={
                      <span className="text-bone">{service.name}</span>
                    }
                  />
                </Reveal>
              ))}
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
            {/* No photograph is a legitimate state, not a broken one: the
                copy simply takes the width instead of sitting beside a
                reserved empty frame. */}
            {deliveryMedia ? (
              <Reveal
                className={
                  flip
                    ? "lg:col-span-6 lg:col-start-7"
                    : "lg:col-span-6 lg:col-start-1"
                }
              >
                <ZoomableImage
                  image={deliveryMedia}
                  label={`${service.name}, access and delivery`}
                  frameClassName={SERVICE_PHOTO_FRAME}
                  /* Centred in its half of the row rather than pinned to
                     the outer edge. Pinning put the whole 256px of slack
                     between the photograph and the copy on the pages
                     where the image leads. */
                  className={DELIVERY_PHOTO_WIDTH}
                  sizes={SERVICE_PHOTO_SIZES}
                  caption={<span className="text-bone">{service.name}</span>}
                />
              </Reveal>
            ) : null}

            <div
              className={
                !deliveryMedia
                  ? "lg:col-span-8 lg:col-start-1 lg:row-start-1"
                  : flip
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
