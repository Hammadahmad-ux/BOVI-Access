"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { DURATION, EASE_OUT } from "@/lib/animations/motion";
import { cn } from "@/lib/utils/cn";
import { useMediaQuery } from "@/lib/utils/use-media-query";

/**
 * The interactive half of the Homepage service index — DESIGN.md §8.
 *
 * Desktop is a sticky photographic stage on the left and six numbered
 * editorial rows on the right. Active state is driven by plain React state
 * from pointer AND focus, deliberately NOT by scroll position: a
 * ScrollTrigger/pinning implementation here would be a scroll trap, would
 * fight the sticky header, and would break the moment a row wraps to two
 * lines. Pointer + focus is the reliable version of the same idea, and it
 * is the only version a keyboard user can actually drive.
 *
 * All six stage images are rendered stacked and only their opacity changes,
 * so switching rows never triggers a network request and never flashes an
 * empty frame. They are lazy by default, and the stage is `display: none`
 * below `lg`, so a phone never downloads them.
 *
 * Alt-text split, deliberate: the stage is the visible photograph on
 * desktop and carries the content module's alt verbatim, with the inactive
 * frames aria-hidden so only the one on screen is announced. The inline
 * thumbnail below `lg` sits INSIDE the row link, where a full alt string
 * would be prepended to the link's accessible name ("Three BOVI Access
 * technicians… Commercial Window Cleaning"), so it is marked decorative —
 * the link text already names what the picture shows.
 */

export type ServiceIndexRow = {
  slug: string;
  name: string;
  /** Two-digit editorial numeral from src/lib/config/site.ts. */
  index: string;
  description: string;
  image: { src: string; alt: string };
};

type ServiceIndexRowsProps = {
  rows: readonly ServiceIndexRow[];
  className?: string;
};

export function ServiceIndexRows({ rows, className }: ServiceIndexRowsProps) {
  // First row is active on load so the stage is never empty, and so the
  // section reads correctly on touch, where nothing is ever hovered.
  const [activeIndex, setActiveIndex] = useState(0);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const crossfade = reducedMotion ? 0 : DURATION.base;
  // The resting frame sits a hair larger and settles inward as it becomes
  // active. Anything beyond ~2% starts to read as a slideshow.
  const restingScale = reducedMotion ? 1 : 1.02;

  return (
    <div
      className={cn(
        "lg:grid lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)] lg:gap-x-16",
        className,
      )}
    >
      {/*
        Stretched grid item (no items-start) — the sticky child needs the
        column to be as tall as the rows or it has no room to stick.
      */}
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-ink-raised">
            {rows.map((row, i) => {
              const isActive = i === activeIndex;
              return (
                <motion.div
                  key={row.slug}
                  aria-hidden={!isActive}
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    scale: isActive ? 1 : restingScale,
                  }}
                  transition={{ duration: crossfade, ease: EASE_OUT }}
                >
                  <Image
                    src={row.image.src}
                    alt={row.image.alt}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    quality={72}
                    className="object-cover object-center"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="border-t border-hairline-dark">
        {rows.map((row, i) => {
          const isActive = i === activeIndex;

          return (
            <li key={row.slug} className="border-b border-hairline-dark">
              <Link
                href={`/services/${row.slug}`}
                onMouseEnter={() => setActiveIndex(i)}
                onFocus={() => setActiveIndex(i)}
                // Stable hook for the e2e guard that proves the stage
                // responds to keyboard focus, not only to hover.
                data-active={isActive}
                className="group grid min-h-11 gap-4 py-7 md:grid-cols-[10rem_minmax(0,1fr)] md:items-center md:gap-7 lg:block lg:py-9"
              >
                {/* Below lg only — desktop is served by the sticky stage. */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-ink-raised md:aspect-[4/5] lg:hidden">
                  <Image
                    src={row.image.src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 10rem, 100vw"
                    quality={72}
                    className="object-cover object-center"
                  />
                </div>

                <div className="flex items-start gap-4 md:gap-5 lg:gap-8">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "eyebrow shrink-0 pt-1 tabular-nums transition-colors duration-200 md:pt-2 lg:pt-4",
                      // On touch there is no active row to indicate, so every
                      // numeral carries the accent; the mist/green split is a
                      // desktop-only signal.
                      "text-green-bright",
                      isActive ? "lg:text-green-bright" : "lg:text-mist",
                    )}
                  >
                    {row.index}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        "text-bone transition-colors duration-200",
                        isActive ? "lg:text-bone" : "lg:text-mist",
                      )}
                    >
                      {row.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 max-w-[52ch] text-small text-mist transition-colors duration-200 lg:mt-4",
                        isActive && "lg:text-bone/80",
                      )}
                    >
                      {row.description}
                    </p>
                  </div>

                  <ArrowRight
                    aria-hidden="true"
                    className={cn(
                      "mt-1 size-5 shrink-0 text-mist transition-[transform,color] duration-200 md:mt-2 lg:mt-4 lg:size-6",
                      "group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5",
                      isActive ? "lg:text-green-bright" : "lg:text-mist",
                    )}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
