import Link from "next/link";
import { primaryServices, services } from "@/lib/config/site";
import { getServiceContent, servicesIntro } from "@/lib/content/home";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  ServiceIndexRows,
  type ServiceIndexRow,
} from "@/components/sections/ServiceIndexRows";

/**
 * Homepage section 02 — the service index. The signature block on the page
 * and the primary route into /services/<slug>.
 *
 * This file stays a Server Component: the join between the service list
 * (src/lib/config/site.ts, which owns order, names and numerals) and the
 * editorial content (src/lib/content/home.ts, which owns descriptions and
 * imagery) happens once at build time and ships as a plain array. Only the
 * hover/focus behaviour is client-side, in ServiceIndexRows. When Phase 4
 * swaps the content module for a Sanity query, this join is the only thing
 * that changes.
 *
 * `flatMap` rather than `map` + non-null assertion: a service configured
 * without editorial content is dropped rather than rendered as a row with
 * a missing description and a broken image.
 */
export function ServiceIndex() {
  const rows: ServiceIndexRow[] = primaryServices.flatMap((service) => {
    const content = getServiceContent(service.slug);
    if (!content) return [];

    return [
      {
        slug: service.slug,
        name: service.name,
        index: service.index,
        description: content.description,
        image: { src: content.image.src, alt: content.image.alt },
      },
    ];
  });

  const secondaryServices = services.filter((service) => !service.primary);

  return (
    <section data-ground="dark" className="bg-ink text-bone">
      <Container className="py-20 lg:py-32">
        <Reveal>
          <SectionLabel index="02" ground="dark">
            Services
          </SectionLabel>

          {/*
            Heading and standfirst sit on one baseline band rather than
            stacked centre — the same asymmetric opening the rest of the
            page uses.
          */}
          <div className="mt-6 lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-16">
            <h2 className="max-w-[15ch] uppercase lg:col-span-7">
              {servicesIntro.heading}
            </h2>
            <p className="mt-6 max-w-[46ch] text-body-lg text-mist lg:col-span-5 lg:mt-0">
              {servicesIntro.body}
            </p>
          </div>
        </Reveal>

        <ServiceIndexRows rows={rows} className="mt-14 lg:mt-24" />

        {/*
          The two non-primary services. Deliberately quiet — they are real
          capabilities, but they are not what the six-row index is arguing.
        */}
        <Reveal
          delay={0.08}
          className="mt-14 border-t border-hairline-dark pt-8 lg:mt-20"
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
              <p className="eyebrow text-mist">Also delivered</p>

              <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-8">
                {secondaryServices.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="group/also inline-flex min-h-11 items-center gap-3 text-body text-bone transition-colors hover:text-green-bright"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1.5 shrink-0 bg-green-bright"
                      />
                      <span className="border-b border-transparent pb-0.5 transition-colors group-hover/also:border-current">
                        {service.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <ArrowLink href="/services" ground="dark" className="shrink-0">
              All services
            </ArrowLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
