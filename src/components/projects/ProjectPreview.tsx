"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { ImageAsset } from "@/lib/content/types";

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
 * BUILT ON <dialog>, NOT A LIBRARY
 *
 * `showModal()` already gives the focus trap, the inert background, the
 * Escape handling and focus restoration on close. A gallery dependency
 * would ship kilobytes to reimplement what the platform does correctly.
 * The only things left to add are the scroll lock and a backdrop click.
 *
 * The full-size image is not rendered until the dialog opens, so a page
 * of twelve projects downloads twelve thumbnails, not twelve full-size
 * photographs.
 */
export function ProjectPreview({
  image,
  title,
  category,
  photoCount,
}: ProjectPreviewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  /*
    Opening and the scroll lock are BOTH tied to `open`, and the lock is
    released by this effect's cleanup rather than by the dialog's `close`
    event.

    Doing it the other way round left the page unscrollable: the lock was
    taken in the click handler and released in a `close` listener, so its
    lifetime depended on two separate things staying in step. Under load
    they did not, and the suite caught body overflow still "hidden" after
    Escape at four viewports. Tied to state, the lock cannot outlive the
    dialog — React guarantees the cleanup.

    Render happens before showModal because the <img> has to exist first,
    or the dialog opens empty for a frame.
  */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.showModal();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Fires for the close button, Escape and backdrop click alike.
    const handleClose = () => setOpen(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const openDialog = useCallback(() => setOpen(true), []);

  const focalPoint = image.focalPoint
    ? `${image.focalPoint.x * 100}% ${image.focalPoint.y * 100}%`
    : undefined;

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={`View larger image for ${title}`}
        className="group/img relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-ink-raised"
      >
        {/*
          One ratio for every card, at every breakpoint. 4:5 rather than
          anything wider: the library is portrait phone photography, and a
          4:3 crop of these frames cuts the technician out of the
          brickwork, lightning and sealant shots entirely — checked
          against the real photographs before choosing.
        */}
        <span className="relative block aspect-[4/5]">
          <Image
            src={image.src}
            alt=""
            fill
            /* Small by design. Four columns at xl, so the rendered card is
               roughly 290px wide — nowhere near the source width. */
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
            quality={72}
            style={focalPoint ? { objectPosition: focalPoint } : undefined}
            className="object-cover object-center transition-transform duration-500 group-hover/img:scale-[1.03] group-focus-visible/img:scale-[1.03]"
          />
        </span>

        {photoCount > 1 ? (
          <span className="eyebrow absolute right-3 bottom-3 rounded-xs bg-ink/80 px-2.5 py-1.5 text-bone backdrop-blur-sm">
            {photoCount} photos
          </span>
        ) : null}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`${title} — larger image`}
        /*
          Backdrop clicks land on the dialog element itself, so anything
          that reaches this handler is outside the figure below.
        */
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/90 backdrop:backdrop-blur-sm"
      >
        {open ? (
          <div className="flex max-h-[92vh] w-[94vw] max-w-[1400px] flex-col items-center gap-4 p-2">
            <figure className="flex min-h-0 flex-col items-center gap-3">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="94vw"
                /* 75, not a higher number: next.config.ts declares
                   `qualities: [72, 75]`, and Next 16 silently falls back
                   to the default for anything not listed. Asking for 82
                   here looked like a decision and delivered 75. */
                quality={75}
                priority
                /* `contain`, never `cover` — the whole point of opening it
                   is to see the photograph, not another crop of it. */
                className="max-h-[80vh] w-auto rounded-sm object-contain"
              />
              <figcaption className="text-center text-small text-mist">
                <span className="eyebrow text-green-bright">{category}</span>
                <span className="mt-1 block text-bone">{title}</span>
              </figcaption>
            </figure>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close image"
          className="fixed top-4 right-4 inline-flex size-11 items-center justify-center rounded-sm bg-ink/80 text-bone backdrop-blur-sm transition-colors hover:bg-ink sm:top-6 sm:right-6"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </dialog>
    </>
  );
}
