import { test, expect, type Page } from "@playwright/test";

/**
 * Production SEO plumbing.
 *
 * These guard the machine-readable layer a search engine reads: the
 * canonical / Open Graph / Twitter tags, robots.txt, the sitemap, and the
 * legacy Wix redirects. Copy can change freely; these break when the
 * canonical domain drifts, a preview URL leaks, a page loses its
 * canonical, or a legacy redirect regresses.
 *
 * The E2E build runs with no NEXT_PUBLIC_SITE_URL, so `siteUrl` resolves
 * to the production default. Every absolute URL below is asserted against
 * that.
 */

const SITE = "https://www.boviaccess.co.uk";

const INDEXABLE_ROUTES = [
  "/",
  "/about",
  "/services",
  "/portfolio",
  "/service-areas",
  "/contact",
  "/privacy",
  "/services/commercial-window-cleaning",
  "/services/drainage-external-pipe-repairs",
  "/services/gutter-cleaning",
  "/services/brickwork-repointing",
  "/services/mastic-sealant",
  "/services/pressure-washing-doff-cleaning",
  "/services/roof-roofline-repairs",
  "/services/lightning-protection",
  "/projects/external-pipe-repair",
  "/projects/gutter-downpipe-clearance",
  "/projects/brickwork-repointing-works",
  "/projects/lightning-protection-works",
  "/projects/mastic-sealant-renewal",
  "/projects/commercial-glazing-clean",
];

const attr = (page: Page, selector: string, name: string) =>
  page.locator(selector).first().getAttribute(name);

test.describe("canonical, Open Graph and Twitter", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Head metadata is viewport-independent.",
  );

  for (const route of INDEXABLE_ROUTES) {
    test(`${route} has a correct canonical, og:url and social image`, async ({
      page,
    }) => {
      await page.goto(route);

      const expected = route === "/" ? SITE : `${SITE}${route}`;

      const canonical = await attr(page, 'link[rel="canonical"]', "href");
      // "/" canonicalises to the bare origin; every other path is slash-less.
      expect([expected, `${expected}/`]).toContain(canonical);

      const ogUrl = await attr(page, 'meta[property="og:url"]', "content");
      expect(ogUrl).toBe(canonical);

      for (const sel of [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ]) {
        const img = await attr(page, sel, "content");
        expect(img, `${sel} on ${route}`).toMatch(
          /^https:\/\/(www\.boviaccess\.co\.uk|cdn\.sanity\.io)\//,
        );
      }

      expect(await attr(page, 'meta[name="twitter:card"]', "content")).toBe(
        "summary_large_image",
      );

      // No non-production host may appear in any head URL.
      const head = await page.locator("head").innerHTML();
      expect(head).not.toMatch(/vercel\.app|wixsite|localhost/);

      // Public pages must not carry a noindex.
      const robots = await page
        .locator('meta[name="robots"]')
        .count();
      if (robots > 0) {
        expect(await attr(page, 'meta[name="robots"]', "content")).not.toMatch(
          /noindex/,
        );
      }
    });
  }
});

test.describe("robots.txt", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "robots.txt is viewport-independent.",
  );

  test("allows the site, blocks the CMS, points at the production sitemap", async ({
    request,
  }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toMatch(/User-Agent:\s*\*/i);
    expect(body).toMatch(/Allow:\s*\/$/m);
    expect(body).toMatch(/Disallow:\s*\/studio/);
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    expect(body).not.toMatch(/vercel\.app|wixsite/);
  });

  test("the Studio route is noindex", async ({ page }) => {
    await page.goto("/studio");
    expect(await attr(page, 'meta[name="robots"]', "content")).toMatch(
      /noindex/,
    );
  });
});

test.describe("sitemap.xml", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "The sitemap is viewport-independent.",
  );

  test("lists every public route on the production domain and nothing else", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    expect(locs.length).toBe(INDEXABLE_ROUTES.length);

    for (const loc of locs) {
      expect(loc.startsWith(`${SITE}/`) || loc === `${SITE}/`).toBe(true);
    }
    expect(xml).not.toMatch(/vercel\.app|wixsite|localhost/);
    expect(xml).not.toContain("/studio");

    for (const route of INDEXABLE_ROUTES) {
      const want = route === "/" ? `${SITE}/` : `${SITE}${route}`;
      expect(locs, `sitemap missing ${route}`).toContain(want);
    }
  });
});

test.describe("legacy Wix redirects", () => {
  test.skip(
    ({ viewport }) => viewport?.width !== 1440,
    "Redirects are viewport-independent.",
  );

  const LEGACY: Array<[string, string]> = [
    ["/CommercialWindowCleaning-FacadeCleaning/", "/services/commercial-window-cleaning"],
    ["/CommercialWindowCleaning-FacadeCleaning", "/services/commercial-window-cleaning"],
    ["/PressureWashingandDOFFcleaning/", "/services/pressure-washing-doff-cleaning"],
    ["/roof-rooflineworks", "/services/roof-roofline-repairs"],
    ["/roof-rooflineworks/", "/services/roof-roofline-repairs"],
    ["/projects", "/portfolio"],
  ];

  for (const [from, to] of LEGACY) {
    test(`${from} redirects to ${to} in one hop`, async ({ request }) => {
      // One hop: the immediate response is a 3xx straight to the target.
      const first = await request.get(from, { maxRedirects: 0 });
      expect([301, 308]).toContain(first.status());
      const location = first.headers()["location"];
      expect(location).toBe(to);

      // And the target itself is a real 200, not another redirect.
      const final = await request.get(to, { maxRedirects: 0 });
      expect(final.status()).toBe(200);
    });
  }
});
