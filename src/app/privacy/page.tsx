import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "@/components/sections/PageHeader";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${business.name} collects, uses and stores the information you provide through this website.`,
  path: "/privacy",
});

/**
 * PRE-LAUNCH: this policy describes only what the site actually does. It
 * deliberately contains no company registration number, registered office
 * or ICO registration, because none has been supplied. Those details, and a
 * legal review, are required before launch — see CONTENT-RULES.md.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy policy" />

      <section className="bg-bone">
        <Container width="narrow" className="py-20 lg:py-28">
          <div className="flex flex-col gap-10 text-body-lg text-moss">
            <div>
              <h2 className="text-h4 text-ink">Information we collect</h2>
              <p className="mt-3">
                We collect only the information you choose to send us through
                the enquiry form or by contacting us directly: your name,
                company, email address, telephone number, the location of the
                building, the works required, and any photographs or files you
                attach.
              </p>
            </div>

            <div>
              <h2 className="text-h4 text-ink">How we use it</h2>
              <p className="mt-3">
                We use this information solely to respond to your enquiry, to
                prepare a quotation, and to carry out any works you instruct.
                We do not sell it, and we do not use it for marketing unless
                you ask us to.
              </p>
            </div>

            <div>
              <h2 className="text-h4 text-ink">How it reaches us</h2>
              <p className="mt-3">
                Enquiries submitted through this website are delivered to us by
                email through a third-party email delivery provider. Your
                message is transmitted over an encrypted connection.
              </p>
            </div>

            <div>
              <h2 className="text-h4 text-ink">Your rights</h2>
              <p className="mt-3">
                You can ask us what information we hold about you, ask us to
                correct it, or ask us to delete it. Contact us at{" "}
                <a
                  href={business.emailHref}
                  className="text-ink underline underline-offset-4 hover:text-green"
                >
                  {business.emailDisplay}
                </a>{" "}
                or call{" "}
                <a
                  href={business.phoneHref}
                  className="text-ink underline underline-offset-4 hover:text-green"
                >
                  {business.phoneDisplay}
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
