import { test, expect } from "@playwright/test";

/**
 * Service page imagery and ordering.
 *
 * The client: the service photographs "look good on phone" but are "too
 * large on laptop/desktop" and "should preferably be the same size", and
 * should "open larger when clicked". Separately, Drainage was to move to
 * 02 and Brickwork to 04.
 *
 * These assert the shape — one frame size per breakpoint, a working
 * lightbox, the numbers paired with the right services — not exact pixel
 * values, so the design can be tuned without rewriting the suite.
 */

const SERVICES = [
  "commercial-window-cleaning",
  "drainage-external-pipe-repairs",
  "gutter-cleaning",
  "brickwork-repointing",
  "mastic-sealant",
  "pressure-washing-doff-cleaning",
  "roof-roofline-repairs",
  "lightning-protection",
];

/** Position -> service, exactly as the client asked for it. */
const ORDER = [
  { index: "01", slug: "commercial-window-cleaning" },
  { index: "02", slug: "drainage-external-pipe-repairs" },
  { index: "03", slug: "gutter-cleaning" },
  { index: "04", slug: "brickwork-repointing" },
  { index: "05", slug: "mastic-sealant" },
  { index: "06", slug: "pressure-washing-doff-cleaning" },
  { index: "07", slug: "roof-roofline-repairs" },
  { index: "08", slug: "lightning-protection" },
];

const frames = (page: import("@playwright/test").Page) =>
  page
    .locator('main button[aria-label^="View larger"] span.block')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        // Rounded to the nearest 2px: sub-pixel layout rounding makes an
        // identical ratio measure 437 on one card and 438 on the next.
        return `${Math.round(rect.width / 2) * 2}x${Math.round(rect.height / 2) * 2}`;
      }),
    );

test.describe("service imagery", () => {
  for (const slug of SERVICES) {
    test(`${slug}: every photograph shares one frame`, async ({ page }) => {
      await page.goto(`/services/${slug}`);

      /*
        Scrolled instantly, not smoothly, and then given a beat to settle.
        The site sets `scroll-behavior: smooth` globally, so a stepped
        scroll leaves the page still animating; measuring a frame in that
        state made this test flake once at 768. Reveal only animates
        opacity and translate, so it cannot change a measured size — but
        measuring mid-flight is not worth defending either way.
      */
      await page.evaluate(async () => {
        const previous = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        await new Promise<void>((resolve) => {
          let y = 0;
          const timer = setInterval(() => {
            y += window.innerHeight * 0.8;
            window.scrollTo(0, y);
            if (y >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 60);
        });
        document.documentElement.style.scrollBehavior = previous;
      });
      await page.waitForTimeout(500);

      const sizes = await frames(page);
      expect(sizes.length).toBeGreaterThan(0);
      expect(new Set(sizes).size, `frames: ${sizes.join(", ")}`).toBe(1);

      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        ),
      ).toBe(0);
    });
  }

  test("desktop photographs are capped, mobile stays full-bleed", async ({
    page,
    viewport,
  }) => {
    // The whole point of the change: smaller on a laptop, unchanged on a
    // phone. 400px is the cap; a phone is narrower than that anyway.
    await page.goto("/services/gutter-cleaning");
    const [first] = await frames(page);
    const width = Number(first.split("x")[0]);

    if ((viewport?.width ?? 0) >= 1024) {
      expect(width).toBeLessThanOrEqual(400);
    } else if ((viewport?.width ?? 0) < 640) {
      // Full-bleed inside the gutter, as it was before.
      expect(width).toBeGreaterThan((viewport?.width ?? 0) * 0.8);
    }
  });
});

test.describe("service lightbox", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Dialog behaviour is viewport-independent; geometry is covered above.",
  );

  test("opens the photograph, and every exit closes it", async ({ page }) => {
    await page.goto("/services/gutter-cleaning");

    const trigger = page
      .locator('main button[aria-label^="View larger"]')
      .first();
    const label = await trigger.getAttribute("aria-label");

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await trigger.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img").first()).toHaveCSS(
      "object-fit",
      "contain",
    );
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    // Escape. Retrying assertions throughout: the dialog leaves the
    // accessibility tree the instant it closes, but React's state update
    // and the effect cleanup that releases the lock land a tick later.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    await expect
      .poll(() =>
        page.evaluate(() => document.activeElement?.getAttribute("aria-label")),
      )
      .toBe(label);

    // Close button
    await trigger.click();
    await page.getByRole("dialog").getByLabel("Close image").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Backdrop
    await trigger.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the thumbnail is small and the large view is not", async ({ page }) => {
    // A lightbox that upscales its own thumbnail would defeat the point.
    await page.goto("/services/gutter-cleaning");

    const thumbWidth = await page
      .locator('main button[aria-label^="View larger"] img')
      .first()
      .evaluate((img) =>
        Number(
          new URL((img as HTMLImageElement).currentSrc).searchParams.get("w"),
        ),
      );

    await page.locator('main button[aria-label^="View larger"]').first().click();
    const full = page.getByRole("dialog").locator("img").first();
    await expect(full).toBeVisible();
    // currentSrc is empty until the browser has picked a candidate.
    await expect.poll(() => full.evaluate((img) => (img as HTMLImageElement).currentSrc)).not.toBe("");
    const fullWidth = await full.evaluate((img) =>
      Number(new URL((img as HTMLImageElement).currentSrc).searchParams.get("w")),
    );

    expect(fullWidth).toBeGreaterThan(thumbWidth * 2);
  });
});

test.describe("service photo placement", () => {
  test("the overview pair sits on one line", async ({ page, viewport }) => {
    /*
      The pair used to be an asymmetric composition: a wider frame and a
      narrower one, the second dropped 64px down the page. The widths
      went when every service photograph was capped to one size, and the
      drop then read as two pictures that failed to line up rather than
      as a composition. The client asked for them level.

      Sampled THROUGH the entrance: Reveal's default travel with a
      per-frame delay would put the pair back on a step for most of a
      second even with the margin gone.
    */
    test.skip((viewport?.width ?? 0) < 640, "The pair stacks on a phone.");
    await page.goto("/services/brickwork-repointing");

    const readTops = () =>
      page.evaluate(() => {
        const grid = [...document.querySelectorAll("main div.grid")].find(
          (g) =>
            g.querySelectorAll('button[aria-label^="View larger"]').length === 2,
        );
        if (!grid) return [];
        return [
          ...grid.querySelectorAll('button[aria-label^="View larger"]'),
        ].map((b) => b.getBoundingClientRect().top);
      });

    await page.evaluate(() => {
      const grid = [...document.querySelectorAll("main div.grid")].find(
        (g) =>
          g.querySelectorAll('button[aria-label^="View larger"]').length === 2,
      );
      grid?.scrollIntoView({ block: "center", behavior: "instant" });
    });

    for (let i = 0; i < 10; i++) {
      const tops = await readTops();
      expect(tops.length).toBe(2);
      expect(
        Math.abs(tops[0] - tops[1]),
        `sample ${i}, tops: ${tops.join(", ")}`,
      ).toBeLessThanOrEqual(1);
      await page.waitForTimeout(80);
    }
  });

  test("every photograph is centred in its column", async ({
    page,
    viewport,
  }) => {
    /*
      The client, on a service page: "move it a little bit to the right,
      and you can centralise all photos on the website." The delivery
      photograph was pinned to the outer edge of its half of the row, so
      capping it at 400px put all 256px of the slack in one place —
      between the photograph and the copy.
    */
    test.skip((viewport?.width ?? 0) < 640, "Full-bleed on a phone.");
    await page.goto("/services/gutter-cleaning");

    const offsets = await page
      .locator('main button[aria-label^="View larger"]')
      .evaluateAll((frames) =>
        frames.map((frame) => {
          const box = frame.getBoundingClientRect();
          const cell = frame.parentElement!.getBoundingClientRect();
          return Math.round(box.left - cell.left - (cell.right - box.right));
        }),
      );

    expect(offsets.length).toBeGreaterThan(0);
    for (const offset of offsets) {
      expect(Math.abs(offset)).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("service order", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Ordering is viewport-independent.",
  );

  test("the services page lists them in the agreed order", async ({ page }) => {
    await page.goto("/services");
    const hrefs = await page
      .locator('main a[href^="/services/"]')
      .evaluateAll((links) => [
        ...new Set(links.map((link) => link.getAttribute("href") ?? "")),
      ]);

    expect(hrefs).toEqual(ORDER.map(({ slug }) => `/services/${slug}`));
  });

  test("each page's numeral matches its position", async ({ page }) => {
    // The numeral and the service must move together. They did not at
    // first: the repo was swapped while Sanity still held the old
    // eyebrows, and because the CMS merges over local the two pages
    // showed each other's numbers.
    for (const { index, slug } of ORDER) {
      await page.goto(`/services/${slug}`);
      await expect(
        page.locator("main p").filter({ hasText: /^\s*Service\s/i }).first(),
      ).toContainText(index);
    }
  });
});
