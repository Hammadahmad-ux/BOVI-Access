import type { Metadata } from "next";
import Link from "next/link";
import { primaryNav, services } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for could not be found.",
  robots: { index: false, follow: true },
};

/**
 * QA #8: a genuinely useful 404 — it routes people onwards rather than
 * dead-ending them. This matters more than usual here, because legacy Wix
 * URLs that were missed by the redirect map will land on it.
 */
export default function NotFound() {
  return (
    <section data-ground="dark" className="bg-ink text-bone">
      <Container className="py-24 lg:py-32">
        <SectionLabel ground="dark">Error 404</SectionLabel>

        <h1 className="mt-6 max-w-[16ch] uppercase">Page not found</h1>

        <p className="mt-8 max-w-[52ch] text-body-lg text-mist">
          The page you were looking for has moved or no longer exists. The
          links below cover everything on the site.
        </p>

        <div className="mt-10">
          <Button href="/" size="lg">
            Back to home
          </Button>
        </div>

        <div className="mt-16 grid gap-12 border-t border-hairline-dark pt-10 sm:grid-cols-2">
          <nav aria-label="Pages">
            <h2 className="eyebrow text-mist">Pages</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body transition-colors hover:text-green-bright"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services">
            <h2 className="eyebrow text-mist">Services</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-body transition-colors hover:text-green-bright"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </section>
  );
}
