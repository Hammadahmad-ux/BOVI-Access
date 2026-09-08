import { coverage } from "@/lib/content/home";
import { getHomepage } from "@/lib/content/provider";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STAGGER } from "@/lib/animations/motion";
import { cn } from "@/lib/utils/cn";

/**
 * BOVI ACCESS — Coverage.
 *
 * WHY THE STATEMENT IS THE ARTWORK: "London & the South East" is the only
 * approved geographic claim, and no borough, county, postcode or radius may
 * ever be listed (CONTENT-RULES.md §5). A map or an area list would either
 * fabricate detail or read as an empty promise, so this section carries no
 * media and no list at all — the type does the whole job, set at the h1 step
 * so it lands as a declaration rather than another heading.
 *
 * NO DECORATIVE GRID: an earlier version laid a faint "survey sheet" of
 * vertical hairlines behind the statement. The client read it as stray
 * square lines, so every page now uses the same flat treatment — a plain
 * ground with only the functional section dividers.
 *
 * WHY THE LAST LINE IS GREEN: at the h1 step this is large text, where brand
 * green clears contrast (3.64:1 on ink is large-text-only). The supporting
 * paragraph underneath is mist for exactly the same reason — small green
 * text on a dark ground is the one pairing the palette forbids.
 *
 * MOTION: a three-beat entrance — label, statement, supporting block. The
 * two heading lines are not staggered against each other because `Reveal`
 * renders a block element, and a block element inside an <h2> is invalid
 * markup; the stagger lives between the beats instead.
 */
export async function Coverage() {
  // The two hard-broken headline lines stay in code — they are a
  // typographic composition, and CLAUDE.md §2 pins the approved coverage
  // wording. Only the supporting sentence is editable.
  const { serviceAreaCopy } = await getHomepage();

  return (
    <section
      data-ground="dark"
      aria-labelledby="coverage-heading"
      className="bg-ink text-bone"
    >
      {/* Tallest rhythm on the page: one statement earns the whole frame. */}
      <Container className="py-24 lg:py-32">
        <Reveal>
          <SectionLabel ground="dark">
            Coverage
          </SectionLabel>
        </Reveal>

        <Reveal delay={STAGGER} y={26}>
          {/*
            Borrowing the h1 size onto an h2 also borrows its optical
            settings (0.90 / -0.035em); left on h2 metrics the two lines
            would sit too loose for a stacked statement.
          */}
          <h2
            id="coverage-heading"
            className="mt-8 text-h2 leading-[0.9] tracking-[-0.035em] uppercase sm:text-h1 lg:mt-10"
          >
            {coverage.lines.map((line, index) => (
              // Hard breaks. This statement never relies on natural wrapping.
              <span
                key={line}
                className={cn(
                  "block",
                  index === coverage.lines.length - 1 && "text-green",
                )}
              >
                {line}
              </span>
            ))}
          </h2>
        </Reveal>

        <Reveal
          delay={STAGGER * 2}
          className="mt-12 border-t border-hairline-dark pt-8 lg:mt-16 lg:pt-10"
        >
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-10">
            <p className="max-w-[46ch] text-body-lg text-mist lg:col-span-7">
              {serviceAreaCopy}
            </p>
            <div className="mt-8 lg:col-span-5 lg:mt-0 lg:justify-self-end lg:self-start">
              <ArrowLink href="/service-areas" ground="dark">
                Check coverage
              </ArrowLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
