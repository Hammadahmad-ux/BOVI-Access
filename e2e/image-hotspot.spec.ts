import { test, expect } from "@playwright/test";
import { focalPointStyle } from "../src/lib/sanity/focal-point";

/**
 * Regression guard for "the Studio hotspot does not move the crop on the
 * live site".
 *
 * The Sanity image URL builder bakes the manual CROP rectangle into the
 * `src`, but the HOTSPOT (which part of the photo to keep in frame) has to
 * be applied at render time as a CSS `object-position`, because one cached
 * image is shown in several aspect frames across the site. `focalPointStyle`
 * is the single place that conversion happens; every `object-fit: cover`
 * CMS image passes through it.
 *
 * The bug was that only the lightbox thumbnail did — the project and
 * service heroes, the homepage images and the related-services cards all
 * rendered a hard-coded `object-position: center`, so moving the hotspot
 * in Studio changed nothing a visitor could see.
 */
test.describe("Sanity hotspot → CSS object-position", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Pure mapping plus one render check — viewport-independent.",
  );

  test("focalPointStyle maps a hotspot to object-position, and centres without one", () => {
    // No hotspot (local assets, un-moved images) → undefined, so callers
    // can spread it and fall back to the CSS default.
    expect(focalPointStyle(undefined)).toBeUndefined();
    expect(focalPointStyle({})).toBeUndefined();
    expect(focalPointStyle({ focalPoint: undefined })).toBeUndefined();

    // A hotspot becomes a percentage object-position on both axes.
    expect(focalPointStyle({ focalPoint: { x: 0.5, y: 0.5 } })).toEqual({
      objectPosition: "50.00% 50.00%",
    });
    expect(
      focalPointStyle({ focalPoint: { x: 0.6022143952154099, y: 0.29380500130696174 } }),
    ).toEqual({ objectPosition: "60.22% 29.38%" });

    // A different hotspot produces a different crop — this is what proves
    // the CMS genuinely drives the frontend.
    expect(focalPointStyle({ focalPoint: { x: 0.18, y: 0.82 } })).toEqual({
      objectPosition: "18.00% 82.00%",
    });

    // A malformed hotspot is clamped into the frame rather than pushing
    // the subject off it.
    expect(focalPointStyle({ focalPoint: { x: 1.4, y: -0.2 } })).toEqual({
      objectPosition: "100.00% 0.00%",
    });
  });

  test("a CMS hero renders the hotspot, not a centred crop", async ({ page }) => {
    await page.goto("/projects/external-pipe-repair");

    const hero = page.locator("section img").first();
    await expect(hero).toBeVisible();

    const src = (await hero.getAttribute("src")) ?? "";
    test.skip(
      !src.includes("cdn.sanity.io"),
      "Running on local content — no CMS hotspot to honour.",
    );

    // The External Pipe Repair hero has a hotspot high and right, over the
    // abseiler. Whatever its exact value, it must NOT be the centre, or the
    // technician is cropped out — which is the bug this guards.
    const objectPosition = await hero.evaluate(
      (el) => getComputedStyle(el).objectPosition,
    );
    expect(objectPosition).not.toBe("50% 50%");
    expect(objectPosition).toMatch(/%/);
  });
});
