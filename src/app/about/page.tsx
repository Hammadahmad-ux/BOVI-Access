import type { Metadata } from "next";
import Image from "next/image";
import { business, audiences } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { STAGGER } from "@/lib/animations/motion";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: `BOVI Access is a specialist rope access contractor delivering high-level maintenance, repair and cleaning for commercial buildings across ${business.coverage}.`,
  path: "/about",
  ogImage: "/images/about/hero.jpg",
});

/**
 * About / Safety.
 *
 * Deliberately NOT a company-history page: no founding date, headcount,
 * turnover or milestone is known, and inventing them is a content-rules
 * violation. The page earns credibility from METHOD instead — how the work
 * is assessed, planned, accessed and delivered — which is all verifiable
 * and all supplied by the client brief.
 */

const stages = [
  {
    index: "01",
    title: "Assess",
    body: "The elevation is inspected and the access problem is understood before anything is priced. Photographs and a close-range look at the defect, not an assumption from the pavement.",
  },
  {
    index: "02",
    title: "Plan",
    body: "Anchor points, rigging, exclusion zones and programme are worked out against the building as it actually is, and agreed with whoever manages it.",
  },
  {
    index: "03",
    title: "Access",
    body: "Technicians reach the work on rope from anchor points at roof level, which on many buildings means far less to erect at street level than a scaffold or a powered platform would need.",
  },
  {
    index: "04",
    title: "Deliver",
    body: "The work is completed and reported back with photographs, so the person responsible for the building can see what was found and what was done.",
  },
] as const;

const safetyPoints = [
  {
    title: "Site assessment",
    body: "The building is assessed before a method is chosen — structure, anchors, obstructions and what sits below the work.",
  },
  {
    title: "Access planning",
    body: "Rigging and rope routes are planned against the elevation, including how a technician is recovered if they cannot descend.",
  },
  {
    title: "Risk planning",
    body: "Hazards are identified for the specific site rather than copied from a generic template.",
  },
  {
    title: "RAMS-led delivery",
    body: "Site-specific risk assessments and method statements are issued before works begin.",
  },
  {
    title: "Coordination",
    body: "Works are scheduled around occupancy, building operations and anyone else on site.",
  },
  {
    title: "Planned delivery",
    body: "Programme, exclusion zones and reinstatement are agreed in advance, not improvised on the day.",
  },
] as const;

const ropeAccessBenefits = [
  {
    title: "Reaches difficult elevations",
    body: "Lightwells, rear courts, atria and tight street frontages can be reached where scaffold or a platform cannot be positioned.",
  },
  {
    title: "Less dependence on large access systems",
    body: "Where the works are localised, rope access can remove the need for a full scaffold or a powered platform.",
  },
  {
    title: "Helps limit disruption",
    body: "A smaller site footprint usually means fewer closures and less interruption to tenants and building operations.",
  },
  {
    title: "Suits inspection and repair",
    body: "A defect can be inspected at close range and, where the scope allows, repaired in the same visit.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About BOVI"
        title={["Access without limits.", "Work without compromise."]}
        lead={`${business.name} provides specialist high-level access, repair and maintenance for commercial buildings, using rope-access methods to reach difficult areas efficiently and with minimal disruption.`}
        media={{
          src: "/images/about/hero.jpg",
          alt: "A BOVI Access team descending the glazed elevation of a high-rise tower on ropes",
          width: 1200,
          height: 1600,
        }}
        height="tall"
      />

      {/* ---------------- 01 Who we are ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <SectionLabel index="01">Who we are</SectionLabel>
              <h2 className="mt-6 max-w-[14ch] text-h2">
                Specialist access for difficult buildings.
              </h2>
            </Reveal>

            <div className="flex max-w-[52ch] flex-col gap-5 lg:col-span-6 lg:col-start-7 lg:self-center">
              <p className="text-body-lg text-ink">
                BOVI Access is a rope access contractor working on the outside
                of commercial buildings — cleaning, repairing and maintaining
                the parts of a building envelope that are hard to get to.
              </p>
              <p className="text-body text-moss">
                Rope access is our primary method, not an add-on to general
                contracting. That shapes how work is quoted, planned and
                delivered: the access problem is solved first, and the trade
                works around it rather than the other way round.
              </p>
              <p className="text-body text-moss">
                The work is commercial — managed blocks, offices, mixed-use and
                retail buildings across {business.coverage} — and the people we
                deal with are the ones responsible for keeping those buildings
                in condition.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- Large media moment ---------------- */}
      <Reveal
        as="figure"
        className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[21/9]"
      >
        <Image
          src="/images/about/elevation.jpg"
          alt="A tall glazed commercial tower photographed from street level, with rope access technicians working at the crown"
          fill
          sizes="100vw"
          quality={74}
          /*
            THE FOCAL POINT IS THE TOP OF THE TOWER, NOT ITS MIDDLE.

            The source is a 3:4 portrait frame with the technicians on the
            crown at roughly 20-27% of its height. The frame here gets
            progressively wider with the viewport, and `cover` keeps the
            width — so the taller the source is relative to the frame, the
            less of it survives:

              below sm   4:5   shows 94% of the photograph
              sm         16:10 shows 47%
              lg         21:9  shows 32%

            Centred, the widescreen crop showed 34%-66% — the middle of
            the building, with the technicians cut off above it. That is
            exactly what the client reported: correct on a phone, wrong on
            a desktop.

            Biasing the position upward moves the visible band over the
            crown: 12%-44% at lg, 13%-60% at sm. Both were checked against
            renders of the real photograph rather than picked by feel; 12%
            left an expanse of empty sky and 25% pressed the crown against
            the top edge.

            Mobile is untouched. At 94% visible there is almost nothing to
            crop, and its framing was already right.
          */
          className="object-cover object-center sm:object-[50%_25%] lg:object-[50%_18%]"
        />
      </Reveal>

      {/* ---------------- 02 How we work ---------------- */}
      <section data-ground="dark" className="bg-ink text-bone">
        <Container className="py-20 lg:py-28">
          <Reveal>
            <SectionLabel index="02" ground="dark">
              How we work
            </SectionLabel>
            <h2 className="mt-6 max-w-[18ch] text-h2">
              Four stages, every job.
            </h2>
          </Reveal>

          <ol className="mt-14 grid border-t border-hairline-dark lg:mt-20 lg:grid-cols-4">
            {stages.map((stage, i) => (
              <Reveal
                as="li"
                key={stage.index}
                delay={Math.min(i * STAGGER, 0.24)}
                className="flex flex-col gap-4 border-b border-hairline-dark py-8 lg:border-b-0 lg:py-0 lg:pr-8 lg:not-first:border-l lg:not-first:pl-8"
              >
                <span aria-hidden="true" className="eyebrow text-green-bright">
                  {stage.index}
                </span>
                <h3 className="text-h4">{stage.title}</h3>
                <p className="max-w-[40ch] text-body text-mist">{stage.body}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* ---------------- 03 Safety ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <SectionLabel index="03">Safety</SectionLabel>
              <h2 className="mt-6 max-w-[15ch] text-h2">
                Safety starts before anyone leaves the ground.
              </h2>
              <figure className="relative mt-10 hidden aspect-[3/4] overflow-hidden rounded-sm lg:block">
                <Image
                  src="/images/about/safety.jpg"
                  alt="A BOVI Access technician in a helmet, harness and respirator at height"
                  fill
                  sizes="40vw"
                  quality={72}
                  className="object-cover object-center"
                />
              </figure>
            </Reveal>

            <ul className="lg:col-span-6 lg:col-start-7">
              {safetyPoints.map((point, i) => (
                <Reveal
                  as="li"
                  key={point.title}
                  delay={Math.min(i * STAGGER, 0.28)}
                  className="border-t border-hairline-light py-6 last:border-b"
                >
                  <h3 className="text-h5">{point.title}</h3>
                  <p className="mt-2 max-w-[46ch] text-body text-moss">
                    {point.body}
                  </p>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ---------------- 04 Why rope access ---------------- */}
      <section data-ground="dark" className="bg-ink-raised text-bone">
        <Container className="py-20 lg:py-28">
          <Reveal>
            <SectionLabel index="04" ground="dark">
              Why rope access
            </SectionLabel>
            <h2 className="mt-6 max-w-[20ch] text-h2">
              The right method for the right problem.
            </h2>
            <p className="mt-7 max-w-[56ch] text-body-lg text-mist">
              Rope access is not the answer to everything. Where the works are
              localised and the elevation is hard to reach, it is usually the
              most practical option — and where it is not, we will say so.
            </p>
          </Reveal>

          <ul className="mt-14 grid gap-x-12 border-t border-hairline-dark sm:grid-cols-2">
            {ropeAccessBenefits.map((benefit, i) => (
              <Reveal
                as="li"
                key={benefit.title}
                delay={Math.min(i * STAGGER, 0.2)}
                className="border-b border-hairline-dark py-7"
              >
                <h3 className="text-h5">{benefit.title}</h3>
                <p className="mt-2 max-w-[44ch] text-body text-mist">
                  {benefit.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ---------------- 05 Who we support ---------------- */}
      <section className="bg-bone">
        <Container className="py-20 lg:py-24">
          <Reveal>
            <SectionLabel index="05">Who we support</SectionLabel>
            <h2 className="mt-6 max-w-[18ch] text-h3">
              The people responsible for the building.
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

          <div className="mt-12">
            <ArrowLink href="/services">See what we do</ArrowLink>
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
