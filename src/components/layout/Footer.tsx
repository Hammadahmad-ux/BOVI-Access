import Link from "next/link";
import { business, footerNav, services } from "@/lib/config/site";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  // QA #9: the copyright year is derived, never hardcoded.
  const year = new Date().getFullYear();

  return (
    <footer data-ground="dark" className="bg-ink text-bone">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-16">
          <div>
            <Logo ground="dark" className="h-12 w-auto lg:h-14" />
            <p className="mt-6 max-w-[38ch] text-body text-mist">
              {business.descriptor} across {business.coverage}.
            </p>
            <p className="eyebrow mt-6 text-green-bright">{business.slogan}</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow text-mist">Navigate</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {footerNav.map((item) => (
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

          <div>
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
          </div>
        </div>

        <div className="mt-16 border-t border-hairline-dark pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="eyebrow text-mist">Contact</h2>
              {/* QA #18 / #19: phone and email are always real links. */}
              <a
                href={business.phoneHref}
                className="font-display text-h4 font-600 transition-colors hover:text-green-bright"
              >
                {business.phoneDisplay}
              </a>
              <a
                href={business.emailHref}
                className="text-body text-mist transition-colors hover:text-bone"
              >
                {business.emailDisplay}
              </a>
            </div>

            <p className="text-small text-mist">
              &copy; {year} {business.legalName}. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
