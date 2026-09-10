"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ImageAsset } from "@/lib/content/types";
import { focalPointStyle } from "@/lib/sanity/focal-point";
import { cn } from "@/lib/utils/cn";

/**
 * One gallery lightbox, shared by the service and project detail pages.
 *
 * WHY A PROVIDER RATHER THAN A SELF-CONTAINED WIDGET
 *
 * A service page splits its three photographs across two sections — one
 * beside "Access and delivery", a pair under the overview — but a visitor
 * who opens any of them expects to page through all three without
 * closing. So the lightbox state has to live above the thumbnails, not
 * inside each one. `<GalleryProvider>` owns the array and the open index;
 * every `<GalleryThumb index={n}>` is just a trigger; the dialog renders
 * once, here.
 *
 * BUILT ON <dialog>. `showModal()` gives the focus trap, the inert
 * background, Escape, and focus restoration to the thumbnail that opened
 * it — all for free. The additions are the scroll lock, the backdrop
 * click, arrow-key and swipe navigation, and the counter.
 *
 * The full-size images are not rendered until the dialog opens, so a page
 * of thumbnails downloads thumbnails.
 */

export type GalleryItem = {
  image: ImageAsset;
  /** Completes "View larger image for …" on the trigger and the dialog. */
  label: string;
  /** Shown under the large image. Omit for none. */
  caption?: ReactNode;
};

type GalleryContextValue = {
  items: readonly GalleryItem[];
  openAt: (index: number) => void;
};

const GalleryContext = createContext<GalleryContextValue | null>(null);

function useGalleryContext(): GalleryContextValue {
  const value = useContext(GalleryContext);
  if (!value) {
    throw new Error("<GalleryThumb> must be rendered inside <GalleryProvider>");
  }
  return value;
}

export function GalleryProvider({
  items,
  children,
}: {
  items: readonly GalleryItem[];
  children: ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);

  const openAt = useCallback(
    (next: number) => {
      if (next >= 0 && next < items.length) setIndex(next);
    },
    [items.length],
  );

  const close = useCallback(() => setIndex(null), []);

  const go = useCallback(
    (delta: number) =>
      setIndex((current) =>
        current === null
          ? current
          : (current + delta + items.length) % items.length,
      ),
    [items.length],
  );

  return (
    <GalleryContext.Provider value={{ items, openAt }}>
      {children}
      <GalleryDialog items={items} index={index} onClose={close} onNavigate={go} />
    </GalleryContext.Provider>
  );
}

/**
 * A thumbnail that opens the shared lightbox at its own index.
 *
 * Deliberately the same shape as the old standalone control — a
 * `<button aria-label="View larger image for …">` wrapping a
 * `span.block` aspect frame — so the layout and the existing tests do
 * not need to know the lightbox became a gallery.
 */
export function GalleryThumb({
  index,
  sizes,
  frameClassName = "aspect-[4/5]",
  className,
  overlay,
}: {
  index: number;
  /** Must reflect the real rendered width. */
  sizes: string;
  /** The aspect frame, e.g. "aspect-[4/5]". */
  frameClassName?: string;
  /** Extra classes on the trigger — sizing, column placement. */
  className?: string;
  /** Rendered inside the trigger, over the thumbnail. */
  overlay?: ReactNode;
}) {
  const { items, openAt } = useGalleryContext();
  const item = items[index];
  if (!item) return null;

  return (
    <button
      type="button"
      onClick={() => openAt(index)}
      aria-haspopup="dialog"
      aria-label={`View larger image for ${item.label}`}
      className={cn(
        "group/img relative block w-full cursor-zoom-in overflow-hidden rounded-sm bg-ink-raised",
        className,
      )}
    >
      <span className={cn("relative block", frameClassName)}>
        <Image
          src={item.image.src}
          alt=""
          fill
          sizes={sizes}
          quality={72}
          /* The Sanity hotspot, so the crop follows the subject rather
             than the frame's centre. Undefined for local assets. */
          style={focalPointStyle(item.image)}
          className="object-cover transition-transform duration-500 group-hover/img:scale-[1.03] group-focus-visible/img:scale-[1.03]"
        />
      </span>

      {overlay}
    </button>
  );
}

const SWIPE_THRESHOLD_PX = 45;

function GalleryDialog({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: readonly GalleryItem[];
  index: number | null;
  onClose: () => void;
  onNavigate: (delta: number) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;
  const hasMany = items.length > 1;

  /*
    REACT STATE IS THE SOURCE OF TRUTH, not the dialog.

    `index === null` closes it. This effect opens the native dialog and
    takes the scroll lock while `open`, and its cleanup both releases the
    lock and calls `.close()` — so a close triggered anywhere (the X,
    Escape, the backdrop) just sets `index` to null and everything unwinds
    here. The `close` event is not relied on: some engines do not fire it
    for a programmatic `.close()`, and the lock outliving the dialog was
    the exact bug this shape avoids.

    Render happens before `showModal` because the <img> has to exist
    first, or the dialog opens empty for a frame.
  */
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    // The thumbnail that opened it — focus goes back here on close.
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    if (dialog && !dialog.open) dialog.showModal();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog?.open) dialog.close();
      // Explicit rather than relying on the dialog's own restoration,
      // which does not fire everywhere for a programmatic close.
      opener?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Escape: `cancel` is preventable and reliably fired; take it over so
    // the dialog closes through React state like every other path.
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    // `close` still fires in most engines — a harmless no-op once state
    // is already null, and a safety net where it is the only signal.
    const handleClose = () => onClose();

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  // Arrow keys page through the set; Escape is the native <dialog>'s own.
  useEffect(() => {
    if (!open || !hasMany) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate(-1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, hasMany, onNavigate]);

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const origin = touchStart.current;
    touchStart.current = null;
    if (!origin || !hasMany) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - origin.x;
    const dy = touch.clientY - origin.y;

    // A deliberate horizontal swipe: far enough, and clearly sideways
    // rather than a scroll that drifted.
    if (Math.abs(dx) >= SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onNavigate(dx < 0 ? 1 : -1);
    }
  };

  const item = index !== null ? items[index] : null;

  return (
    <dialog
      ref={dialogRef}
      aria-label={item ? `${item.label} — larger image` : "Photograph"}
      /*
        Backdrop clicks land on the dialog element itself, so anything
        that reaches this handler is outside the figure below.
      */
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/90 backdrop:backdrop-blur-sm"
    >
      {open && item ? (
        <div
          className="flex max-h-[92vh] w-[94vw] max-w-[1400px] flex-col items-center gap-4 p-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <figure className="flex min-h-0 flex-col items-center gap-3">
            <Image
              src={item.image.src}
              alt={item.image.alt}
              width={item.image.width}
              height={item.image.height}
              sizes="94vw"
              /* 75, not higher: next.config.ts declares `qualities: [72,
                 75]` and Next 16 silently falls back for anything else. */
              quality={75}
              priority
              /* `contain`, never `cover` — the point of opening it is to
                 see the whole photograph, not another crop. */
              className="max-h-[80vh] w-auto rounded-sm object-contain"
            />
            {item.caption ? (
              <figcaption className="text-center text-small text-mist">
                {item.caption}
              </figcaption>
            ) : null}
          </figure>

          {hasMany ? (
            <p
              aria-live="polite"
              className="text-small tabular-nums text-mist"
            >
              {index + 1} / {items.length}
            </p>
          ) : null}
        </div>
      ) : null}

      {hasMany ? (
        <>
          <button
            type="button"
            onClick={() => onNavigate(-1)}
            aria-label="Previous image"
            className="fixed top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-sm bg-ink/80 text-bone backdrop-blur-sm transition-colors hover:bg-ink sm:left-6"
          >
            <ChevronLeft aria-hidden="true" className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate(1)}
            aria-label="Next image"
            className="fixed top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-sm bg-ink/80 text-bone backdrop-blur-sm transition-colors hover:bg-ink sm:right-6"
          >
            <ChevronRight aria-hidden="true" className="size-6" />
          </button>
        </>
      ) : null}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close image"
        className="fixed top-4 right-4 inline-flex size-11 items-center justify-center rounded-sm bg-ink/80 text-bone backdrop-blur-sm transition-colors hover:bg-ink sm:top-6 sm:right-6"
      >
        <X aria-hidden="true" className="size-5" />
      </button>
    </dialog>
  );
}
