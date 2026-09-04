import Link from "next/link";
import type { Route } from "next";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type Crumb = {
  label: string;
  /** Omitted on the final crumb, which is the current page. */
  href?: Route;
};

type BreadcrumbsProps = {
  trail: readonly Crumb[];
  className?: string;
  ground?: "light" | "dark";
};

/**
 * Deliberately quiet — breadcrumbs orient, they do not decorate.
 *
 * Used on service and project detail pages only; the Homepage does not
 * need them. The markup is an ordered list inside a labelled <nav>, which
 * is also the structure BreadcrumbList schema is generated from in
 * src/lib/seo/structured-data.tsx.
 */
export function Breadcrumbs({
  trail,
  className,
  ground = "dark",
}: BreadcrumbsProps) {
  if (trail.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-small",
          ground === "dark" ? "text-mist" : "text-moss",
        )}
      >
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={crumb.label} className="flex items-center gap-2">
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className={cn(
                    "transition-colors",
                    ground === "dark"
                      ? "hover:text-green-bright"
                      : "hover:text-green",
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className={ground === "dark" ? "text-bone" : "text-ink"}>
                  {crumb.label}
                </span>
              )}
              {!last ? (
                <ChevronRight aria-hidden="true" className="size-3.5 opacity-60" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
