import type { CSSProperties } from "react";
import type { ImageAsset } from "@/lib/content/types";

/**
 * The Sanity hotspot Renan sets in Studio, expressed as a CSS
 * `object-position`.
 *
 * WHY THIS EXISTS. Sanity images carry two editable pieces of framing:
 *
 *   crop     a rectangle cut out of the source. `@sanity/image-url` bakes
 *            this into the URL (`?rect=…`), so it is already respected —
 *            see `imageAssetFrom` in ./image.ts.
 *   hotspot  which part of the (cropped) image must stay in view when the
 *            layout crops it further. This CANNOT be baked into one URL,
 *            because the same cached image is displayed in several
 *            different aspect frames across the site (a 5:4 card, a 3:4
 *            column, a near-full-viewport hero). It has to be applied at
 *            render time.
 *
 * Every component that renders a CMS image with `object-fit: cover` reads
 * this so the crop follows the hotspot instead of the frame's centre.
 * `object-cover` centres by default, and centring a portrait photograph
 * inside a shorter frame is exactly how a technician ends up half out of
 * shot.
 *
 * Returns `undefined` when there is no hotspot — local assets, and any
 * image whose hotspot was never moved in Studio. Undefined leaves the CSS
 * default (centre), which is what those crops were composed for, so a
 * call site can spread this unconditionally.
 */
export function focalPointStyle(
  image: Pick<ImageAsset, "focalPoint"> | undefined | null,
): CSSProperties | undefined {
  const point = image?.focalPoint;
  if (!point) return undefined;

  // Clamp defensively: a malformed hotspot must not push the subject off
  // the frame entirely.
  const x = Math.min(100, Math.max(0, point.x * 100));
  const y = Math.min(100, Math.max(0, point.y * 100));

  return { objectPosition: `${x.toFixed(2)}% ${y.toFixed(2)}%` };
}
