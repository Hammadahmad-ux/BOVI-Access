import { test, expect } from "@playwright/test";

/**
 * Projects — completed-work gallery.
 *
 * These guard the two things the client actually reported: project cards
 * that sent visitors to service pages instead of showing the work, and
 * two Lightning Protection entries on one page. Both were symptoms of the
 * same thing — the list was photographs grouped by category rather than
 * jobs — so the guards below assert the shape, not just the symptom.
 *
 * Page-level invariants; one viewport is enough. The responsive checks
 * for these routes live in foundation.spec.ts, which runs everywhere.
 */
test.describe("projects gallery", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Content invariants are viewport-independent.",
  );

  test("no project card links to a service page", async ({ page }) => {
    // THE CLIENT'S ACTUAL COMPLAINT: "it redirects to the service pages
    // rather than actually showing photos of completed work."
    await page.goto("/portfolio");

    const serviceLinks = await page
      .locator('main a[href^="/services/"]')
      .count();
    expect(serviceLinks).toBe(0);

    const projectLinks = await page
      .locator('main a[href^="/projects/"]')
      .count();
    expect(projectLinks).toBeGreaterThanOrEqual(3);
  });

  test("every project appears exactly once", async ({ page }) => {
    // The duplicate Lightning Protection entry existed because two
    // photographs shared a category. Now one card is one job, so a
    // repeated destination means a genuine duplicate.
    await page.goto("/portfolio");

    const hrefs = await page
      .locator('main a[href^="/projects/"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );

    expect(hrefs.length).toBe(new Set(hrefs).size);
  });

  test("no service category is listed twice", async ({ page }) => {
    await page.goto("/portfolio");

    // `data-project-category` marks the two places a project's service
    // category is rendered — the featured block and each card. Matching on
    // the `.eyebrow` class instead swept up the section labels and the
    // "4 photos" badges, which repeat legitimately.
    const categories = await page
      .locator("main [data-project-category]")
      .evaluateAll((nodes) =>
        nodes
          .map((node) => node.textContent?.trim().toLowerCase() ?? "")
          .filter(Boolean),
      );

    expect(categories.length).toBeGreaterThanOrEqual(3);

    const counts = new Map<string, number>();
    for (const category of categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    const repeated = [...counts].filter(([, n]) => n > 1);
    expect(repeated).toEqual([]);
  });

  test("every project card resolves to a real detail page", async ({
    page,
    request,
  }) => {
    await page.goto("/portfolio");
    const hrefs = await page
      .locator('main a[href^="/projects/"]')
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute("href") ?? "")),
      ]);

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), `${href} should render`).toBe(200);
    }
  });

  test("a project page shows its own photographs", async ({ page }) => {
    await page.goto("/portfolio");
    const href = await page
      .locator('main a[href^="/projects/"]')
      .first()
      .getAttribute("href");
    await page.goto(href as string);

    // The whole point of the rebuild: more than one photograph of the job.
    const figures = page.locator(
      'main section ul li button[aria-label^="View larger"] img',
    );
    await expect(figures.first()).toBeVisible();
    expect(await figures.count()).toBeGreaterThanOrEqual(1);

    const broken = await page
      .locator("img")
      .evaluateAll((images) =>
        (images as HTMLImageElement[])
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.currentSrc || img.src),
      );
    expect(broken).toEqual([]);
  });

  test("a project with no location, date or scope renders cleanly", async ({
    page,
  }) => {
    // None of the current projects has verified metadata, so this is the
    // normal case rather than an edge case. What must never happen is an
    // empty "Location" label or a Details band containing nothing.
    await page.goto("/portfolio");
    const href = await page
      .locator('main a[href^="/projects/"]')
      .first()
      .getAttribute("href");
    await page.goto(href as string);

    // No metadata means no definition rows at all — not rows with empty
    // values, and not a "Details" band containing one line that repeats
    // the category already in the hero.
    expect(await page.locator("main dt").count()).toBe(0);
    expect(
      await page.getByRole("heading", { name: /details/i }).count(),
    ).toBe(0);

    // Section numerals must still start at 01, rather than leaving a gap
    // where a hidden section used to be.
    const photographs = page
      .locator("main p", { hasText: /photographs/i })
      .first();
    await expect(photographs).toContainText("01");
  });

  test("an unknown project slug is a real 404", async ({ request }) => {
    const response = await request.get("/projects/not-a-real-project");
    expect(response.status()).toBe(404);
  });

  test("homepage project cards link to projects, not services", async ({
    page,
  }) => {
    await page.goto("/");

    const grid = page.locator("section", { has: page.getByText("Recent works") });
    const hrefs = await grid
      .locator('a[href^="/projects/"], a[href^="/services/"]')
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((href) => href.startsWith("/services/"))).toEqual([]);
  });

  test("project URLs are in the sitemap, without duplicates", async ({
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const urls = [
      ...sitemap.matchAll(/<loc>[^<]*(\/projects\/[a-z0-9-]+)<\/loc>/g),
    ].map((match) => match[1]);

    expect(urls.length).toBeGreaterThan(0);
    expect(urls.length).toBe(new Set(urls).size);

    for (const url of urls) {
      expect((await request.get(url)).status()).toBe(200);
    }
  });
});

/**
 * Card geometry and the image lightbox.
 *
 * The client's second round of feedback: "some of the project cards are
 * slightly misaligned and the project photos are quite large [...] make
 * the images smaller by default and keep all the cards/photos aligned and
 * consistent in size [...] visitors could then click on a photo to open
 * it in a larger view."
 *
 * These run at every viewport, because that is where the alignment
 * actually has to hold.
 */
test.describe("projects grid and lightbox", () => {
  test("every card preview has identical dimensions", async ({ page }) => {
    // The old grid switched between a 4:3 and a 3:4 frame depending on
    // the source photograph's orientation, and staggered every second
    // column down 64px. Both are what "misaligned" meant.
    await page.goto("/portfolio");

    const sizes = await page
      .locator('main button[aria-label^="View larger"] span.block')
      .evaluateAll((frames) =>
        frames.map((frame) => {
          const rect = frame.getBoundingClientRect();
          return `${Math.round(rect.width)}x${Math.round(rect.height)}`;
        }),
      );

    expect(sizes.length).toBeGreaterThanOrEqual(3);
    expect(new Set(sizes).size, `frame sizes: ${sizes.join(", ")}`).toBe(1);
  });

  test("cards in a row share a top edge and align their titles", async ({
    page,
  }) => {
    await page.goto("/portfolio");

    const rows = await page.locator("main ul > li").evaluateAll((items) => {
      const cards = items.filter((li) =>
        li.querySelector('button[aria-label^="View larger"]'),
      );
      const grouped = new Map<number, number[]>();
      for (const card of cards) {
        const top = Math.round(card.getBoundingClientRect().top);
        const title = card.querySelector('a[href^="/projects/"]');
        const titleTop = title
          ? Math.round(title.getBoundingClientRect().top)
          : -1;
        const key = [...grouped.keys()].find((k) => Math.abs(k - top) < 4);
        const bucket = key === undefined ? [] : grouped.get(key)!;
        if (key === undefined) grouped.set(top, bucket);
        bucket.push(titleTop);
      }
      return [...grouped.values()];
    });

    expect(rows.length).toBeGreaterThan(0);
    for (const titleTops of rows) {
      // One distinct title position per row: no card is pushed down by a
      // longer title or a longer description.
      expect(new Set(titleTops).size).toBe(1);
    }
  });

  test("the grid gains columns with the viewport", async ({
    page,
    viewport,
  }) => {
    await page.goto("/portfolio");

    const columns = await page.locator("main ul").first().evaluate((ul) => {
      const template = getComputedStyle(ul).gridTemplateColumns;
      return template.split(" ").filter(Boolean).length;
    });

    const width = viewport?.width ?? 0;
    const expected =
      width >= 1280 ? 4 : width >= 1024 ? 3 : width >= 640 ? 2 : 1;
    expect(columns).toBe(expected);
  });

  test("clicking a photograph opens it larger, and Escape closes it", async ({
    page,
  }) => {
    await page.goto("/portfolio");

    const trigger = page
      .locator('main button[aria-label^="View larger"]')
      .first();
    const label = await trigger.getAttribute("aria-label");

    await expect(page.getByRole("dialog")).toHaveCount(0);

    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // The large view must show the whole photograph, not another crop.
    const image = dialog.locator("img").first();
    await expect(image).toHaveCSS("object-fit", "contain");

    const box = await image.boundingBox();
    expect(box!.width).toBeLessThanOrEqual((page.viewportSize()?.width ?? 0) + 1);
    expect(box!.height).toBeLessThanOrEqual(
      (page.viewportSize()?.height ?? 0) + 1,
    );

    // Background must not scroll behind the dialog.
    expect(
      await page.evaluate(() => document.body.style.overflow),
    ).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    /*
      Polled, not asserted instantly. Closing a <dialog> is synchronous,
      but the scroll lock is released by a React effect cleanup, which
      lands on the next tick — reading it immediately raced the framework
      rather than testing the behaviour.
    */
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow))
      .not.toBe("hidden");

    // Focus handed back to the photograph that opened it.
    await expect
      .poll(() =>
        page.evaluate(() =>
          document.activeElement?.getAttribute("aria-label"),
        ),
      )
      .toBe(label);
  });

  test("the close button and the backdrop both dismiss the lightbox", async ({
    page,
  }) => {
    await page.goto("/portfolio");
    const trigger = page
      .locator('main button[aria-label^="View larger"]')
      .first();

    await trigger.click();
    await page.getByRole("dialog").getByLabel("Close image").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Top-left corner is backdrop on every viewport.
    await page.mouse.click(5, 5);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the title still opens the project page", async ({ page }) => {
    // Two destinations from one card: the photograph opens the image, the
    // title opens the job. Neither may swallow the other.
    await page.goto("/portfolio");

    const link = page.locator('main a[href^="/projects/"]').last();
    const href = await link.getAttribute("href");
    await link.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator("h1")).toHaveCount(1);
    // Opening a project must not have left a dialog behind.
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("a project page's photographs are capped and identical", async ({
    page,
    viewport,
  }) => {
    /*
      The client's complaint, in one assertion: a photograph inside a
      project ran the full column, so at 1440 each frame was 664x830 and
      one filled the screen. It must never exceed the 400px a service
      page uses, and every frame in the set must be the same size.
    */
    await page.goto("/projects/lightning-protection-works");

    const frames = page.locator(
      'main section ul li button[aria-label^="View larger"]',
    );
    expect(await frames.count()).toBeGreaterThan(1);

    const boxes = await frames.evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { w: Math.round(rect.width), h: Math.round(rect.height) };
      }),
    );

    const first = boxes[0];
    for (const box of boxes) {
      // 1px of tolerance: a fractional grid track rounds either way.
      expect(Math.abs(box.w - first.w)).toBeLessThanOrEqual(1);
      expect(Math.abs(box.h - first.h)).toBeLessThanOrEqual(1);
    }

    const width = viewport?.width ?? 0;
    if (width >= 640) {
      expect(first.w).toBeLessThanOrEqual(400);
    }
    // 4:5, the same frame the service pages and the grid use.
    expect(first.h / first.w).toBeGreaterThan(1.2);
    expect(first.h / first.w).toBeLessThan(1.3);
  });

  test("a project page's photographs open larger too", async ({ page }) => {
    // Smaller frames are only acceptable because the detail is still
    // reachable. Same component as the grid, exercised where the client
    // found the problem.
    await page.goto("/projects/lightning-protection-works");

    const trigger = page
      .locator('main section ul li button[aria-label^="View larger"]')
      .first();
    const label = await trigger.getAttribute("aria-label");

    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img").first()).toHaveCSS(
      "object-fit",
      "contain",
    );

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect
      .poll(() =>
        page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
      )
      .toBe(label);
  });

  test("the homepage projects section is untouched", async ({ page }) => {
    // The compact portfolio card is deliberately NOT the homepage
    // treatment; that section has its own editorial composition.
    await page.goto("/");
    await expect(
      page.locator('main button[aria-label^="View larger"]'),
    ).toHaveCount(0);
  });
});
