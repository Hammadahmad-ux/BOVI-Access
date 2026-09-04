import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "@/components/sections/PageHeader";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: `BOVI Access is a specialist rope access contractor delivering high-level maintenance and repair for commercial buildings across ${business.coverage}.`,
  path: "/about",
});

/** PHASE 3 expands this page with the safety / RAMS-led delivery detail. */
export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Access where traditional methods fall short"
        intro={`${business.name} provides specialist high-level access, repair and maintenance solutions for commercial buildings, using rope-access methods to reach difficult areas efficiently and with minimal disruption.`}
      />

      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <h2 className="max-w-[18ch] text-h3">
              Planned, documented works on occupied commercial buildings.
            </h2>
            <div className="flex flex-col gap-5 text-body-lg text-moss">
              <p>
                Rope access allows facade, roofline and high-level works to be
                completed without scaffolding or powered access, reducing cost,
                disruption and time on site.
              </p>
              <p>
                Every project is delivered to a documented method statement and
                risk assessment, agreed with the property or facilities manager
                before work begins.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
