/**
 * Captures full-page screenshots of a running build at the mandatory QA
 * widths, then slices each into readable chunks for review.
 *
 * Usage: node scripts/qa-shots.mjs <baseUrl> <path> [widths...]
 * Output goes to qa-screenshots/ (git-ignored).
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";

const [baseUrl = "http://localhost:3212", pagePath = "/", ...widthArgs] =
  process.argv.slice(2);
const widths = widthArgs.length ? widthArgs.map(Number) : [1440, 1024, 768, 390];

const OUT = "qa-screenshots";
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(baseUrl + pagePath, { waitUntil: "networkidle" });

  // Above-the-fold capture FIRST, before any scrolling. fullPage
  // screenshots displace sticky/fixed elements, so the header and hero
  // composition can only be judged from a real viewport capture.
  await page.waitForTimeout(2200); // let the hero entrance sequence finish
  await page
    .screenshot()
    .then((buf) =>
      sharp(buf).resize({ width: Math.min(width, 820) }).jpeg({ quality: 78 })
        .toFile(`${OUT}/w${width}-fold.jpg`),
    );

  // Scroll the whole page so lazy images load and every scroll reveal
  // fires and COMPLETES. Reveals run for 0.65s, so the dwell at each stop
  // must comfortably exceed that or fullPage catches them mid-fade.
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 420));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1600);

  const buffer = await page.screenshot({ fullPage: true });
  const meta = await sharp(buffer).metadata();

  // Downscale to a readable review width, then slice vertically.
  const reviewWidth = Math.min(width, 820);
  const scaled = await sharp(buffer)
    .resize({ width: reviewWidth })
    .jpeg({ quality: 74 })
    .toBuffer();
  const scaledMeta = await sharp(scaled).metadata();

  const CHUNK = 1500;
  const chunks = Math.ceil(scaledMeta.height / CHUNK);
  for (let i = 0; i < chunks; i++) {
    const top = i * CHUNK;
    const height = Math.min(CHUNK, scaledMeta.height - top);
    await sharp(scaled)
      .extract({ left: 0, top, width: scaledMeta.width, height })
      .jpeg({ quality: 76 })
      .toFile(`${OUT}/w${width}-${String(i + 1).padStart(2, "0")}.jpg`);
  }

  console.log(`${width}px  page ${meta.width}x${meta.height}  -> ${chunks} chunks`);
  await page.close();
}

await browser.close();
