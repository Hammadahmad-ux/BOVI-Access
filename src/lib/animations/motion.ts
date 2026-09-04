/**
 * Shared motion constants.
 *
 * Every animation in the app pulls its timing from here, so the whole site
 * moves with one hand. Scattering magic durations across components is how
 * a site ends up feeling inconsistent.
 *
 * Target intensity is 6/10 — see CLAUDE.md §11.
 */

/** Standard ease-out. Decisive start, soft landing. */
export const EASE_OUT = [0.22, 0.61, 0.36, 1] as const;

/** For masked text reveals — slightly sharper. */
export const EASE_MASK = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  /** Hover, colour, small state changes. */
  fast: 0.2,
  /** Standard entrance. */
  base: 0.65,
  /** Large media and mask reveals. */
  slow: 0.9,
} as const;

/** Stagger between siblings in a revealed group. */
export const STAGGER = 0.08;

/**
 * Hero entrance timeline, in seconds from sequence start.
 * Total must stay within 1.4–1.8s and must never gate interaction.
 */
export const HERO_TIMELINE = {
  eyebrow: 0.15,
  line1: 0.3,
  line2: 0.42,
  line3: 0.54,
  supporting: 0.8,
  body: 0.9,
  ctas: 1.02,
  trustRail: 1.16,
} as const;

/** Viewport trigger shared by every scroll reveal. */
export const VIEWPORT = { once: true, amount: 0.25, margin: "0px 0px -80px 0px" } as const;
