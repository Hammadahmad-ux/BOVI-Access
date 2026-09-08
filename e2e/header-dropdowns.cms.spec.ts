import { test, expect } from "@playwright/test";

const fixtureState = process.env.CMS_FIXTURE_STATE;

test("CMS lifecycle is reflected in the Services dropdown", async ({ page }) => {
  expect(["published", "unpublished"]).toContain(fixtureState);

  await page.goto("/about");
  const nav = page.getByRole("navigation", { name: "Primary" });

  await nav.getByRole("button", { name: "Services", exact: true }).click();
  const servicePanel = nav.locator('[data-nav-panel="services"]');
  const fixtureService = servicePanel.getByRole("link", {
    name: "QA Temporary Test Service",
    exact: true,
  });

  if (fixtureState === "published") {
    await expect(fixtureService).toHaveAttribute(
      "href",
      "/services/qa-temporary-test-service",
    );
  } else {
    await expect(fixtureService).toHaveCount(0);
  }

  // Projects is a plain link to /portfolio — there is no projects panel to
  // reflect a CMS change into. Its lifecycle is covered by verify:cms's
  // /portfolio and sitemap assertions.
  await expect(
    nav.getByRole("button", { name: "Projects", exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole("link", { name: "Projects", exact: true }),
  ).toHaveAttribute("href", "/portfolio");
});
