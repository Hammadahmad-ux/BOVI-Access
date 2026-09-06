"use client";

import { useCallback, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type NavLinkProps = {
  href: Route;
  children: ReactNode;
  /**
   * A plain class string, or a function given whether this item is the
   * active section — the header needs the flag for its own styling.
   */
  className?: string | ((active: boolean) => string);
  /**
   * Fired on every activation, same-route or not. The mobile menu uses
   * it to close itself.
   */
  onNavigate?: () => void;
};

/**
 * A primary navigation link that also works when you are already there.
 *
 * THE PROBLEM IT SOLVES
 *
 * Clicking HOME at the bottom of the homepage did nothing. Next's Link
 * treats a navigation to the current URL as a no-op — there is no route
 * change, so nothing re-renders and nothing scrolls. `Link`'s `scroll`
 * prop does not help either: it governs what happens WHEN a navigation
 * occurs, and here one never does. The visitor is left staring at the
 * bottom of the page having pressed the site's own name.
 *
 * TWO DIFFERENT KINDS OF "CURRENT"
 *
 * `active` drives the styling and aria-current, and deliberately matches
 * a whole section: SERVICES stays lit on /services/gutter-cleaning.
 * `isCurrentPage` is an exact match and is the only thing that triggers
 * the scroll. Keying the scroll off `active` would mean clicking SERVICES
 * from a service page scrolled you up instead of taking you to the
 * services index — a worse bug than the one being fixed.
 *
 * Scoped to the primary nav on purpose. This is not a global interceptor
 * for every internal link.
 */
export function NavLink({
  href,
  children,
  className,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();

  // The section rule the header already used. Unchanged.
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  const isCurrentPage = pathname === href;

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      onNavigate?.();

      if (!isCurrentPage || event.defaultPrevented) return;

      // Ctrl/cmd/shift/alt-click and middle-click are requests to open the
      // page somewhere else. Hijacking them to scroll would be wrong even
      // though the destination is the current URL.
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      /*
        Deferred a frame because of the mobile menu. `onNavigate` closes
        it, and the menu holds `body { overflow: hidden }` while it is
        open — scrolling in the same tick would fight a locked document.
        By the next frame React has committed the close and released the
        lock.

        "instant" rather than "auto": auto defers to the CSS
        scroll-behavior, which is `smooth` site-wide, so it would animate
        for the very people who asked it not to.
      */
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "instant" : "smooth" });
      });
    },
    [isCurrentPage, onNavigate],
  );

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={active ? "page" : undefined}
      className={typeof className === "function" ? className(active) : className}
    >
      {children}
    </Link>
  );
}
