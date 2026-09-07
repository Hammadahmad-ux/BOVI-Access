"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { business, primaryNav } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { NavLink } from "@/components/layout/NavLink";
import { MobileMenu } from "@/components/layout/MobileMenu";
import {
  NavDropdown,
  type NavDropdownItem,
} from "@/components/layout/NavDropdown";
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
const DROPDOWN_CLOSE_DELAY = 160;

type DropdownId = "services" | "projects";

type HeaderProps = {
  serviceItems: readonly NavDropdownItem[];
  projectItems: readonly NavDropdownItem[];
};

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

export function Header({ serviceItems, projectItems }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const servicesTriggerRef = useRef<HTMLButtonElement>(null);
  const projectsTriggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressFocusOpenRef = useRef(false);
  const pathname = usePathname();

  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    getIsScrolled,
    getIsScrolledOnServer,
  );

  const closeMenu = () => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  };

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeDropdown = useCallback(() => {
    clearCloseTimer();
    setOpenDropdown(null);
  }, [clearCloseTimer]);

  const openDesktopDropdown = useCallback(
    (id: DropdownId) => {
      // Escape returns focus to the disclosure button. That focus event is
      // synchronous and must not immediately reopen the panel just closed.
      if (suppressFocusOpenRef.current) return;
      clearCloseTimer();
      setOpenDropdown(id);
    },
    [clearCloseTimer],
  );

  const closeDropdownDelayed = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(
      () => setOpenDropdown(null),
      DROPDOWN_CLOSE_DELAY,
    );
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!openDropdown) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      const activeTrigger =
        openDropdown === "services"
          ? servicesTriggerRef.current
          : projectsTriggerRef.current;
      suppressFocusOpenRef.current = true;
      closeDropdown();
      activeTrigger?.focus();
      // React's delegated focus event may flush after focus() returns, so
      // keep the guard through the current task rather than clearing it
      // synchronously.
      setTimeout(() => {
        suppressFocusOpenRef.current = false;
      }, 0);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeDropdown, openDropdown]);

  useEffect(() => clearCloseTimer, [clearCloseTimer]);

  const servicesActive = pathname.startsWith("/services");
  const projectsActive =
    pathname === "/portfolio" || pathname.startsWith("/projects/");

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

          <nav
            ref={desktopNavRef}
            aria-label="Primary"
            className="hidden xl:block"
          >
            <ul className="flex items-center gap-8">
              {primaryNav.map((item) => {
                if (item.href === "/services") {
                  return (
                    <NavDropdown
                      key={item.href}
                      id="services"
                      label={item.label}
                      items={serviceItems}
                      open={openDropdown === "services"}
                      active={servicesActive}
                      triggerRef={servicesTriggerRef}
                      onOpen={() => openDesktopDropdown("services")}
                      onClose={closeDropdown}
                      onCloseDelayed={closeDropdownDelayed}
                    />
                  );
                }

                if (item.href === "/portfolio") {
                  return (
                    <NavDropdown
                      key={item.href}
                      id="projects"
                      label={item.label}
                      items={projectItems}
                      open={openDropdown === "projects"}
                      active={projectsActive}
                      triggerRef={projectsTriggerRef}
                      onOpen={() => openDesktopDropdown("projects")}
                      onClose={closeDropdown}
                      onCloseDelayed={closeDropdownDelayed}
                    />
                  );
                }

                return (
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
                );
              })}
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
      <MobileMenu
        open={menuOpen}
        onClose={closeMenu}
        serviceItems={serviceItems}
        projectItems={projectItems}
      />
    </>
  );
}
