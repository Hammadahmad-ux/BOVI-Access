import { test, expect } from "@playwright/test";

/**
 * Foundation guards.
 *
 * These are not feature tests — they encode the QA rules that must never
 * regress as pages are added in Phases 2-4. Every new route should be
 * added to ROUTES below.
 */

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/services/commercial-window-cleaning",
  "/portfolio",
  "/service-areas",
  "/contact",
  "/privacy",
];

for (const route of ROUTES) {
  test.describe(`${route}`, () => {
    test("has no horizontal overflow", async ({ page }) => {
      await page.goto(route);
      // QA #1 / #16. Compares the document's scrollable width against the
      // viewport; 1px of tolerance absorbs sub-pixel rounding.
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test("has exactly one h1", async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
    });

    test("has a title and meta description", async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveTitle(/BOVI Access/);
      const description = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(description?.length ?? 0).toBeGreaterThan(50);
    });

    test("logs no console errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  });
}

test("logo links to home", async ({ page }) => {
  await page.goto("/about");
  const logo = page.getByRole("link", { name: /BOVI Access — home/i }).first();
  await expect(logo).toHaveAttribute("href", "/");
});

test("phone and email are real links", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator('a[href="tel:+447990377780"]').first(),
  ).toBeAttached();
  await expect(
    page.locator('a[href="mailto:info@boviaccess.co.uk"]').first(),
  ).toBeAttached();
});

test("no dead links", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page.locator("a[href]").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") ?? ""),
  );
  // QA #20 in spirit: a bare "#" is never an acceptable destination.
  expect(hrefs.filter((href) => href === "#" || href === "")).toEqual([]);
});

test("legacy Wix URLs redirect to the new service pages", async ({ page }) => {
  await page.goto("/CommercialWindowCleaning-FacadeCleaning/");
  await expect(page).toHaveURL(/\/services\/commercial-window-cleaning$/);

  await page.goto("/PressureWashingandDOFFcleaning/");
  await expect(page).toHaveURL(/\/services\/pressure-washing-doff-cleaning$/);
});

test("unknown routes render the custom 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: /page not found/i }),
  ).toBeVisible();
});

test.describe("mobile navigation", () => {
  // QA #3: the mobile menu must actually work — open, navigate, close,
  // and be operable from the keyboard.
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) >= 1024,
    "Mobile menu is only rendered below the lg breakpoint.",
  );

  test("opens, lists every page, and closes", async ({ page }) => {
    await page.goto("/");

    const trigger = page.getByRole("button", { name: /open navigation/i });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();

    const dialog = page.getByRole("dialog", { name: /site navigation/i });
    await expect(dialog).toBeVisible();

    for (const label of [
      "Home",
      "About",
      "Services",
      "Projects",
      "Service Areas",
      "Contact",
    ]) {
      await expect(dialog.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    // Escape must close it.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("navigates and closes on selection", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation/i }).click();

    const dialog = page.getByRole("dialog", { name: /site navigation/i });
    await dialog.getByRole("link", { name: "About", exact: true }).click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(dialog).toBeHidden();
    // Background scroll must be released again.
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("the logo is not clipped by the header", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    const logo = header.getByRole("link", { name: /BOVI Access — home/i });

    const headerBox = await header.boundingBox();
    const logoBox = await logo.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(logoBox).not.toBeNull();
    expect(logoBox!.height).toBeLessThanOrEqual(headerBox!.height);
  });
});
