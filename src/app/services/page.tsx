import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { business } from "@/lib/config/site";
import { getServices } from "@/lib/content/provider";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { STAGGER } from "@/lib/animations/motion";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description: `Commercial window cleaning, repointing, gutter clearance, external pipe repairs, mastic and DOFF cleaning — delivered by rope access across ${business.coverage}.`,
  path: "/services",
});

/**
 * Services overview.
 *
 * Deliberately NOT the Homepage ServiceIndex. The Homepage uses a sticky
 * stage with compact rows because it has to earn attention in a scroll;
 * this page is where someone has already decided to look, so it gives each
 * service a full alternating editorial row with its photograph, its own
 * one-line scope and a real route.
 *
 * The six primary services get the large treatment. The two secondary
 * services get a tighter pair below — present and properly linked, but not
 * competing with the six.
 */
export const revalidate = 3600;

export default async function ServicesPage() {
  const servicePages = await getServices();
  const primary = servicePages.filter((s) => s.primary);
  const secondary = servicePages.filter((s) => !s.primary);

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={["External building works.", "Without the access limits."]}
        lead="BOVI Access combines specialist rope access with practical external maintenance, so works at height can be surveyed, priced and completed without scaffold or powered access."
        height="standard"
      />

      {/* ---------------- Primary six ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <ul className="flex flex-col gap-20 lg:gap-28">
            {primary.map((service, i) => {
              const flip = i % 2 === 1;

              return (
                <Reveal as="li" key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-16"
                  >
                    <span
                      className={
                        flip
                          ? "relative block aspect-[4/3] overflow-hidden rounded-sm bg-ink-raised lg:col-span-6 lg:col-start-7 lg:aspect-[5/4]"
                          : "relative block aspect-[4/3] overflow-hidden rounded-sm bg-ink-raised lg:col-span-6 lg:col-start-1 lg:aspect-[5/4]"
                      }
                    >
                      {/* A service created in Studio may not have a
                          photograph yet. The frame already carries an ink
                          ground, so omitting the image leaves a clean
                          block rather than a broken one. */}
                      {service.heroMedia ? (
                        <Image
                          src={service.heroMedia.src}
                          /* Decorative: the row link is named by the service
                             title, so a verbatim alt would be read twice. */
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 46vw, 100vw"
                          quality={72}
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                        />
                      ) : null}
                    </span>

                    <span
                      className={
                        flip
                          ? "lg:col-span-5 lg:col-start-1 lg:row-start-1"
                          : "lg:col-span-5 lg:col-start-8 lg:row-start-1"
                      }
                    >
                      <span
                        aria-hidden="true"
                        className="eyebrow block text-green"
                      >
                        {service.index}
                      </span>

                      <span className="mt-4 block font-display text-h3 font-bold tracking-[-0.022em] transition-colors group-hover:text-green">
                        {service.name}
                      </span>

                      <span className="mt-5 block max-w-[46ch] text-body-lg text-moss">
                        {service.intro}
                      </span>

                      <span className="eyebrow mt-7 inline-flex min-h-11 items-center gap-3 text-ink">
                        <span className="border-b border-current pb-1">
                          View service
                        </span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
                        />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* ---------------- Secondary two ---------------- */}
      <section data-ground="dark" className="bg-ink-raised text-bone">
        <Container className="py-20 lg:py-24">
          <Reveal>
            <SectionLabel ground="dark">Also delivered</SectionLabel>
          </Reveal>

          <ul className="mt-10 grid gap-8 md:grid-cols-2 lg:gap-12">
            {secondary.map((service, i) => (
              <Reveal
                as="li"
                key={service.slug}
                delay={Math.min(i * STAGGER, 0.16)}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col gap-5 border-t border-hairline-dark pt-8"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="font-display text-h4 font-semibold transition-colors group-hover:text-green-bright">
                      {service.name}
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="mt-1 size-5 shrink-0 text-mist transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-green-bright"
                    />
                  </span>
                  <span className="max-w-[46ch] text-body text-mist">
                    {service.intro}
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------------- Not sure which service ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <h2 className="max-w-[16ch] text-h3">
                Not sure which service you need?
              </h2>
            </Reveal>

            <div className="lg:col-span-6 lg:col-start-7">
              <p className="max-w-[52ch] text-body-lg text-moss">
                Most enquiries start with a photograph and an address. Send us
                the building location and a short description of the problem,
                and we will tell you which of the above it is — or that it is
                something we do not do.
              </p>

              <ul className="mt-8 flex flex-col">
                {[
                  "Where the building is",
                  "What the issue looks like",
                  "Which elevation or level it affects",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-4 border-t border-hairline-light py-4 text-body last:border-b"
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-green"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <Button href="/contact" size="lg">
                  Request a Quote
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
