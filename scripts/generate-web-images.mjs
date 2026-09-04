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
    src: `${SRC}/07-General-Rope-Access/IMG_4093.jpg`,
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

  /* ---------------- Featured project ---------------- */
  {
    src: `${SRC}/06-Window-Cleaning-Liverpool/IMG_4077.jpg`,
    out: "public/images/home/featured-project.jpg",
    width: 1500,
    quality: 76,
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
