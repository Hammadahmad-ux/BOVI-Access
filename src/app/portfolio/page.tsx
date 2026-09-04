import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { PageHeader } from "@/components/sections/PageHeader";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description: `Recent commercial rope access, facade maintenance and external repair projects delivered by ${business.name}.`,
  path: "/portfolio",
});

/**
 * PHASE 4 populates this route from the Sanity `project` collection and
 * adds /projects/[slug] detail pages.
 *
 * It is intentionally empty of project entries right now: no project name,
 * client, location, value or date has been verified, and inventing them is
 * a content-rules violation. The page still carries real metadata and a
 * working conversion path, so it is honest rather than a placeholder.
 */
export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Work delivered at height"
        intro={`Facade, roofline and high-level repair projects completed on commercial buildings across ${business.coverage}.`}
      />
      <FinalCta />
    </>
  );
}
