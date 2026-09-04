/**
 * Builds a labelled contact sheet for a client-asset folder so images can
 * be reviewed in one pass instead of opened individually.
 * Output goes to a scratch dir and is never committed.
 *
 * Usage: node scripts/contact-sheet.mjs <folder> <out.jpg> [cols]
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const [folder, out, colsArg] = process.argv.slice(2);
const COLS = Number(colsArg) || 5;
const TW = 300;
const TH = 225;
const LABEL = 22;

const files = (await readdir(folder))
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort();

const rows = Math.ceil(files.length / COLS);
const W = COLS * TW;
const H = rows * (TH + LABEL);

const composites = [];
for (let i = 0; i < files.length; i++) {
  const x = (i % COLS) * TW;
  const y = Math.floor(i / COLS) * (TH + LABEL);
  const buf = await sharp(path.join(folder, files[i]))
    .resize(TW - 4, TH - 4, { fit: "cover" })
    .jpeg({ quality: 72 })
    .toBuffer();
  composites.push({ input: buf, left: x + 2, top: y + 2 });

  const label = files[i].replace(/\.jpe?g$/i, "").slice(0, 32);
  const svg = `<svg width="${TW}" height="${LABEL}"><rect width="${TW}" height="${LABEL}" fill="#101211"/><text x="6" y="15" font-family="monospace" font-size="13" fill="#4caf45">${i + 1}. ${label}</text></svg>`;
  composites.push({ input: Buffer.from(svg), left: x, top: y + TH });
}

await mkdir(path.dirname(out), { recursive: true });
await sharp({
  create: { width: W, height: H, channels: 3, background: "#101211" },
})
  .composite(composites)
  .jpeg({ quality: 78 })
  .toFile(out);

console.log(`${out}  ${W}x${H}  ${files.length} images`);
