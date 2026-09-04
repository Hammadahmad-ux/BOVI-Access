import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { business, services } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "@/components/sections/PageHeader";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description: `Commercial window cleaning, repointing, gutter clearance, external pipe repairs, mastic and DOFF cleaning delivered by rope access across ${business.coverage}.`,
  path: "/services",
});

/**
 * PHASE 2 replaces this list with the sticky-image / numbered-row editorial
 * interaction described in DESIGN.md. The route, data source and URLs do
 * not change when it does.
 */
export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="High-level access, repair and maintenance"
        intro={`Specialist works delivered by rope access on commercial buildings across ${business.coverage}.`}
      />

      <section className="bg-bone">
        <Container className="py-16 lg:py-24">
          <ul>
            {services.map((service) => (
              <li
                key={service.slug}
                className="border-t border-hairline-light last:border-b"
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex items-center gap-5 py-7 lg:gap-10 lg:py-9"
                >
                  <span aria-hidden="true" className="eyebrow w-8 shrink-0 text-green">
                    {service.index}
                  </span>
                  <span className="flex-1 font-display text-h3 font-bold tracking-[-0.022em] transition-colors group-hover:text-green">
                    {service.name}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-6 shrink-0 text-moss transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-green"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
