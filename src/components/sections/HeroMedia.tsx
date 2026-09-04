"use client";

import { useEffect, useRef, useState } from "react";
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
  // Below this width the still is the intended composition, and the
  // bandwidth cost of video is not justified.
  const wideEnough = useMediaQuery("(min-width: 768px)");

  const useVideo = Boolean(media.videoUrl) && !reducedMotion && wideEnough;

  useEffect(() => {
    if (!useVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => setVideoReady(true);
    video.addEventListener("canplay", markReady);
    // Autoplay can still be refused; the still simply remains visible.
    void video.play().catch(() => undefined);

    return () => video.removeEventListener("canplay", markReady);
  }, [useVideo]);

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
          ref={videoRef}
          src={media.videoUrl}
          poster={media.posterImage}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-700 ${
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
