import Link from "next/link";
import { services } from "@/lib/config/site";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

type RelatedServicesProps = {
  currentSlug: string;
  /** How many sibling services to surface. */
  limit?: number;
};

/**
 * Internal linking between service pages. Sanity will later allow Renan to
 * curate this per service via `relatedServices[]`; until then it falls
 * through to the next services in configured order, which is deterministic
 * and never produces an empty or duplicated list.
 */
export function RelatedServices({
  currentSlug,
  limit = 3,
}: RelatedServicesProps) {
  const others = services.filter((service) => service.slug !== currentSlug);
  const startIndex = services.findIndex((s) => s.slug === currentSlug);
  const ordered = [
    ...others.slice(startIndex),
    ...others.slice(0, startIndex),
  ].slice(0, limit);

  if (ordered.length === 0) return null;

  return (
    <section className="bg-bone">
      <Container className="py-16 lg:py-24">
        <SectionLabel>Related services</SectionLabel>
        <ul className="mt-8 grid gap-px border border-hairline-light bg-hairline-light sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((service) => (
            <li key={service.slug} className="bg-bone">
              <Link
                href={`/services/${service.slug}`}
                className="flex h-full flex-col gap-3 p-7 transition-colors hover:bg-pure"
              >
                <span aria-hidden="true" className="eyebrow text-green">
                  {service.index}
                </span>
                <span className="font-display text-h4 font-600">
                  {service.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
