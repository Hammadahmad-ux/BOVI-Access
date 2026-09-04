import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${business.name} collects, uses and stores the information you provide through this website.`,
  path: "/privacy",
});

/**
 * PRE-LAUNCH — LEGAL REVIEW REQUIRED.
 *
 * This describes accurately what the website actually does with data, and
 * nothing more. It deliberately contains no company registration number,
 * registered office or ICO registration number, because none has been
 * supplied — and it does not claim to have been reviewed by a solicitor,
 * because it has not been.
 *
 * Before launch: obtain the company details, have the wording reviewed,
 * and update. Tracked in CONTENT-RULES.md §10 and DEPLOYMENT.md §7.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead="How we handle the information you send us, and nothing more than that."
        height="compact"
      />

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
              <h2 className="text-h4 text-ink">Photographs and files</h2>
              <p className="mt-3">
                If you attach photographs or a PDF to an enquiry, they are sent
                to us as email attachments and are not stored on this website
                or in any separate file store. They exist in our email inbox
                and nowhere else.
              </p>
            </div>

            <div>
              <h2 className="text-h4 text-ink">How it reaches us</h2>
              <p className="mt-3">
                Enquiries submitted through this website are delivered to us by
                email through a third-party email delivery provider. Your
                message is transmitted over an encrypted connection.
              </p>
              <p className="mt-3">
                The website is hosted by a third-party hosting provider, and
                its page content is managed through a third-party content
                management service. Neither is given your enquiry: the enquiry
                goes only to the email provider and then to us.
              </p>
            </div>

            <div>
              <h2 className="text-h4 text-ink">Cookies and analytics</h2>
              <p className="mt-3">
                This website does not set advertising or analytics cookies, and
                does not track you across other websites. If that changes we
                will update this page and ask for your consent first.
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
