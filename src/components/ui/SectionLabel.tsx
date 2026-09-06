import { cn } from "@/lib/utils/cn";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
  ground?: "light" | "dark";
};

/**
 * The small uppercase eyebrow that opens each section.
 *
 * It used to carry a two-digit numeral — "01 — Services" — as a running
 * index across each page. The client asked for the numbers to come off:
 * he liked the device but wanted the headings and photographs to carry
 * the sections on their own. The numeral is gone from the component
 * rather than blanked at the call sites, so it cannot creep back one
 * section at a time.
 *
 * Service numbering is a different thing and stays: "Service 02" in a
 * service page's hero is the order of the service list, which the client
 * set deliberately, not decoration on a section.
 */
export function SectionLabel({
  children,
  className,
  ground = "light",
}: SectionLabelProps) {
  return (
    <p
      className={cn(
        "eyebrow",
        ground === "dark" ? "text-mist" : "text-moss",
        className,
      )}
    >
      {children}
    </p>
  );
}
