import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityConfig } from "@/lib/config/env";

const builder = imageUrlBuilder({
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
});

/** Build a Sanity CDN URL for an image reference. */
export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto("format").fit("max");
}
