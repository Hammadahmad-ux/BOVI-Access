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
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "client-assets/jpg";

/** slot -> source file. Provenance is documented in ASSET-INVENTORY.md. */
const images = [
  {
    src: `${SRC}/06-Window-Cleaning-Liverpool/IMG_4045.jpg`,
    out: "public/images/hero/hero-still.jpg",
    width: 1800,
    quality: 78,
  },
];

for (const img of images) {
  await mkdir(path.dirname(img.out), { recursive: true });
  const info = await sharp(img.src)
    .rotate() // honour EXIF orientation
    .resize({ width: img.width, withoutEnlargement: true })
    .jpeg({ quality: img.quality, mozjpeg: true, progressive: true })
    .toFile(img.out);
  console.log(
    `${img.out.padEnd(40)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`,
  );
}
