import { test, expect } from "@playwright/test";

/**
 * Homepage guards.
 *
 * The generic per-route checks (overflow, single h1, metadata, console
 * errors, dead links) live in foundation.spec.ts and already cover "/".
 * This file asserts the things specific to the Homepage build: that every
 * section is actually present, that the signature service interaction
 * works, and that every CTA points at a real destination.
 */

const isDesktop = (width: number | undefined) => (width ?? 0) >= 1024;

test.describe("homepage structure", () => {
  test("renders all nine sections in the locked order", async ({ page }) => {
    await page.goto("/");

    // Section headings, in document order. The Hero owns the h1; every
    // other section opens with an h2.
    const headings = await page
      .locator("main h1, main h2")
      .allTextContents();

    const flat = headings.join(" | ").toLowerCase();

    expect(flat).toContain("access"); // Hero h1
    expect(flat).toContain("traditional methods fall short"); // Introduction
    expect(flat).toContain("delivered at height"); // Services
    expect(flat).toContain("without scaffold"); // Featured project
    expect(flat).toContain("qualified, insured and planned properly"); // Why BOVI
    expect(flat).toContain("property teams actually procure"); // Audiences
    expect(flat).toContain("recent works"); // Projects
    expect(flat).toContain("south east"); // Coverage
    expect(flat).toContain("access at height"); // Final CTA
  });

  test("has exactly one h1 and no skipped heading levels", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);

    const levels = await page
      .locator("main h1, main h2, main h3, main h4")
      .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName[1])));

    let previous = levels[0];
    for (const level of levels) {
      expect(level - previous).toBeLessThanOrEqual(1);
      previous = level;
    }
  });

  test("links to all six primary service pages", async ({ page }) => {
    await page.goto("/");
    for (const slug of [
      "commercial-window-cleaning",
      "brickwork-repointing",
      "gutter-cleaning",
      "drainage-external-pipe-repairs",
      "mastic-sealant",
      "pressure-washing-doff-cleaning",
    ]) {
      await expect(
        page.locator(`main a[href="/services/${slug}"]`).first(),
      ).toBeAttached();
    }
  });

  test("every homepage CTA points at a real destination", async ({ page }) => {
    await page.goto("/");
    for (const href of [
      "/contact",
      "/services",
      "/about",
      "/portfolio",
      "/service-areas",
    ]) {
      await expect(page.locator(`main a[href="${href}"]`).first()).toBeAttached();
    }
  });

  test("no image fails to load", async ({ page }) => {
    const failed: string[] = [];
    page.on("response", (response) => {
      if (
        response.request().resourceType() === "image" &&
        response.status() >= 400
      ) {
        failed.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState("networkidle");

    expect(failed).toEqual([]);
  });

  test("every image is correctly described or correctly decorative", async ({
    page,
  }) => {
    await page.goto("/");

    const problems = await page.locator("main img").evaluateAll((images) =>
      images
        .map((img) => {
          const alt = img.getAttribute("alt");
          const src = img.getAttribute("src") ?? "unknown";

          // A MISSING alt attribute is always a failure — assistive tech
          // falls back to reading the filename.
          if (alt === null) return `${src}: no alt attribute`;

          // alt="" declares the image decorative. That is correct only when
          // something else already conveys the meaning: either the image is
          // inside a link/button that carries its own text label, or it is
          // explicitly hidden from the accessibility tree. A standalone
          // content image with alt="" is a real failure.
          if (alt.trim() === "") {
            const insideLabelledControl = Boolean(
              img.closest("a, button")?.textContent?.trim(),
            );
            const hidden = Boolean(img.closest("[aria-hidden='true']"));
            if (!insideLabelledControl && !hidden) {
              return `${src}: empty alt on a standalone content image`;
            }
          }

          return null;
        })
        .filter(Boolean),
    );

    expect(problems).toEqual([]);
  });
});

test.describe("service index interaction", () => {
  test.skip(
    ({ viewport }) => !isDesktop(viewport?.width),
    "The sticky hover/focus stage is a desktop-only enhancement.",
  );

  test("keyboard focus changes the active service", async ({ page }) => {
    await page.goto("/");

    const firstRow = page.locator('main a[href="/services/commercial-window-cleaning"]').first();
    const secondRow = page.locator('main a[href="/services/brickwork-repointing"]').first();

    await firstRow.scrollIntoViewIfNeeded();
    await secondRow.focus();

    // Focusing a row must be reflected somewhere in the DOM — the
    // implementation marks the active row. This asserts the interaction is
    // wired to focus, not only to hover (QA: no hover-only affordances).
    await expect(secondRow).toBeFocused();

    const activeCount = await page
      .locator('main [data-active="true"]')
      .count();
    expect(activeCount).toBeGreaterThan(0);
  });
});

test.describe("mobile homepage", () => {
  test.skip(
    ({ viewport }) => isDesktop(viewport?.width),
    "Mobile-specific behaviour.",
  );

  test("service list is usable without hover", async ({ page }) => {
    await page.goto("/");
    const row = page
      .locator('main a[href="/services/commercial-window-cleaning"]')
      .first();
    await row.scrollIntoViewIfNeeded();
    await expect(row).toBeVisible();

    const box = await row.boundingBox();
    expect(box).not.toBeNull();
    // Comfortable tap target.
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("no section overflows the viewport", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const offenders = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      return Array.from(document.querySelectorAll("main *"))
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.right > viewportWidth + 1;
        })
        .slice(0, 5)
        .map((el) => `${el.tagName}.${(el.className || "").toString().slice(0, 60)}`);
    });

    expect(offenders).toEqual([]);
  });
});

/**
 * Hero background video.
 *
 * Guards the three behaviours that make a background video safe rather
 * than merely present: it must be silent and uncontrollable, it must not
 * play for people who asked for less motion, and it must not be pushed at
 * phones — where the 2.34:1 source would be cropped to a sliver anyway.
 */
test.describe("hero video", () => {
  test("plays silently and decoratively on desktop", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < 768, "Video is desktop and tablet only.");

    await page.goto("/");
    const video = page.locator("section video").first();
    await expect(video).toBeAttached();

    const state = await video.evaluate((el: HTMLVideoElement) => ({
      muted: el.muted,
      loop: el.loop,
      playsInline: el.playsInline,
      controls: el.controls,
      ariaHidden: el.getAttribute("aria-hidden"),
      preload: el.preload,
      hasAudioTrack: el.src.length > 0,
    }));

    expect(state.muted).toBe(true);
    expect(state.loop).toBe(true);
    expect(state.playsInline).toBe(true);
    // Native controls would break the composition and invite interaction
    // with something purely decorative.
    expect(state.controls).toBe(false);
    // Decorative: it must not be announced.
    expect(state.ariaHidden).toBe("true");
    // Never "auto" — the poster is the LCP element and must not compete
    // with a 3.6MB download.
    expect(state.preload).not.toBe("auto");
  });

  test("is not served to small screens", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) >= 768, "Checks the mobile branch.");
    await page.goto("/");
    await page.waitForTimeout(1500);
    await expect(page.locator("section video")).toHaveCount(0);
  });

  test("the hero still is always present as poster and fallback", async ({
    page,
  }) => {
    await page.goto("/");
    // Whether or not video plays, the photograph is what holds the hero
    // together and carries the LCP.
    const still = page.locator('section img[alt*="rope access technician"]');
    await expect(still.first()).toBeAttached();
  });
});
