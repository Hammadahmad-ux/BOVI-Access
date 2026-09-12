"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { business, primaryNav } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { NavLink } from "@/components/layout/NavLink";
import type { NavDropdownItem } from "@/components/layout/NavDropdown";
import { DURATION, EASE_OUT } from "@/lib/animations/motion";
import { useMediaQuery } from "@/lib/utils/use-media-query";
import { cn } from "@/lib/utils/cn";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  serviceItems: readonly NavDropdownItem[];
};

/**
 * Full-screen dark navigation panel.
 *
 * Deliberately not a cramped dropdown — the brief calls for a large dark
 * treatment. Handles Escape, background scroll lock, and returns focus to
 * the trigger on close (the parent owns the trigger ref).
 *
 * OPENS WITH A SLIDE, not a snap — the client asked for the tap-to-open
 * transition to feel deliberate. A fade-plus-drop was tried first and
 * read as the wrong motion for a full-screen panel; a horizontal slide
 * in from the right — where the trigger sits, like a standard app
 * drawer — is what actually reads as an intentional reveal rather than
 * something fading into place. `DURATION.slow` (0.9s) is the same
 * constant every large media/mask reveal on the site already uses, so
 * this reads as one motion system rather than a bespoke menu animation.
 * `prefers-reduced-motion` collapses it to 0s — the same "keep the
 * transform, zero the duration" approach `ServiceIndexRows` already
 * uses — rather than branching the JSX.
 */
export function MobileMenu({ open, onClose, serviceItems }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const servicesActive = pathname.startsWith("/services");
  // Services is the only nested section — open it by default when the
  // visitor is already on a service page. Projects is a plain link.
  const [servicesExpanded, setServicesExpanded] = useState(servicesActive);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const panelTransition = {
    duration: reducedMotion ? 0 : DURATION.slow,
    ease: EASE_OUT,
  };

  useEffect(() => {
    if (!open) return;

    // Move focus into the panel so keyboard users are not stranded.
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      // Simple focus trap across the panel's tabbable elements.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // The panel is hidden from `xl` up. If a tablet is rotated (or a window
    // resized) across that boundary while the menu is open, the panel
    // disappears but its scroll lock would survive and leave the page
    // permanently unscrollable. Closing on the media-query change keeps the
    // lock's lifetime tied to the panel's.
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onBreakpointChange = () => {
      if (desktop.matches) onClose();
    };
    desktop.addEventListener("change", onBreakpointChange);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpointChange);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          id="mobile-menu"
          data-ground="dark"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 flex flex-col bg-ink text-bone xl:hidden"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={panelTransition}
        >
          <div className="flex items-center justify-between border-b border-hairline-dark px-(--spacing-gutter) py-4">
            <Logo ground="dark" className="h-8 w-auto" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-sm"
            >
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>

          <nav
            aria-label="Primary"
            className="flex-1 overflow-y-auto px-(--spacing-gutter) py-8"
          >
            <ul className="flex flex-col">
              {primaryNav.map((item) => {
                if (item.href === "/services") {
                  const panelId = "mobile-services-links";

                  return (
                    <li
                      key={item.href}
                      className="border-b border-hairline-dark"
                    >
                      <button
                        type="button"
                        aria-expanded={servicesExpanded}
                        aria-controls={panelId}
                        data-mobile-nav-trigger="services"
                        data-active={servicesActive}
                        onClick={() =>
                          setServicesExpanded((current) => !current)
                        }
                        className={cn(
                          "flex min-h-11 w-full items-center gap-4 py-4 text-left",
                          servicesActive && "text-green-bright",
                        )}
                      >
                        <span className="flex-1 font-display text-h3 font-bold tracking-[-0.02em]">
                          {item.label}
                        </span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "size-5 shrink-0 text-mist transition-transform duration-200",
                            servicesExpanded && "rotate-180 text-green-bright",
                          )}
                        />
                      </button>

                      {servicesExpanded && (
                        <ul
                          id={panelId}
                          aria-label={`${item.label} links`}
                          className="pb-4 pl-8 sm:pl-10"
                        >
                          {serviceItems.map((nestedItem, nestedIndex) => (
                            <li
                              key={nestedItem.href}
                              className={cn(
                                nestedIndex === 1 &&
                                  "mt-1 border-t border-hairline-dark pt-1",
                              )}
                            >
                              <NavLink
                                href={nestedItem.href}
                                onNavigate={onClose}
                                className={(active) =>
                                  cn(
                                    "block min-h-11 py-3 font-display text-small font-medium leading-snug",
                                    "transition-colors hover:text-green-bright",
                                    active ? "text-green-bright" : "text-mist",
                                    nestedIndex === 0 &&
                                      "font-semibold uppercase tracking-[0.06em] text-bone",
                                  )
                                }
                              >
                                {nestedItem.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.href} className="border-b border-hairline-dark">
                    {/* Closing the menu is the `onNavigate` callback, so tapping
                  the page you are already on closes it AND returns you to
                  the top rather than closing onto the same scroll
                  position. */}
                    <NavLink
                      href={item.href}
                      onNavigate={onClose}
                      className="flex items-baseline gap-4 py-4"
                    >
                      <span className="font-display text-h3 font-bold tracking-[-0.02em]">
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-hairline-dark px-(--spacing-gutter) py-6">
            <Button
              href="/contact"
              size="lg"
              className="w-full"
              onClick={onClose}
            >
              Request a Quote
            </Button>
            <div className="mt-4 flex flex-col gap-1 text-small text-mist">
              <a href={business.phoneHref} className="py-1">
                {business.phoneDisplay}
              </a>
              <a href={business.emailHref} className="py-1">
                {business.emailDisplay}
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
