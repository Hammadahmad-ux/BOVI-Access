import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityConfig } from "@/lib/config/env";
import type { ImageAsset } from "@/lib/content/types";

/** The shape Sanity returns for an image field, plus our custom alt. */
export type SanityImage = {
  _type?: string;
  alt?: string;
  asset?: { _ref?: string; _id?: string };
  hotspot?: { x: number; y: number };
  crop?: unknown;
};

const builder = sanityConfig.isConfigured
  ? createImageUrlBuilder({
      projectId: sanityConfig.projectId,
      dataset: sanityConfig.dataset,
    })
  : null;

/**
 * Sanity encodes the source dimensions in the asset ref, e.g.
 * `image-abc123-1400x1867-jpg`. Reading them lets us reserve the correct
 * aspect ratio up front instead of shipping a layout shift.
 */
function dimensionsFromRef(ref?: string): { width: number; height: number } {
  const match = ref?.match(/-(\d+)x(\d+)-/);
  if (!match) return { width: 1400, height: 1867 };
  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * Converts a Sanity image into the same ImageAsset shape the local
 * content modules use, so components never learn where an image came
 * from.
 *
 * Returns `fallback` (or null) when the field is empty or the CMS is not
 * configured — a half-filled document must never blank out a page.
 *
 * Alt text is REQUIRED at the schema level. If it is somehow missing we
 * return the fallback rather than emit an unlabelled image.
 */
export function imageAssetFrom(
  image: SanityImage | undefined,
  fallback: ImageAsset,
): ImageAsset;
export function imageAssetFrom(
  image: SanityImage | undefined,
  fallback?: undefined,
): ImageAsset | null;
export function imageAssetFrom(
  image: SanityImage | undefined,
  fallback?: ImageAsset,
): ImageAsset | null {
  const ref = image?.asset?._ref ?? image?.asset?._id;
  if (!builder || !image || !ref || !image.alt?.trim()) {
    return fallback ?? null;
  }

  const { width, height } = dimensionsFromRef(ref);

  // Cap the source width: next/image resizes again at request time, so
  // pulling the full original would waste bandwidth for no visual gain.
  const cappedWidth = Math.min(width, 1800);
  const cappedHeight = Math.round((height / width) * cappedWidth);

  return {
    src: builder
      .image(image)
      .width(cappedWidth)
      .auto("format")
      .fit("max")
      .url(),
    alt: image.alt.trim(),
    width: cappedWidth,
    height: cappedHeight,
  };
}
