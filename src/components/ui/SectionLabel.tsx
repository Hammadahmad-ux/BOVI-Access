import { cn } from "@/lib/utils/cn";

type SectionLabelProps = {
  /** Two-digit section numeral, e.g. "01". Optional. */
  index?: string;
  children: React.ReactNode;
  className?: string;
  ground?: "light" | "dark";
};

/**
 * The small uppercase eyebrow that opens each section.
 * Renders as "01 — BOVI ACCESS".
 */
export function SectionLabel({
  index,
  children,
  className,
  ground = "light",
}: SectionLabelProps) {
  return (
    <p
      className={cn(
        "eyebrow flex items-center gap-2",
        ground === "dark" ? "text-mist" : "text-moss",
        className,
      )}
    >
      {index ? (
        // Decorative: "01 - Services" must be announced as "Services".
        <span aria-hidden="true" className="contents">
          <span
            className={
              ground === "dark" ? "text-green-bright" : "text-green"
            }
          >
            {index}
          </span>
          <span>—</span>
        </span>
      ) : null}
      <span>{children}</span>
    </p>
  );
}
