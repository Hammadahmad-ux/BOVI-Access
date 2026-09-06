import { getCliClient } from "sanity/cli";
import { servicePages } from "@/lib/content/services";

/**
 * Pushes the revised Drainage & External Pipe Repairs copy into Sanity.
 *
 * Run with:
 *   npm run cms:sync-drainage
 *
 * WHY THIS EXISTS
 *
 * The provider merges CMS values OVER the local baseline, so a service
 * whose Sanity document still holds the previous wording keeps serving
 * that wording no matter what the repo says. The drainage document was
 * seeded from the old copy; without this, the SEO pass would have changed
 * nothing on the live site.
 *
 * IT ONLY WRITES OVER THE EXACT PREVIOUS TEXT. Each field carries the
 * value it is expected to still hold; if what is in Sanity differs, the
 * field is left alone and reported. These documents are Renan's to edit,
 * and silently overwriting something he had rewritten would be worse than
 * leaving the CMS stale.
 *
 * Idempotent: after a successful run the stored values no longer match,
 * so a second run reports "already updated" and writes nothing.
 *
 * Authenticated by the existing Sanity CLI session (`--with-user-token`),
 * same as scripts/migrate-to-sanity.ts. No write token is created.
 */

const client = getCliClient({ apiVersion: "2026-09-04" });

const SLUG = "drainage-external-pipe-repairs";
const DOC_ID = `service-${SLUG}`;

/** What the document is expected to still contain, field by field. */
const PREVIOUS = {
  intro:
    "Repair, replacement and clearing of external pipework and soil stacks on elevations and lightwells that are difficult to reach.",
  overview: [
    "External soil stacks and rainwater pipes often run the full height of a building, frequently down a lightwell or a tight rear elevation where there is no room for access equipment.",
    "Rope access reaches the whole run from the roof down, so a leaking joint or a blocked section can be reached at the point it has failed rather than from the nearest available platform.",
  ],
  delivery: [
    "The full run is inspected so the actual failure point is found, not just the visible symptom.",
    "Works are carried out from rope, so lightwells and rear elevations do not need to be opened up for equipment.",
    "Where a defect is beyond the scope of a repair, it is reported rather than patched.",
  ],
  commonWorks: [
    "Clearing blockages in external soil and rainwater stacks",
    "Replacing failed or damaged sections of pipework",
    "Renewing brackets, clips and fixings",
    "Sealing and making good pipe joints",
    "Replacing downpipe shoes and offsets",
    "Close-up inspection of pipe runs and staining",
  ],
  seoDescription:
    "External pipe and drainage repairs at height by rope access — soil stacks, rainwater goods and lightwell pipework on commercial buildings.",
};

type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  children: { _type: "span"; _key: string; text: string; marks: string[] }[];
};

/** Plain paragraphs -> Portable Text. Mirrors migrate-to-sanity.ts. */
function toBlocks(paragraphs: readonly string[], prefix: string): Block[] {
  return paragraphs.map((text, i) => ({
    _type: "block",
    _key: `${prefix}${i}`,
    style: "normal",
    children: [{ _type: "span", _key: `${prefix}${i}s`, text, marks: [] }],
  }));
}

const same = (a: readonly string[] | undefined, b: readonly string[]) =>
  Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);

async function run() {
  const local = servicePages.find((service) => service.slug === SLUG);
  if (!local) throw new Error(`No local content for ${SLUG}`);

  const doc = await client.fetch<{
    intro?: string;
    overview?: string[];
    delivery?: string[];
    commonWorks?: string[];
    seoDescription?: string;
  } | null>(
    `*[_id == $id][0]{
      intro,
      "overview": overview[]{"t": pt::text(@)}.t,
      "delivery": deliveryContent[]{"t": pt::text(@)}.t,
      commonWorks,
      "seoDescription": seo.seoDescription
    }`,
    { id: DOC_ID },
  );

  if (!doc) throw new Error(`${DOC_ID} not found in Sanity`);

  const set: Record<string, unknown> = {};
  const skipped: string[] = [];

  const consider = (
    field: string,
    matches: boolean,
    value: unknown,
    alreadyDone: boolean,
  ) => {
    if (alreadyDone) return;
    if (matches) set[field] = value;
    else skipped.push(field);
  };

  consider(
    "intro",
    doc.intro === PREVIOUS.intro,
    local.intro,
    doc.intro === local.intro,
  );
  consider(
    "overview",
    same(doc.overview, PREVIOUS.overview),
    toBlocks(local.overview, `ov-${SLUG}-`),
    same(doc.overview, local.overview),
  );
  consider(
    "deliveryContent",
    same(doc.delivery, PREVIOUS.delivery),
    toBlocks(local.delivery, `dl-${SLUG}-`),
    same(doc.delivery, local.delivery),
  );
  consider(
    "commonWorks",
    same(doc.commonWorks, PREVIOUS.commonWorks),
    local.commonWorks,
    same(doc.commonWorks, local.commonWorks),
  );
  consider(
    "seo.seoDescription",
    doc.seoDescription === PREVIOUS.seoDescription,
    local.seoDescription,
    doc.seoDescription === local.seoDescription,
  );

  if (skipped.length > 0) {
    console.log(
      `  NOT TOUCHED (edited in Studio since seeding): ${skipped.join(", ")}`,
    );
  }

  const fields = Object.keys(set);
  if (fields.length === 0) {
    console.log("  nothing to do — already up to date.");
    return;
  }

  await client.patch(DOC_ID).set(set).commit();
  console.log(`  UPDATED ${SLUG} — ${fields.join(", ")}`);
}

// `sanity exec` bundles to CJS, which has no top-level await.
run().catch((error) => {
  console.error(error);
  process.exit(1);
});
