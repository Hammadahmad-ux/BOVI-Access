import { readFileSync } from "node:fs";
import { join } from "node:path";

import { getCliClient } from "sanity/cli";

import { projects as localProjects } from "@/lib/content/projects";
import type { ImageAsset } from "@/lib/content/types";

/**
 * Seeds the six verified local projects into Sanity as real, editable
 * documents — the ones `/portfolio` and `/projects/<slug>` already show.
 *
 * Run with:
 *   npm run cms:seed-projects
 *
 * which is `sanity exec … --with-user-token` under the hood — same as
 * `npm run cms:migrate` for services. The CLI bundler resolves the `@/`
 * path alias, and `--with-user-token` authenticates from the existing
 * Sanity CLI session, so no write token is created, stored or revoked.
 *
 * ---------------------------------------------------------------------
 * WHY THIS EXISTS — the services migration deliberately created no project
 * documents ("No BOVI project has a verified name, client, location or
 * date"). That was true then. Since, `/portfolio` was rebuilt as a
 * completed-work gallery with six service-led titles that ARE verified
 * against the photography (see the header of src/lib/content/projects.ts),
 * but nothing ever wrote them into Sanity — so Studio showed "No documents
 * of this type" and Renan could not edit the live projects.
 *
 * This closes that gap. The SOURCE OF TRUTH is src/lib/content/projects.ts,
 * imported directly so the seed can never drift from what the site renders.
 * ---------------------------------------------------------------------
 *
 * IDEMPOTENT. Documents use deterministic IDs (`project-<slug>`). A project
 * that already exists is skipped ENTIRELY — no image is re-uploaded and no
 * field is rewritten — so re-running never duplicates a document and never
 * overwrites an edit Renan has made in Studio. To force a re-seed of one
 * project, delete it in Studio first.
 *
 * WHAT IT DELIBERATELY DOES NOT DO:
 *   - No location, completion date or scope. None is verified for any of
 *     these jobs (CONTENT-RULES.md §1). The fields stay blank and the
 *     project page omits the sections that have no value.
 *   - No SEO overrides. The project's own title and summary are the
 *     fallbacks the template already uses.
 *   - Never touches the eight service documents.
 *   - No homepage references. The Featured Project block and the "Recent
 *     works" row resolve against the live project collection on their own
 *     (see FeaturedProject.tsx / ProjectGrid.tsx): with nothing chosen in
 *     Studio they show the `featured` project and the first three. Pre-
 *     wiring `homepage.featuredProject` / `selectedProjects` here would
 *     only add a reference that BLOCKS Renan from deleting those projects
 *     until he unpicks them first — friction for no gain, since the
 *     rendered result is identical either way.
 *
 * IMAGES. The optimised derivatives under public/images/projects/<slug>/
 * are uploaded as Sanity assets — the exact files the site serves today,
 * so the rendered result is unchanged and Renan can replace any of them
 * from Studio normally. Sanity assets are content-addressed (sha1), so an
 * image is never stored twice even if this somehow runs against a
 * half-seeded dataset.
 */

const client = getCliClient({ apiVersion: "2026-09-04" });

/** Maps a project serviceSlug to the seeded service document id. */
function serviceRef(serviceSlug: string) {
  return { _type: "reference" as const, _ref: `service-${serviceSlug}` };
}

/**
 * Uploads one derivative from public/ and returns an image field value.
 * `image.src` is a site-absolute path like /images/projects/<slug>/main.jpg.
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

async function run() {
  const { projectId, dataset } = client.config();
  console.log(
    `Seeding ${localProjects.length} projects into ${projectId}/${dataset}\n`,
  );

  let created = 0;
  let skipped = 0;

  for (const project of localProjects) {
    const _id = `project-${project.slug}`;

    if (await client.getDocument(_id)) {
      skipped += 1;
      console.log(`  skip    ${project.slug}  (already exists)`);
      continue;
    }

    const heroImage = {
      _type: "image" as const,
      ...(await uploadImageField(project.image, `${project.slug}-main`)),
    };

    const gallery = [];
    for (let i = 0; i < project.gallery.length; i += 1) {
      const field = await uploadImageField(
        project.gallery[i],
        `${project.slug}-${String(i + 1).padStart(2, "0")}`,
      );
      gallery.push({ _type: "galleryImage" as const, _key: `g${i}`, ...field });
    }

    // Sequential create (awaited per project, in source order) so
    // `_createdAt` increases monotonically and the provider's
    // `order(featured desc, completionDate desc, _createdAt asc)` reproduces
    // the exact order src/lib/content/projects.ts lists them in.
    await client.createIfNotExists({
      _id,
      _type: "project",
      title: project.title,
      slug: { _type: "slug", current: project.slug },
      service: serviceRef(project.serviceSlug),
      summary: project.summary,
      heroImage,
      ...(gallery.length ? { gallery } : {}),
      featured: Boolean(project.featured),
    });

    created += 1;
    console.log(
      `  create  ${project.slug}  (hero + ${gallery.length} gallery)`,
    );
  }

  const total = await client.fetch<number>(`count(*[_type == "project"])`);
  console.log(
    `\nDone. ${created} created, ${skipped} already present. ` +
      `${total} project document(s) now in ${dataset}.`,
  );
}

run().catch((error: unknown) => {
  console.error(
    "Seed failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
