import { test, expect } from "@playwright/test";

/**
 * CMS integration guards.
 *
 * These run against whatever content source is configured — the real
 * Sanity project in normal use, the verified local content when it is
 * not. Either way the invariants below must hold, which is the point:
 * the site is not allowed to behave differently depending on where its
 * content came from.
 *
 * The one thing they CANNOT cover is a service that exists only in the
 * CMS, because that needs a document the real dataset does not have.
 * `npm run verify:cms` proves that separately against a fixture API, so
 * no test content is ever written into the client's live dataset.
 *
 * Page-level invariants, not layout — one viewport is enough, and
 * running them seven times would just be slower.
 */
test.describe("CMS integration", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Content invariants are viewport-independent.",
  );

  test("the services listing and the sitemap agree, with no duplicates", async ({
    page,
    request,
  }) => {
    await page.goto("/services");

    const listed = await page
      .locator('main a[href^="/services/"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );
    const uniqueListed = [...new Set(listed)];

    // A service rendered twice means the local list and the CMS list were
    // concatenated without de-duplicating by slug.
    expect(listed.length).toBe(uniqueListed.length);
    expect(uniqueListed.length).toBeGreaterThanOrEqual(8);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    const sitemapServiceUrls = [
      ...sitemap.matchAll(/<loc>[^<]*(\/services\/[a-z0-9-]+)<\/loc>/g),
    ].map((match) => match[1]);

    expect(sitemapServiceUrls.length).toBe(
      new Set(sitemapServiceUrls).size,
    );

    // Every service a visitor can click must also be one Google is told
    // about, and vice versa.
    expect([...sitemapServiceUrls].sort()).toEqual([...uniqueListed].sort());
  });

  test("every listed service resolves to a real page", async ({
    page,
    request,
  }) => {
    await page.goto("/services");
    const hrefs = await page
      .locator('main a[href^="/services/"]')
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute("href") ?? "")),
      ]);

    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), `${href} should render`).toBe(200);
    }
  });

  test("an unknown service slug is a real 404, not an empty page", async ({
    request,
  }) => {
    // `dynamicParams` is on so that a service published after the last
    // build still resolves. The risk that buys is a URL that renders an
    // empty shell instead of a 404 for anything at all.
    const response = await request.get(
      "/services/definitely-not-a-real-service",
    );
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain("Page not found");
  });

  test("homepage CMS-backed sections render content, never a blank", async ({
    page,
  }) => {
    // Every one of these reads through the provider now. With the CMS
    // fields empty — which is how the project ships — each must fall back
    // to the verified local copy rather than rendering nothing. An empty
    // string here would mean a half-filled Sanity document could blank a
    // homepage section.
    await page.goto("/");

    const hero = page.locator("section").first();
    await expect(hero.getByText(/Professional access, repair/)).toBeVisible();

    // The introduction BODY, which is CMS-editable — not its heading,
    // which is not.
    await expect(
      page.getByText(/specialist high-level access, repair and maintenance/i).first(),
    ).toBeVisible();

    const coverage = page.getByText(
      /BOVI Access supports commercial property/i,
    );
    await expect(coverage.first()).toBeVisible();

    await expect(
      page.getByText(/Tell us about the building/i).first(),
    ).toBeVisible();
  });

  test("the introduction photograph and featured project still render", async ({
    page,
  }) => {
    // Both are CMS-selectable now. With nothing selected they must show
    // the verified local photography, with real dimensions so nothing
    // shifts.
    await page.goto("/");

    const broken = await page
      .locator("img")
      .evaluateAll((images) =>
        (images as HTMLImageElement[])
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.currentSrc || img.src),
      );
    expect(broken).toEqual([]);
  });
});
