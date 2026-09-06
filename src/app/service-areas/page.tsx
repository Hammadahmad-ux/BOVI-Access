import type { Metadata } from "next";
import { business, audiences } from "@/lib/config/site";
import { coverage } from "@/lib/content/home";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Button } from "@/components/ui/Button";
import { STAGGER } from "@/lib/animations/motion";

export const metadata: Metadata = buildMetadata({
  title: "Service Areas",
  description: `${business.name} supports commercial maintenance and access projects across ${business.coverage}. Tell us the building location and we will confirm whether we can attend.`,
  path: "/service-areas",
});

/**
 * Service Areas.
 *
 * The coverage statement is exactly what the client has approved and no
 * more. There are deliberately NO named boroughs, counties, postcodes or
 * radii, and no map — a coverage map is a factual claim about where a
 * contractor will travel, and that claim has not been verified.
 * See CONTENT-RULES.md §5.
 *
 * The page answers the question a property manager actually has ("will you
 * come to my building?") by explaining how location is assessed and
 * inviting them to ask, rather than by drawing a boundary.
 */

const propertyTypes = [
  {
    title: "Managed residential blocks",
    body: "Planned maintenance and reactive callouts across managing agent portfolios.",
  },
  {
    title: "Commercial offices",
    body: "Facade, glazing and envelope works on occupied office buildings.",
  },
  {
    title: "Mixed-use and retail",
    body: "Works scheduled around trading hours and public frontage.",
  },
  {
    title: "Industrial and logistics",
    body: "High-level gutter, roofline and external pipework maintenance.",
  },
] as const;

const assessmentSteps = [
  {
    index: "01",
    title: "Location and access",
    body: "Where the building is, what surrounds it, and whether the elevation can be reached from roof-level anchors.",
  },
  {
    index: "02",
    title: "Scope and elevation",
    body: "Which elevation and which levels are affected, and whether the work is localised or runs the full height.",
  },
  {
    index: "03",
    title: "Practicality",
    body: "Whether rope access is genuinely the right method. If it is not, we will say so rather than take the job.",
  },
] as const;

export default function ServiceAreasPage() {
  return (
    <>
      <PageHero
        eyebrow="Service Areas"
        title={["Commercial rope access", "across London and beyond."]}
        lead={`${business.name} supports commercial maintenance and access projects across London and surrounding areas.`}
        height="standard"
      />

      {/* ---------------- Coverage statement ---------------- */}
      <section
        data-ground="dark"
        className="relative isolate overflow-hidden bg-ink text-bone"
      >
        {/*
          Decorative measured linework — the feel of a survey drawing, not
          cartography. It states nothing about where BOVI works.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, #F5F4F0 0 1px, transparent 1px 96px), repeating-linear-gradient(to bottom, #F5F4F0 0 1px, transparent 1px 96px)",
          }}
        />

        <Container className="relative z-10 py-20 lg:py-28">
          <Reveal>
            <SectionLabel ground="dark">
              Coverage
            </SectionLabel>
          </Reveal>

          <Reveal delay={STAGGER}>
            <p className="mt-8 font-display text-h2 leading-[0.9] font-extrabold tracking-[-0.035em] uppercase sm:text-h1">
              {coverage.lines.map((line, i) => (
                <span
                  key={line}
                  className={i === 1 ? "block text-green" : "block"}
                >
                  {line}
                </span>
              ))}
            </p>
          </Reveal>

          <Reveal delay={STAGGER * 2}>
            <div className="mt-12 grid gap-8 border-t border-hairline-dark pt-10 lg:grid-cols-12 lg:gap-16">
              <p className="max-w-[52ch] text-body-lg text-mist lg:col-span-6">
                {coverage.body} If your building sits outside our usual
                coverage, ask — we will tell you plainly whether we can attend
                rather than quote for a job we cannot service properly.
              </p>
              <div className="lg:col-span-5 lg:col-start-8">
                <Button href="/contact" size="lg">
                  Check your location
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ---------------- Property types ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <Reveal>
            <SectionLabel>Property types</SectionLabel>
            <h2 className="mt-6 max-w-[18ch] text-h2">
              The buildings we work on.
            </h2>
          </Reveal>

          <ul className="mt-12 grid border-t border-hairline-light sm:grid-cols-2">
            {propertyTypes.map((type, i) => (
              <Reveal
                as="li"
                key={type.title}
                delay={Math.min(i * STAGGER, 0.2)}
                className="border-b border-hairline-light py-7 pr-8 sm:even:border-l sm:even:pl-8"
              >
                <h3 className="text-h5">{type.title}</h3>
                <p className="mt-2 max-w-[42ch] text-body text-moss">
                  {type.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------------- How location is assessed ---------------- */}
      <section data-ground="dark" className="bg-ink-raised text-bone">
        <Container className="py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <SectionLabel ground="dark">
                Assessment
              </SectionLabel>
              <h2 className="mt-6 max-w-[14ch] text-h2">
                How we assess a location.
              </h2>
            </Reveal>

            <ol className="lg:col-span-7 lg:col-start-6">
              {assessmentSteps.map((step, i) => (
                <Reveal
                  as="li"
                  key={step.index}
                  delay={Math.min(i * STAGGER, 0.2)}
                  className="flex gap-6 border-t border-hairline-dark py-7 last:border-b"
                >
                  <span
                    aria-hidden="true"
                    className="eyebrow shrink-0 text-green-bright"
                  >
                    {step.index}
                  </span>
                  <span>
                    <h3 className="text-h5">{step.title}</h3>
                    <p className="mt-2 max-w-[46ch] text-body text-mist">
                      {step.body}
                    </p>
                  </span>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* ---------------- Who we work with ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-24">
          <Reveal>
            <SectionLabel>Enquiries</SectionLabel>
            <h2 className="mt-6 max-w-[20ch] text-h3">
              Most enquiries reach us from one of these four.
            </h2>
          </Reveal>

          <ul className="mt-12 grid border-t border-hairline-light sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map((audience, i) => (
              <Reveal
                as="li"
                key={audience}
                delay={Math.min(i * STAGGER, 0.2)}
                className="border-b border-hairline-light py-7 pr-6 lg:not-first:border-l lg:not-first:pl-7"
              >
                <span aria-hidden="true" className="eyebrow block text-green">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-h5">{audience}</h3>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
