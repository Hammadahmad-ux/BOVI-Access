import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ServicePage } from "@/lib/content/services";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STAGGER } from "@/lib/animations/motion";

type RelatedServicesProps = {
  currentSlug: string;
  /**
   * Curated sibling slugs, from the Sanity `relatedServices[]` field or
   * the local baseline. Each service picks its own, so no two pages show
   * the same trio — which is what makes internal linking useful rather
   * than decorative.
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
 * Falls back to the next services in configured order if no curation is
 * supplied, so the component can never render an empty or duplicated list.
 */
export function RelatedServices({
  currentSlug,
  slugs,
  all,
  limit = 3,
}: RelatedServicesProps) {
  const bySlug = new Map(all.map((service) => [service.slug, service]));

  const curated = (slugs ?? [])
    .filter((slug) => slug !== currentSlug)
    // A curated slug that no longer resolves — the service was
    // unpublished or renamed — is dropped rather than rendered as a dead
    // link. The fallback below then makes up the difference.
    .map((slug) => bySlug.get(slug))
    .filter((s): s is ServicePage => Boolean(s));

  let ordered = curated.slice(0, limit);

  if (ordered.length === 0) {
    const others = all.filter((s) => s.slug !== currentSlug);
    const start = Math.max(
      0,
      all.findIndex((s) => s.slug === currentSlug),
    );
    ordered = [...others.slice(start), ...others.slice(0, start)].slice(
      0,
      limit,
    );
  }

  if (ordered.length === 0) return null;

  return (
    <section data-ground="dark" className="bg-ink text-bone">
      <Container className="py-20 lg:py-24">
        <Reveal>
          <SectionLabel ground="dark">Related services</SectionLabel>
        </Reveal>

        <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((service, i) => (
            <Reveal
              as="li"
              key={service.slug}
              delay={Math.min(i * STAGGER, 0.2)}
            >
              <Link
                href={`/services/${service.slug}`}
                className="group flex flex-col gap-5"
              >
                <span className="relative block aspect-[5/4] overflow-hidden rounded-sm bg-ink-raised">
                  {service.heroMedia ? (
                    <Image
                      src={service.heroMedia.src}
                      /* Decorative: the link is already named by the service
                         title below, so a verbatim alt would be read twice. */
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                      quality={72}
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                    />
                  ) : null}
                </span>

                <span className="flex items-start justify-between gap-4">
                  <span className="font-display text-h4 font-semibold transition-colors group-hover:text-green-bright">
                    {service.name}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-mist transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-green-bright"
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
