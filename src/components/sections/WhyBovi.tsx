import { whyBovi } from "@/lib/content/home";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STAGGER } from "@/lib/animations/motion";
import { cn } from "@/lib/utils/cn";

/**
 * Why BOVI — the six differentiators, set as a technical specification
 * schedule rather than a card grid.
 *
 * WHY A SCHEDULE: this section makes method claims to a procurement
 * audience. A datasheet — aligned numerals, hairline rules, a fixed
 * measure on every description — reads as evidence, where six rounded
 * cards read as marketing. Nothing here is boxed or filled.
 *
 * WHY THE ROWS ARE NOT LINKS: there is no honest destination for "Planned
 * Works". So the interaction is limited to a 1px rule appearing on the
 * left edge — enough to track the eye across a two-column schedule, not
 * enough to imply a click target. Mobile never depends on it.
 *
 * CONTENT: "RAMS-Led Delivery" is one of the claims pending written
 * confirmation from the client (CONTENT-RULES.md §4). Row copy is
 * rendered verbatim from the content module and must not be strengthened
 * here — no "certified", no "accredited", no insurance figure.
 */

/**
 * The tail of the row stagger is capped: past ~0.3s the last row arrives
 * noticeably after the reader has already reached it.
 */
const MAX_ROW_DELAY = 0.3;

export function WhyBovi() {
  return (
    <section className="bg-bone text-ink">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-10">
            <div className="lg:col-span-7">
              <SectionLabel index="04">Why BOVI</SectionLabel>
              <h2 className="mt-6 max-w-[15ch]">{whyBovi.heading}</h2>
            </div>
            {/* Sits on the heading's baseline edge on desktop, so the two
                open as one block rather than as a stacked intro. */}
            <p className="max-w-[44ch] text-body-lg text-moss lg:col-span-5 lg:self-end lg:pb-2">
              {whyBovi.body}
            </p>
          </div>
        </Reveal>

        {/* Two columns on desktop so six rows read as a schedule rather
            than a long list. Grid rows stretch, so the horizontal rules
            line up across both columns. */}
        <ul className="mt-14 border-t border-hairline-light lg:mt-20 lg:grid lg:grid-cols-2">
          {whyBovi.rows.map((row, i) => (
            <Reveal
              key={row.index}
              as="li"
              y={16}
              delay={Math.min(i * STAGGER, MAX_ROW_DELAY)}
              className={cn(
                // Per-side border colours only: the `border-*` shorthand
                // would fight the transparent left edge.
                "grid grid-cols-[2.25rem_1fr] border-b border-b-hairline-light",
                "border-l border-l-transparent py-8 transition-colors",
                "duration-200 hover:border-l-green lg:py-10",
                i % 2 === 1
                  ? // Right column: the transparent edge becomes the
                    // vertical rule between the two columns.
                    "lg:border-l-hairline-light lg:pl-10"
                  : // Left column stays flush, so the numerals form a hard
                    // left margin aligned with the section heading.
                    "lg:pr-10",
              )}
            >
              <span
                aria-hidden="true"
                className="eyebrow mt-1.5 text-green"
              >
                {row.index}
              </span>
              <div>
                <h3 className="text-h5 leading-[1.2] tracking-[-0.01em]">
                  {row.title}
                </h3>
                <p className="mt-3 max-w-[38ch] text-body text-moss">
                  {row.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
