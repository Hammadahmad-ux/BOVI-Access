import { test, expect } from "@playwright/test";

/**
 * Claim safety — CONTENT-RULES.md §7a.
 *
 * The client asked us to stop making absolute access and logistics
 * claims: "avoid absolute statements such as 'no road to close' [...]
 * because requirements depend on each individual site and access
 * conditions."
 *
 * A rule in a document is guidance. This is the enforcement, and it
 * matters more than usual here because the copy is EDITABLE: these
 * sentences live in Sanity as well as in the repo, and the provider
 * merges CMS values over the local ones. Someone — Renan, or a future
 * migration re-seeding old text — can reintroduce a promise the business
 * cannot keep without touching a line of code. This catches that.
 *
 * It reads the RENDERED page, so it covers both content sources.
 */

/**
 * Phrases that promise an outcome belonging to the site rather than to
 * BOVI. Matched case-insensitively against visible text.
 *
 * NOT banned: a softened "…can often be reached without scaffolding the
 * whole elevation". That states a tendency. The bare forms below state a
 * guarantee, which is the difference the client actually asked for.
 */
const BANNED = [
  "no road to close",
  "no road closure",
  "without a road closure",
  "without closing a road",
  "zero disruption",
  "no disruption",
  "without a scaffold licence",
  "no scaffold licence",
  "no scaffold to erect",
  "no platform to position",
  "no scaffolding required",
  "without scaffold or powered access",
  "without full scaffold",
  "guaranteed saving",
  "always cheaper",
  "always faster",
];

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/services/commercial-window-cleaning",
  "/services/brickwork-repointing",
  "/services/gutter-cleaning",
  "/services/drainage-external-pipe-repairs",
  "/services/mastic-sealant",
  "/services/pressure-washing-doff-cleaning",
  "/services/roof-roofline-repairs",
  "/services/lightning-protection",
  "/portfolio",
  "/projects/external-pipe-repair",
  "/projects/gutter-downpipe-clearance",
  "/projects/brickwork-repointing-works",
  "/projects/lightning-protection-works",
  "/projects/mastic-sealant-renewal",
  "/projects/commercial-glazing-clean",
  "/service-areas",
  "/contact",
];

test.describe("claim safety", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Copy is viewport-independent.",
  );

  test("no page promises an outcome that depends on the site", async ({
    page,
  }) => {
    const found: string[] = [];

    for (const route of ROUTES) {
      await page.goto(route);
      const text = (await page.locator("body").innerText())
        .toLowerCase()
        .replace(/\s+/g, " ");

      for (const phrase of BANNED) {
        if (text.includes(phrase)) found.push(`${route} — "${phrase}"`);
      }
    }

    expect(found).toEqual([]);
  });

  test("any surviving 'without scaffold' wording is qualified", async ({
    page,
  }) => {
    // Two sentences keep the phrase and soften it with "often". Guard the
    // softener rather than the phrase, so the wording can be reworded but
    // not un-qualified.
    const unqualified: string[] = [];

    for (const route of ROUTES) {
      await page.goto(route);
      const text = (await page.locator("body").innerText())
        .toLowerCase()
        .replace(/\s+/g, " ");

      for (const match of text.matchAll(/.{0,70}without scaffold\w*/g)) {
        const clause = match[0];
        const qualified =
          /\b(often|usually|can|may|where|depending|reduc|less reliance)\b/.test(
            clause,
          );
        if (!qualified) unqualified.push(`${route} — …${clause}`);
      }
    }

    expect(unqualified).toEqual([]);
  });

  test("the services heading is the client's approved wording", async ({
    page,
  }) => {
    await page.goto("/services");
    const heading = await page.locator("h1").innerText();
    expect(heading.replace(/\s+/g, " ").trim()).toBe(
      "External building works. Access without limits.",
    );
  });
});
