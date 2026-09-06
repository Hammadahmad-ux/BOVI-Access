import { test, expect } from "@playwright/test";

/**
 * Primary navigation.
 *
 * The reported bug: standing at the bottom of the homepage and clicking
 * HOME did nothing, because Next treats a navigation to the current URL
 * as a no-op. These guard the fix without pinning the animation — they
 * wait for the scroll to settle rather than asserting a position after a
 * fixed delay, which is what a real visitor experiences and what stops
 * the longest page on the site from failing on timing alone.
 */

const NAV = [
  { route: "/", label: "Home" },
  { route: "/about", label: "About" },
  { route: "/services", label: "Services" },
  { route: "/portfolio", label: "Projects" },
  { route: "/service-areas", label: "Service Areas" },
  { route: "/contact", label: "Contact" },
] as const;

const settled = (page: import("@playwright/test").Page) =>
  page.waitForFunction(() => window.scrollY === 0, { timeout: 8000 });

test.describe("desktop primary nav", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) < 1280,
    "The desktop nav appears at xl.",
  );

  for (const { route, label } of NAV) {
    test(`clicking ${label} while on ${route} returns to the top`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(200);

      await page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("link", { name: label, exact: true })
        .click();

      await settled(page);
      // And it must not have navigated anywhere.
      expect(new URL(page.url()).pathname).toBe(route);
    });
  }

  test("navigating to a DIFFERENT page still works", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 2000));

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "About", exact: true })
      .click();

    await expect(page).toHaveURL(/\/about$/);
    await settled(page);
  });

  test("a section link from a child page navigates rather than scrolling", async ({
    page,
  }) => {
    /*
      The trap this fix could easily have introduced. SERVICES is styled
      active on /services/mastic-sealant because the header highlights the
      whole section — but it is NOT the current page, so clicking it must
      go to the services index. Scrolling instead would strand the visitor.
    */
    await page.goto("/services/mastic-sealant");
    await page.evaluate(() => window.scrollTo(0, 1200));

    const services = page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Services", exact: true });
    await expect(services).toHaveAttribute("aria-current", "page");

    await services.click();
    await expect(page).toHaveURL(/\/services$/);
  });

  test("the active item is still marked, and only that one", async ({
    page,
  }) => {
    await page.goto("/about");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.locator('a[aria-current="page"]')).toHaveCount(1);
    await expect(nav.locator('a[aria-current="page"]')).toHaveText("About");
  });
});

test.describe("mobile primary nav", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) >= 1280,
    "The mobile menu only exists below xl.",
  );

  for (const { route, label } of [
    { route: "/", label: "Home" },
    { route: "/portfolio", label: "Projects" },
  ]) {
    test(`tapping ${label} while on ${route} closes the menu and returns to the top`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBeGreaterThan(200);

      await page.getByRole("button", { name: /open navigation/i }).click();
      const menu = page.getByRole("dialog", { name: /site navigation/i });
      await expect(menu).toBeVisible();

      await menu.getByRole("link", { name: label, exact: true }).click();

      await expect(menu).toBeHidden();
      await settled(page);

      // The menu's scroll lock must not survive it. This is the ordering
      // the scroll is deferred a frame for: closing the menu releases
      // `overflow: hidden`, and scrolling a locked document does nothing.
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    });
  }

  test("tapping a different page still navigates and closes the menu", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation/i }).click();

    const menu = page.getByRole("dialog", { name: /site navigation/i });
    await menu.getByRole("link", { name: "Contact", exact: true }).click();

    await expect(page).toHaveURL(/\/contact$/);
    await expect(menu).toBeHidden();
  });
});

test.describe("reduced motion", () => {
  test("returns to the top immediately, without animating", async ({
    page,
    viewport,
  }) => {
    test.skip(
      (viewport?.width ?? 0) < 1280,
      "Uses the desktop nav for a single-click path.",
    );

    // `emulateMedia`, not `test.use({ reducedMotion })` — the latter is
    // not in this Playwright's typed options, so it silently did nothing
    // and the test passed a smooth scroll off as an instant one.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 3000));
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(200);

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Home", exact: true })
      .click();

    // No polling: with reduced motion this must be done by the next
    // frames, not eased over half a second.
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});
