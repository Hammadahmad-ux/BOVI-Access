import { defineConfig, devices } from "@playwright/test";

/**
 * Browser assertions against the isolated Sanity fixture server started by
 * scripts/verify-cms-service.mjs. No webServer belongs here: that script has
 * already built and started the exact fixture state under test.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/header-dropdowns.cms.spec.ts",
  workers: 1,
  retries: 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: process.env.CMS_FIXTURE_BASE_URL ?? "http://localhost:3661",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
  },
});
