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

  test("Projects opens on click and contains only the provided projects", async ({
    page,
  }) => {
    await page.goto("/portfolio");
    const expected = await uniqueMainHrefs(page, "/projects/");
    const nav = primaryNav(page);
    const trigger = nav.getByRole("button", { name: "Projects", exact: true });

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const panel = nav.locator('[data-nav-panel="projects"]');
    await expect(
      panel.getByRole("link", { name: "View All Projects", exact: true }),
    ).toHaveAttribute("href", "/portfolio");

    const actual = await panel.locator('a[href^="/projects/"]').evaluateAll(
      (links) => links.map((link) => link.getAttribute("href") ?? ""),
    );
    expect(actual).toEqual(expected);
  });

  test("service and project items navigate to their real detail routes", async ({
    page,
  }) => {
    await page.goto("/");
    let nav = primaryNav(page);

    await nav.getByRole("button", { name: "Services", exact: true }).click();
    const service = nav.locator('[data-nav-panel="services"] a').nth(1);
    const serviceHref = await service.getAttribute("href");
    await service.click();
    await expect(page).toHaveURL(new RegExp(`${serviceHref}$`));

    nav = primaryNav(page);
    await nav.getByRole("button", { name: "Projects", exact: true }).click();
    const project = nav.locator('[data-nav-panel="projects"] a').nth(1);
    const projectHref = await project.getAttribute("href");
    await project.click();
    await expect(page).toHaveURL(new RegExp(`${projectHref}$`));
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

  test("section triggers stay active on detail routes", async ({ page }) => {
    await page.goto("/services/gutter-cleaning");
    await expect(
      primaryNav(page).getByRole("button", {
        name: "Services",
        exact: true,
      }),
    ).toHaveAttribute("data-active", "true");

    await page.goto("/projects/external-pipe-repair");
    await expect(
      primaryNav(page).getByRole("button", {
        name: "Projects",
        exact: true,
      }),
    ).toHaveAttribute("data-active", "true");
  });
});

test.describe("mobile header accordions", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) >= 1280,
    "The accordion lives in the mobile/tablet navigation.",
  );

  test("Services and Projects expand with their nested links", async ({
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

    const projects = dialog.getByRole("button", {
      name: "Projects",
      exact: true,
    });
    await projects.click();
    await expect(projects).toHaveAttribute("aria-expanded", "true");
    await expect(services).toHaveAttribute("aria-expanded", "false");
    await expect(
      dialog.getByRole("link", { name: "View All Projects", exact: true }),
    ).toBeVisible();
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
