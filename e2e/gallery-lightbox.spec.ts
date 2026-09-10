import { test, expect, type Page } from "@playwright/test";

/**
 * The gallery lightbox on the service and project detail pages.
 *
 * The client asked for a proper gallery: click any photograph, then page
 * through the rest of that job's photographs without closing — arrows and
 * a counter on desktop, swipe on touch, arrow keys and Escape on a
 * keyboard. One implementation (`src/components/ui/Gallery.tsx`) backs
 * both page types.
 *
 * These assert the behaviour, not pixel geometry, so the layout can still
 * be tuned. The frame-size checks live in projects.spec / services.spec.
 */

const MULTI_IMAGE = "/projects/external-pipe-repair"; // 4 gallery photos
const SINGLE_IMAGE = "/projects/mastic-sealant-renewal"; // 1 gallery photo

const triggers = (page: Page) =>
  page.locator('main section ul li button[aria-label^="View larger"]');

const counter = (page: Page) =>
  page.getByRole("dialog").getByText(/^\d+ \/ \d+$/);

test.describe("gallery lightbox", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440 && viewport?.width !== 390,
    "Behaviour is covered once on desktop and once on a phone.",
  );

  test("opens at the clicked photograph, not the first", async ({ page }) => {
    await page.goto(MULTI_IMAGE);

    const count = await triggers(page).count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Open the third thumbnail.
    await triggers(page).nth(2).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(counter(page)).toHaveText(`3 / ${count}`);
  });

  test("next and previous page through the set without closing", async ({
    page,
  }) => {
    await page.goto(MULTI_IMAGE);
    const count = await triggers(page).count();

    await triggers(page).first().click();
    const dialog = page.getByRole("dialog");
    await expect(counter(page)).toHaveText(`1 / ${count}`);

    await dialog.getByRole("button", { name: "Next image" }).click();
    await expect(counter(page)).toHaveText(`2 / ${count}`);
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Previous image" }).click();
    await expect(counter(page)).toHaveText(`1 / ${count}`);

    // Previous from the first wraps to the last — never a dead end.
    await dialog.getByRole("button", { name: "Previous image" }).click();
    await expect(counter(page)).toHaveText(`${count} / ${count}`);
    await expect(dialog).toBeVisible();
  });

  test("arrow keys navigate and Escape closes", async ({ page }) => {
    await page.goto(MULTI_IMAGE);
    const count = await triggers(page).count();

    await triggers(page).first().click();
    await expect(counter(page)).toHaveText(`1 / ${count}`);

    await page.keyboard.press("ArrowRight");
    await expect(counter(page)).toHaveText(`2 / ${count}`);

    await page.keyboard.press("ArrowLeft");
    await expect(counter(page)).toHaveText(`1 / ${count}`);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("a swipe pages through on touch, a small drag does not", async ({
    page,
    viewport,
  }) => {
    test.skip(
      (viewport?.width ?? 0) >= 768,
      "Swipe is the touch affordance; desktop has the arrows.",
    );
    await page.goto(MULTI_IMAGE);
    const count = await triggers(page).count();

    await triggers(page).first().click();
    await expect(counter(page)).toHaveText(`1 / ${count}`);

    // Synthesise a horizontal touch drag on the figure. The project has no
    // `hasTouch`, so the events are constructed and dispatched directly.
    const swipe = (dx: number) =>
      page.evaluate((delta) => {
        const figure = document.querySelector("dialog figure");
        if (!figure) throw new Error("no dialog figure");
        const y = figure.getBoundingClientRect().top + 40;
        const startX = 200;
        const touch = (x: number) =>
          new Touch({ identifier: 1, target: figure, clientX: x, clientY: y });
        figure.dispatchEvent(
          new TouchEvent("touchstart", {
            bubbles: true,
            touches: [touch(startX)],
            changedTouches: [touch(startX)],
          }),
        );
        figure.dispatchEvent(
          new TouchEvent("touchend", {
            bubbles: true,
            touches: [],
            changedTouches: [touch(startX + delta)],
          }),
        );
      }, dx);

    // A deliberate leftward swipe advances.
    await swipe(-120);
    await expect(counter(page)).toHaveText(`2 / ${count}`);

    // A tiny movement is ignored — a tap or a scroll that drifted.
    await swipe(-12);
    await expect(counter(page)).toHaveText(`2 / ${count}`);

    // A rightward swipe goes back.
    await swipe(120);
    await expect(counter(page)).toHaveText(`1 / ${count}`);
  });

  test("a single-photograph gallery has no navigation", async ({ page }) => {
    await page.goto(SINGLE_IMAGE);

    await expect(triggers(page)).toHaveCount(1);
    await triggers(page).first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Next image" }),
    ).toHaveCount(0);
    await expect(
      dialog.getByRole("button", { name: "Previous image" }),
    ).toHaveCount(0);
    await expect(counter(page)).toHaveCount(0);

    // Close still works.
    await dialog.getByLabel("Close image").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the thumbnail crops, the large view shows the whole photograph", async ({
    page,
  }) => {
    // The thumbnail crops around the Sanity hotspot (object-cover); the
    // large view never re-crops (object-contain), so opening it shows the
    // photograph, not another crop of it.
    await page.goto(MULTI_IMAGE);

    await expect(triggers(page).first().locator("img")).toHaveCSS(
      "object-fit",
      "cover",
    );

    await triggers(page).first().click();
    await expect(
      page.getByRole("dialog").locator("figure img"),
    ).toHaveCSS("object-fit", "contain");
  });
});

test.describe("detail-page hero is not a lightbox, listing images are links", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Navigation is viewport-independent.",
  );

  test("a service card photograph opens the service page", async ({ page }) => {
    await page.goto("/services");

    // The whole card is one link on the services listing; the photograph
    // is inside it, so a click on the image lands on the service.
    const card = page.locator('main a[href^="/services/"]').first();
    const href = await card.getAttribute("href");
    const image = card.locator("img").first();
    await expect(image).toBeVisible();
    await image.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("no gallery lightbox trigger leaks onto a listing page", async ({
    page,
  }) => {
    for (const route of ["/", "/portfolio", "/services"]) {
      await page.goto(route);
      await expect(
        page.locator('main button[aria-label^="View larger"]'),
        `${route} should have no lightbox trigger`,
      ).toHaveCount(0);
    }
  });
});
