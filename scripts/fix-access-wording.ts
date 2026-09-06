import { getCliClient } from "sanity/cli";
import { servicePages } from "@/lib/content/services";

/**
 * Brings the Sanity service documents in line with the corrected local
 * copy after the access/disruption wording pass.
 *
 * Run with:
 *   npm run cms:fix-wording
 *
 * WHY THIS EXISTS
 *
 * The client asked us to stop making absolute access claims — "no road to
 * close", "without a scaffold licence" — because what a job needs depends
 * on the site. Fixing the local content module is only half of it: the
 * same sentences were seeded into Sanity, and the provider merges CMS
 * content OVER the local baseline. Correct the code alone and the live
 * site keeps serving the old wording from the CMS.
 *
 * IT ONLY TOUCHES WHAT IS STILL UNSAFE. Every field is checked against
 * UNSAFE_PHRASES first, and skipped if none matches. That matters because
 * these documents are Renan's to edit: a blind overwrite would silently
 * throw away anything he had rewritten since the migration. If he has
 * already fixed a sentence himself, this leaves it alone.
 *
 * Idempotent — running it twice does nothing the second time.
 *
 * Authenticated by `--with-user-token`, i.e. the existing Sanity CLI
 * session, so no write token is created, pasted into a file or left to be
 * revoked later. Same pattern as scripts/migrate-to-sanity.ts.
 */

const client = getCliClient({ apiVersion: "2026-09-04" });

/**
 * The wording being retired. A field containing any of these is seeded or
 * unsafe copy and gets replaced with the corrected local value.
 *
 * EVERY PHRASE HERE MUST BE ABSENT FROM THE CORRECTED COPY. Two of the
 * rewrites keep "without scaffolding …" and soften it with "often", so a
 * loose phrase matches the fix as well as the fault and the script
 * rewrites that document on every run — which is exactly what happened
 * to lightning-protection before this list was tightened. Check any new
 * entry against src/lib/content/services.ts before adding it.
 */
const UNSAFE_PHRASES = [
  "without scaffold or powered access",
  "without closing a road",
  "without the programme and cost of a full scaffold",
  "without full scaffold",
  "without towers or a cherry picker",
  "without treating it as a scaffold job",
  "without scaffolding an elevation",
  // Narrow on purpose: the corrected copy still ends "…without
  // scaffolding the elevation", and differs only by "can often be".
  "the system can be inspected, maintained or reinstated without scaffolding",
  "on occupied buildings, without scaffold",
  "scaffold is disproportionate",
  "is slow and expensive",
];

const isUnsafe = (text: string) =>
  UNSAFE_PHRASES.some((phrase) => text.toLowerCase().includes(phrase));

type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  children: { _type: "span"; _key: string; text: string; marks: string[] }[];
};

/** Plain paragraphs -> Portable Text blocks. Mirrors migrate-to-sanity.ts. */
function toBlocks(paragraphs: readonly string[], prefix: string): Block[] {
  return paragraphs.map((text, i) => ({
    _type: "block",
    _key: `${prefix}${i}`,
    style: "normal",
    children: [{ _type: "span", _key: `${prefix}${i}s`, text, marks: [] }],
  }));
}

type ServiceDoc = {
  _id: string;
  slug?: string;
  intro?: string;
  overview?: string[];
  delivery?: string[];
  seoDescription?: string;
};

/** `sanity exec` bundles to CJS, which has no top-level await. */
async function run() {
    const docs = await client.fetch<ServiceDoc[]>(
    `*[_type == "service" && defined(slug.current)]{
      _id,
      "slug": slug.current,
      intro,
      "overview": overview[]{"t": pt::text(@)}.t,
      "delivery": deliveryContent[]{"t": pt::text(@)}.t,
      "seoDescription": seo.seoDescription
    }`,
  );

  let patched = 0;
  let skipped = 0;

  for (const doc of docs) {
    const local = servicePages.find((service) => service.slug === doc.slug);
    if (!local) {
      console.log(`  skip  ${doc.slug} — no local counterpart`);
      skipped++;
      continue;
    }

    const set: Record<string, unknown> = {};

    if (doc.intro && isUnsafe(doc.intro)) set.intro = local.intro;

    if (doc.seoDescription && isUnsafe(doc.seoDescription)) {
      set["seo.seoDescription"] = local.seoDescription;
    }

    if ((doc.overview ?? []).some(isUnsafe)) {
      set.overview = toBlocks(local.overview, `ov-${local.slug}-`);
    }

    if ((doc.delivery ?? []).some(isUnsafe)) {
      set.deliveryContent = toBlocks(local.delivery, `dl-${local.slug}-`);
    }

    const fields = Object.keys(set);
    if (fields.length === 0) {
      console.log(`  ok    ${doc.slug} — already safe`);
      skipped++;
      continue;
    }

    await client.patch(doc._id).set(set).commit();
    console.log(`  FIXED ${doc.slug} — ${fields.join(", ")}`);
    patched++;
  }

  console.log(`\n${patched} document(s) patched, ${skipped} left alone.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
