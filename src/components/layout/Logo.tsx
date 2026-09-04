import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  /** Which ground the logo sits on — selects the correct artwork. */
  ground?: "dark" | "light";
  /**
   * Sizing is CSS-driven and MUST set a height, e.g. "h-9 w-auto".
   *
   * The BOVI lockup is stacked (BOVI over ACCESS) with a ~2:1 ratio, so
   * setting a width leaves the height free to overflow a fixed-height
   * header — which is exactly how it clipped on mobile before. Constrain
   * the height and let the width follow.
   */
  className?: string;
  /**
   * Render a plain image rather than a link. Use only where a link would
   * nest inside another link.
   */
  asImageOnly?: boolean;
};

/**
 * Intrinsic dimensions of the generated artwork, halved. These exist only
 * to give the browser a correct aspect ratio up front (no layout shift);
 * the rendered size comes from `className`.
 */
const INTRINSIC_WIDTH = 360;
const INTRINSIC_HEIGHT = 178;

export function Logo({
  ground = "dark",
  className = "h-9 w-auto",
  asImageOnly = false,
}: LogoProps) {
  const src =
    ground === "dark"
      ? "/brand/bovi-access-lockup-on-dark.png"
      : "/brand/bovi-access-lockup-on-light.png";

  const image = (
    <Image
      src={src}
      alt={`${business.name} — ${business.slogan}`}
      width={INTRINSIC_WIDTH}
      height={INTRINSIC_HEIGHT}
      priority
      sizes="200px"
      className={cn("object-contain", className)}
    />
  );

  if (asImageOnly) return image;

  // QA #17: the logo must always link to "/".
  return (
    <Link
      href="/"
      aria-label={`${business.name} — home`}
      className="inline-flex shrink-0 items-center"
    >
      {image}
    </Link>
  );
}
