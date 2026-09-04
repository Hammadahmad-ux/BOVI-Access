import { test, expect } from "@playwright/test";

/**
 * Enquiry form guards.
 *
 * These test the FORM and the ENDPOINT CONTRACT — validation, honeypot,
 * file rules, and that the UI never claims a delivery that did not
 * happen. They do NOT prove that email is delivered: that requires real
 * Resend credentials and is a separate manual step recorded in
 * DEPLOYMENT.md §5. Passing these does not mean enquiries are arriving.
 */

test.describe("quote form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("every control has a real label", async ({ page }) => {
    for (const label of [
      "Name",
      "Email",
      "Phone",
      "Project location",
      "Service required",
      "Project details",
    ]) {
      await expect(
        page.getByLabel(new RegExp(`^${label}`, "i")).first(),
      ).toBeVisible();
    }
  });

  test("blocks submission and reports errors when empty", async ({ page }) => {
    let posted = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/quote")) posted = true;
    });

    await page.getByRole("button", { name: /send enquiry/i }).click();

    // Client validation must stop it reaching the server at all.
    await expect(
      page.getByText(/please check the highlighted fields/i),
    ).toBeVisible();
    expect(posted).toBe(false);

    // And the invalid fields must be marked for assistive tech.
    const name = page.getByLabel(/^name/i).first();
    await expect(name).toHaveAttribute("aria-invalid", "true");
  });

  test("rejects an invalid email", async ({ page }) => {
    const email = page.getByLabel(/^email/i).first();
    await email.fill("not-an-email");
    await email.blur();
    await expect(page.getByText(/valid email address/i)).toBeVisible();
  });

  test("has a keyboard-operable file input with stated limits", async ({
    page,
  }) => {
    const input = page.locator('input[type="file"]');
    await expect(input).toBeAttached();
    await expect(input).toHaveAttribute("multiple", "");

    const accept = await input.getAttribute("accept");
    expect(accept).toContain("image/jpeg");
    expect(accept).toContain("application/pdf");
    // Executables must never be offered.
    expect(accept).not.toContain("application/x-");

    await expect(page.getByText(/up to 5 files, 8MB each/i)).toBeVisible();
  });

  test("phone and email remain live links", async ({ page }) => {
    await expect(
      page.locator('a[href="tel:+447990377780"]').first(),
    ).toBeAttached();
    await expect(
      page.locator('a[href="mailto:info@boviaccess.co.uk"]').first(),
    ).toBeAttached();
  });
});

test.describe("quote endpoint", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Endpoint behaviour does not vary by viewport.",
  );

  test("rejects a payload that fails server validation", async ({ request }) => {
    const form = new URLSearchParams({
      name: "A",
      email: "nope",
      phone: "1",
      projectLocation: "",
      serviceRequired: "Not a real service",
      projectDetails: "short",
      preferredContact: "Email",
    });

    const response = await request.post("/api/quote", {
      form: Object.fromEntries(form),
    });

    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(Array.isArray(body.errors)).toBe(true);
  });

  test("silently absorbs a honeypot submission without sending", async ({
    request,
  }) => {
    const response = await request.post("/api/quote", {
      form: {
        name: "Bot",
        email: "bot@example.com",
        phone: "07000000000",
        projectLocation: "Somewhere",
        serviceRequired: "Gutter Cleaning",
        projectDetails: "x".repeat(40),
        preferredContact: "Email",
        website: "http://spam.example",
      },
    });

    // 200 so the bot does not retry, but nothing is delivered.
    expect(response.status()).toBe(200);
  });

  test("refuses honestly when email is not configured", async ({ request }) => {
    const response = await request.post("/api/quote", {
      form: {
        name: "Test Person",
        email: "test@example.com",
        phone: "07990 377780",
        projectLocation: "12 Example Street, London",
        serviceRequired: "Gutter Cleaning",
        projectDetails:
          "Testing the endpoint contract with a message long enough to pass validation.",
        preferredContact: "Email",
      },
    });

    const body = await response.json();

    if (response.status() === 503) {
      // Expected while RESEND_API_KEY is unset: an explicit refusal that
      // points at the phone number, NOT a fake success.
      expect(body.ok).toBe(false);
      expect(body.message).toMatch(/07990 377780|info@boviaccess\.co\.uk/);
    } else {
      // Credentials are configured — the only acceptable success is a
      // real one, and it must not be a 2xx with ok:false.
      expect(response.ok()).toBe(true);
      expect(body.ok).toBe(true);
    }
  });
});

test.describe("indexing and discovery", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Not viewport-dependent.",
  );

  test("robots excludes the studio and points at the sitemap", async ({
    request,
  }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("/studio");
    expect(body.toLowerCase()).toContain("sitemap:");
  });

  test("sitemap lists public pages and excludes internal ones", async ({
    request,
  }) => {
    const body = await (await request.get("/sitemap.xml")).text();

    for (const path of [
      "/about",
      "/services",
      "/services/commercial-window-cleaning",
      "/portfolio",
      "/contact",
    ]) {
      expect(body).toContain(path);
    }

    expect(body).not.toContain("/studio");
  });

  test("the studio is noindex", async ({ page }) => {
    await page.goto("/studio");
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(robots).toContain("noindex");
  });

  test("pages carry a canonical and Open Graph tags", async ({ page }) => {
    for (const route of ["/", "/services/gutter-cleaning", "/portfolio"]) {
      await page.goto(route);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(
        page.locator('meta[property="og:title"]'),
      ).toHaveCount(1);
    }
  });

  test("emits Organization structured data without fabricated fields", async ({
    page,
  }) => {
    await page.goto("/");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    const org = blocks
      .map((b) => JSON.parse(b))
      .find((d) => d["@type"] === "Organization");

    expect(org).toBeTruthy();
    expect(org.name).toBe("BOVI Access");
    // No address, rating, review or award has been verified — none may
    // appear. CONTENT-RULES.md §1.
    expect(org.address).toBeUndefined();
    expect(org.aggregateRating).toBeUndefined();
    expect(org.review).toBeUndefined();
    expect(org.award).toBeUndefined();
  });
});
