import { test, expect } from "@playwright/test";

/**
 * Topical SEO guards.
 *
 * The client asked for more emphasis on Drainage & Pipe Repairs — his
 * first two jobs were that work — around "external pipe repairs", "soil
 * pipe repairs" and "drainage & pipe repairs".
 *
 * These assert the SHAPE of that coverage, not the sentences: which page
 * owns the topic, that it is internally linked, that the metadata is
 * unique and readable, and that nothing has tipped into stuffing. Copy
 * can be rewritten freely without breaking them; the topic going missing,
 * or being repeated into spam, breaks them.
 */

const SERVICE_SLUGS = [
  "commercial-window-cleaning",
  "brickwork-repointing",
  "gutter-cleaning",
  "drainage-external-pipe-repairs",
  "mastic-sealant",
  "pressure-washing-doff-cleaning",
  "roof-roofline-repairs",
  "lightning-protection",
];

const DRAINAGE = "/services/drainage-external-pipe-repairs";

test.describe("topical SEO", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Copy and metadata are viewport-independent.",
  );

  test("every service page has a unique, sane title and description", async ({
    page,
  }) => {
    const titles = new Map<string, string>();
    const descriptions = new Map<string, string>();

    for (const slug of SERVICE_SLUGS) {
      await page.goto(`/services/${slug}`);

      const title = await page.title();
      const description =
        (await page
          .locator('meta[name="description"]')
          .getAttribute("content")) ?? "";

      expect(title.length, `${slug} title length`).toBeGreaterThan(20);
      expect(title.length, `${slug} title length`).toBeLessThan(70);
      expect(description.length, `${slug} description length`).toBeGreaterThan(
        80,
      );
      expect(description.length, `${slug} description length`).toBeLessThan(
        200,
      );

      expect(titles.has(title), `duplicate title: ${title}`).toBe(false);
      expect(
        descriptions.has(description),
        `duplicate description on ${slug}`,
      ).toBe(false);
      titles.set(title, slug);
      descriptions.set(description, slug);
    }
  });

  test("the drainage page owns its topic", async ({ page }) => {
    await page.goto(DRAINAGE);

    const title = await page.title();
    const description =
      (await page.locator('meta[name="description"]').getAttribute("content")) ??
      "";
    const body = (await page.locator("main").innerText()).toLowerCase();

    // The H1 stays the readable service name, not a keyword list.
    await expect(page.locator("h1")).toHaveCount(1);
    expect((await page.locator("h1").innerText()).trim()).toBe(
      "Drainage & External Pipe Repairs",
    );

    expect(title.toLowerCase()).toContain("pipe repairs");
    expect(description.toLowerCase()).toContain("external pipe repairs");
    expect(description.toLowerCase()).toContain("soil pipe");

    // The three target topics all appear in the visible copy.
    for (const topic of ["external pipe repair", "soil pipe repair", "pipework"]) {
      expect(body, `drainage page should cover "${topic}"`).toContain(topic);
    }

    // Scope boundary: the page must not imply services BOVI does not sell.
    for (const outOfScope of ["drain unblocking", "cctv drain survey"]) {
      expect(body).not.toContain(outOfScope);
    }
  });

  test("the drainage topic is not stuffed", async ({ page }) => {
    await page.goto(DRAINAGE);

    // No single paragraph or list item should read as keyword filler.
    const blocks = await page.locator("main p, main li").allInnerTexts();
    const stuffed = blocks.filter(
      (text) => (text.toLowerCase().match(/\bpipe\w*/g) ?? []).length >= 4,
    );
    expect(stuffed).toEqual([]);

    // And the exact phrase must not be hammered.
    const body = (await page.locator("main").innerText()).toLowerCase();
    const exact = (body.match(/external pipe repairs/g) ?? []).length;
    expect(exact).toBeLessThanOrEqual(4);
  });

  test("the pipe repair project links to the drainage service", async ({
    page,
  }) => {
    await page.goto("/projects/external-pipe-repair");
    await expect(
      page.locator(`main a[href="${DRAINAGE}"]`).first(),
    ).toBeAttached();
  });

  test("other services are still linked and not demoted", async ({ page }) => {
    // The emphasis must not have quietly removed anything. Every service
    // still has its own row on /services and its own reachable page.
    await page.goto("/services");
    const hrefs = await page
      .locator('main a[href^="/services/"]')
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute("href") ?? "")),
      ]);

    for (const slug of SERVICE_SLUGS) {
      expect(hrefs, `${slug} missing from /services`).toContain(
        `/services/${slug}`,
      );
    }
  });

  test("service structured data reflects the real service", async ({
    page,
  }) => {
    await page.goto(DRAINAGE);
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    const service = blocks
      .map((raw) => JSON.parse(raw) as Record<string, unknown>)
      .find((data) => data["@type"] === "Service");

    expect(service).toBeTruthy();
    expect(service!.name).toBe("Drainage & External Pipe Repairs");
    // No invented trust signals.
    for (const forbidden of ["aggregateRating", "review", "offers", "price"]) {
      expect(service).not.toHaveProperty(forbidden);
    }
  });
});
