"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { ImageAsset } from "@/lib/content/types";
import { cn } from "@/lib/utils/cn";

type ZoomableImageProps = {
  image: ImageAsset;
  /** Completes "View larger image for …" on the trigger. */
  label: string;
  /** Shown under the large image. Omit for no caption. */
  caption?: ReactNode;
  /** The aspect frame, e.g. "aspect-[4/5]". */
  frameClassName?: string;
  /** Extra classes on the trigger button — sizing, column placement. */
  className?: string;
  /** Thumbnail `sizes`. Must reflect the real rendered width. */
  sizes: string;
  /** Rendered inside the trigger, over the thumbnail. */
  overlay?: ReactNode;
};

/**
 * A photograph that opens full size when clicked.
 *
 * Extracted from the Projects card so the service pages could reuse it
 * rather than grow a second, subtly different modal. Everything that was
 * hard to get right the first time lives here once: the dialog, the
 * scroll lock, the backdrop click, focus restoration.
 *
 * BUILT ON <dialog>. `showModal()` already gives the focus trap, the
 * inert background, Escape handling and focus restoration on close, so a
 * gallery dependency would only ship kilobytes to reimplement the
 * platform. The scroll lock and the backdrop click are the additions.
 *
 * The full-size image is not rendered until the dialog opens, so a page
 * of thumbnails downloads thumbnails.
 */
export function ZoomableImage({
  image,
  label,
  caption,
  frameClassName = "aspect-[4/5]",
  className,
  sizes,
  overlay,
}: ZoomableImageProps) {
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

  // The Sanity hotspot, so a CMS image crops around its subject rather
  // than its centre. Undefined for local assets, whose crops were chosen
  // by eye.
  const focalPoint = image.focalPoint
    ? `${image.focalPoint.x * 100}% ${image.focalPoint.y * 100}%`
    : undefined;

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={`View larger image for ${label}`}
        className={cn(
          "group/img relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-ink-raised",
          className,
        )}
      >
        <span className={cn("relative block", frameClassName)}>
          <Image
            src={image.src}
            alt=""
            fill
            sizes={sizes}
            quality={72}
            style={focalPoint ? { objectPosition: focalPoint } : undefined}
            className="object-cover object-center transition-transform duration-500 group-hover/img:scale-[1.03] group-focus-visible/img:scale-[1.03]"
          />
        </span>

        {overlay}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`${label} — larger image`}
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
                   to the default for anything not listed. */
                quality={75}
                priority
                /* `contain`, never `cover` — the whole point of opening it
                   is to see the photograph, not another crop of it. */
                className="max-h-[80vh] w-auto rounded-sm object-contain"
              />
              {caption ? (
                <figcaption className="text-center text-small text-mist">
                  {caption}
                </figcaption>
              ) : null}
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
