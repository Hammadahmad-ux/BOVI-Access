import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "@/components/sections/PageHeader";
import { FinalCta } from "@/components/sections/FinalCta";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = buildMetadata({
  title: "Service Areas",
  description: `${business.name} supports commercial property and maintenance projects across ${business.coverage}.`,
  path: "/service-areas",
});

/**
 * Coverage is stated exactly as the client has confirmed it. Named boroughs
 * or counties must NOT be added without written confirmation — see
 * CONTENT-RULES.md § Geographic coverage.
 */
export default function ServiceAreasPage() {
  return (
    <>
      <PageHeader eyebrow="Coverage" title="Where we work" />

      <section className="bg-bone">
        <Container className="py-20 lg:py-28">
          <p className="font-display text-h1 font-extrabold uppercase leading-[0.9] tracking-[-0.035em]">
            <span className="block">London &amp;</span>
            <span className="block text-green">The South East</span>
          </p>

          <p className="mt-10 max-w-[52ch] text-body-lg text-moss">
            {business.name} supports commercial property and maintenance
            projects across London and surrounding areas.
          </p>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
