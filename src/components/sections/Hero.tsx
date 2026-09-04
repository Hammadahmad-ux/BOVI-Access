import { resolveHeroMedia } from "@/lib/config/hero-media";
import { Container } from "@/components/ui/Container";
import { HeroMedia } from "@/components/sections/HeroMedia";
import { HeroContent } from "@/components/sections/HeroContent";

/**
 * Homepage Hero.
 *
 * Stays a Server Component: media resolution and the LCP still are rendered
 * on the server, and only the copy block (`HeroContent`, which owns the
 * staged mask-reveal entrance) ships as client JavaScript.
 *
 * Media resolution is delegated entirely to resolveHeroMedia() — this
 * component never references a video URL.
 *
 * COMPOSITION: just under a full viewport, in `svh` rather than `dvh` so the
 * section does not resize as mobile browser chrome collapses. Stopping short
 * of 100 also lets the next section's edge show, which reads as a page that
 * continues rather than a slide. Content is bottom-aligned; the top padding
 * clears the header, which sits transparent over this section rather than
 * pushing it down.
 */
export function Hero() {
  const media = resolveHeroMedia();

  return (
    <section
      data-ground="dark"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[92svh] items-end overflow-hidden bg-ink text-bone lg:min-h-[94svh]"
    >
      <HeroMedia media={media} overlay="strong" />

      <Container className="relative z-10 pt-28 pb-14 lg:pt-36 lg:pb-20">
        <HeroContent />
      </Container>
    </section>
  );
}
