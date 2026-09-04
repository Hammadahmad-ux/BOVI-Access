"use client";

import { motion } from "motion/react";
import { DURATION, EASE_OUT, VIEWPORT } from "@/lib/animations/motion";
import { useMediaQuery } from "@/lib/utils/use-media-query";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait after the element enters the viewport. */
  delay?: number;
  /** Travel distance in px. 0 gives a pure fade. */
  y?: number;
  as?: "div" | "li" | "section" | "figure";
};

/**
 * The single scroll-reveal primitive.
 *
 * Reveals once, on entry, and never replays — repeated animation on
 * scroll-back is noise. Under `prefers-reduced-motion` the content is
 * rendered immediately with no transform and no delay, rather than
 * animating faster.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  as = "div",
}: RevealProps) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const MotionTag = motion[as];

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: DURATION.base, ease: EASE_OUT, delay }}
    >
      {children}
    </MotionTag>
  );
}
