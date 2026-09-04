import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "That page could not be found. Use the links here to reach BOVI Access services, projects or contact details.",
  robots: { index: false, follow: true },
};

/**
 * QA #8: a genuinely useful 404 — it routes people onwards rather than
 * dead-ending them. This matters more than usual here, because legacy Wix
 * URLs that were missed by the redirect map will land on it.
 *
 * It offers three routes out and defers the full index to the footer,
 * which is directly below it. Printing the whole site index here as well
 * duplicated all eight services within one screen.
 */
export default function NotFound() {
  return (
    <section data-ground="dark" className="bg-ink text-bone">
      <Container className="py-24 lg:py-32">
        <SectionLabel ground="dark">Error 404</SectionLabel>

        <h1 className="mt-6 max-w-[16ch] uppercase">Page not found</h1>

        <p className="mt-8 max-w-[52ch] text-body-lg text-mist">
          The page you were looking for has moved or no longer exists.
        </p>

        {/*
          Three destinations, not two full site indexes.

          This page used to reprint every page and all eight services —
          directly above a footer that already lists exactly the same
          links. The service list appeared twice within one screen, which
          read as unfinished, and the duplication left a large dead gap
          above the footer. The footer is the site index; this is the
          recovery route.
        */}
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Button href="/" size="lg">
            Back to home
          </Button>
          <Button href="/services" size="lg" variant="secondary">
            All services
          </Button>
          <Button href="/contact" size="lg" variant="secondary">
            Contact us
          </Button>
        </div>

        <p className="mt-12 border-t border-hairline-dark pt-8 text-small text-mist">
          If you followed a link from an old address, everything on the site is
          listed in the footer below — or call{" "}
          <a
            href={business.phoneHref}
            className="text-bone underline underline-offset-4 transition-colors hover:text-green-bright"
          >
            {business.phoneDisplay}
          </a>
          .
        </p>
      </Container>
    </section>
  );
}
