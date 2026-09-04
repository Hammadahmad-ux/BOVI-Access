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
 *                /media/bovi-hero-background.mp4.
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
  /** Remote video URL, or null when none is configured. */
  videoUrl: string | null;
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
  /** Values sourced from the Sanity `homepage` singleton (Phase 4). */
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
 * Client-supplied hero footage, encoded for the web by
 * `npm run assets:video` from client-assets/BOVI-hero-background.MP4.
 *
 * 17.5s, 1280x548, silent, faststart. The source is 2.34:1 — far wider
 * than a portrait phone viewport — which is a further reason the video is
 * suppressed on small screens in favour of the still (see HeroMedia).
 *
 * PROVENANCE PENDING: supplied and approved by the client as temporary
 * hero footage. It has not been confirmed as BOVI's own crew — the PPE
 * and setting differ from the verified BOVI photography. Tracked in
 * client-assets/ASSET-INVENTORY.md; confirm before launch.
 */
const DEFAULT_HERO_VIDEO: string | null = "/media/bovi-hero-background.mp4";

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

  return {
    videoUrl: cms?.videoUrl?.trim() || readEnvVideoUrl() || DEFAULT_HERO_VIDEO,
    posterImage: poster,
    fallbackImage: cms?.fallbackImage?.trim() || poster,
    imageAlt: cms?.imageAlt?.trim() || DEFAULT_HERO_ALT,
  };
}
