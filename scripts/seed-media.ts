import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getCliClient } from "sanity/cli";

import { resolveHeroMedia } from "@/lib/config/hero-media";
import { introduction } from "@/lib/content/home";
import { servicePages } from "@/lib/content/services";
import type { ImageAsset } from "@/lib/content/types";

/**
 * Seeds the CURRENT service and homepage photography into Sanity as real
 * image assets, so Renan can replace it from Studio.
 *
 * Run with:
 *   npm run cms:seed-media
 *
 * `sanity exec … --with-user-token` under the hood — same mechanism as
 * `cms:migrate` and `cms:seed-projects`. Authenticates from the existing
 * Sanity CLI session; no write token is created or stored.
 *
 * ---------------------------------------------------------------------
 * WHY — the eight service documents were migrated with their TEXT only;
 * their photographs stayed in /public and rendered through a local
 * fallback, so the "Main photograph" and "Photo gallery" fields in Studio
 * did nothing. The homepage hero and introduction images were the same.
 * This uploads the exact files the site serves today
 * (public/images/services/*, public/images/hero/hero-still.jpg,
 * public/images/home/introduction.jpg) as Sanity assets and wires them
 * onto the documents. No hotspot is set, so the crop stays dead-centre —
 * identical to what renders now. Nothing is a stock or substitute image.
 * ---------------------------------------------------------------------
 *
 * IDEMPOTENT, and it respects Studio edits. A service whose document
 * already carries ANY image (hero or gallery) is skipped whole, and the
 * homepage fields are filled only when empty. So the normal case — a
 * developer running this once — seeds everything; a re-run only repairs
 * an image slot that is still empty. To re-seed a service, clear its
 * photographs in Studio first.
 *
 * Once seeded, the provider treats service images as CMS-authoritative
 * (src/lib/content/provider.ts › mergeService): a photo replaced in Studio
 * replaces it, a photo removed removes it, and no stale local image is
 * pushed underneath. Local imagery is only reached on a full CMS outage.
 */

const client = getCliClient({ apiVersion: "2026-09-04" });

/**
 * Uploads one derivative from public/ and returns an image field value.
 * `image.src` is a site-absolute path like /images/services/foo.jpg.
 */
async function uploadImageField(image: ImageAsset, keyHint: string) {
  const diskPath = join(process.cwd(), "public", image.src);
  const buffer = readFileSync(diskPath);
  const asset = await client.assets.upload("image", buffer, {
    filename: `${keyHint}${image.src.slice(image.src.lastIndexOf("."))}`,
    contentType: "image/jpeg",
  });
  return {
    asset: { _type: "reference" as const, _ref: asset._id },
    alt: image.alt,
  };
}

type MaybeImageDoc = {
  heroMedia?: { asset?: unknown };
  gallery?: unknown[];
  introImage?: { asset?: unknown };
  heroPoster?: { asset?: unknown };
} | null;

async function run() {
  const { projectId, dataset } = client.config();
  console.log(`Seeding media into ${projectId}/${dataset}\n`);

  let updated = 0;
  let skipped = 0;

  /* ---------------- Services ---------------- */
  for (const service of servicePages) {
    const _id = `service-${service.slug}`;
    const doc = (await client.getDocument(_id)) as MaybeImageDoc;

    if (!doc) {
      console.log(`  MISSING ${_id} — run \`npm run cms:migrate\` first`);
      continue;
    }

    const alreadyHasMedia =
      Boolean(doc.heroMedia?.asset) ||
      (Array.isArray(doc.gallery) && doc.gallery.length > 0);
    if (alreadyHasMedia) {
      skipped += 1;
      console.log(`  skip    ${service.slug}  (already has photographs)`);
      continue;
    }

    const patch: Record<string, unknown> = {};

    if (service.heroMedia) {
      patch.heroMedia = {
        _type: "image",
        ...(await uploadImageField(service.heroMedia, `${service.slug}-hero`)),
      };
    }

    if (service.gallery?.length) {
      const gallery = [];
      for (let i = 0; i < service.gallery.length; i += 1) {
        gallery.push({
          _type: "galleryImage" as const,
          _key: `g${i}`,
          ...(await uploadImageField(
            service.gallery[i],
            `${service.slug}-${String(i + 1).padStart(2, "0")}`,
          )),
        });
      }
      patch.gallery = gallery;
    }

    await client.patch(_id).set(patch).commit();
    updated += 1;
    console.log(
      `  media   ${service.slug}  (hero + ${service.gallery?.length ?? 0} gallery)`,
    );
  }

  /* ---------------- Homepage ---------------- */
  const hp = (await client.getDocument("homepage")) as MaybeImageDoc;
  const heroDefaults = resolveHeroMedia();
  const hpPatch: Record<string, unknown> = {};

  if (!hp?.heroPoster?.asset) {
    hpPatch.heroPoster = {
      _type: "image",
      ...(await uploadImageField(
        { src: heroDefaults.posterImage, alt: heroDefaults.imageAlt, width: 0, height: 0 },
        "homepage-hero-poster",
      )),
    };
  }
  if (!hp?.introImage?.asset) {
    hpPatch.introImage = {
      _type: "image",
      ...(await uploadImageField(introduction.image, "homepage-intro")),
    };
  }

  if (Object.keys(hpPatch).length > 0) {
    await client.patch("homepage").set(hpPatch).commit();
    updated += 1;
    console.log(`  homepage  (${Object.keys(hpPatch).join(", ")})`);
  } else {
    skipped += 1;
    console.log("  skip    homepage  (already has photographs)");
  }

  console.log(
    `\nDone. ${updated} document(s) updated, ${skipped} already had photographs.`,
  );
}

run().catch((error: unknown) => {
  console.error(
    "Media seed failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
