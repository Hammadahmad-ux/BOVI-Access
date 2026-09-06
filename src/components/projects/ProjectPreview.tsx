import type { ImageAsset } from "@/lib/content/types";
import { ZoomableImage } from "@/components/ui/ZoomableImage";

type ProjectPreviewProps = {
  image: ImageAsset;
  /** Used for the accessible names and the caption under the large image. */
  title: string;
  category: string;
  /** Hero plus gallery. Shown as a badge only when there is more to see. */
  photoCount: number;
};

/**
 * The card thumbnail on /portfolio, and the lightbox it opens.
 *
 * WHY THE IMAGE IS A BUTTON AND THE TITLE IS A LINK
 *
 * The client asked for smaller photographs that can be clicked to view
 * larger, while keeping the project pages. Those are two destinations
 * from one card, so they need two controls — nesting a button inside the
 * card link would be invalid and would leave a visitor unsure what a
 * click does. The photograph opens the image; the title opens the job.
 *
 * The dialog itself lives in ZoomableImage, shared with the service
 * pages. This file is now only the project-specific dressing: the ratio,
 * the photo-count badge and the caption.
 */
export function ProjectPreview({
  image,
  title,
  category,
  photoCount,
}: ProjectPreviewProps) {
  return (
    <ZoomableImage
      image={image}
      label={title}
      /*
        One ratio for every card, at every breakpoint. 4:5 rather than
        anything wider: the library is portrait phone photography, and a
        4:3 crop of these frames cuts the technician out of the brickwork,
        lightning and sealant shots entirely — checked against the real
        photographs before choosing.
      */
      frameClassName="aspect-[4/5]"
      /* Small by design. Four columns at xl, so the rendered card is
         roughly 290px wide — nowhere near the source width. */
      sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
      overlay={
        photoCount > 1 ? (
          <span className="eyebrow absolute right-3 bottom-3 rounded-xs bg-ink/80 px-2.5 py-1.5 text-bone backdrop-blur-sm">
            {photoCount} photos
          </span>
        ) : null
      }
      caption={
        <>
          <span className="eyebrow text-green-bright">{category}</span>
          <span className="mt-1 block text-bone">{title}</span>
        </>
      }
    />
  );
}
