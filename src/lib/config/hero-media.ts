/**
 * BOVI ACCESS — Hero media resolution.
 *
 * ============================================================
 * TO SWAP THE HERO VIDEO, CHANGE ONE VALUE — NOTHING ELSE.
 * ============================================================
 *
 * RESOLUTION ORDER (first match wins):
 *   1. Sanity  — `heroVideoUrl` on the `homepage` singleton. This is where
 *                Renan changes it, with no developer involved.
 *   2. Env     — NEXT_PUBLIC_BOVI_HERO_VIDEO_URL, for a deployment that
 *                needs a different video before the CMS is connected.
 *   3. Local   — the client-supplied footage bundled at
 *                /media/bovi-hero-desktop.mp4 and
 *                /media/bovi-hero-mobile.mp4.
 *   4. None    — the genuine BOVI photograph, if the local file is ever
 *                removed. A supported state, not a broken one.
 *
 * The same order applies to the poster and fallback images.
 *
 * Setting DEFAULT_HERO_VIDEO to null returns the hero to the photograph.
 * Either of the two layers above it overrides the local file without any
 * code change, which is the whole point of this module.
 */

export type HeroMedia = {
  /**
   * Video for wide viewports, or null when none is configured.
   *
   * The local default is a 16:9 composition built from the client's
   * portrait footage — see scripts/generate-hero-video.mjs.
   */
  videoUrl: string | null;
  /**
   * Video for narrow viewports. The client's footage is portrait, so
   * below the composite's breakpoint the phone simply gets the original
   * 9:16 frame, which fits a phone almost exactly.
   *
   * A single URL from Sanity or env sets BOTH: one video is still a
   * complete answer, and Renan is never asked to supply two.
   */
  videoUrlNarrow: string | null;
  /**
   * Poster frame shown while the video loads, and the LCP image when no
   * video is configured. Must be a genuine BOVI photograph.
   */
  posterImage: string;
  /**
   * Still shown when video cannot or should not play — reduced-motion
   * users, mobile data-saving, decode failure. May equal `posterImage`.
   */
  fallbackImage: string;
  /** Alt text for the still. Required; describes the real photograph. */
  imageAlt: string;
};

export type HeroMediaOverrides = {
  /**
   * Values sourced from the Sanity `homepage` singleton.
   *
   * `videoUrl` here is the schema's single `heroVideoUrl` field. It is
   * deliberately NOT split in two: the CMS contract stays one video URL,
   * and the responsive pair is a local production detail.
   */
  cms?: Partial<Pick<HeroMedia, "videoUrl" | "posterImage" | "fallbackImage" | "imageAlt">>;
};

/**
 * Genuine BOVI photograph used as the Hero still until a video is approved.
 * Derived from the client's own asset package — see client-assets/ASSET-INVENTORY.md
 * for the source file and provenance.
 */
const DEFAULT_HERO_STILL = "/images/hero/hero-still.jpg";

const DEFAULT_HERO_ALT =
  "BOVI Access rope access technician working at height on the facade of a modern brick and metal-clad building";

/**
 * Client-supplied hero footage, encoded by `npm run assets:video` from
 * client-assets/hero-new-background.mov.
 *
 * This is BOVI's own montage — rope-access technicians working glazing,
 * descending elevations and rigging at roof level, carrying a BOVI ACCESS
 * watermark. It replaces the earlier clip whose provenance was never
 * confirmed.
 *
 * The source is a single 36s portrait (1080x1920) file. Two derivatives
 * come out of it because one shape cannot serve both hero layouts:
 *
 *   desktop  1920x1080  the portrait frame laid over a blurred, darkened
 *                       copy of itself, offset right so the typography
 *                       keeps the left of the frame
 *   mobile   1080x1920  the portrait frame as shot
 *
 * Setting either to null is safe: the hero falls back to the genuine
 * BOVI photograph, which is a supported state.
 */
const DEFAULT_HERO_VIDEO: string | null = "/media/bovi-hero-desktop.mp4";
const DEFAULT_HERO_VIDEO_NARROW: string | null = "/media/bovi-hero-mobile.mp4";

function readEnvVideoUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_BOVI_HERO_VIDEO_URL?.trim();
  if (!raw) return null;
  // Guard against a placeholder being shipped to production by mistake.
  if (!/^https?:\/\//i.test(raw)) return null;
  return raw;
}

export function resolveHeroMedia(overrides: HeroMediaOverrides = {}): HeroMedia {
  const { cms } = overrides;

  const poster = cms?.posterImage?.trim() || DEFAULT_HERO_STILL;

  // One configured URL replaces both derivatives. Anything Renan or a
  // deployment supplies is a single video, and it should play at every
  // width rather than only on desktop.
  const configured = cms?.videoUrl?.trim() || readEnvVideoUrl() || null;

  return {
    videoUrl: configured || DEFAULT_HERO_VIDEO,
    videoUrlNarrow: configured || DEFAULT_HERO_VIDEO_NARROW,
    posterImage: poster,
    fallbackImage: cms?.fallbackImage?.trim() || poster,
    imageAlt: cms?.imageAlt?.trim() || DEFAULT_HERO_ALT,
  };
}
