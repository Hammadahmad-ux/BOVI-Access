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
};
