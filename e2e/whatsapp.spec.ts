import { test, expect } from "@playwright/test";

/**
 * Floating WhatsApp button.
 *
 * The link is never followed — wa.me would be an external request, and a
 * test suite has no business opening a chat with the client's phone.
 * Everything here is asserted from the anchor itself.
 */

/** The one true destination. Mirrors `business.whatsappHref`. */
const WHATSAPP = "https://wa.me/447990377780";

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/services/mastic-sealant",
  "/portfolio",
  "/projects/external-pipe-repair",
  "/service-areas",
  "/contact",
  "/privacy",
];

test.describe("WhatsApp button", () => {
  test("is on every public page, pointing at the right number", async ({
    page,
  }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      const button = page.getByRole("link", {
        name: /contact bovi access on whatsapp/i,
      });

      await expect(button, `${route} should carry the button`).toBeVisible();
      await expect(button).toHaveAttribute("href", WHATSAPP);
      await expect(button).toHaveAttribute("target", "_blank");
      // Opening a new tab without this hands the opener to the new
      // document, which is a real, if small, security hole.
      await expect(button).toHaveAttribute("rel", /noopener/);
      await expect(button).toHaveAttribute("rel", /noreferrer/);
    }
  });

  test("is on the 404 page too", async ({ page }) => {
    // Somebody who lands on a dead URL is exactly the person who wants a
    // shortcut to a human.
    await page.goto("/no-such-page-at-all");
    await expect(
      page.getByRole("link", { name: /contact bovi access on whatsapp/i }),
    ).toBeVisible();
  });

  test("is NOT present in Sanity Studio", async ({ page }) => {
    await page.goto("/studio");
    await page.waitForTimeout(1200);

    // `display: none`, so it is out of the layout, out of the
    // accessibility tree and out of the tab order — getByRole finds
    // nothing, which is the assertion that matters.
    await expect(
      page.getByRole("link", { name: /contact bovi access on whatsapp/i }),
    ).toHaveCount(0);

    const focusable = await page.evaluate(() => {
      const anchor = document.querySelector('a[href^="https://wa.me"]');
      if (!anchor) return "absent";
      return (anchor as HTMLElement).offsetParent === null
        ? "hidden"
        : "VISIBLE";
    });
    expect(focusable).not.toBe("VISIBLE");
  });

  test("meets the touch target minimum and stays in the viewport", async ({
    page,
    viewport,
  }) => {
    await page.goto("/contact");
    // Scrolled to the bottom is where a fixed button is most likely to
    // land on the footer.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);

    const button = page.getByRole("link", {
      name: /contact bovi access on whatsapp/i,
    });
    const box = await button.boundingBox();
    expect(box).not.toBeNull();

    // WCAG 2.5.8 asks for 24px; the brief asks for 44px+.
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // boundingBox gives x/y/width/height, not right/bottom.
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
  });

  test("does not cover any other interactive element", async ({ page }) => {
    // The footer build credit sat 3px under it at 768 before the footer
    // gained bottom padding. A floating element that lands on a link is
    // the failure mode worth guarding, not the pixel offsets.
    await page.goto("/contact");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);

    const collisions = await page.evaluate(() => {
      const anchor = document.querySelector('a[href^="https://wa.me"]');
      if (!anchor) return ["button missing"];
      const rect = anchor.getBoundingClientRect();

      return [
        ...document.querySelectorAll("a, button, input, textarea, select"),
      ]
        .filter((el) => el !== anchor && !anchor.contains(el))
        .filter((el) => {
          const other = el.getBoundingClientRect();
          return (
            other.width > 0 &&
            other.height > 0 &&
            other.right > rect.left &&
            other.left < rect.right &&
            other.bottom > rect.top &&
            other.top < rect.bottom
          );
        })
        .map((el) => `${el.tagName}: ${el.textContent?.trim().slice(0, 30)}`);
    });

    expect(collisions).toEqual([]);
  });

  test("stays secondary to Request a Quote", async ({ page }) => {
    // The client's constraint: "The main CTA should still be 'Request a
    // Quote'." Area is the crude but honest proxy — the floating button
    // must not be the biggest call to action on the screen.
    await page.goto("/");

    const quote = page
      .getByRole("link", { name: /request a quote/i })
      .first();
    const whatsapp = page.getByRole("link", {
      name: /contact bovi access on whatsapp/i,
    });

    const quoteBox = await quote.boundingBox();
    const whatsappBox = await whatsapp.boundingBox();
    expect(quoteBox).not.toBeNull();
    expect(whatsappBox).not.toBeNull();

    const area = (b: { width: number; height: number }) => b.width * b.height;
    expect(area(whatsappBox!)).toBeLessThan(area(quoteBox!));
  });
});
