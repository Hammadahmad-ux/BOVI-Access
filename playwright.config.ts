import { defineConfig, devices } from "@playwright/test";

/**
 * Browser QA harness.
 *
 * Prepared in Phase 1, exercised properly in Phase 5. The viewport list is
 * the mandatory QA ladder from QA-CHECKLIST.md — every one of these widths
 * must be clean before launch.
 */

/**
 * The E2E build disables next/image optimization (next.config.ts) — the
 * site's project/homepage photography now comes from the Sanity CDN, and
 * `next start`'s single-process optimizer wedges under the parallel sweep,
 * taking the whole server down. Set here so the webServer's `next build`
 * inherits it AND specs can branch on it (one service-lightbox check
 * inspects the `?w=` an optimized URL carries; Vercel's edge optimizer
 * covers that in production).
 */
process.env.E2E_NO_IMAGE_OPT ||= "1";

const PORT = 3100;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Fixture lifecycle coverage owns its own already-running server and is
  // invoked by `npm run verify:cms`; the normal suite must not run it
  // against local or live content by accident.
  testIgnore: "**/*.cms.spec.ts",
  fullyParallel: true,
  /**
   * Capped deliberately. The test build disables next/image optimization
   * (`E2E_NO_IMAGE_OPT` — see the webServer block and next.config.ts), so
   * the project and homepage photography loads straight from the Sanity
   * CDN. Seven viewport projects sweeping every route in parallel put
   * enough concurrent load on that CDN that a cold transform occasionally
   * takes several seconds, which delays a page's `load` event — hence the
   * worker cap AND the roomy navigation/test timeouts below. The pages
   * themselves render fine; this is purely image-fetch latency under a
   * load production never sees.
   */
  workers: 2,
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 60_000,
  },

  projects: [
    { name: "desktop-1440", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "desktop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "laptop-1024", use: { ...devices["Desktop Chrome"], viewport: { width: 1024, height: 768 } } },
    { name: "tablet-768", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "mobile-430", use: { ...devices["Desktop Chrome"], viewport: { width: 430, height: 932 }, isMobile: false } },
    { name: "mobile-390", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "mobile-375", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } } },
    /*
      A SAFARI PROXY. Renan edits and browses on Safari/macOS; Playwright
      has no real Safari, but WebKit is its engine and the closest
      automatable stand-in. Running the full 7-viewport x every-spec
      matrix on a second engine would roughly double an already ~30-minute
      suite for marginal extra signal, so this is deliberately narrow: one
      desktop viewport (his actual setup) against the specs most likely to
      behave differently across engines — the gallery lightbox (native
      `<dialog>`, touch/swipe handling, focus restoration), the Sanity
      hotspot/crop image pipeline, and the core content routes. Broad
      per-route layout sweeping (foundation.spec.ts) stays Chromium-only;
      it is layout arithmetic, not rendering-engine-sensitive.
    */
    {
      name: "webkit-1440",
      testMatch: [
        "gallery-lightbox.spec.ts",
        "image-hotspot.spec.ts",
        "services.spec.ts",
        "projects.spec.ts",
        "homepage.spec.ts",
        "cms.spec.ts",
      ],
      use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } },
    },
  ],

  webServer: {
    /**
     * Builds here rather than assuming a prior `npm run build`, because
     * the test build must carry `E2E_NO_IMAGE_OPT` (next.config.ts reads
     * it at build time). Locally the running server is reused between
     * runs — `reuseExistingServer` — so this only costs a build on the
     * first invocation. A normal `npm run build` for deployment is
     * unaffected: the flag is scoped to this command's env.
     */
    command: `npx next build && npx next start --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { E2E_NO_IMAGE_OPT: process.env.E2E_NO_IMAGE_OPT ?? "1" },
  },
});
