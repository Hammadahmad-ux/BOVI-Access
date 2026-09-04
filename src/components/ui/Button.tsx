import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-display font-semibold uppercase tracking-[0.08em] " +
  "transition-colors duration-200 " +
  // 44px minimum touch target on every variant (QA: touch-target size).
  "min-h-11";

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-[var(--text-small)]",
  lg: "px-7 py-4 text-[var(--text-body)]",
};

const variants: Record<Variant, string> = {
  // White-on-green is 5.17:1 — passes AA for normal text.
  primary: "bg-green text-pure hover:bg-[#236a1f]",
  // Hairline-bordered, inherits the ground's foreground colour.
  secondary:
    "border border-current text-current hover:bg-current/10",
  ghost: "text-current hover:text-green underline-offset-4 hover:underline",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & {
  /**
   * `Route` is Next's typed-route union. It accepts real internal routes
   * and protocol URLs (tel:, mailto:, https:), and rejects paths that do
   * not exist — so a broken CTA fails the build rather than shipping.
   */
  href: Route;
} & Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  "href" | "className" | "children"
>;

type ButtonAsButton = CommonProps & {
  href?: never;
} & Omit<React.ComponentPropsWithoutRef<"button">, "className" | "children">;

/**
 * Renders a real `<a>` for navigation and a real `<button>` for actions.
 * Never a div. `href` decides — there is no `as` prop to get wrong.
 *
 * External and protocol links (tel:, mailto:) bypass next/link.
 */
export function Button(props: ButtonAsLink | ButtonAsButton) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;

  const classes = cn(base, sizes[size], variants[variant], className);

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...linkRest } = rest;
    const isExternal = /^(https?:|tel:|mailto:)/i.test(href);

    if (isExternal) {
      return (
        <a href={href} className={classes} {...linkRest}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}
