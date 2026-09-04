import { business, trustClaims } from "@/lib/config/site";
import { resolveHeroMedia } from "@/lib/config/hero-media";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroMedia } from "@/components/sections/HeroMedia";

/**
 * Homepage Hero.
 *
 * PHASE 1 SCOPE: structure, media architecture and locked copy only.
 * The staged mask-reveal motion sequence (eyebrow -> ACCESS -> WITHOUT ->
 * LIMITS -> copy -> CTAs -> trust rail, ~1.4-1.8s total) is Phase 2 and
 * will be layered onto this markup without changing it.
 *
 * Media resolution is delegated entirely to resolveHeroMedia() — this
 * component never references a video URL.
 */
export function Hero() {
  const media = resolveHeroMedia();

  return (
    <section
      data-ground="dark"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[calc(100dvh-4rem)] items-end overflow-hidden bg-ink text-bone lg:min-h-[calc(100dvh-5rem)]"
    >
      <HeroMedia media={media} />

      <Container className="relative z-10 pt-24 pb-14 lg:pt-32 lg:pb-20">
        <p className="eyebrow text-green-bright">{business.name}</p>

        <h1 id="hero-heading" className="mt-5 max-w-[14ch] uppercase">
          {/* Each word owns a line — never allowed to wrap per-letter. */}
          <span className="block">Access</span>
          <span className="block">Without</span>
          <span className="block">Limits</span>
        </h1>

        <p className="mt-7 font-display text-h4 font-500 text-bone">
          {business.descriptor}
        </p>

        <p className="mt-4 max-w-[52ch] text-body-lg text-mist">
          Professional access, repair and maintenance solutions for commercial
          buildings across {business.coverage}.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href="/contact" size="lg">
            Request a Quote
          </Button>
          <Button href="/services" size="lg" variant="secondary">
            Explore Services
          </Button>
        </div>

        {/*
          Trust rail. These three claims come from the client's own prior
          material and are pending written re-confirmation — see
          `trustClaims` in src/lib/config/site.ts and CONTENT-RULES.md.
        */}
        <ul className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-hairline-dark pt-6">
          {trustClaims.map((claim) => (
            <li key={claim.label} className="eyebrow flex items-center gap-2.5">
              <span aria-hidden="true" className="size-1.5 bg-green-bright" />
              <span className="text-mist">{claim.label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
