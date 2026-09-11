import { getCliClient } from "sanity/cli";
import { servicePages } from "@/lib/content/services";

/**
 * Seeds the verified local service content into Sanity.
 *
 * Run with:
 *   npm run cms:migrate
 *
 * which is `sanity exec` under the hood. That matters for two reasons:
 * the CLI bundler resolves the `@/` tsconfig path alias (plain `node`
 * cannot, which is why this replaced the earlier .mjs version), and
 * `--with-user-token` authenticates from the existing CLI session, so no
 * write token has to be created, pasted into a file, or later revoked.
 *
 * IDEMPOTENT. Documents use deterministic IDs (`service-<slug>`) and are
 * written with `createIfNotExists`, so re-running never produces
 * duplicates and never overwrites an edit made in Studio. To force a
 * re-seed of one document, delete it in Studio first.
 *
 * WHAT IT DELIBERATELY DOES NOT DO:
 *   - No project documents. The six verified projects are seeded by a
 *     separate script — `npm run cms:seed-projects` (scripts/seed-projects.ts)
 *     — which also uploads their photographs as image assets.
 *   - No address or company number on siteSettings — neither supplied.
 *   - No FAQs. Every service seeds with an empty list; the front end
 *     renders nothing rather than inventing questions.
 *   - No images. Upload those in Studio, where the hotspot tool sets the
 *     crop.
 */

const client = getCliClient({ apiVersion: "2026-09-04" });

type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  children: { _type: "span"; _key: string; text: string; marks: string[] }[];
};

/** Plain paragraphs -> Portable Text blocks. */
function toBlocks(paragraphs: readonly string[], prefix: string): Block[] {
  return paragraphs.map((text, i) => ({
    _type: "block",
    _key: `${prefix}${i}`,
    style: "normal",
    children: [{ _type: "span", _key: `${prefix}s${i}`, text, marks: [] }],
  }));
}

async function run() {
  console.log(
    `Seeding ${servicePages.length} services into ${client.config().projectId}/${client.config().dataset}\n`,
  );

  let created = 0;
  let skipped = 0;

  for (const service of servicePages) {
    const _id = `service-${service.slug}`;

    const existing = await client.getDocument(_id);
    if (existing) {
      skipped += 1;
      console.log(`  skip    ${service.slug}  (already exists)`);
      continue;
    }

    await client.createIfNotExists({
      _id,
      _type: "service",
      name: service.name,
      slug: { _type: "slug", current: service.slug },
      order: Number(service.index),
      ...(service.legacyUrl ? { legacyUrl: service.legacyUrl } : {}),
      heroTitle: service.heroTitle,
      intro: service.intro,
      overview: toBlocks(service.overview, "ov"),
      commonWorks: [...service.commonWorks],
      deliveryContent: toBlocks(service.delivery, "dl"),
      suitableFor: [...service.suitableFor],
      faq: [],
      seo: { _type: "seo", seoDescription: service.seoDescription },
    });

    created += 1;
    console.log(`  create  ${service.slug}`);
  }

  // Related-service references are patched in a second pass, once every
  // document is guaranteed to exist — otherwise a reference could point
  // at a document that has not been written yet.
  console.log("\nLinking related services…");
  for (const service of servicePages) {
    const relatedServices = service.relatedServices.map((slug, i) => ({
      _type: "reference" as const,
      _key: `rel${i}`,
      _ref: `service-${slug}`,
    }));
    await client.patch(`service-${service.slug}`).set({ relatedServices }).commit();
  }

  // The homepage singleton, with the fixed ID the Studio structure
  // resolves. Created empty on purpose: the front end falls back to
  // verified local content for anything blank, so an empty Homepage
  // document changes nothing on the live site until Renan fills it in.
  // (There is no siteSettings document — contact details and brand config
  // live in src/lib/config/site.ts. See CMS-HANDOVER.md.)
  console.log("Creating the homepage singleton…");
  await client.createIfNotExists({ _id: "homepage", _type: "homepage" });

  console.log(
    `\nDone. ${created} services created, ${skipped} already present.\n` +
      "Service and homepage images are seeded separately by\n" +
      "`npm run cms:seed-media`; projects by `npm run cms:seed-projects`.",
  );
}

run().catch((error: unknown) => {
  console.error(
    "Migration failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
