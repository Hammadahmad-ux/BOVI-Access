import { audiences } from "@/lib/content/home";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STAGGER } from "@/lib/animations/motion";
import { cn } from "@/lib/utils/cn";

/**
 * BOVI ACCESS — Who we work with.
 *
 * The four buyer categories are set as a structured index, not as four
 * cards. The hairlines BETWEEN columns are what does that work: they make
 * the row read as one table of clients rather than four floating blocks.
 * There are deliberately no logos, testimonials or icons here — none has
 * been verified (CONTENT-RULES.md §1), and the category names carry the
 * meaning on their own.
 *
 * Columns get a floor height and their text is bottom-anchored, so the
 * four title blocks share a baseline instead of starting at four different
 * heights. That shared baseline is most of the reason this reads as
 * designed rather than stacked.
 */
export function AudienceSection() {
  return (
    <section data-ground="dark" className="bg-ink-raised text-bone">
      <Container className="py-20 lg:py-28">
        <Reveal>
          <SectionLabel ground="dark">
            Clients
          </SectionLabel>
          <h2 className="mt-6 max-w-[20ch]">{audiences.heading}</h2>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:mt-20">
          {audiences.items.map((item, index) => (
            <Reveal
              key={item.key}
              as="li"
              delay={index * STAGGER}
              className={columnClassName(index)}
            >
              {/* Positional marker only — the accessible name is the title. */}
              <span aria-hidden="true" className="eyebrow text-green-bright">
                {item.key}
              </span>

              <div className="mt-auto pt-10">
                {/* Two lines are reserved so a title that wraps ("Commercial
                    Property Owners") keeps the same baseline as the ones
                    that do not. Without this the four columns drift. */}
                <h3 className="text-h4 leading-tight sm:min-h-[2lh]">
                  {item.title}
                </h3>
                <p className="mt-4 text-body text-mist">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/**
 * A rule may only ever sit BETWEEN two columns. Because the grid reflows
 * 4-up → 2-up → 1-up, "between" means something different at each
 * breakpoint, so each item's rules are derived from its position in the
 * row at that breakpoint. Drawing the rules on the container instead would
 * leave an orphan border down the left edge of every wrapped row.
 *
 * Below `sm` the vertical rules are gone entirely and the horizontal
 * `border-t` on each item becomes the separator.
 */
function columnClassName(index: number) {
  const startsSmRow = index % 2 === 0;
  const startsLgRow = index % 4 === 0;
  const endsLgRow = index % 4 === 3;

  return cn(
    "flex flex-col border-t border-hairline-dark pt-7 pb-10",
    // At lg the four tops line up into one continuous rule across the row,
    // and the bottom padding is dropped because nothing follows it.
    "lg:min-h-80 lg:pt-8 lg:pb-0",
    !startsSmRow && "sm:border-l sm:pl-6",
    !startsLgRow && "lg:border-l lg:pl-8",
    // Clear space ahead of the NEXT column's rule, so text never crowds it.
    startsSmRow && "sm:pr-6",
    !endsLgRow && "lg:pr-8",
  );
}
