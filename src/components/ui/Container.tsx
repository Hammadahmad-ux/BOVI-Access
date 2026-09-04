import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * `page` is the standard editorial measure. `wide` is for full-bleed-ish
   * media rows that still need gutters. `narrow` is for prose.
   */
  width?: "narrow" | "page" | "wide";
  as?: "div" | "section" | "header" | "footer" | "main" | "nav";
};

const widths = {
  narrow: "max-w-[68ch]",
  page: "max-w-[90rem]", // 1440
  wide: "max-w-[102.5rem]", // 1640
} as const;

/**
 * The only horizontal-padding authority in the app. Sections must not
 * invent their own side padding — that is how gutters drift out of
 * alignment between viewports.
 */
export function Container({
  children,
  className,
  width = "page",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-(--spacing-gutter) md:px-(--spacing-gutter-lg)",
        widths[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
