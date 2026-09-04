import Link from "next/link";
import type { Route } from "next";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ArrowLinkProps<T extends string> = {
  /**
   * Generic over the route, exactly as next/link is.
   *
   * A bare `Route` resolves to `RouteImpl<string>`, whose dynamic-route
   * branch collapses to `never` — so a plain `href: Route` silently
   * rejects every dynamic path like `/services/<slug>`. Taking the route
   * as a type parameter lets the literal flow through and the dynamic
   * branch resolve.
   */
  href: Route<T>;
  children: React.ReactNode;
  className?: string;
  /** `dark` for light text on a dark ground. */
  ground?: "light" | "dark";
};

/**
 * Editorial text link with a translating arrow — the site's standard
 * tertiary action, used wherever a full Button would be too heavy.
 *
 * The arrow is aria-hidden; the accessible name is the label alone.
 */
export function ArrowLink<T extends string>({
  href,
  children,
  className,
  ground = "light",
}: ArrowLinkProps<T>) {
  return (
    <Link
      href={href}
      className={cn(
        "group/arrow inline-flex min-h-11 items-center gap-3 eyebrow transition-colors",
        ground === "dark"
          ? "text-bone hover:text-green-bright"
          : "text-ink hover:text-green",
        className,
      )}
    >
      <span className="border-b border-current pb-1">{children}</span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-200 group-hover/arrow:translate-x-1"
      />
    </Link>
  );
}
