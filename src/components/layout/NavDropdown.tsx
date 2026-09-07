"use client";

import type { RefObject } from "react";
import type { Route } from "next";
import { ChevronDown } from "lucide-react";

import { NavLink } from "@/components/layout/NavLink";
import { cn } from "@/lib/utils/cn";

export type NavDropdownItem = {
  label: string;
  href: Route;
};

type NavDropdownProps = {
  id: "services" | "projects";
  label: string;
  items: readonly NavDropdownItem[];
  open: boolean;
  active: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onOpen: () => void;
  onClose: () => void;
  onCloseDelayed: () => void;
};

/**
 * Desktop navigation disclosure.
 *
 * This deliberately uses a native button followed by an ordinary list of
 * links, rather than `role="menu"`. Site navigation should retain normal
 * browser Tab behaviour; application-menu arrow-key semantics would make
 * these links less predictable, not more accessible.
 */
export function NavDropdown({
  id,
  label,
  items,
  open,
  active,
  triggerRef,
  onOpen,
  onClose,
  onCloseDelayed,
}: NavDropdownProps) {
  const panelId = `${id}-nav-panel`;

  return (
    <li
      // Match the bar height so the panel is anchored below the header,
      // not below the much shorter text line (which would overlap the CTA).
      className="relative flex h-20 items-center lg:h-[5.5rem]"
      onMouseEnter={onOpen}
      onMouseLeave={onCloseDelayed}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onClose();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        data-nav-trigger={id}
        data-active={active}
        onFocus={onOpen}
        // `click()` first moves the pointer over the button, so hover may
        // already have opened the panel before the click event arrives.
        // Opening idempotently here keeps a genuine click from immediately
        // toggling that freshly opened panel closed.
        onClick={onOpen}
        className={cn(
          "eyebrow inline-flex items-center gap-1.5 py-2 transition-colors",
          active || open
            ? "text-green-bright"
            : "text-bone hover:text-green-bright",
        )}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          id={panelId}
          data-nav-panel={id}
          className={cn(
            "absolute left-0 top-[calc(100%+0.375rem)] z-50",
            "w-[min(23rem,calc(100vw-5rem))] rounded-sm border border-hairline-dark",
            "bg-ink-raised p-2 text-bone shadow-[0_18px_45px_rgb(0_0_0/0.32)]",
            // Covers the visual gap so moving from trigger to panel does
            // not create a dead strip. The delayed close is a second guard.
            "before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-['']",
          )}
        >
          <ul aria-label={`${label} links`}>
            {items.map((item, index) => (
              <li
                key={item.href}
                className={cn(
                  index === 1 && "mt-1 border-t border-hairline-dark pt-1",
                )}
              >
                <NavLink
                  href={item.href}
                  onNavigate={onClose}
                  className={(itemActive) =>
                    cn(
                      "block rounded-sm px-3 py-2.5 font-display text-small font-medium leading-snug",
                      "transition-colors hover:bg-bone/8 hover:text-green-bright",
                      itemActive ? "text-green-bright" : "text-bone",
                      index === 0 && "font-semibold uppercase tracking-[0.06em]",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
