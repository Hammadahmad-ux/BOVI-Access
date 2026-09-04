/**
 * Seeds the verified local service content into Sanity.
 *
 * Run once, after the Sanity project exists:
 *   SANITY_WRITE_TOKEN=<token> npm run cms:migrate
 *
 * IDEMPOTENT. Documents use deterministic IDs (`service-<slug>`) and are
 * written with createIfNotExists, so re-running never produces duplicates
 * and never overwrites an edit Renan has already made in Studio. To force
 * a re-seed of a document, delete it in Studio first.
 *
 * WHAT IT DOES NOT DO:
 *   - It does not create project documents. No BOVI project has a
 *     verified name, client, location or date, so there is nothing
 *     truthful to seed. Renan adds those himself.
 *   - It does not populate siteSettings address or company number —
 *     neither has been supplied (CONTENT-RULES.md §1).
 *   - It does not invent FAQs. Every service seeds with an empty FAQ list.
 */
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN.\n" +
      "Create the Sanity project first — see CMS-HANDOVER.md.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-09-04",
  useCdn: false,
});

/**
 * Read the service content straight out of the TypeScript module by
 * evaluating its exported literal. Keeping one source avoids the seed
 * drifting from what the site actually renders.
 */
const source = readFileSync("src/lib/content/services.ts", "utf8");
const slugs = [...source.matchAll(/^\s{4}slug: "([a-z0-9-]+)",$/gm)].map(
  (m) => m[1],
);

if (slugs.length === 0) {
  console.error("Could not read service slugs from src/lib/content/services.ts");
  process.exit(1);
}

const { servicePages } = await import("../src/lib/content/services.ts").catch(
  () => ({ servicePages: null }),
);

if (!servicePages) {
  console.error(
    "This script needs to import TypeScript directly.\n" +
      "Run it with:  node --experimental-strip-types scripts/migrate-to-sanity.mjs",
  );
  process.exit(1);
}

const toBlocks = (paragraphs) =>
  paragraphs.map((text, i) => ({
    _type: "block",
    _key: `p${i}`,
    style: "normal",
    children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
  }));

let created = 0;
let skipped = 0;

for (const service of servicePages) {
  const _id = `service-${service.slug}`;

  const doc = {
    _id,
    _type: "service",
    name: service.name,
    slug: { _type: "slug", current: service.slug },
    order: Number(service.index),
    legacyUrl: service.legacyUrl ?? undefined,
    eyebrow: service.eyebrow,
    heroTitle: service.heroTitle,
    intro: service.intro,
    overview: toBlocks(service.overview),
    commonWorks: [...service.commonWorks],
    deliveryContent: toBlocks(service.delivery),
    suitableFor: [...service.suitableFor],
    // Deliberately empty — see the header note.
    faq: [],
    seo: { _type: "seo", seoDescription: service.seoDescription },
  };

  const existing = await client.getDocument(_id).catch(() => null);
  if (existing) {
    skipped += 1;
    console.log(`skip   ${service.slug} (already exists)`);
    continue;
  }

  await client.createIfNotExists(doc);
  created += 1;
  console.log(`create ${service.slug}`);
}

// Link related services once every document exists.
for (const service of servicePages) {
  const refs = service.relatedServices.map((slug, i) => ({
    _type: "reference",
    _key: `r${i}`,
    _ref: `service-${slug}`,
  }));
  await client.patch(`service-${service.slug}`).set({ relatedServices: refs }).commit();
}

// Singletons, with fixed IDs so Studio's structure resolves them.
await client.createIfNotExists({ _id: "homepage", _type: "homepage" });
await client.createIfNotExists({
  _id: "siteSettings",
  _type: "siteSettings",
  phone: "07990 377780",
  phoneE164: "+447990377780",
  email: "info@boviaccess.co.uk",
  quoteCTA: "Request a Quote",
});

console.log(
  `\nDone. ${created} services created, ${skipped} already present.\n` +
    "Images are NOT migrated — upload them in Studio, where the hotspot\n" +
    "tool can be used to control cropping.",
);
