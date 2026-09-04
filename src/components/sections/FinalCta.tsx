import { business } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * Closing conversion block, shared by every page.
 * Copy is locked — see CLAUDE.md § Final CTA.
 */
export function FinalCta() {
  return (
    <section data-ground="dark" className="border-t border-hairline-dark bg-ink text-bone">
      <Container className="py-20 lg:py-28">
        <h2 className="max-w-[14ch] uppercase">
          <span className="block">Need safe</span>
          <span className="block">access at height?</span>
        </h2>

        <p className="mt-7 max-w-[52ch] text-body-lg text-mist">
          Tell us about the building, works required and access challenges.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href="/contact" size="lg">
            Request a Quote
          </Button>
          <Button href={business.phoneHref} size="lg" variant="secondary">
            {business.phoneDisplay}
          </Button>
        </div>

        <p className="mt-6 text-small text-mist">
          Photos can be attached to your enquiry.
        </p>
      </Container>
    </section>
  );
}
