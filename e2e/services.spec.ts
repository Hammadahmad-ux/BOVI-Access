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

      /*
        EXACT equality held until a service could have three or four
        photographs sharing one row (see `restGalleryColumns` in
        ServiceBody.tsx). The lead "access and delivery" photo sits in
        its own half-width column and reliably hits the full 320px cap;
        three or four photographs dividing the page's own width each
        land a bit under it — as low as 276px for four, measured at
        1280 — because their shared track is narrower than the cap to
        begin with. That is the same kind of deliberate compromise the
        project detail gallery already makes for its own four-image row:
        still "compact", just not pixel-identical to a differently-shaped
        section elsewhere on the page.

        A RATIO rather than a fixed pixel gap, because the achievable
        size at a given column count scales with the viewport — a fixed
        pixel budget that comfortably covers 1440 is too tight at 1024,
        and one loose enough for 1024 would hide a real regression at
        1440. 80% of the largest frame is comfortably above every
        legitimate case above (276/320 = 86%) while still catching a
        real one (a photograph rendering full-width, or collapsed to a
        sliver, moves this well below 80%).
      */
      const widths = sizes.map((s) => Number(s.split("x")[0]));
      const heights = sizes.map((s) => Number(s.split("x")[1]));
      expect(
        Math.min(...widths) / Math.max(...widths),
        `frames: ${sizes.join(", ")}`,
      ).toBeGreaterThanOrEqual(0.8);
      expect(
        Math.min(...heights) / Math.max(...heights),
        `frames: ${sizes.join(", ")}`,
      ).toBeGreaterThanOrEqual(0.8);

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
    // phone. The cap was 400; the client's latest note pulled it down
    // towards the Related Services card scale, so it is ~320 now. A phone
    // is narrower than that anyway.
    await page.goto("/services/gutter-cleaning");
    const [first] = await frames(page);
    const width = Number(first.split("x")[0]);

    if ((viewport?.width ?? 0) >= 1024) {
      expect(width).toBeLessThanOrEqual(360);
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
    // This reads the `?w=` that an OPTIMIZED next/image URL carries; the
    // E2E build turns optimization off (playwright.config.ts), so both
    // views load the same source file and there is no width to compare.
    // Vercel's edge optimizer serves the right variant in production.
    test.skip(
      process.env.E2E_NO_IMAGE_OPT === "1",
      "next/image optimization is disabled in the E2E build",
    );
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

/**
 * Gallery photograph count vs. the CMS.
 *
 * THE INCIDENT: Renan published five gallery photographs on Drainage &
 * External Pipe Repairs — Studio showed all five — and the live page
 * rendered three. Mastic & Sealant's four also rendered three. The
 * template required an exact gallery[1]+gallery[2] pair for "the rest of
 * the gallery" and silently dropped gallery[3] onward, with no error
 * anywhere. Fixed by sizing that grid to however many photographs there
 * actually are (see `restGalleryColumns` in ServiceBody.tsx).
 *
 * These run against the REAL production dataset (this suite's webServer
 * points at it, same as every other service/project test), so they are a
 * live regression guard for the two services this actually happened to —
 * not just a fixture proving the code path exists.
 */
test.describe("service gallery count", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Photograph count does not vary by viewport.",
  );

  test("drainage renders all five published photographs, not three", async ({
    page,
  }) => {
    await page.goto("/services/drainage-external-pipe-repairs");
    const thumbs = page.locator('main button[aria-label^="View larger"]');
    await expect(thumbs).toHaveCount(5);

    // The lightbox's own array must match — opening the highest-numbered
    // "rest" thumbnail should show "5 / 5", not stop short at whatever
    // the old three-slot template capped it to. Targeted by its own
    // label rather than DOM `.last()`: the lead "access and delivery"
    // photograph renders in a LATER section than the "rest" grid, so it
    // is last in the DOM despite being FIRST in reading/lightbox order.
    await page
      .locator('main button[aria-label$=", photograph 4"]')
      .click();
    await expect(page.locator("dialog [aria-live]")).toHaveText("5 / 5");
  });

  test("mastic and sealant renders all four published photographs, not three", async ({
    page,
  }) => {
    await page.goto("/services/mastic-sealant");
    const thumbs = page.locator('main button[aria-label^="View larger"]');
    await expect(thumbs).toHaveCount(4);

    await page
      .locator('main button[aria-label$=", photograph 3"]')
      .click();
    await expect(page.locator("dialog [aria-live]")).toHaveText("4 / 4");
  });

  test("every service's photograph numbering is complete, with no gap and no duplicate", async ({
    page,
  }) => {
    /*
      Generalised so this class of bug cannot regress service-by-service
      again. The old template's gap looked exactly like this: "photograph
      1, photograph 2" rendered while "photograph 3" and "photograph 4"
      silently didn't exist. Reading the labels straight off the rendered
      page — not hardcoding a count per service — this holds for however
      many photographs Renan adds or removes from here on.
    */
    for (const slug of SERVICES) {
      await page.goto(`/services/${slug}`);

      const numerals = await page
        .locator('main button[aria-label^="View larger"]')
        .evaluateAll((buttons) =>
          buttons
            .map((b) => b.getAttribute("aria-label") ?? "")
            .map((label) => label.match(/, photograph (\d+)$/)?.[1])
            .filter((n): n is string => Boolean(n))
            .map(Number),
        );

      const expected = Array.from(
        { length: numerals.length },
        (_, i) => i + 1,
      );
      expect(numerals.sort((a, b) => a - b), slug).toEqual(expected);

      // At most one lead photograph, and it is optional (a brand-new
      // service can have neither a gallery nor a hero image yet).
      const deliveryCount = await page
        .locator(
          'main button[aria-label$=", access and delivery"]',
        )
        .count();
      expect(deliveryCount, slug).toBeLessThanOrEqual(1);
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

  test("no primary service row carries a visible 01/02 numeral", async ({
    page,
  }) => {
    /*
      A numeral used to render here (ServicePage.index, via a `.eyebrow`
      span above each title) and an earlier test asserted it matched the
      service's real position — guarding against the numeral and the
      service drifting apart the way they did once, when the repo was
      swapped while Sanity still held the old visible "Service NN"
      eyebrows.

      The client has now asked for the numeral removed from this overview
      row too, the same request already applied to every service DETAIL
      page. `service.index` itself is untouched — it still drives the
      sticky homepage index and this row's own reading order — only the
      visible digit above each title is gone, so what is left to guard is
      that it stays gone.
    */
    await page.goto("/services");

    for (const { slug } of ORDER.slice(0, 6)) {
      // ".eyebrow" alone is not distinctive enough to assert absence of —
      // the row's own "View service" link reuses that same typography
      // utility class. The numeral was specifically a standalone two-digit
      // span; matching on its exact text is what actually distinguishes it
      // from that unrelated element.
      const row = page.locator(`main a[href="/services/${slug}"]`).first();
      const bareNumeral = row.locator("text=/^\\d{2}$/");
      await expect(bareNumeral).toHaveCount(0);
    }
  });
});
