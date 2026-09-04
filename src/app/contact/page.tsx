import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Request a Quote",
  description: `Request a quote from ${business.name}. Tell us about the building, works required and access challenges. Call ${business.phoneDisplay} or email ${business.emailDisplay}.`,
  path: "/contact",
});

/**
 * PHASE 4 adds the full enquiry form on this route (React Hook Form + Zod,
 * server-side validation, honeypot, rate limiting, file upload, Resend
 * delivery). The Zod schema and types already exist in src/lib/forms.
 *
 * Until then the page still converts: both contact methods are live,
 * clickable links.
 */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Request a quote"
        intro="Tell us about the building, works required and access challenges."
      />

      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <dl className="grid gap-10 sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-moss">Call</dt>
              <dd className="mt-3">
                <a
                  href={business.phoneHref}
                  className="font-display text-h3 font-bold tracking-[-0.022em] transition-colors hover:text-green"
                >
                  {business.phoneDisplay}
                </a>
              </dd>
            </div>

            <div>
              <dt className="eyebrow text-moss">Email</dt>
              <dd className="mt-3">
                <a
                  href={business.emailHref}
                  className="font-display text-h4 font-semibold break-words transition-colors hover:text-green"
                >
                  {business.emailDisplay}
                </a>
              </dd>
            </div>
          </dl>
        </Container>
      </section>
    </>
  );
}
