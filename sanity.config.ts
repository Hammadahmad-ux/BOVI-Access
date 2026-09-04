"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import type { SchemaTypeDefinition } from "sanity";

import { sanityConfig } from "@/lib/config/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

/**
 * Sanity Studio configuration.
 *
 * NOTE: `npm install sanity` runs an initialiser that scaffolds its own
 * default config into src/sanity/ and OVERWRITES this file. If the Studio
 * suddenly points at `./src/sanity/env`, that has happened again — delete
 * src/sanity/ and restore this file. The schema lives in sanity/ at the
 * repository root, alongside the Studio structure.
 *
 * Only ever loaded from /studio, and only when a project ID is present —
 * see src/app/studio/[[...tool]]/page.tsx. That guard is why this file
 * can assume `sanityConfig.projectId` is non-empty.
 *
 * The schema objects are cast because they are authored as plain objects
 * rather than `defineType()` calls (see sanity/schemaTypes/index.ts).
 * The runtime shape is identical.
 */
export default defineConfig({
  name: "bovi-access",
  title: "BOVI Access",
  basePath: "/studio",

  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,

  schema: { types: schemaTypes as SchemaTypeDefinition[] },

  plugins: [
    structureTool({ structure }),
    // Vision is a developer query tool. Useful during setup and
    // migration; consider removing it before final client handover.
    visionTool({ defaultApiVersion: sanityConfig.apiVersion }),
  ],

  document: {
    // Singletons must not be duplicated — a second Homepage document
    // would make the site's query ambiguous.
    actions: (prev, context) =>
      ["homepage", "siteSettings"].includes(context.schemaType)
        ? prev.filter(
            ({ action }) => action && !["duplicate", "delete"].includes(action),
          )
        : prev,
  },
});
