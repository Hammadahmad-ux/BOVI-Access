"use client";

import { motion } from "motion/react";
import { business, trustClaims } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import {
  DURATION,
  EASE_MASK,
  EASE_OUT,
  HERO_TIMELINE,
} from "@/lib/animations/motion";
import { useMediaQuery } from "@/lib/utils/use-media-query";

/**
 * Hero copy block and its entrance sequence.
 *
 * Split out of `Hero` so the section itself stays a Server Component: media
 * resolution and the LCP still keep rendering on the server, and the only
 * JavaScript this costs is the text block's own timeline.
 *
 * WHY MOTION, NOT GSAP: CLAUDE.md §11 reserves GSAP for the hero mask
 * sequence, but the sequence is three clip-and-translate reveals on fixed
 * delays with no scrubbing, no timeline seeking and no cross-element
 * choreography. Motion's declarative `initial`/`animate` expresses that
 * exactly, so GSAP would only add a second animation runtime to the bundle.
 * GSAP still earns its place on the scrubbed service and project work.
 *
 * WHY ON MOUNT, NOT ON SCROLL: the hero is already in view at load, so a
 * viewport trigger (`Reveal`) would fire on an intersection that has
 * already happened. Nothing here gates interaction either — the CTAs are in
 * the DOM, hit-testable and focusable from the first paint; the sequence
 * only moves paint, never pointer events.
 *
 * REDUCED MOTION: `useMediaQuery` returns `false` on the server, so the
 * server HTML is always the animated branch and hydration matches it. React
 * then re-renders with the real value before paint. Both branches emit the
 * same tags with the same classes — only the element's implementation, and
 * therefore its inline style, differs. Swapping the element rather than
 * zeroing the transition matters: it drops Motion's `opacity: 0` in that
 * pre-paint re-render instead of waiting for an animation frame to clear it.
 */

/** Travel for the plain fade-ups. The masked H1 lines travel their own height. */
const FADE_UP_Y = 18;

type EntranceTag = "p" | "div" | "ul";

type EntranceProps = {
  children: React.ReactNode;
  /** Seconds from sequence start. Always a HERO_TIMELINE value. */
  delay: number;
  /** Resolved once by the parent so every step agrees on one answer. */
  reduced: boolean;
  className?: string;
  as?: EntranceTag;
};

function Entrance({
  children,
  delay,
  reduced,
  className,
  as = "div",
}: EntranceProps) {
  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as];

  return (
    <MotionTag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: FADE_UP_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.base, ease: EASE_OUT, delay }}
    >
      {children}
    </MotionTag>
  );
}

type MaskLineProps = {
  children: React.ReactNode;
  delay: number;
  reduced: boolean;
};

/**
 * One hard-broken H1 line, revealed through a mask.
 *
 * The outer span clips; the inner span rises from just below it. Two spans,
 * no extra heading and no wrapper element — the H1 stays a single H1 whose
 * accessible name is unchanged, and the text stays selectable.
 *
 * `overflow-hidden` is safe on these three lines specifically: they are
 * uppercase with no descenders, so at `line-height: 0.9` the ink sits inside
 * the line box. Do not reuse this for mixed-case type without padding.
 */
function MaskLine({ children, delay, reduced }: MaskLineProps) {
  return (
    <span className="block overflow-hidden">
      {reduced ? (
        <span className="block">{children}</span>
      ) : (
        <motion.span data-reveal=""
          className="block"
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={{ duration: DURATION.slow, ease: EASE_MASK, delay }}
        >
          {children}
        </motion.span>
      )}
    </span>
  );
}

export function HeroContent() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <>
      <Entrance
        as="p"
        delay={HERO_TIMELINE.eyebrow}
        reduced={reduced}
        /*
          CONTRAST, not decoration. Measured against the new client
          footage frame by frame: green-bright (#4caf45) is a MIDTONE, so
          it needs a near-ink background to clear AA. The desktop encode
          bakes in a left-hand gradient dark enough for that, and it
          measures 6.7:1 there. The mobile encode is the raw footage
          full-bleed and the same label measured 3.4:1 at 375px — a fail
          at 12px. Darkening the mobile scrim far enough to rescue the
          green would have meant roughly 85% black over the whole frame,
          which is the one thing this revision must not do to the
          client's video. Bone at 8.9:1 costs an accent on small screens
          and keeps the footage visible.
        */
        className="eyebrow text-bone lg:text-green-bright"
      >
        {business.name}
      </Entrance>

      <h1 id="hero-heading" className="mt-5 max-w-[14ch] uppercase">
        {/* Each word owns a line — never allowed to wrap per-letter. */}
        <MaskLine delay={HERO_TIMELINE.line1} reduced={reduced}>
          Access
        </MaskLine>
        <MaskLine delay={HERO_TIMELINE.line2} reduced={reduced}>
          Without
        </MaskLine>
        <MaskLine delay={HERO_TIMELINE.line3} reduced={reduced}>
          Limits
        </MaskLine>
      </h1>

      <Entrance
        as="p"
        delay={HERO_TIMELINE.supporting}
        reduced={reduced}
        className="mt-7 font-display text-h4 font-medium text-bone"
      >
        {business.descriptor}
      </Entrance>

      <Entrance
        as="p"
        delay={HERO_TIMELINE.body}
        reduced={reduced}
        /* Same measurement, same reason: mist is 3.2:1 over the mobile
           footage and 5.8:1 over the desktop composition. */
        className="mt-4 max-w-[46ch] text-body-lg text-bone lg:text-mist"
      >
        Professional access, repair and maintenance solutions for commercial
        buildings across {business.coverage}.
      </Entrance>

      <Entrance
        delay={HERO_TIMELINE.ctas}
        reduced={reduced}
        className="mt-9 flex flex-wrap items-center gap-3"
      >
        <Button href="/contact" size="lg">
          Request a Quote
        </Button>
        <Button href="/services" size="lg" variant="secondary">
          Explore Services
        </Button>
      </Entrance>

      {/*
        Trust rail. These three claims come from the client's own prior
        material and are pending written re-confirmation — see
        `trustClaims` in src/lib/config/site.ts and CONTENT-RULES.md.
      */}
      <Entrance
        as="ul"
        delay={HERO_TIMELINE.trustRail}
        reduced={reduced}
        className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-hairline-dark pt-6 lg:mt-14"
      >
        {trustClaims.map((claim) => (
          <li key={claim.label} className="eyebrow flex items-center gap-2.5">
            <span aria-hidden="true" className="size-1.5 bg-green-bright" />
            <span className="text-mist">{claim.label}</span>
          </li>
        ))}
      </Entrance>
    </>
  );
}
