/**
 * Shared content types.
 *
 * Lives apart from the individual content modules so `home`, `services`
 * and `projects` can all use it without importing each other — which
 * would otherwise be circular.
 */

export type ImageAsset = {
  src: string;
  alt: string;
  /** Intrinsic dimensions of the generated derivative — prevents CLS. */
  width: number;
  height: number;
  /**
   * Where the subject sits, 0-1 on each axis, from the Sanity hotspot.
   *
   * Cards crop with `object-fit: cover`, which otherwise centres — and
   * centring a portrait photograph inside a shorter frame is exactly how
   * a technician ends up half out of shot. Undefined means centre, which
   * is right for the local images because their crops were chosen by eye.
   */
  focalPoint?: { x: number; y: number };
};
