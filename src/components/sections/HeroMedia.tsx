"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import type { HeroMedia as HeroMediaConfig } from "@/lib/config/hero-media";
import {
  useMediaQuery,
  useResolvedMediaQuery,
} from "@/lib/utils/use-media-query";

type HeroMediaProps = {
  media: HeroMediaConfig;
  /** Overlay strength. The Hero's text contrast depends on this. */
  overlay?: "soft" | "standard" | "strong";
};

/**
 * Flat scrim, used at every width.
 *
 * On wide viewports it steps down, because the desktop encode already
 * carries a baked left-to-right darkening gradient (see
 * scripts/generate-hero-video.mjs). Keeping the full-strength flat scrim
 * on top of that would stack two scrims and leave the client's footage
 * looking switched off — the thing this revision exists to avoid.
 */
const overlays = {
  soft: "bg-ink/35 lg:bg-ink/25",
  standard: "bg-ink/55 lg:bg-ink/35",
  strong: "bg-ink/74 lg:bg-ink/40",
} as const;

/**
 * The width at which the hero switches from the portrait encode to the
 * 16:9 composition. Must stay in step with `lg:` in the overlay classes
 * above and with PANEL_X in scripts/generate-hero-video.mjs.
 *
 * 1024 rather than 1280: the composition is built with the sharp panel
 * inset from the right edge precisely so it survives the side-cropping
 * that `object-fit: cover` applies at 1024. Below that the viewport is
 * portrait-ish and the portrait encode is simply the better picture.
 */
const WIDE = "(min-width: 1024px)";

/**
 * Hero background media.
 *
 * Renders the still image ALWAYS — it is the LCP element and the guaranteed
 * fallback. Video, when configured, layers over the still and fades in only
 * once it can actually play. This means:
 *   - no blank hero while video buffers
 *   - no layout shift
 *   - no broken hero if the video URL is wrong or blocked
 *
 * Video is suppressed for reduced-motion users. It plays at every width
 * otherwise, phones included, at the client's request.
 *
 * RESPONSIVE SOURCE
 *
 * The client's footage is portrait, so there are two encodes of it and
 * the browser must fetch exactly one. `useResolvedMediaQuery` returns
 * null until hydration rather than guessing, so nothing is server
 * rendered with a src and no viewport ever starts the wrong download.
 * The `key` remounts the element if the breakpoint is crossed, which is
 * what makes the browser actually load the other file rather than keep
 * playing the stale one.
 *
 * The video URLs themselves come from `resolveHeroMedia()`. Nothing in
 * this component knows or cares where they were configured.
 */
export function HeroMedia({ media, overlay = "standard" }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [readySrc, setReadySrc] = useState<string | null>(null);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isWide = useResolvedMediaQuery(WIDE);

  const videoSrc =
    reducedMotion || isWide === null
      ? null
      : (isWide ? media.videoUrl : media.videoUrlNarrow) ?? null;

  /**
   * Ref callback rather than an effect, because `canplay` can fire BEFORE
   * an effect gets the chance to subscribe — on a cached or fast-starting
   * file the event is simply missed, the video stays hidden, and it plays
   * at opacity 0 behind the poster. That is exactly what happened on
   * mobile once. Checking readyState at the moment the element is
   * attached closes the race; the onCanPlay prop below covers the slower
   * path.
   */
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (!node) return;
    // HAVE_FUTURE_DATA or better — enough to paint a frame.
    if (node.readyState >= 3) setReadySrc(node.currentSrc || node.src);
    // Autoplay can still be refused; the still simply remains visible.
    void node.play().catch(() => undefined);
  }, []);

  // Compared against the current source, not a bare boolean, so that
  // switching encodes hides the element until the NEW file can play
  // instead of showing a stale frame at full opacity.
  const visible = readySrc !== null && videoSrc !== null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={media.fallbackImage}
        alt={media.imageAlt}
        fill
        priority
        sizes="100vw"
        quality={72}
        className="object-cover object-center"
      />

      {videoSrc ? (
        <video
          key={videoSrc}
          ref={attachVideo}
          onCanPlay={(event) =>
            setReadySrc(event.currentTarget.currentSrc || videoSrc)
          }
          src={videoSrc}
          poster={media.posterImage}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          /*
            Wide: the composition is authored at 16:9, so `cover` only
            trims the sides and object-position stays centred.

            Narrow: a 9:16 encode on a portrait phone is very nearly an
            exact fit — at 390x800 barely 30px is lost from each side.
            The 45% vertical bias holds the frame on the action for the
            squarer tablet case, where cover has to crop top and bottom.
          */
          className={`absolute inset-0 size-full object-cover object-[50%_45%] transition-opacity duration-700 lg:object-center ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}

      {/* Readability layer. Sits above media, below content. */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${overlays[overlay]}`}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40"
      />
      {/*
        Wide only. The desktop encode bakes in a left-weighted gradient,
        but the hero also renders over the STILL when video is suppressed
        or has not started, and the still has no such gradient. This keeps
        the left column readable in both states without darkening the
        right, where the sharp footage sits.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-ink/70 via-ink/20 to-transparent lg:block"
      />
    </div>
  );
}
