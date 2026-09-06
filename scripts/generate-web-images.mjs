/**
 * Produces optimised web derivatives from the curated client images.
 *
 * Run with: npm run assets:images
 *
 * Reads from client-assets/jpg (untracked working library), writes to
 * public/images (tracked). Originals are never modified. next/image
 * handles responsive sizing and AVIF/WebP negotiation at request time,
 * so a single high-quality source per slot is correct here — we are not
 * hand-cutting a breakpoint ladder.
 *
 * Provenance for every slot is documented in
 * client-assets/ASSET-INVENTORY.md. Do not add a slot here without
 * adding the matching row there.
 *
 * `trimBars`: some client images are iPhone screenshots (1170x2532) with
 * black letterbox bars baked in above and below the photograph. Setting
 * this trims the uniform black border back to the real image before
 * resizing, so the crop is the photo rather than the screenshot.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "client-assets/jpg";

const images = [
  /* ---------------- Hero ---------------- */
  {
    src: `${SRC}/06-Window-Cleaning-Liverpool/IMG_4045.jpg`,
    out: "public/images/hero/hero-still.jpg",
    width: 1800,
    quality: 78,
  },

  /* ---------------- Introduction ---------------- */
  {
    src: `${SRC}/07-General-Rope-Access/IMG_4184.jpg`,
    out: "public/images/home/introduction.jpg",
    width: 1200,
    quality: 74,
  },

  /* ---------------- Service index stage ----------------
   * Shown at roughly half-viewport width on desktop and full width on
   * mobile, so 1000px is ample. Six primary services; the two without
   * genuine service-specific imagery use a broader real BOVI photograph
   * with honest alt text — see ASSET-INVENTORY.md § Service imagery.
   */
  {
    src: `${SRC}/02-Window-Cleaning/ca095fda-7cb7-43c1-bfcb-080939001734.jpg`,
    out: "public/images/services/commercial-window-cleaning.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1722.jpg`,
    out: "public/images/services/brickwork-repointing.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_6272.jpg`,
    out: "public/images/services/gutter-cleaning.jpg",
    width: 1400,
    quality: 74,
    trimBars: true,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_5861.jpg`,
    out: "public/images/services/drainage-external-pipe-repairs.jpg",
    width: 1400,
    quality: 74,
    trimBars: true,
  },
  {
    // IMG_4093 was here and was WRONG: the technician is carrying a
    // window cleaner's bucket and squeegee, so the page for a sealant
    // service showed window cleaning kit. The client spotted it.
    // IMG_9969 shows a technician applying sealant from a cordless gun
    // into a vertical joint — genuinely this service.
    src: `${SRC}/07-General-Rope-Access/IMG_9969.jpg`,
    out: "public/images/services/mastic-sealant.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9398.jpg`,
    out: "public/images/services/pressure-washing-doff-cleaning.jpg",
    width: 1400,
    quality: 74,
  },

  /* ---------------- Projects grid ----------------
   * Deliberately three different crops — see DESIGN.md § Project
   * composition. Widths differ because the rendered sizes differ.
   */
  {
    src: `${SRC}/02-Window-Cleaning/IMG_7448.jpg`,
    out: "public/images/home/project-01.jpg",
    width: 1600,
    quality: 74,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1693.jpg`,
    out: "public/images/home/project-02.jpg",
    width: 1000,
    quality: 76,
  },
  {
    src: `${SRC}/04-Lightning-Protection/69a393a4-51c3-448c-a03d-aa86cce20539.jpg`,
    out: "public/images/home/project-03.jpg",
    width: 1200,
    quality: 76,
  },
  /* ---------------- Services 07-08 (secondary) ---------------- */
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9419.jpg`,
    out: "public/images/services/roof-roofline-repairs.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/04-Lightning-Protection/cf652e84-b883-4a7f-9cec-8e66c7e05797.jpg`,
    out: "public/images/services/lightning-protection.jpg",
    width: 1400,
    quality: 74,
  },

  /* ---------------- About ---------------- */
  {
    src: `${SRC}/02-Window-Cleaning/1886bb55-7623-4559-8a65-b2d8df3495dd.jpg`,
    out: "public/images/about/hero.jpg",
    width: 1600,
    quality: 76,
  },
  {
    src: `${SRC}/02-Window-Cleaning/5df96089-7359-4355-9b53-aa3473345e8b.jpg`,
    out: "public/images/about/elevation.jpg",
    width: 1400,
    quality: 76,
  },
  {
    src: `${SRC}/07-General-Rope-Access/IMG_2983.jpg`,
    out: "public/images/about/safety.jpg",
    width: 1200,
    quality: 74,
  },

  /* ---------------- Portfolio ---------------- */
  {
    src: `${SRC}/02-Window-Cleaning/IMG_3384.jpg`,
    out: "public/images/portfolio/hero.jpg",
    width: 1600,
    quality: 74,
  },
  {
    src: `${SRC}/06-Window-Cleaning-Liverpool/IMG_4063.jpg`,
    out: "public/images/home/project-04.jpg",
    width: 1200,
    quality: 74,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_5865.jpg`,
    out: "public/images/home/project-05.jpg",
    width: 1200,
    quality: 74,
    trimBars: true,
  },
  {
    src: `${SRC}/04-Lightning-Protection/4c19f2c3-9952-47b8-b19b-11cd8563a264.jpg`,
    out: "public/images/home/project-06.jpg",
    width: 1200,
    quality: 74,
  },
  /* ---------------- Service galleries ----------------
   * Added in the client image revision pass. Renan asked for more
   * pictures on the internal pages; every frame below is a genuine BOVI
   * photograph chosen because it shows THIS service, not because a slot
   * needed filling. Services with thin coverage get fewer images rather
   * than borrowed ones.
   *
   * Naming: `<slug>-01|02|03`. 01 is the large mid-page image; 02 and 03
   * are the asymmetric pair. A service with no 02/03 simply renders no
   * pair — see ServiceBody.
   */

  /* Commercial Window Cleaning — the best-covered service. */
  {
    src: `${SRC}/02-Window-Cleaning/810C5448-B313-4E13-8C42-B29AEEF4737E.jpg`,
    out: "public/images/services/commercial-window-cleaning-01.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/02-Window-Cleaning/IMG_9304.jpg`,
    out: "public/images/services/commercial-window-cleaning-02.jpg",
    width: 1100,
    quality: 74,
  },
  {
    src: `${SRC}/02-Window-Cleaning/bd7eada4-16f4-4dc4-b8ef-4a5d6970252d.jpg`,
    out: "public/images/services/commercial-window-cleaning-03.jpg",
    width: 1100,
    quality: 74,
  },

  /* Brickwork & Repointing — the "Repoint" folder. */
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1718.jpg`,
    out: "public/images/services/brickwork-repointing-01.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1745.jpg`,
    out: "public/images/services/brickwork-repointing-02.jpg",
    width: 1100,
    quality: 74,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1698.jpg`,
    out: "public/images/services/brickwork-repointing-03.jpg",
    width: 1200,
    quality: 74,
  },

  /* Gutter Cleaning — the gutter frames mis-filed under "Repoint",
     plus the cleared-outlet shot from the drainage set. */
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_0710.jpg`,
    out: "public/images/services/gutter-cleaning-01.jpg",
    width: 1400,
    quality: 74,
    trimBars: true,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_6274.jpg`,
    out: "public/images/services/gutter-cleaning-02.jpg",
    width: 1100,
    quality: 74,
    trimBars: true,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_0707.jpg`,
    out: "public/images/services/gutter-cleaning-03.jpg",
    width: 1100,
    quality: 74,
    trimBars: true,
  },

  /* Drainage & External Pipe Repairs — the "Waste pipe" folder. */
  {
    src: `${SRC}/05-Drainage-Pipes/PHOTO-2024-12-27-10-54-10.jpg`,
    out: "public/images/services/drainage-external-pipe-repairs-01.jpg",
    width: 1200,
    quality: 74,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_5859.jpg`,
    out: "public/images/services/drainage-external-pipe-repairs-02.jpg",
    width: 1100,
    quality: 74,
    trimBars: true,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_5863.jpg`,
    out: "public/images/services/drainage-external-pipe-repairs-03.jpg",
    width: 1100,
    quality: 74,
    trimBars: true,
  },

  /* Mastic & Sealant — previously recorded as having NO genuine
     imagery. It does: IMG_9892/9896/9966/9969 are one joint-sealing
     job, with backer rod, pointing trowel and a cordless sealant gun
     all visible. The earlier pass missed them because they sit in the
     unsorted "general" folder. */
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9892.jpg`,
    out: "public/images/services/mastic-sealant-01.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9966.jpg`,
    out: "public/images/services/mastic-sealant-02.jpg",
    width: 1100,
    quality: 74,
  },
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9896.jpg`,
    out: "public/images/services/mastic-sealant-03.jpg",
    width: 1100,
    quality: 74,
  },

  /* Pressure Washing / DOFF — still the thinnest service in the
     library. ONE additional genuine frame, and no pair. Better a
     shorter page than a borrowed photograph. */
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9664.jpg`,
    out: "public/images/services/pressure-washing-doff-cleaning-01.jpg",
    width: 1400,
    quality: 74,
    trimBars: true,
  },

  /* Roof & Roofline Repairs. */
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9420.jpg`,
    out: "public/images/services/roof-roofline-repairs-01.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/07-General-Rope-Access/IMG_6403.jpg`,
    out: "public/images/services/roof-roofline-repairs-02.jpg",
    width: 1100,
    quality: 74,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_0706.jpg`,
    out: "public/images/services/roof-roofline-repairs-03.jpg",
    width: 1100,
    quality: 74,
    trimBars: true,
  },

  /* Lightning Protection — the "Spda" folder. */
  {
    src: `${SRC}/04-Lightning-Protection/dc4aec95-66f6-49ef-a00b-af1b149e7c33.jpg`,
    out: "public/images/services/lightning-protection-01.jpg",
    width: 1400,
    quality: 74,
  },
  {
    src: `${SRC}/04-Lightning-Protection/7c7e3f8d-418f-46da-91c6-f5d7c61781ce.jpg`,
    out: "public/images/services/lightning-protection-02.jpg",
    width: 1100,
    quality: 74,
  },
  {
    src: `${SRC}/04-Lightning-Protection/fe14fd76-14a3-4dd7-9531-df2781e10d48.jpg`,
    out: "public/images/services/lightning-protection-03.jpg",
    width: 1100,
    quality: 74,
  },
  /* ---------------- Projects ----------------
   * Completed-work gallery. Renan asked for the Projects page to show
   * photographs of real jobs rather than route people back into the
   * service pages, so each entry below is ONE JOB and every frame in it
   * is from that same job — verified by reviewing the source folders as
   * contact sheets, not by trusting the folder names.
   *
   * Provenance for each grouping is in
   * client-assets/ASSET-INVENTORY.md § Project groupings. Do not add a
   * project here without adding that row, and do not mix frames from two
   * buildings into one project.
   *
   * `main` is the card and page-hero image; 01-03 are the detail gallery.
   */

  /* External pipework — cream glazed-brick lightwell, cast iron stacks. */
  {
    src: `${SRC}/05-Drainage-Pipes/PHOTO-2024-12-27-10-54-10.jpg`,
    out: "public/images/projects/external-pipe-repair/main.jpg",
    width: 1300,
    quality: 72,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_5861.jpg`,
    out: "public/images/projects/external-pipe-repair/01.jpg",
    width: 900,
    quality: 72,
    trimBars: true,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_5859.jpg`,
    out: "public/images/projects/external-pipe-repair/02.jpg",
    width: 900,
    quality: 72,
    trimBars: true,
  },
  {
    src: `${SRC}/05-Drainage-Pipes/IMG_5860.jpg`,
    out: "public/images/projects/external-pipe-repair/03.jpg",
    width: 900,
    quality: 72,
    trimBars: true,
  },

  /* Gutter and downpipe clearance — residential block, blocked hopper. */
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_0706.jpg`,
    out: "public/images/projects/gutter-downpipe-clearance/main.jpg",
    width: 1300,
    quality: 72,
    trimBars: true,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_0710.jpg`,
    out: "public/images/projects/gutter-downpipe-clearance/01.jpg",
    width: 900,
    quality: 72,
    trimBars: true,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_0711.jpg`,
    out: "public/images/projects/gutter-downpipe-clearance/02.jpg",
    width: 900,
    quality: 72,
    trimBars: true,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_0707.jpg`,
    out: "public/images/projects/gutter-downpipe-clearance/03.jpg",
    width: 900,
    quality: 72,
    trimBars: true,
  },

  /* Repointing — weathered chimney stacks and parapets. */
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1722.jpg`,
    out: "public/images/projects/brickwork-repointing-works/main.jpg",
    width: 1300,
    quality: 72,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1718.jpg`,
    out: "public/images/projects/brickwork-repointing-works/01.jpg",
    width: 900,
    quality: 72,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1745.jpg`,
    out: "public/images/projects/brickwork-repointing-works/02.jpg",
    width: 900,
    quality: 72,
  },
  {
    src: `${SRC}/03-Brickwork-Repointing/IMG_1698.jpg`,
    out: "public/images/projects/brickwork-repointing-works/03.jpg",
    width: 1100,
    quality: 72,
  },

  /* Lightning protection — one red brick block, conductor tape run. */
  {
    src: `${SRC}/04-Lightning-Protection/7c7e3f8d-418f-46da-91c6-f5d7c61781ce.jpg`,
    out: "public/images/projects/lightning-protection-works/main.jpg",
    width: 1300,
    quality: 72,
  },
  {
    src: `${SRC}/04-Lightning-Protection/4c19f2c3-9952-47b8-b19b-11cd8563a264.jpg`,
    out: "public/images/projects/lightning-protection-works/01.jpg",
    width: 900,
    quality: 72,
  },
  {
    src: `${SRC}/04-Lightning-Protection/cf652e84-b883-4a7f-9cec-8e66c7e05797.jpg`,
    out: "public/images/projects/lightning-protection-works/02.jpg",
    width: 900,
    quality: 72,
  },
  {
    src: `${SRC}/04-Lightning-Protection/dc4aec95-66f6-49ef-a00b-af1b149e7c33.jpg`,
    out: "public/images/projects/lightning-protection-works/03.jpg",
    width: 900,
    quality: 72,
  },

  /* Sealant renewal.
   *
   * TWO images, not four, on purpose. The general folder holds joint
   * sealing from TWO different sites — 9966/9969 on a brick-and-panel
   * block, and 9892/9896 on a rendered elevation beside a railway line.
   * They were nearly shipped as one project; presenting frames from two
   * buildings as one job is exactly what CONTENT-RULES.md §2 forbids, and
   * the second site has no frame showing the work itself. So this project
   * is the brick-and-panel site only, where the sealant gun and the bead
   * in the joint are both plainly visible. */
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9969.jpg`,
    out: "public/images/projects/mastic-sealant-renewal/main.jpg",
    width: 1300,
    quality: 72,
  },
  {
    src: `${SRC}/07-General-Rope-Access/IMG_9966.jpg`,
    out: "public/images/projects/mastic-sealant-renewal/01.jpg",
    width: 900,
    quality: 72,
  },

  /* Glazing clean — the single coherent apartment-block job. */
  {
    src: `${SRC}/06-Window-Cleaning-Liverpool/IMG_4045.jpg`,
    out: "public/images/projects/commercial-glazing-clean/main.jpg",
    width: 1300,
    quality: 72,
  },
  {
    src: `${SRC}/06-Window-Cleaning-Liverpool/IMG_4063.jpg`,
    out: "public/images/projects/commercial-glazing-clean/01.jpg",
    width: 900,
    quality: 72,
  },
  {
    src: `${SRC}/06-Window-Cleaning-Liverpool/IMG_4037.jpg`,
    out: "public/images/projects/commercial-glazing-clean/02.jpg",
    width: 900,
    quality: 72,
  },
  {
    src: `${SRC}/06-Window-Cleaning-Liverpool/IMG_4097.jpg`,
    out: "public/images/projects/commercial-glazing-clean/03.jpg",
    width: 900,
    quality: 72,
  },
];

let total = 0;

for (const img of images) {
  await mkdir(path.dirname(img.out), { recursive: true });
  let pipeline = sharp(img.src).rotate(); // honour EXIF orientation

  if (img.trimBars) {
    pipeline = pipeline.trim({ background: "#000000", threshold: 18 });
  }

  const info = await pipeline
    .resize({ width: img.width, withoutEnlargement: true })
    .jpeg({ quality: img.quality, mozjpeg: true, progressive: true })
    .toFile(img.out);

  total += info.size;
  console.log(
    `${img.out.padEnd(56)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(4)}  ${(info.size / 1024).toFixed(0).padStart(4)}KB`,
  );
}

console.log(`\n${images.length} images, ${(total / 1024 / 1024).toFixed(2)}MB total`);
