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
  // Project detail pages exist now. Two of them: the one with the most
  // photographs, and the one with the fewest — a single-image gallery is
  // where an "and N more" layout would break first.
  "/projects/external-pipe-repair",
  "/projects/mastic-sealant-renewal",
  "/service-areas",
  "/contact",
  "/privacy",
];

for (const route of ROUTES) {
  test.describe(`${route}`, () => {
    test("carries no 01/02 section numbering", async ({ page }) => {
      /*
        The client asked for the running section numerals to come off —
        first the "Service 02"-style eyebrow prefix, and later — a second,
        broader request — every remaining bare "01" / "02" positional
        marker sitewide (the Why BOVI schedule, the homepage service
        index, the mobile nav, the audience/assessment/suitable-for
        lists, and more). Swept per route rather than asserted once,
        because each numeral was a prop on a shared component and could
        return on a single section without anyone noticing.

        Two shapes, both caught: "01 — Something" (an opening prefix
        inside a longer label) and a bare "01" as an element's ENTIRE
        text content (the standalone eyebrow spans this second request
        removed). A real sentence never has a two-digit-only text node,
        so the bare-numeral half of this carries no false-positive risk.
      */
      await page.goto(route);

      const numbered = await page
        .locator("main p, main span")
        .evaluateAll((nodes) =>
          nodes
            .map((n) => (n.textContent ?? "").trim())
            .filter((text) => /^\d{2}(\s*[—–-]|$)/.test(text)),
        );

      expect(numbered, `numbered labels on ${route}`).toEqual([]);
    });

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
        // `<Analytics />` (root layout) requests `/_vercel/insights/…` on
        // every route. Real Vercel infrastructure serves it; this test
        // server is not that, so it 404s here and only here — Chromium
        // logs a resource-load console error for it regardless, even
        // though `@vercel/analytics` itself handles the failure silently
        // and it is a genuine 200 once deployed. Identified by the
        // failing request's own URL, not the message text, so an
        // unrelated broken resource still fails this guard.
        if (msg.type() === "error" && !msg.location().url.includes("/_vercel/insights/")) {
          errors.push(msg.text());
        }
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(route);
      /*
        `load`, not `networkidle`. The hero video streams continuously
        while it loops, so the network never goes idle on "/" — Playwright
        simply waited out its own timeout. It was passing at 26.7s against
        a 30s limit before the client's new footage doubled the file size,
        which is a flake waiting to happen rather than a real signal.

        A short settle after load is what this test actually needs: enough
        for hydration to run and throw, if it is going to.
      */
      await page.waitForLoadState("load");
      await page.waitForTimeout(800);
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

    for (const label of ["Home", "About", "Projects", "Service Areas", "Contact"]) {
      await expect(
        dialog.getByRole("link", { name: label, exact: true }),
      ).toBeVisible();
    }
    // Services is the only nested section.
    await expect(
      dialog.getByRole("button", { name: "Services", exact: true }),
    ).toBeVisible();

    // Escape must close it.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("opens with a slow reveal rather than snapping in", async ({
    page,
  }) => {
    // The client asked for the tap-to-open transition to feel deliberate.
    // `toBeVisible()` alone would not catch a regression to an instant
    // snap-in — Playwright counts a fully transparent element as visible,
    // since opacity 0 is not display:none or visibility:hidden — so this
    // reads the computed opacity directly, mid-transition and then
    // settled, against `DURATION.slow` (0.9s) in MobileMenu.tsx.
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation/i }).click();

    const dialog = page.getByRole("dialog", { name: /site navigation/i });
    const opacity = () =>
      dialog.evaluate((el) => Number(getComputedStyle(el).opacity));

    await page.waitForTimeout(150);
    const early = await opacity();
    expect(early, "still mid-transition ~150ms in").toBeGreaterThan(0);
    expect(early, "still mid-transition ~150ms in").toBeLessThan(1);

    await expect.poll(opacity, { timeout: 2000 }).toBe(1);
  });

  test("skips the reveal entirely under reduced motion", async ({ page }) => {
    // Same approach as the reduced-motion guard in navigation.spec.ts:
    // `emulateMedia`, not `test.use({ reducedMotion })`.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation/i }).click();

    const dialog = page.getByRole("dialog", { name: /site navigation/i });
    // No polling: with reduced motion this must already be settled by
    // the next frame, not eased in over 0.9s.
    await page.waitForTimeout(80);
    expect(
      await dialog.evaluate((el) => getComputedStyle(el).opacity),
    ).toBe("1");
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

    // The panel's own opening reveal slides up from `y: -16`, so its
    // bounding box is transiently off the `y: 0` this test checks for
    // until that settles — wait for it before measuring the STEADY
    // STATE position this guard actually cares about, same idea as
    // waiting for any other entrance transition to finish.
    await expect
      .poll(() => dialog.evaluate((el) => getComputedStyle(el).opacity))
      .toBe("1");

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

/**
 * Vercel Web Analytics.
 *
 * `<Analytics />` is mounted exactly once, in the root layout, so every
 * route gets it for free. The guard is that it never gets duplicated —
 * a second copy pasted onto an individual page would double-count every
 * pageview — and that it never throws.
 *
 * Runs on one viewport only: the component has no responsive behaviour.
 */
test.describe("Vercel Web Analytics", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "The analytics beacon does not vary by viewport.",
  );

  test("mounts exactly once, on every route, with no console errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      // The beacon script itself 404s outside real Vercel infrastructure
      // — there is no platform behind this Playwright server to serve
      // it from — which Chromium logs as a resource-load console error
      // even though `@vercel/analytics` handles the failure silently.
      // Identified by the failing resource's own URL, not by the
      // message text, so an unrelated broken image or font still fails
      // this guard.
      if (message.type() === "error" && !message.location().url.includes("/_vercel/insights/")) {
        errors.push(message.text());
      }
    });

    for (const route of [
      "/",
      "/services",
      "/services/gutter-cleaning",
      "/portfolio",
      "/projects/external-pipe-repair",
    ]) {
      await page.goto(route);
      // `next/script` injects this tag client-side; the production
      // build (which this suite runs against — see webServer in
      // playwright.config.ts) is what actually renders it, unlike
      // `next dev`'s debug-only mode.
      const beacons = page.locator('script[src*="/_vercel/insights/script"]');
      await expect(beacons).toHaveCount(1);
    }

    expect(errors).toEqual([]);
  });
});
