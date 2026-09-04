/**
 * BOVI ACCESS — Hero media resolution.
 *
 * ============================================================
 * TO SWAP THE HERO VIDEO, CHANGE ONE VALUE — NOTHING ELSE.
 * ============================================================
 *
 * Phase 1-3 (now):
 *   Set NEXT_PUBLIC_BOVI_HERO_VIDEO_URL in .env.local / Vercel.
 *
 * Phase 4 (once Sanity is live):
 *   Renan sets `heroVideoUrl` on the `homepage` singleton in Sanity Studio.
 *   Pass that value into `resolveHeroMedia({ cms })` from the Homepage's
 *   server component. It takes precedence over the environment variable.
 *   No component, style or layout change is required for either path.
 *
 * There is deliberately NO hardcoded video URL anywhere in this codebase.
 * If no URL is configured, `videoUrl` resolves to `null` and the Hero
 * renders the genuine BOVI still image instead — which is a fully
 * supported production state, not a degraded one.
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
    videoUrl: cms?.videoUrl?.trim() || readEnvVideoUrl(),
    posterImage: poster,
    fallbackImage: cms?.fallbackImage?.trim() || poster,
    imageAlt: cms?.imageAlt?.trim() || DEFAULT_HERO_ALT,
  };
}
