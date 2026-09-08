import { test, expect, type Page } from "@playwright/test";

const primaryNav = (page: Page) =>
  page.getByRole("navigation", { name: "Primary" });

const uniqueMainHrefs = async (page: Page, prefix: string) =>
  page.locator(`main a[href^="${prefix}"]`).evaluateAll((links) => [
    ...new Set(links.map((link) => link.getAttribute("href") ?? "")),
  ]);

test.describe("desktop header dropdowns", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Interaction coverage runs once at the largest desktop viewport.",
  );

  test("Services opens on hover and contains every provided service", async ({
    page,
  }) => {
    await page.goto("/services");
    const expected = await uniqueMainHrefs(page, "/services/");
    const nav = primaryNav(page);
    const trigger = nav.getByRole("button", { name: "Services", exact: true });

    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const panel = nav.locator('[data-nav-panel="services"]');
    await expect(panel).toBeVisible();
    await expect(
      panel.getByRole("link", { name: "View All Services", exact: true }),
    ).toHaveAttribute("href", "/services");

    const actual = await panel.locator('a[href^="/services/"]').evaluateAll(
      (links) => links.map((link) => link.getAttribute("href") ?? ""),
    );
    expect(actual).toEqual(expected);
  });

  test("Projects is a plain link to /portfolio with no dropdown", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = primaryNav(page);

    // No disclosure button, no panel — just a link.
    await expect(
      nav.getByRole("button", { name: "Projects", exact: true }),
    ).toHaveCount(0);
    const link = nav.getByRole("link", { name: "Projects", exact: true });
    await expect(link).toHaveAttribute("href", "/portfolio");

    await link.click();
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(nav.locator('[data-nav-panel="projects"]')).toHaveCount(0);
  });

  test("service items navigate to their real detail routes", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = primaryNav(page);

    await nav.getByRole("button", { name: "Services", exact: true }).click();
    const service = nav.locator('[data-nav-panel="services"] a').nth(1);
    const serviceHref = await service.getAttribute("href");
    await service.click();
    await expect(page).toHaveURL(new RegExp(`${serviceHref}$`));
  });

  test("keyboard operation, Escape, and outside click close cleanly", async ({
    page,
  }) => {
    await page.goto("/");
    const nav = primaryNav(page);
    const services = nav.getByRole("button", {
      name: "Services",
      exact: true,
    });

    // Prove hydration and outside-click handling before using programmatic
    // focus; in dev mode Playwright can otherwise focus the server-rendered
    // button before React has attached its focus handler.
    await services.click();
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await page.locator("main h1").click({ position: { x: 4, y: 4 } });
    await expect(services).toHaveAttribute("aria-expanded", "false");

    await services.focus();
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(services).toHaveAttribute("aria-expanded", "false");
    await expect(services).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(
      nav.getByRole("link", { name: "View All Services", exact: true }),
    ).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(services).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Space");
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(services).toHaveAttribute("aria-expanded", "false");

  });

  test("the section stays lit on detail routes", async ({ page }) => {
    await page.goto("/services/gutter-cleaning");
    await expect(
      primaryNav(page).getByRole("button", {
        name: "Services",
        exact: true,
      }),
    ).toHaveAttribute("data-active", "true");

    // Projects is a link now — it lights up green across its whole section,
    // the /portfolio index and every /projects/<slug> page.
    await page.goto("/projects/external-pipe-repair");
    await expect(
      primaryNav(page).getByRole("link", { name: "Projects", exact: true }),
    ).toHaveClass(/text-green-bright/);
  });
});

test.describe("mobile header accordion", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) >= 1280,
    "The accordion lives in the mobile/tablet navigation.",
  );

  test("Services expands with its nested links; Projects is a plain link", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation/i }).click();
    const dialog = page.getByRole("dialog", { name: /site navigation/i });

    const services = dialog.getByRole("button", {
      name: "Services",
      exact: true,
    });
    await services.click();
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await expect(
      dialog.getByRole("link", { name: "View All Services", exact: true }),
    ).toBeVisible();

    // Projects has no disclosure button and no nested list — it is a
    // direct link to /portfolio.
    await expect(
      dialog.getByRole("button", { name: "Projects", exact: true }),
    ).toHaveCount(0);
    await expect(
      dialog.getByRole("link", { name: "Projects", exact: true }),
    ).toHaveAttribute("href", "/portfolio");
  });

  test("selecting a nested item navigates, closes, and releases scroll", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation/i }).click();
    const dialog = page.getByRole("dialog", { name: /site navigation/i });
    await dialog
      .getByRole("button", { name: "Services", exact: true })
      .click();

    const nested = dialog.locator('#mobile-services-links a[href^="/services/"]').first();
    const href = await nested.getAttribute("href");
    await nested.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(dialog).toBeHidden();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
});
