import type { Metadata } from "next";
import { business } from "@/lib/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { Hero } from "@/components/sections/Hero";

export const metadata: Metadata = buildMetadata({
  title: business.descriptor,
  description: `BOVI Access provides specialist high-level access, repair and maintenance for commercial buildings across ${business.coverage}. Rope access window cleaning, repointing, gutter clearance and external repairs.`,
  path: "/",
  brandInTitle: true,
});

/**
 * Homepage.
 *
 * PHASE 1: Hero only — enough to prove the foundation renders end to end.
 * PHASE 2 adds, in this locked order: Introduction, Services, Featured
 * Project, Why BOVI, Who We Work With, Projects, Service Area, Final CTA.
 * See CLAUDE.md § Homepage architecture.
 */
export default function HomePage() {
  return <Hero />;
}
