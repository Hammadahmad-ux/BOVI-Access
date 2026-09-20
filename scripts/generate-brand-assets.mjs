/**
 * Generates the production brand + favicon assets from the client's
 * 2026 rebrand artwork.
 *
 * Run with: npm run assets:brand
 *
 * Sources (client-assets/new logo/ — never written to by this script):
 *   Bovi access new logo.png      1600x1600, OPAQUE black ground. The new
 *                                 BOVI ACCESS lockup: green wordmark, white
 *                                 ACCESS + rope-access figure.
 *   O sign logo favicon .jpeg     1600x1600, OPAQUE black ground. The "O" +
 *                                 rope-access technician icon.
 *
 * WHY THE BLACK IS REMOVED RATHER THAN LEFT IN. The header, footer and mobile
 * menu sit on the site's ink ground (#101211), not pure black, so an opaque
 * black lockup would show as a visibly darker rectangle. And the artwork has
 * anti-aliased edges, so a simple "make black transparent" cut would leave a
 * dark fringe.
 *
 * The lockup is only ever two colours over black — the brand green and an
 * off-white — so each pixel is UNMIXED into how much of each colour it holds:
 * pixel = white * a_w + green * a_g (the remainder being black). Alpha is
 * a_w + a_g and the colour is the weighted mix, which recovers clean,
 * fringe-free edges against ANY ground. The same alpha then drives the
 * on-light variant, with the white recoloured to ink.
 *
 * Nothing is redrawn or reinterpreted — the artwork's own pixels are the input.
 *
 * Outputs:
 *   public/brand/bovi-access-logo-on-dark.png    header / footer / mobile menu
 *   public/brand/bovi-access-logo-on-light.png   Organization JSON-LD logo
 *   public/brand/bovi-mark-on-dark.png           the O + figure on its own
 *   src/app/icon.png, src/app/apple-icon.png     favicon / app icons
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "client-assets/new logo";
const LOGO = `${SRC}/Bovi access new logo.png`;
const ICON = `${SRC}/O sign logo favicon .jpeg`;

// Measured from the artwork: the solid green of the wordmark, and the
// off-white of the figure (the ACCESS letters run a shade brighter, which the
// clamp below folds into the same colour).
const GREEN = [42, 125, 37];
const WHITE = [245, 245, 245];
// The site's --color-ink, used for the on-light variant.
const INK = [16, 18, 17];

await mkdir("public/brand", { recursive: true });

/**
 * Unmixes an opaque white+green-on-black image into a transparent RGBA
 * buffer. `whiteAs` is the colour the white component is rendered in.
 * `noiseFloor` zeroes alpha below it, so JPEG noise in the black ground does
 * not survive as a faint haze.
 */
async function unmixToTransparent(file, { whiteAs, noiseFloor, trimThreshold }) {
  const { data, info } = await sharp(file)
    .removeAlpha()
    .trim({ threshold: trimThreshold })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const ww = dot(WHITE, WHITE);
  const gg = dot(GREEN, GREEN);
  const wg = dot(WHITE, GREEN);
  const det = ww * gg - wg * wg;

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, o = 0; i < data.length; i += info.channels, o += 4) {
    const p = [data[i], data[i + 1], data[i + 2]];
    const pw = dot(WHITE, p);
    const pg = dot(GREEN, p);

    // Least-squares solve of p = aw*WHITE + ag*GREEN.
    let aw = Math.max(0, (gg * pw - wg * pg) / det);
    let ag = Math.max(0, (ww * pg - wg * pw) / det);
    const sum = aw + ag;
    if (sum > 1) {
      aw /= sum;
      ag /= sum;
    }

    const alpha = Math.min(1, sum);
    if (alpha < noiseFloor) continue; // stays fully transparent

    for (let c = 0; c < 3; c++) {
      out[o + c] = Math.round((aw * whiteAs[c] + ag * GREEN[c]) / (aw + ag));
    }
    out[o + 3] = Math.round(alpha * 255);
  }

  return { data: out, width: info.width, height: info.height };
}

async function writeTransparent(image, out, width) {
  const info = await sharp(image.data, {
    raw: { width: image.width, height: image.height, channels: 4 },
  })
    .resize({ width, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(
    `${out.padEnd(48)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)}KB`,
  );
}

// ---- Logo lockups --------------------------------------------------------
const lockupOnDark = await unmixToTransparent(LOGO, {
  whiteAs: WHITE,
  noiseFloor: 0.02,
  trimThreshold: 16,
});
const lockupOnLight = await unmixToTransparent(LOGO, {
  whiteAs: INK,
  noiseFloor: 0.02,
  trimThreshold: 16,
});
await writeTransparent(lockupOnDark, "public/brand/bovi-access-logo-on-dark.png", 720);
await writeTransparent(lockupOnLight, "public/brand/bovi-access-logo-on-light.png", 720);

// ---- The "O" mark on its own --------------------------------------------
// A JPEG, so the black ground carries compression noise: a higher noise
// floor keeps it from surviving as haze around the ring.
const mark = await unmixToTransparent(ICON, {
  whiteAs: WHITE,
  noiseFloor: 0.08,
  trimThreshold: 24,
});
await writeTransparent(mark, "public/brand/bovi-mark-on-dark.png", 256);

// ---- App icons -----------------------------------------------------------
// The client's icon is designed on a solid black square, so that is kept:
// tightly cropped to the "O" with an even margin so it stays legible at 16px,
// on the same pure black as its own counter so the two never disagree.
const BLACK = { r: 0, g: 0, b: 0 };
// PNG intermediate: the source is a JPEG, and sharp would otherwise re-encode
// the trimmed crop as a second, lossy JPEG generation.
const { data: iconCrop, info: iconInfo } = await sharp(ICON)
  .removeAlpha()
  .trim({ threshold: 24 })
  .png()
  .toBuffer({ resolveWithObject: true });

const side = Math.ceil(Math.max(iconInfo.width, iconInfo.height) * 1.16);
const padX = side - iconInfo.width;
const padY = side - iconInfo.height;

// Built as its own step: sharp always runs `resize` BEFORE `extend` whatever
// order they are chained in, so padding and scaling in one pipeline scales
// the bare crop and then adds unscaled padding around it.
const iconSquare = await sharp(iconCrop)
  .extend({
    left: Math.floor(padX / 2),
    right: Math.ceil(padX / 2),
    top: Math.floor(padY / 2),
    bottom: Math.ceil(padY / 2),
    background: BLACK,
  })
  .png()
  .toBuffer();

const icons = [
  [512, "src/app/icon.png"],
  [180, "src/app/apple-icon.png"],
];

for (const [size, out] of icons) {
  const info = await sharp(iconSquare)
    .resize(size, size, { kernel: "lanczos3" })
    .flatten({ background: BLACK })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(
    `${out.padEnd(48)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)}KB`,
  );
}
