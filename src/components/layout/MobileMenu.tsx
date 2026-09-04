"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { business, primaryNav } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Full-screen dark navigation panel.
 *
 * Deliberately not a cramped dropdown — the brief calls for a large dark
 * treatment. Handles Escape, background scroll lock, and returns focus to
 * the trigger on close (the parent owns the trigger ref).
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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
        'a[href], button:not([disabled])',
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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      id="mobile-menu"
      data-ground="dark"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-50 flex flex-col bg-ink text-bone lg:hidden"
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
          {primaryNav.map((item, i) => (
            <li key={item.href} className="border-b border-hairline-dark">
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-baseline gap-4 py-4"
              >
                {/*
                  Decorative numeral. aria-hidden so the link is announced
                  as "About", not "02 About".
                */}
                <span aria-hidden="true" className="eyebrow text-green-bright">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-h3 font-700 tracking-[-0.02em]">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-hairline-dark px-(--spacing-gutter) py-6">
        <Button href="/contact" size="lg" className="w-full" onClick={onClose}>
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
    </div>
  );
}
