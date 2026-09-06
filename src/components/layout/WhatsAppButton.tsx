import { business } from "@/lib/config/site";

/**
 * Floating WhatsApp contact button, bottom-right of every public page.
 *
 * Added at the client's request: "a small floating WhatsApp button [...]
 * Please keep it clean and subtle so it matches the professional look of
 * the website. The main CTA should still be 'Request a Quote'."
 *
 * THAT LAST SENTENCE IS THE BRIEF. This is a convenience shortcut, not a
 * second conversion path, so everything here is sized to lose to the
 * green "Request a Quote" pill: 48px on desktop against a full-width
 * button with a label, no wording of its own, a shadow light enough to
 * read as lifted rather than as a card, and no pulse, bounce or badge.
 * It should be findable when wanted and ignorable when not.
 *
 * A plain anchor — no JavaScript. `wa.me` resolves to the app on a phone
 * and to WhatsApp Web on a desktop by itself, so window.open would only
 * add a popup blocker to the failure modes.
 *
 * NOT rendered inside Sanity Studio: `data-site-chrome` is what the
 * Studio route strips, alongside the header, footer and skip link. See
 * src/app/studio/[[...tool]]/page.tsx.
 */
export function WhatsAppButton() {
  return (
    <div
      data-site-chrome
      /*
        The wrapper is fixed and click-through; only the button itself
        takes pointer events, so the
        corner of the page underneath stays selectable and clickable.

        z-40 sits above page content and level with the header — they
        never meet, one being pinned top and the other bottom — and below
        the mobile menu at z-50, which must be able to cover it.

        env(safe-area-inset-bottom) is 0 unless a viewport opts into
        viewport-fit: cover, so the 1rem base is what actually applies
        today. It costs nothing and is correct if that ever changes.
      */
      className="pointer-events-none fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 sm:right-6 sm:bottom-6"
    >
      <a
        href={business.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Contact ${business.name} on WhatsApp`}
        className={[
          "group pointer-events-auto relative flex items-center justify-center rounded-full",
          // 52px on phones, 48px from sm up. Both clear the 44px minimum
          // target on their own, without relying on padding.
          "size-13 sm:size-12",
          "bg-green text-pure",
          // Deliberately modest. A heavy shadow is what makes a floating
          // button read as an advert rather than as part of the page.
          "shadow-[0_2px_10px_rgb(16_18_17/0.25)]",
          "transition duration-200 ease-out",
          "hover:-translate-y-0.5 hover:bg-[#236a1f] hover:shadow-[0_6px_18px_rgb(16_18_17/0.3)]",
          "focus-visible:-translate-y-0.5",
        ].join(" ")}
      >
        <WhatsAppGlyph />

        {/*
          Desktop-only label, on hover AND keyboard focus. It carries no
          meaning the aria-label does not already give, so a touch user
          who never sees it loses nothing — which is the only reason a
          tooltip is acceptable here at all.
        */}
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap sm:block",
            "eyebrow rounded-sm bg-ink px-3 py-2 text-bone",
            "opacity-0 transition-opacity duration-200",
            "group-hover:opacity-100 group-focus-visible:opacity-100",
          ].join(" ")}
        >
          WhatsApp
        </span>
      </a>
    </div>
  );
}

/**
 * Inline rather than from an icon package: lucide-react, which the rest
 * of the site uses, has no WhatsApp mark, and pulling in a second icon
 * library for one glyph is not a trade worth making.
 */
function WhatsAppGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="size-6 fill-current sm:size-[1.375rem]"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
