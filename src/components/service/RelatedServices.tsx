import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ServicePage } from "@/lib/content/services";
import { focalPointStyle } from "@/lib/sanity/focal-point";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STAGGER } from "@/lib/animations/motion";

type RelatedServicesProps = {
  currentSlug: string;
  /**
   * Curated sibling slugs, from the Sanity `relatedServices[]` field or
   * the local baseline. Each service picks its own, so the links are
   * genuinely relevant rather than decorative. Fewer than `limit` is
   * fine — the row is topped up from the remaining services below.
   */
  slugs?: readonly string[];
  /**
   * Every service the site currently has, RESOLVED — local and CMS-only
   * together. Passed in rather than looked up here, because this is a
   * presentational component and the local lookup it used to do could
   * not see services that exist only in Sanity: a page could neither
   * link to a new service nor be linked from one.
   */
  all: readonly ServicePage[];
  limit?: number;
};

/**
 * Internal linking between service pages.
 *
 * Shows up to `limit` cards: the curated siblings first, then — if that
 * leaves the four-card row short — the next services in configured order,
 * skipping the current page and anything already shown. So the row is
 * always full and never duplicated, whether a page curated three links,
 * one, or none.
 */
export function RelatedServices({
  currentSlug,
  slugs,
  all,
  limit = 4,
}: RelatedServicesProps) {
  const bySlug = new Map(all.map((service) => [service.slug, service]));

  const curated = (slugs ?? [])
    .filter((slug) => slug !== currentSlug)
    // A curated slug that no longer resolves — the service was
    // unpublished or renamed — is dropped rather than rendered as a dead
    // link. The top-up below then makes up the difference.
    .map((slug) => bySlug.get(slug))
    .filter((s): s is ServicePage => Boolean(s));

  const ordered = curated.slice(0, limit);

  // Top up to `limit` from the remaining services, in configured order
  // starting after the current one. The section is a designed four-card
  // row: three curated links plus one sibling reads as a full row, where
  // three alone left a visible gap once the grid went to four columns.
  // A page with no curation at all falls through to the same list.
  if (ordered.length < limit) {
    const chosen = new Set(ordered.map((s) => s.slug));
    chosen.add(currentSlug);

    const start = Math.max(
      0,
      all.findIndex((s) => s.slug === currentSlug),
    );
    const rotated = [...all.slice(start), ...all.slice(0, start)];

    for (const service of rotated) {
      if (ordered.length >= limit) break;
      if (chosen.has(service.slug)) continue;
      chosen.add(service.slug);
      ordered.push(service);
    }
  }

  if (ordered.length === 0) return null;

  return (
    <section data-ground="dark" className="bg-ink text-bone">
      <Container className="py-20 lg:py-24">
        <Reveal>
          <SectionLabel ground="dark">Related services</SectionLabel>
        </Reveal>

        {/*
          Four across from `xl` up (1280+), where the cards have room to
          stay premium; three at the 1024 laptop edge rather than crushing
          four into ~210px; two on a tablet, one on a phone. The cards are
          deliberately compact — a smaller title, an arrow to match, and
          tighter gutters — so the four-up row reads full without crowding.
        */}
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ordered.map((service, i) => (
            <Reveal
              as="li"
              key={service.slug}
              delay={Math.min(i * STAGGER, 0.2)}
            >
              <Link
                href={`/services/${service.slug}`}
                className="group flex flex-col gap-4"
              >
                <span className="relative block aspect-[5/4] overflow-hidden rounded-sm bg-ink-raised">
                  {service.heroMedia ? (
                    <Image
                      src={service.heroMedia.src}
                      /* Decorative: the link is already named by the service
                         title below, so a verbatim alt would be read twice. */
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 21vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                      quality={72}
                      /* Follows the Sanity hotspot Renan sets in Studio;
                         centres for services still on local imagery. */
                      style={focalPointStyle(service.heroMedia)}
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                    />
                  ) : null}
                </span>

                {/* Reserves two lines for the title so a one-line name and
                    a wrapped one leave the card the same height — every card
                    stays level, in its row and across rows, whether or not
                    a service name wraps. ~2x the h5 line height. */}
                <span className="flex min-h-[3.9rem] items-start justify-between gap-3">
                  <span className="font-display text-h5 font-semibold transition-colors group-hover:text-green-bright">
                    {service.name}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-mist transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-green-bright"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
