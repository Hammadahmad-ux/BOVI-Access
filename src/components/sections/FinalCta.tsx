import { Phone } from "lucide-react";
import { business } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { STAGGER } from "@/lib/animations/motion";

/**
 * BOVI ACCESS — closing conversion block, shared by every page.
 *
 * Copy and routes are LOCKED (CLAUDE.md § Final CTA). Only the composition
 * below is ours to design.
 *
 * The section sits between two other dark blocks (Coverage above, the
 * Footer below), so its presence has to come from structure rather than a
 * change of ground: a top hairline, deliberately more vertical room than
 * any neighbour, and a heading pushed up to the h1 step so the close lands
 * with the same weight as the Hero. The h1 line-height and tracking are
 * restated because `text-h1` only carries the size — without them the
 * heading would keep the looser h2 metrics and read as a smaller heading
 * set large, not as a second masthead.
 *
 * The heading is given the full measure (no max-width) because
 * "ACCESS AT HEIGHT?" is the widest line on the site at this step; capping
 * it would break the hard line breaks the copy depends on. Below ~520px it
 * wraps to three lines, which is the same shape the Hero takes on mobile.
 *
 * The actions are a separate column behind a hairline — vertical from `lg`,
 * horizontal below it — so the mechanics of getting in touch read as their
 * own panel rather than as more body copy. Phone is given the same size and
 * width as the quote CTA, plus a handset glyph, because a property manager
 * is as likely to call as to fill in a form; a faint text link would
 * misrepresent how this business is actually contacted.
 */
export function FinalCta() {
  return (
    <section
      data-ground="dark"
      className="border-t border-hairline-dark bg-ink text-bone"
    >
      <Container className="py-24 lg:py-32">
        <Reveal>
          <h2 className="text-h1 leading-[0.9] tracking-[-0.035em] uppercase">
            <span className="block">Need safe</span>
            <span className="block">access at height?</span>
          </h2>
        </Reveal>

        {/* Grid rows stretch by default, which is what lets the divider run
            the full height of the action panel instead of stopping short. */}
        <Reveal
          delay={STAGGER}
          className="mt-14 grid gap-y-10 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-16"
        >
          <p className="max-w-[44ch] text-body-lg text-mist">
            Tell us about the building, works required and access challenges.
          </p>

          <div className="border-t border-hairline-dark pt-10 lg:w-[22rem] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
            <div className="flex flex-col items-stretch gap-3">
              <Button href="/contact" size="lg">
                Request a Quote
              </Button>
              <Button href={business.phoneHref} size="lg" variant="secondary">
                <Phone aria-hidden="true" className="size-4 shrink-0" />
                {business.phoneDisplay}
              </Button>
            </div>

            <p className="mt-6 text-small text-mist">
              {/* Reinstate "Photos can be attached to your enquiry." once
                  the Phase 4 quote form actually accepts uploads — until
                  then it promises something the site cannot do. */}
              Call or email and we will come back to you.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
