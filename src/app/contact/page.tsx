import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = buildMetadata({
  title: "Request a Quote",
  description: `Send ${business.name} your building location and the works required. Call ${business.phoneDisplay} or email ${business.emailDisplay}.`,
  path: "/contact",
});

/**
 * Contact / Request a Quote.
 *
 * The form submits for real — see QuoteForm and /api/quote. Both contact
 * methods on this page are still given equal weight to the form, because
 * a property manager who wants an answer this afternoon will call.
 */

const expectations = [
  {
    title: "What to send",
    body: "The building address, which elevation is affected, and roughly how high. A photograph from the ground helps more than a long description.",
  },
  {
    title: "What happens next",
    body: "We review whether rope access is the right method, and come back with what we would need to do and what it would cost.",
  },
  {
    title: "If it is not for us",
    body: "If the work is outside what we do, or the building is outside where we work, we will say so rather than quote for it.",
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us what you need access to."
        lead={`Send ${business.name} your project details and location so the team can review the requirement.`}
        height="compact"
      />

      <section className="bg-bone">
        <Container className="py-16 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* ---------------- Contact details ---------------- */}
            <div className="lg:col-span-4">
              <Reveal>
                <SectionLabel>Speak to us</SectionLabel>

                <dl className="mt-8 flex flex-col">
                  <div className="border-t border-hairline-light py-6">
                    <dt className="eyebrow text-moss">Call</dt>
                    <dd className="mt-3">
                      <a
                        href={business.phoneHref}
                        className="inline-flex min-h-11 items-center font-display text-h4 font-semibold transition-colors hover:text-green"
                      >
                        {business.phoneDisplay}
                      </a>
                    </dd>
                  </div>

                  <div className="border-t border-hairline-light py-6">
                    <dt className="eyebrow text-moss">Email</dt>
                    <dd className="mt-3">
                      <a
                        href={business.emailHref}
                        className="inline-flex min-h-11 items-center font-display text-h5 font-semibold break-words transition-colors hover:text-green"
                      >
                        {business.emailDisplay}
                      </a>
                    </dd>
                  </div>

                  <div className="border-t border-b border-hairline-light py-6">
                    <dt className="eyebrow text-moss">Coverage</dt>
                    <dd className="mt-3 text-body-lg">{business.coverage}</dd>
                  </div>
                </dl>
              </Reveal>

              <Reveal delay={0.08}>
                <ul className="mt-12 flex flex-col gap-8">
                  {expectations.map((item) => (
                    <li key={item.title}>
                      <h2 className="text-h5">{item.title}</h2>
                      <p className="mt-2 max-w-[42ch] text-body text-moss">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* ---------------- Form ---------------- */}
            <div className="lg:col-span-7 lg:col-start-6">
              <Reveal delay={0.06}>
                <h2 className="text-h3">Request a quote</h2>
                <p className="mt-4 max-w-[52ch] text-body text-moss">
                  Required fields are marked with an asterisk. The more detail
                  you can give about the building, the more useful the answer.
                </p>
              </Reveal>

              <div className="mt-10">
                <QuoteForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
