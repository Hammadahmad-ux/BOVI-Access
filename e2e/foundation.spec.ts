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
  "/services/brickwork-repointing",
  "/services/gutter-cleaning",
  // The two longest service titles — they are where responsive
  // typography breaks first, so they are always in the sweep.
  "/services/drainage-external-pipe-repairs",
  "/services/pressure-washing-doff-cleaning",
  "/services/mastic-sealant",
  "/services/roof-roofline-repairs",
  "/services/lightning-protection",
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

test.describe("footer build credit", () => {
  test("credits SadaWorks and links out correctly", async ({ page }) => {
    await page.goto("/");

    const credit = page
      .locator("footer")
      .getByRole("link", { name: /designed by sadaworks/i });

    await expect(credit).toBeVisible();
    await expect(credit).toHaveAttribute("href", "https://sadaworks.com");
    // An external target must not hand the opener over to the new document.
    await expect(credit).toHaveAttribute("target", "_blank");
    await expect(credit).toHaveAttribute("rel", /noreferrer/);

    // The mark is decorative — the link text already says who built it, so
    // it must not be announced a second time.
    const mark = credit.locator("img");
    await expect(mark).toHaveAttribute("alt", "");
  });
});

test.describe("mobile navigation", () => {
  // QA #3: the mobile menu must actually work — open, navigate, close,
  // and be operable from the keyboard.
  // The desktop nav appears at xl (1280). Below that the hamburger and the
  // full-screen panel are what a visitor gets — including on a 1024 laptop.
  test.skip(
    ({ viewport }) => (viewport?.width ?? 0) >= 1280,
    "Mobile menu is only rendered below the xl breakpoint.",
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

  test("opens full-screen after the page has been scrolled", async ({
    page,
  }) => {
    await page.goto("/");

    // REGRESSION GUARD.
    //
    // Past the scroll threshold the header gains `backdrop-blur-md`, and a
    // backdrop-filter makes an element a containing block for its `fixed`
    // descendants. While the panel was nested inside the header, scrolling
    // down silently re-anchored it to the 80px bar: the button worked, the
    // dialog opened, and the visitor saw nothing usable. Every existing
    // menu test opened it at scroll zero, where there is no filter — which
    // is exactly why this reached production.
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(24);

    await page.getByRole("button", { name: /open navigation/i }).click();

    const dialog = page.getByRole("dialog", { name: /site navigation/i });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: "About", exact: true }),
    ).toBeVisible();

    // Visible is not enough — assert it actually fills the viewport rather
    // than being clipped to the header bar.
    const viewport = page.viewportSize();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.width)).toBeGreaterThanOrEqual(viewport!.width);
    expect(Math.round(box!.height)).toBeGreaterThanOrEqual(viewport!.height);
    expect(Math.round(box!.y)).toBe(0);
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

/**
 * Bounded internal-link crawl.
 *
 * Walks every internal href reachable from the site's own pages and
 * asserts each resolves. This is the check that catches a link no
 * individual page test thought to look at — a footer entry, a related
 * service, a breadcrumb.
 *
 * Runs on one viewport only: link validity is not width-dependent, and
 * running it seven times would just be slow.
 */
test.describe("internal link crawl", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Link validity does not vary by viewport.",
  );

  test("every internal link resolves without 404, 500 or a redirect loop", async ({
    page,
    request,
  }) => {
    const seenPages = new Set<string>();
    const hrefs = new Set<string>();
    const queue = [...ROUTES];

    while (queue.length > 0) {
      const route = queue.shift() as string;
      if (seenPages.has(route)) continue;
      seenPages.add(route);

      await page.goto(route);
      const found = await page.locator("a[href]").evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );

      for (const href of found) {
        // tel: and mailto: are not HTTP and must not be fetched.
        if (!href.startsWith("/")) continue;
        const clean = href.split("#")[0];
        if (!clean) continue;
        hrefs.add(clean);
        if (!seenPages.has(clean) && !queue.includes(clean)) queue.push(clean);
      }
    }

    const failures: string[] = [];
    for (const href of hrefs) {
      const response = await request.get(href, { maxRedirects: 5 });
      if (response.status() >= 400) {
        failures.push(`${response.status()} ${href}`);
      }
    }

    // Sanity check that the crawl actually walked the site: it must have
    // reached at least every route the sweep already knows about.
    expect(hrefs.size).toBeGreaterThanOrEqual(ROUTES.length);
    expect(failures).toEqual([]);
  });
});
