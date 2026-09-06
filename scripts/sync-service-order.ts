import { getCliClient } from "sanity/cli";
import { services } from "@/lib/config/site";

/**
 * Repositions Drainage and Brickwork in Sanity to match the code.
 *
 * Run with:
 *   npm run cms:sync-order
 *
 * WHY THIS EXISTS
 *
 * The client asked for Drainage & External Pipe Repairs at 02 and
 * Brickwork & Repointing at 04. Swapping them in src/lib/config/site.ts
 * fixes the numbered list and the ordering everywhere, because that array
 * is the site's order of record — but NOT the numeral printed on each
 * service page. That comes from the document's `eyebrow`, and the
 * provider merges CMS over local, so Sanity's stale "Service 02" beat the
 * repo's "Service 04" and the two pages showed each other's numbers.
 *
 * `order` is corrected alongside it. It does not affect the public site
 * (local services keep their configured order; `order` only sorts
 * CMS-only additions) but it is what the Services list in Studio sorts
 * by, so leaving it would show Renan an order the site does not use.
 *
 * ONLY OVERWRITES THE EXACT PREVIOUS VALUE. If a field holds anything
 * else, Renan has edited it and it is left alone and reported. Idempotent:
 * a second run finds the new values and writes nothing.
 *
 * Authenticated by the existing Sanity CLI session (`--with-user-token`).
 */

const client = getCliClient({ apiVersion: "2026-09-04" });

/** slug -> what the document should still contain before we touch it. */
const MOVES = [
  {
    slug: "drainage-external-pipe-repairs",
    previous: { eyebrow: "Service 04", order: 4 },
  },
  {
    slug: "brickwork-repointing",
    previous: { eyebrow: "Service 02", order: 2 },
  },
];

async function run() {
  for (const { slug, previous } of MOVES) {
    const id = `service-${slug}`;
    const position = services.findIndex((service) => service.slug === slug);
    if (position < 0) throw new Error(`${slug} is not in the service index`);

    const target = {
      eyebrow: `Service ${services[position].index}`,
      order: position + 1,
    };

    const doc = await client.fetch<{
      eyebrow?: string;
      order?: number;
    } | null>(`*[_id == $id][0]{eyebrow, order}`, { id });

    if (!doc) throw new Error(`${id} not found in Sanity`);

    const set: Record<string, unknown> = {};
    const skipped: string[] = [];

    if (doc.eyebrow === target.eyebrow) {
      /* already done */
    } else if (doc.eyebrow === previous.eyebrow) {
      set.eyebrow = target.eyebrow;
    } else {
      skipped.push(`eyebrow (${doc.eyebrow ?? "empty"})`);
    }

    if (doc.order === target.order) {
      /* already done */
    } else if (doc.order === previous.order) {
      set.order = target.order;
    } else {
      skipped.push(`order (${doc.order ?? "empty"})`);
    }

    if (skipped.length > 0) {
      console.log(`  ${slug}: NOT TOUCHED, edited in Studio — ${skipped.join(", ")}`);
    }

    if (Object.keys(set).length === 0) {
      console.log(`  ${slug}: already correct`);
      continue;
    }

    await client.patch(id).set(set).commit();
    console.log(
      `  ${slug}: ${Object.entries(set)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(", ")}`,
    );
  }
}

// `sanity exec` bundles to CJS, which has no top-level await.
run().catch((error) => {
  console.error(error);
  process.exit(1);
});
