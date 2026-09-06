/**
 * Proves the client-facing promise: a service that exists ONLY in the CMS
 * gets a real page, appears in the listing and the sitemap, and vanishes
 * from all three when it is unpublished.
 *
 * Run with: npm run verify:cms
 *
 * It builds the site twice against a fixture Sanity API (see
 * scripts/sanity-stub-server.cjs) — once with a service the codebase has
 * never seen, once without it. The client's real dataset is never touched
 * and no test document is ever created, so there is nothing to clean up
 * afterwards and nothing that can be left behind by accident.
 *
 * Takes a few minutes: two full production builds is the point, because
 * the build is where generateStaticParams and the sitemap are resolved.
 *
 * NOTE the `rm -rf .next` between runs. Next persists Sanity responses in
 * .next/cache, so without it the second build happily reuses the first
 * fixture's data and the test passes for the wrong reason. In production
 * the publish webhook purges that cache by tag instead.
 */
import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const STUB_PORT = 3999;
const SITE_PORT = 3661;
const BASE = `http://localhost:${SITE_PORT}`;
const API_HOST = `http://localhost:${STUB_PORT}`;
const SLUG = "qa-temporary-test-service";

const children = [];
let failures = 0;

function check(label, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}: ${actual}${ok ? "" : ` (expected ${expected})`}`);
}

/**
 * Counts real anchors only. The RSC flight payload embedded further down
 * the document repeats every href with escaped quotes, so a plain
 * substring match double-counts everything on the page.
 */
function countLinks(html, slug) {
  return (html.match(new RegExp(`href="/services/${slug}"`, "g")) ?? []).length;
}

async function get(path) {
  const res = await fetch(BASE + path);
  return { status: res.status, body: await res.text() };
}

/**
 * Spawned WITHOUT `shell`, deliberately. With a shell on Windows the
 * child is the shell, and killing it leaves the real node process alive
 * and still holding the port — so the second build silently talked to the
 * FIRST fixture's stub and the unpublish test passed for the wrong
 * reason. Running node directly means kill() kills the thing we started.
 */
function start(command, args, env, label) {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.on("error", (error) => {
    console.error(`${label} failed to start:`, error.message);
    failures++;
  });
  children.push(child);
  return child;
}

async function waitForServer(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url);
      return true;
    } catch {
      await sleep(400);
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function build() {
  const result = spawnSync(
    process.execPath,
    ["node_modules/next/dist/bin/next", "build"],
    {
      env: { ...process.env, SANITY_API_HOST: API_HOST },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  if (result.status !== 0) {
    console.error(result.stderr?.toString().split("\n").slice(-20).join("\n"));
    throw new Error("next build failed");
  }
}

async function run(fixture, label, assertions) {
  console.log(`\n=== ${label} ===`);
  rmSync(".next", { recursive: true, force: true });

  const stub = start(
    process.execPath,
    ["scripts/sanity-stub-server.cjs", fixture, String(STUB_PORT)],
    {},
    "stub",
  );
  await waitForServer(API_HOST, 15_000);

  build();

  const site = start(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(SITE_PORT)],
    { SANITY_API_HOST: API_HOST },
    "site",
  );
  await waitForServer(BASE);

  await assertions();

  site.kill();
  stub.kill();
  await sleep(1200);
}

try {
  await run("scripts/fixtures/new-service.json", "Service PUBLISHED", async () => {
    const page = await get(`/services/${SLUG}`);
    check("new service page status", page.status, 200);
    check(
      "renders its own heading",
      page.body.includes("QA Temporary Test Service"),
      true,
    );
    check(
      "renders its overview copy",
      page.body.includes("First fixture work item"),
      true,
    );
    check(
      "canonical points at the new URL",
      page.body.includes(`/services/${SLUG}"`),
      true,
    );
    check(
      "links to a related service that exists only locally",
      page.body.includes("/services/gutter-cleaning"),
      true,
    );

    const list = await get("/services");
    check(
      "listed on the services overview exactly once",
      countLinks(list.body, SLUG),
      1,
    );
    check(
      "the original eight are still listed",
      new Set(list.body.match(/href="\/services\/[a-z-]+"/g) ?? []).size,
      9,
    );

    const map = await get("/sitemap.xml");
    check("sitemap URL count", (map.body.match(/<loc>/g) ?? []).length, 16);
    check(
      "sitemap contains the new service once",
      (map.body.match(new RegExp(`/services/${SLUG}<`, "g")) ?? []).length,
      1,
    );

    const missing = await get("/services/no-such-service-anywhere");
    check("unknown slug still 404s", missing.status, 404);
  });

  await run("scripts/fixtures/no-new-service.json", "Service UNPUBLISHED", async () => {
    const page = await get(`/services/${SLUG}`);
    check("page is gone", page.status, 404);

    const list = await get("/services");
    check("no longer listed", countLinks(list.body, SLUG), 0);

    const map = await get("/sitemap.xml");
    check("sitemap URL count back to baseline", (map.body.match(/<loc>/g) ?? []).length, 15);

    const core = await get("/services/mastic-sealant");
    check("the original eight are untouched", core.status, 200);
  });
} finally {
  for (const child of children) child.kill();
}

console.log(
  failures === 0
    ? "\nCMS service lifecycle verified.\n"
    : `\n${failures} check(s) FAILED.\n`,
);
process.exit(failures === 0 ? 0 : 1);
