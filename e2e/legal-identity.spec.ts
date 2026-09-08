import { test, expect } from "@playwright/test";

/**
 * Client-confirmed business identity — confirmed by Renan in writing on
 * 2026-09-08 (CONTENT-RULES.md §4, §9).
 *
 * Trust claims render once, on the homepage hero rail. Legal identity —
 * legal entity, company number, registered office — renders in the footer
 * (concise) and on /privacy (complete). Copy is viewport-independent, so
 * this runs once at the widest viewport.
 */

const CONFIRMED_TRUST_CLAIMS = [
  "IRATA Level 3",
  "Fully Insured",
  "18+ Years’ Experience Working at Height",
  "Commercial & Residential",
];

const COMPANY_NUMBER = "16680959";
const LEGAL_NAME = "BOVI Access Ltd";
const REGISTERED_OFFICE =
  "167–169 Great Portland Street, 5th Floor, London, W1W 5PF";

test.describe("confirmed business identity", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Copy is viewport-independent.",
  );

  test("the homepage hero rail shows the four confirmed statements", async ({
    page,
  }) => {
    await page.goto("/");
    // The trust rail is the only list directly under the hero heading.
    const heroText = (
      await page.locator("main").first().innerText()
    ).replace(/\s+/g, " ");

    for (const claim of CONFIRMED_TRUST_CLAIMS) {
      // The rail is CSS-uppercased; assert case-insensitively.
      expect(heroText.toLowerCase()).toContain(claim.toLowerCase());
    }
  });

  test("the footer carries the statutory company disclosure", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = (await page.locator("footer").innerText()).replace(
      /\s+/g,
      " ",
    );

    expect(footer).toContain(LEGAL_NAME);
    expect(footer).toContain(COMPANY_NUMBER);
    expect(footer.toLowerCase()).toContain("england");
    // The registered office is deliberately NOT in the footer.
    expect(footer).not.toContain("Great Portland Street");
  });

  test("the privacy page names the controller in full", async ({ page }) => {
    await page.goto("/privacy");
    const body = (await page.locator("main").first().innerText()).replace(
      /\s+/g,
      " ",
    );

    expect(body).toContain(LEGAL_NAME);
    expect(body).toContain(COMPANY_NUMBER);
    expect(body).toContain(REGISTERED_OFFICE);
    expect(body.toLowerCase()).toContain("data controller");
    expect(body).toContain("info@boviaccess.co.uk");
  });

  test("organization structured data carries the legal identity", async ({
    page,
  }) => {
    await page.goto("/");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    const org = blocks
      .map((raw) => JSON.parse(raw) as Record<string, unknown>)
      .find((data) => data["@type"] === "Organization");

    expect(org).toBeTruthy();
    expect(org!.legalName).toBe(LEGAL_NAME);
    expect(JSON.stringify(org!.identifier)).toContain(COMPANY_NUMBER);
    // No invented identifiers.
    for (const forbidden of ["vatID", "taxID", "duns", "leiCode"]) {
      expect(org).not.toHaveProperty(forbidden);
    }
  });
});
