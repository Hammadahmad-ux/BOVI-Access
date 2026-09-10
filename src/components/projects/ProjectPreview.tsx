import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import type { ImageAsset } from "@/lib/content/types";
import { focalPointStyle } from "@/lib/sanity/focal-point";

type ProjectPreviewProps<T extends string> = {
  image: ImageAsset;
  /**
   * `/projects/<slug>` — where the photograph and the title both go.
   * Generic over the route for the same reason `ArrowLink` is: a bare
   * `Route` collapses its dynamic branch to `never`.
   */
  href: Route<T>;
  /** For the accessible name on the image link. */
  title: string;
  /** Hero plus gallery. Shown as a badge only when there is more to see. */
  photoCount: number;
};

/**
 * The card photograph on /portfolio.
 *
 * The client asked for the photograph to open the project, exactly like
 * the title beneath it: "clicking the main project photo should navigate
 * to the project detail page". So this is now a link, not a lightbox
 * trigger — the lightbox belongs on the detail page, where a visitor is
 * actually looking at the job.
 *
 * TWO LINKS, ONE DESTINATION. The title link carries the accessible name;
 * this one is `aria-hidden` and off the tab order so a keyboard or
 * screen-reader user reaches the project once, not twice. Mouse users can
 * click either. This is the standard "clickable card" pattern.
 */
export function ProjectPreview<T extends string>({
  image,
  href,
  title,
  photoCount,
}: ProjectPreviewProps<T>) {
  return (
    <Link
      href={href}
      aria-hidden="true"
      tabIndex={-1}
      data-card-image
      className="group/img relative block w-full cursor-pointer overflow-hidden rounded-sm bg-ink-raised"
    >
      {/*
        Same ratio for every card, at every breakpoint. 4:5 rather than
        anything wider: the library is portrait phone photography, and a
        4:3 crop cuts the technician out of the brickwork, lightning and
        sealant shots entirely.
      */}
      <span className="relative block aspect-[4/5]">
        <Image
          src={image.src}
          /* Decorative: the title link beside this one names the project. */
          alt=""
          fill
          /* Small by design. Four columns at xl, so the rendered card is
             roughly 290px wide — nowhere near the source width. */
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
          quality={72}
          /* Follows the Sanity hotspot rather than the frame's centre. */
          style={focalPointStyle(image)}
          className="object-cover transition-transform duration-500 group-hover/img:scale-[1.03]"
        />
      </span>

      {photoCount > 1 ? (
        <span className="eyebrow absolute right-3 bottom-3 rounded-xs bg-ink/80 px-2.5 py-1.5 text-bone backdrop-blur-sm">
          {photoCount} photos
        </span>
      ) : null}

      <span className="sr-only">{title}</span>
    </Link>
  );
}
