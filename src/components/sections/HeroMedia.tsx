"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import type { HeroMedia as HeroMediaConfig } from "@/lib/config/hero-media";
import { useMediaQuery } from "@/lib/utils/use-media-query";

type HeroMediaProps = {
  media: HeroMediaConfig;
  /** Overlay strength. The Hero's text contrast depends on this. */
  overlay?: "soft" | "standard" | "strong";
};

const overlays = {
  soft: "bg-ink/35",
  standard: "bg-ink/55",
  strong: "bg-ink/70",
} as const;

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
 * Video is deliberately suppressed for reduced-motion users and on small
 * viewports, where the still is both faster and the better composition.
 *
 * The video URL itself comes from `resolveHeroMedia()`. Nothing in this
 * component knows or cares where it was configured.
 */
export function HeroMedia({ media, overlay = "standard" }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Video now plays at every width, phones included, at the client's
  // request. Reduced motion is still honoured — that is a stated user
  // preference, not a breakpoint.
  const useVideo = Boolean(media.videoUrl) && !reducedMotion;

  /**
   * Ref callback rather than an effect, because `canplay` can fire BEFORE
   * an effect gets the chance to subscribe — on a cached or fast-starting
   * file the event is simply missed, `videoReady` stays false, and the
   * video plays at opacity 0 behind the poster. That is exactly what
   * happened on mobile. Checking readyState at the moment the element is
   * attached closes the race; the onCanPlay prop below covers the slower
   * path.
   */
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (!node) return;
    // HAVE_FUTURE_DATA or better — enough to paint a frame.
    if (node.readyState >= 3) setVideoReady(true);
    // Autoplay can still be refused; the still simply remains visible.
    void node.play().catch(() => undefined);
  }, []);

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

      {useVideo && media.videoUrl ? (
        <video
          ref={attachVideo}
          onCanPlay={() => setVideoReady(true)}
          src={media.videoUrl}
          poster={media.posterImage}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          /*
            The source is 2.34:1. On a portrait phone `cover` scales it to
            fill the height, so only the middle band of the frame is
            visible. object-position keeps that band on the centre of the
            action rather than drifting to an edge.
          */
          className={`absolute inset-0 size-full object-cover object-[50%_45%] transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
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
    </div>
  );
}
