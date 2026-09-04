/**
 * Produces the web derivative of the hero background video.
 *
 * Run with: npm run assets:video
 *
 * Source: client-assets/BOVI-hero-background.MP4 (client-supplied, never
 * modified, never committed — see .gitignore).
 * Output: public/media/bovi-hero-background.mp4
 *
 * WHY RE-ENCODE RATHER THAN REMUX
 *
 * The source is 1280x548 at 6544 kb/s — roughly six times the bitrate that
 * resolution needs. It is also written with the `moov` atom AFTER `mdat`,
 * so a browser has to download almost the whole 13.7MB before it can show
 * a single frame. And it carries an AAC audio track that a muted
 * background video must never ship.
 *
 * So the pass does three things that all matter:
 *   -crf 24          sane bitrate for background footage
 *   -movflags +faststart   moov first, so playback can begin while loading
 *   -an              drop the audio track entirely
 *
 * Resolution is left at the source's native 1280x548. Upscaling would add
 * bytes without adding detail.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import ffmpeg from "ffmpeg-static";

const SRC = "client-assets/BOVI-hero-background.MP4";
const OUT = "public/media/bovi-hero-background.mp4";

mkdirSync("public/media", { recursive: true });

const args = [
  "-y",
  "-i", SRC,
  // Video: H.264 High, widely supported, CRF-based so quality is
  // consistent rather than pinned to a bitrate guess.
  "-c:v", "libx264",
  "-profile:v", "high",
  "-crf", "24",
  "-preset", "slow",
  // Cap keyframe interval so looping restarts cleanly.
  "-g", "48",
  "-pix_fmt", "yuv420p",
  // Decorative, muted background footage — audio is dead weight and a
  // liability if a browser ever unmutes.
  "-an",
  // moov atom first: the browser can start playing before the whole file
  // has arrived. The source did not have this.
  "-movflags", "+faststart",
  OUT,
];

const result = spawnSync(ffmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });

if (result.status !== 0) {
  console.error(result.stderr?.toString().split("\n").slice(-12).join("\n"));
  process.exit(1);
}

const before = statSync(SRC).size;
const after = statSync(OUT).size;

console.log(
  `${OUT}\n` +
    `  ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB ` +
    `(${Math.round((1 - after / before) * 100)}% smaller), audio removed, faststart enabled`,
);
