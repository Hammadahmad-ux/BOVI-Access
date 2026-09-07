import { test, expect } from "@playwright/test";

const fixtureState = process.env.CMS_FIXTURE_STATE;

test("CMS lifecycle is reflected in both header dropdowns", async ({ page }) => {
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

  await nav.getByRole("button", { name: "Projects", exact: true }).click();
  const projectPanel = nav.locator('[data-nav-panel="projects"]');
  const fixtureProject = projectPanel.getByRole("link", {
    name: "QA Temporary Test Project",
    exact: true,
  });

  if (fixtureState === "published") {
    await expect(fixtureProject).toHaveAttribute(
      "href",
      "/projects/qa-temporary-test-project",
    );
  } else {
    await expect(fixtureProject).toHaveCount(0);
    // This project still exists in the checked-in local fallback, but is
    // intentionally absent from the successful CMS response in this run.
    // It must not be resurrected in navigation as stale local content.
    await expect(
      projectPanel.getByRole("link", {
        name: "Commercial Glazing Clean",
        exact: true,
      }),
    ).toHaveCount(0);
  }
});
