/**
 * Generates the production brand + favicon assets from the client's
 * original transparent PNG logo files.
 *
 * Run with: npm run assets:brand
 *
 * Source of truth is client-assets/raw/Logo (untracked). This script is
 * idempotent and safe to re-run; it never writes back to the raw folder.
 *
 * Logo variant map (established by visual inspection — see
 * client-assets/ASSET-INVENTORY.md):
 *   Access - 1(1).PNG  transparent, green BOVI + WHITE ACCESS  -> dark grounds
 *   Access - 3.PNG     transparent, green BOVI + DARK ACCESS   -> light grounds
 *   Access - 2(1).PNG  transparent, green ring + white figure  -> dark grounds
 *   Access - 2.PNG     opaque black ground, green ring         -> favicon
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const RAW = "client-assets/raw/Logo";

await mkdir("public/brand", { recursive: true });

const lockups = [
  {
    src: `${RAW}/Access - 1(1).PNG`,
    out: "public/brand/bovi-access-lockup-on-dark.png",
    width: 720,
  },
  {
    src: `${RAW}/Access - 3.PNG`,
    out: "public/brand/bovi-access-lockup-on-light.png",
    width: 720,
  },
  {
    src: `${RAW}/Access - 2(1).PNG`,
    out: "public/brand/bovi-mark-on-dark.png",
    width: 256,
  },
];

for (const job of lockups) {
  const info = await sharp(job.src)
    .trim({ threshold: 1 })
    .resize({ width: job.width, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(job.out);
  console.log(
    `${job.out.padEnd(48)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)}KB`,
  );
}

// App icons. The opaque dark-ground mark reads correctly against any
// browser chrome, so it is the safe choice for a tab icon.
const icons = [
  [512, "src/app/icon.png"],
  [180, "src/app/apple-icon.png"],
];

for (const [size, out] of icons) {
  const info = await sharp(`${RAW}/Access - 2.PNG`)
    .trim({ threshold: 10 })
    .resize(size, size, { fit: "contain", background: "#101211" })
    .flatten({ background: "#101211" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(
    `${out.padEnd(48)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)}KB`,
  );
}
