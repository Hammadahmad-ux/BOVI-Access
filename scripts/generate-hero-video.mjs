/**
 * Produces the web derivatives of the hero background video.
 *
 * Run with: npm run assets:video
 *
 * Source: client-assets/hero-new-background.mov — the client's own BOVI
 * Access montage. Never modified, never committed (see .gitignore).
 *
 * Outputs:
 *   public/media/bovi-hero-desktop.mp4   1920x1080 composite
 *   public/media/bovi-hero-mobile.mp4    810x1440 portrait
 *
 * ---------------------------------------------------------------------
 * WHY THIS IS NOT A SIMPLE RE-ENCODE
 *
 * 1. THE SOURCE IS HDR. It is HEVC Main 10, Dolby Vision profile 8.4,
 *    BT.2020 primaries with an HLG transfer. Handing that to libx264 with
 *    `-pix_fmt yuv420p` and nothing else produces the classic washed-out,
 *    grey, desaturated result: the wide-gamut values get reinterpreted as
 *    BT.709 and everything flattens. TONEMAP below does the conversion
 *    properly — linearise, tone map with Hable, then land in BT.709.
 *
 * 2. THE SOURCE IS PORTRAIT (1080x1920) AND THE DESKTOP HERO IS WIDE.
 *    Cropping a 9:16 frame to 16:9 throws away three quarters of the
 *    picture, and stretching it is not an option. So the desktop file is
 *    a composition built from the same footage:
 *
 *      - a copy scaled to fill 1920x1080, heavily blurred and darkened,
 *        as the backdrop;
 *      - the untouched portrait footage, at its own aspect ratio, laid
 *        over it toward the right;
 *      - the panel's vertical edges feathered into the backdrop so there
 *        is no pillarbox seam;
 *      - a left-weighted darkening gradient, because the hero typography
 *        sits on the left and has to stay readable over moving footage.
 *
 *    The panel is INSET from the right edge rather than flush with it.
 *    The hero renders this video with `object-fit: cover`, so a narrower
 *    viewport crops the sides: at 1024px roughly 230px is lost from each
 *    edge. A flush-right panel would lose its right third there. Inset,
 *    it loses about 6%.
 *
 * 3. THE AUDIO TRACK MUST GO. A muted background video has no use for it
 *    and it is a liability if a browser ever unmutes.
 *
 * Metadata is stripped (`-map_metadata -1`): the source carries the
 * client's editing-tool metadata and creation timestamps, which have no
 * business being served to the public.
 *
 * ---------------------------------------------------------------------
 * `shortest=1` IS LOAD BEARING. The two mask PNGs are `-loop 1` inputs,
 * which never end. Without it the filter graph keeps producing frames
 * after the video runs out and the encode runs until it is killed — the
 * first attempt at this reached 40MB and was still going. Every
 * framesync filter fed by a looped input needs it.
 *
 * FILE WEIGHT. The client's montage is 36s, where the previous clip was
 * 17.5s, so at equivalent quality it costs roughly twice the bytes. CRF
 * and resolution are the only real levers: dropping to 24fps saves
 * nothing, because CRF targets quality per frame and fewer frames simply
 * cost more each. The mobile encode is 810px rather than 1080 because it
 * is 100% sharp handheld footage, where the desktop file is mostly cheap
 * blur with a 608px sharp strip. If the pages need to be lighter, the
 * honest lever is a shorter edit — which is the client's call, not ours.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const SRC = "client-assets/hero-new-background.mov";
const OUT_DESKTOP = "public/media/bovi-hero-desktop.mp4";
const OUT_MOBILE = "public/media/bovi-hero-mobile.mp4";

/** Portrait encode width. See the note on file weight in the header. */
const MOBILE_W = 810;

/* ------------------------------------------------------------------ */
/* Composition constants                                               */
/* ------------------------------------------------------------------ */

const CANVAS_W = 1920;
const CANVAS_H = 1080;

/** The portrait panel at full canvas height, 9:16, rounded to even. */
const PANEL_H = CANVAS_H;
const PANEL_W = Math.round((1080 / 1920) * PANEL_H / 2) * 2; // 608

/**
 * Left edge of the sharp panel. 1056/1920 = 55% across, leaving 256px of
 * backdrop to its right. See note 2 above for why it is not flush right.
 */
const PANEL_X = 1056;

/** Feather widths, in px, on the panel's left and right edges. */
const FEATHER_LEFT = 130;
const FEATHER_RIGHT = 80;

/**
 * HLG BT.2020 -> BT.709 SDR. `npl=100` treats the HLG signal as mastered
 * for a 100-nit reference, which is what keeps midtones where the client
 * shot them instead of crushing them.
 */
const TONEMAP =
  "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709," +
  "tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p";

/* ------------------------------------------------------------------ */
/* Masks                                                               */
/* ------------------------------------------------------------------ */

const TMP = tmpdir();
const FEATHER_PNG = path.join(TMP, "bovi-hero-feather.png");
const SCRIM_PNG = path.join(TMP, "bovi-hero-scrim.png");

/** Smoothstep — a linear ramp leaves a visible edge where it starts. */
const smooth = (t) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

/**
 * Greyscale alpha mask for the sharp panel: transparent at both vertical
 * edges, fully opaque through the middle. `alphamerge` reads this as the
 * panel's alpha so it dissolves into the blurred backdrop.
 */
async function writeFeatherMask() {
  const data = Buffer.alloc(PANEL_W * PANEL_H);
  for (let x = 0; x < PANEL_W; x++) {
    const left = smooth(x / FEATHER_LEFT);
    const right = smooth((PANEL_W - 1 - x) / FEATHER_RIGHT);
    const value = Math.round(255 * Math.min(left, right));
    for (let y = 0; y < PANEL_H; y++) data[y * PANEL_W + x] = value;
  }
  await sharp(data, { raw: { width: PANEL_W, height: PANEL_H, channels: 1 } })
    .png()
    .toFile(FEATHER_PNG);
}

/**
 * Black RGBA scrim, opaque on the left and clear by the time it reaches
 * the panel. This is what buys contrast for the H1, the supporting copy,
 * the CTAs and the trust rail without dimming the client's footage — the
 * failure mode we are avoiding is a hero so darkened that the work is no
 * longer visible.
 */
async function writeScrim() {
  const data = Buffer.alloc(CANVAS_W * CANVAS_H * 4);
  // Full strength to 22% of the width, gone by 60% — just short of the
  // panel's left feather, so the two transitions do not stack.
  const solidTo = CANVAS_W * 0.22;
  const clearAt = CANVAS_W * 0.6;
  const PEAK = 0.7; // 70% black at the left edge

  for (let x = 0; x < CANVAS_W; x++) {
    const t = (x - solidTo) / (clearAt - solidTo);
    const alpha = Math.round(255 * PEAK * (1 - smooth(t)));
    for (let y = 0; y < CANVAS_H; y++) {
      const i = (y * CANVAS_W + x) * 4;
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = alpha;
    }
  }
  await sharp(data, {
    raw: { width: CANVAS_W, height: CANVAS_H, channels: 4 },
  })
    .png()
    .toFile(SCRIM_PNG);
}

/* ------------------------------------------------------------------ */
/* Encode                                                              */
/* ------------------------------------------------------------------ */

function run(args, label) {
  const result = spawnSync(ffmpeg, args, {
    stdio: ["ignore", "ignore", "pipe"],
    maxBuffer: 1024 * 1024 * 64,
  });
  if (result.status !== 0) {
    console.error(`\n${label} FAILED\n`);
    console.error(result.stderr?.toString().split("\n").slice(-25).join("\n"));
    process.exit(1);
  }
}

/** Shared x264 settings. 30fps: the source is 60, which a background
 *  montage does not need and which doubles the bitrate. */
const encode = (crf) => [
  "-c:v", "libx264",
  "-profile:v", "high",
  "-crf", String(crf),
  "-preset", "slow",
  "-r", "30",
  "-g", "60",
  "-pix_fmt", "yuv420p",
  "-an",
  "-map_metadata", "-1",
  "-movflags", "+faststart",
];

mkdirSync("public/media", { recursive: true });

await writeFeatherMask();
await writeScrim();

/* ---- Desktop: the 16:9 composition -------------------------------- */
const filter = [
  `[0:v]${TONEMAP},fps=30,split=2[bg][fg]`,
  // Backdrop: fill the canvas width, take the middle band, blur, darken
  // and desaturate so it reads as depth rather than as a second video.
  `[bg]scale=${CANVAS_W}:-2:flags=lanczos,crop=${CANVAS_W}:${CANVAS_H},` +
    `gblur=sigma=42:steps=3,eq=brightness=-0.16:saturation=0.55,` +
    `hqdn3d=2:1.5:6:6[bgo]`,
  // Sharp panel: the untouched frame, scaled by height only.
  `[fg]scale=-2:${PANEL_H}:flags=lanczos,format=yuva420p[fgs]`,
  `[1:v]format=gray[fmask]`,
  `[fgs][fmask]alphamerge=shortest=1[fga]`,
  `[bgo][fga]overlay=x=${PANEL_X}:y=0:format=auto:shortest=1[comp]`,
  `[comp][2:v]overlay=x=0:y=0:format=auto:shortest=1,format=yuv420p[out]`,
].join(";");

run(
  [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", SRC,
    "-loop", "1", "-i", FEATHER_PNG,
    "-loop", "1", "-i", SCRIM_PNG,
    "-filter_complex", filter,
    "-map", "[out]",
    ...encode(29),
    OUT_DESKTOP,
  ],
  "desktop",
);

/* ---- Mobile: the portrait frame, untouched ------------------------ */
run(
  [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", SRC,
    "-vf", `${TONEMAP},fps=30,scale=${MOBILE_W}:-2:flags=lanczos`,
    // 33 rather than 31: at a real phone width the two are
    // indistinguishable, and this is the connection least able to afford
    // the bytes. Checked side by side at 390px before choosing.
    ...encode(33),
    OUT_MOBILE,
  ],
  "mobile",
);

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2);
console.log(
  `${SRC}  ${mb(SRC)}MB (HDR HEVC 1080x1920 60fps)\n` +
    `  -> ${OUT_DESKTOP}  ${CANVAS_W}x${CANVAS_H}  ${mb(OUT_DESKTOP)}MB\n` +
    `  -> ${OUT_MOBILE}   ${MOBILE_W}x1440          ${mb(OUT_MOBILE)}MB\n` +
    `  tone mapped to BT.709, audio removed, metadata stripped, faststart`,
);
