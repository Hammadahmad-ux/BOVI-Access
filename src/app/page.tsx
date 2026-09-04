import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";

import { Hero } from "@/components/sections/Hero";
import { Introduction } from "@/components/sections/Introduction";
import { ServiceIndex } from "@/components/sections/ServiceIndex";
import { FeaturedProject } from "@/components/sections/FeaturedProject";
import { WhyBovi } from "@/components/sections/WhyBovi";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { ProjectGrid } from "@/components/sections/ProjectGrid";
import { Coverage } from "@/components/sections/Coverage";
import { FinalCta } from "@/components/sections/FinalCta";

export const metadata: Metadata = buildMetadata({
  title: business.descriptor,
  description: `BOVI Access provides specialist high-level access, repair and maintenance for commercial buildings across ${business.coverage}. Rope access window cleaning, repointing, gutter clearance and external repairs.`,
  path: "/",
  brandInTitle: true,
});

/**
 * Homepage.
 *
 * Section order is LOCKED — see CLAUDE.md §9. Do not reorder without a
 * significant, stated UX reason.
 *
 * The dark/light rhythm is deliberate and is what gives the page its
 * structure: the two dark runs (services + featured project, then
 * audiences) are broken by light sections so neither reads as one long
 * slab. Grounds are declared here for reference; each section owns its
 * own background so it stays portable to other pages.
 *
 *   Hero            dark
 *   Introduction    light
 *   ServiceIndex    dark
 *   FeaturedProject dark (raised)
 *   WhyBovi         light
 *   AudienceSection dark (raised)
 *   ProjectGrid     light
 *   Coverage        dark
 *   FinalCta        dark
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Introduction />
      <ServiceIndex />
      <FeaturedProject />
      <WhyBovi />
      <AudienceSection />
      <ProjectGrid />
      <Coverage />
      <FinalCta />
    </>
  );
}
