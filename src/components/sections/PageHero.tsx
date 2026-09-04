import Image from "next/image";
import type { ImageAsset } from "@/lib/content/types";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils/cn";

type PageHeroProps = {
  eyebrow: string;
  /** Rendered as the page H1. Pass an array for hard line breaks. */
  title: string | readonly string[];
  lead?: string;
  /** Optional background photograph. Without one the hero is flat ink. */
  media?: ImageAsset;
  crumbs?: readonly Crumb[];
  /**
   * Editorial variation, not decoration — internal heroes should not all
   * be the same height. `compact` for utility pages, `tall` for the pages
   * that carry a photograph and need presence.
   */
  height?: "compact" | "standard" | "tall";
  children?: React.ReactNode;
};

/**
 * The internal-page hero.
 *
 * Related to the Homepage hero — dark ground, eyebrow, large display H1,
 * left-aligned, media behind a scrim — but deliberately shorter, so a
 * visitor reaches real content quickly. The Homepage keeps the
 * full-viewport treatment to itself.
 *
 * Heights are capped in svh so a short mobile viewport never turns the
 * hero into a full screen of nothing but a heading.
 */
const heights = {
  compact: "min-h-[38svh] py-20 lg:min-h-[42svh] lg:py-24",
  standard: "min-h-[52svh] py-24 lg:min-h-[58svh] lg:py-28",
  tall: "min-h-[58svh] py-24 lg:min-h-[68svh] lg:py-32",
} as const;

export function PageHero({
  eyebrow,
  title,
  lead,
  media,
  crumbs,
  height = "standard",
  children,
}: PageHeroProps) {
  const lines = Array.isArray(title) ? title : [title as string];

  return (
    <section
      data-ground="dark"
      className={cn(
        "relative isolate flex items-end overflow-hidden bg-ink text-bone",
        heights[height],
      )}
    >
      {media ? (
        <div className="absolute inset-0">
          <Image
            src={media.src}
            alt={media.alt}
            fill
            priority
            sizes="100vw"
            quality={72}
            className="object-cover object-center"
          />
          {/* Legibility scrim. Matches the Homepage hero treatment; see
              DESIGN.md - the one permitted gradient. */}
          <div aria-hidden="true" className="absolute inset-0 bg-ink/70" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/50"
          />
        </div>
      ) : null}

      <Container className="relative z-10">
        {crumbs?.length ? <Breadcrumbs trail={crumbs} className="mb-8" /> : null}

        <SectionLabel ground="dark">{eyebrow}</SectionLabel>

        <h1 className="mt-6 max-w-[18ch]">
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        {lead ? (
          <p className="mt-7 max-w-[52ch] text-body-lg text-mist">{lead}</p>
        ) : null}

        {children}
      </Container>
    </section>
  );
}
