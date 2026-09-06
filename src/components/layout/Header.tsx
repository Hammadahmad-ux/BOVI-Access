"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Menu } from "lucide-react";
import { business, primaryNav } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { NavLink } from "@/components/layout/NavLink";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { cn } from "@/lib/utils/cn";

/**
 * Global header.
 *
 * At the very top of a page the header is transparent and borderless so it
 * reads as part of the dark masthead beneath it — on the Homepage that means
 * the hero photograph runs uninterrupted behind the logo and nav. Past a
 * short threshold it resolves into an ink bar with a hairline and a light
 * backdrop blur, which is what separates it from light body sections.
 *
 * That transparent state only works if the header sits OVER the page rather
 * than above it, so the header cancels its own flow height with a negative
 * bottom margin instead of switching to `fixed` — it stays `sticky`, keyboard
 * focus order is unchanged, and no ancestor needs to know about it. Every
 * route opens on a dark ground (Hero, or PageHero's `bg-ink` masthead), so
 * bone-on-dark stays legible everywhere at scroll zero.
 */

/**
 * Threshold in px. Small enough that the bar resolves as soon as the page
 * genuinely moves, large enough that mobile rubber-banding does not flip it.
 */
const SCROLL_THRESHOLD = 24;

function subscribeToScroll(onStoreChange: () => void) {
  window.addEventListener("scroll", onStoreChange, { passive: true });
  return () => window.removeEventListener("scroll", onStoreChange);
}

/**
 * The snapshot is a boolean, not the scroll offset, so React compares
 * `false === false` on every scroll event and only commits a render when the
 * flag actually flips. Reading it through `useSyncExternalStore` rather than
 * an effect also means a page restored mid-scroll (back-navigation, a reload
 * at depth) paints the resolved state on its first client render instead of
 * waiting for a scroll event — and it avoids setting state in an effect body,
 * which is a lint error in this repo.
 */
function getIsScrolled() {
  return window.scrollY > SCROLL_THRESHOLD;
}

/** The server has no scroll position; every page renders from the top. */
function getIsScrolledOnServer() {
  return false;
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    getIsScrolled,
    getIsScrolledOnServer,
  );

  const closeMenu = () => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <header
        data-site-chrome
        data-ground="dark"
        data-scrolled={scrolled}
        className={cn(
          "sticky top-0 z-40 border-b text-bone",
          // Cancels the header's own flow height (bar + 1px hairline) so it
          // overlays the page. Without the +1px a hairline of page background
          // would show above the masthead at scroll zero.
          // (Negative sign lives inside the calc so it stays valid CSS.)
          "mb-[calc(-5rem_-_1px)] lg:mb-[calc(-5.5rem_-_1px)]",
          "transition-[background-color,border-color,backdrop-filter] duration-[250ms] ease-out",
          scrolled
            ? // 95% rather than flat ink so the blur is actually doing something
              // as light sections pass underneath. It still reads as solid ink.
              "border-hairline-dark bg-ink/95 backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        <Container className="flex h-20 items-center justify-between gap-6 lg:h-[5.5rem]">
          <Logo ground="dark" priority className="h-8 w-auto lg:h-11" />

          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-8">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  {/* NavLink owns the active rule and the same-page
                      scroll-to-top; the styling below is unchanged. */}
                  <NavLink
                    href={item.href}
                    className={(active) =>
                      cn(
                        "eyebrow py-2 transition-colors",
                        active
                          ? "text-green-bright"
                          : "text-bone hover:text-green-bright",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={business.phoneHref}
              className="eyebrow hidden text-mist transition-colors hover:text-bone 2xl:inline-flex"
            >
              {business.phoneDisplay}
            </a>

            <Button href="/contact" className="hidden sm:inline-flex">
              Request a Quote
            </Button>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm xl:hidden"
            >
              <Menu aria-hidden="true" className="size-6" />
            </button>
          </div>
        </Container>
      </header>

      {/*
        The panel is rendered as a SIBLING of the header, never inside it.

        Past the scroll threshold the header gains `backdrop-blur-md`. A
        backdrop-filter makes an element a CONTAINING BLOCK for its `fixed`
        descendants, so a panel nested here stopped being viewport-fixed the
        moment the page was scrolled and collapsed into the 80px bar — the
        menu did open, it was just clipped to the header. At scroll zero
        there is no filter, so it worked, which is exactly why this only
        showed up after scrolling down.
      */}
      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
