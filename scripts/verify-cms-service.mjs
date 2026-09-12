/**
 * Proves the client-facing promise: services and projects that exist ONLY
 * in the CMS get real pages and navigation entries, then vanish everywhere
 * when unpublished. It also proves a successfully deleted CMS project is
 * never resurrected from the local outage fallback.
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
const PROJECT_SLUG = "qa-temporary-test-project";
const fixtureEnv = {
  NEXT_PUBLIC_SANITY_PROJECT_ID: "fixture",
  NEXT_PUBLIC_SANITY_DATASET: "fixture",
  SANITY_API_HOST: API_HOST,
};

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
      env: { ...process.env, ...fixtureEnv },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  if (result.status !== 0) {
    console.error(result.stderr?.toString().split("\n").slice(-20).join("\n"));
    throw new Error("next build failed");
  }
}

async function run(fixture, label, assertions, options = {}) {
  const { skipBrowserCheck = false } = options;
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
    fixtureEnv,
    "site",
  );
  await waitForServer(BASE);

  await assertions();

  if (!skipBrowserCheck) {
    const browserResult = spawnSync(
      process.execPath,
      [
        "node_modules/@playwright/test/cli.js",
        "test",
        "--config=playwright.cms.config.ts",
      ],
      {
        env: {
          ...process.env,
          CMS_FIXTURE_BASE_URL: BASE,
          CMS_FIXTURE_STATE: label === "Service PUBLISHED"
            ? "published"
            : "unpublished",
        },
        stdio: "inherit",
      },
    );
    if (browserResult.status !== 0) {
      failures++;
      throw new Error(`fixture Playwright check failed for ${label}`);
    }
  }

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

    // The projects in this run come from the fixture CMS, not local
    // fallback — proof that the provider treats a populated Sanity response
    // as authoritative for the project list.
    const project = await get("/projects/external-pipe-repair");
    check("a fixture project page renders", project.status, 200);
    check(
      "project page shows its CMS summary",
      project.body.includes("running the full height of a narrow lightwell"),
      true,
    );
    const addedProject = await get(`/projects/${PROJECT_SLUG}`);
    check("new fixture project page renders", addedProject.status, 200);

    const map = await get("/sitemap.xml");
    // 7 static + 8 core services + fixture service + 7 projects.
    check("sitemap URL count", (map.body.match(/<loc>/g) ?? []).length, 23);
    check(
      "sitemap contains the new service once",
      (map.body.match(new RegExp(`/services/${SLUG}<`, "g")) ?? []).length,
      1,
    );

    const missing = await get("/services/no-such-service-anywhere");
    check("unknown slug still 404s", missing.status, 404);

    // The homepage references these two projects by _id (see the fixture's
    // "homepage" object) — proof the sections actually resolve a real
    // reference before the next run deletes what it points to.
    const home = await get("/");
    check(
      "homepage Featured Project links to the referenced project",
      home.body.includes('href="/projects/commercial-glazing-clean"'),
      true,
    );
    check(
      "homepage Recent works includes the fixture project",
      home.body.includes("QA Temporary Test Project"),
      true,
    );
  });

  await run("scripts/fixtures/no-new-service.json", "Service UNPUBLISHED", async () => {
    const page = await get(`/services/${SLUG}`);
    check("page is gone", page.status, 404);

    const list = await get("/services");
    check("no longer listed", countLinks(list.body, SLUG), 0);

    const map = await get("/sitemap.xml");
    // 7 static + 8 core services + 5 CMS projects. The fixture project is
    // unpublished and one formerly published local-baseline project has
    // been deleted from the successful CMS response.
    check("sitemap URL count after removals", (map.body.match(/<loc>/g) ?? []).length, 20);
    check(
      "sitemap has no entry for the deleted shipped project",
      map.body.includes("/projects/commercial-glazing-clean<"),
      false,
    );
    check(
      "sitemap has no entry for the deleted fixture project",
      map.body.includes(`/projects/${PROJECT_SLUG}<`),
      false,
    );

    const deletedProject = await get("/projects/commercial-glazing-clean");
    check("deleted CMS project does not fall back locally", deletedProject.status, 404);

    const deletedFixtureProject = await get(`/projects/${PROJECT_SLUG}`);
    check(
      "a deleted client-created project also 404s, not just a shipped one",
      deletedFixtureProject.status,
      404,
    );

    const core = await get("/services/mastic-sealant");
    check("the original eight are untouched", core.status, 200);

    const listing = await get("/portfolio");
    check(
      "the deleted shipped project is gone from the listing",
      listing.body.includes("/projects/commercial-glazing-clean"),
      false,
    );
    check(
      "the deleted client-created project is gone from the listing",
      listing.body.includes(`/projects/${PROJECT_SLUG}`),
      false,
    );

    // Both projects the homepage was still pointing at (see the fixture's
    // dangling "homepage" references) are gone. Neither section may crash,
    // resurrect them, or show nothing — they must fall through to whatever
    // project actually still exists.
    const home = await get("/");
    check("homepage still renders once its references dangle", home.status, 200);
    check(
      "homepage Featured Project no longer links to the deleted project",
      home.body.includes('href="/projects/commercial-glazing-clean"'),
      false,
    );
    check(
      "homepage Recent works no longer includes the deleted fixture project",
      home.body.includes("QA Temporary Test Project"),
      false,
    );
    check(
      "homepage Featured Project falls through to a surviving project",
      home.body.includes('href="/projects/external-pipe-repair"'),
      true,
    );
  });

  /*
   * THE RECURRING INCIDENT, REPRODUCED SAFELY.
   *
   * The client's "Gutter Cleaning" service had its slug field changed in
   * Studio (apparently via the Content Agent, not the read-only form
   * input) from "gutter-cleaning" to "gutter-cleaning-repairs", twice.
   * Because the provider used to match a CMS document to its local
   * counterpart BY SLUG, this read as a brand new ninth service: the
   * canonical /services/gutter-cleaning kept serving stale local content,
   * and a phantom /services/gutter-cleaning-repairs appeared alongside it.
   *
   * The fix matches by the document's stable `_id` instead (see
   * CORE_SERVICE_ID in src/lib/content/provider.ts). This fixture carries
   * that same drifted slug at the real `service-gutter-cleaning` id and
   * proves the frontend now shrugs it off entirely: still eight services,
   * still one URL, the CMS content still wins.
   */
  await run(
    "scripts/fixtures/core-service-drift.json",
    "Core service identity drift",
    async () => {
      const canonical = await get("/services/gutter-cleaning");
      check("the contract URL still serves", canonical.status, 200);
      check(
        "it shows the CMS content, not the stale local copy",
        canonical.body.includes(
          "Fixture intro text proving the CMS content for the drifted document",
        ),
        true,
      );

      const drifted = await get("/services/gutter-cleaning-repairs-DRIFT-FIXTURE");
      check(
        "the drifted slug does not resolve as a second page",
        drifted.status,
        404,
      );

      const list = await get("/services");
      check(
        "exactly eight services listed — no phantom ninth",
        new Set(list.body.match(/href="\/services\/[a-z-]+"/g) ?? []).size,
        8,
      );
      check(
        "the drifted URL is not linked from the listing",
        list.body.includes("gutter-cleaning-repairs-DRIFT-FIXTURE"),
        false,
      );

      const map = await get("/sitemap.xml");
      // 7 static + 8 services + 6 projects — identical to a clean
      // production dataset, proving the drift changed nothing downstream.
      check(
        "sitemap URL count is unaffected by the drift",
        (map.body.match(/<loc>/g) ?? []).length,
        21,
      );
      check(
        "sitemap has no phantom drifted entry",
        map.body.includes("gutter-cleaning-repairs-DRIFT-FIXTURE"),
        false,
      );
    },
    // This fixture is not about the "published"/"unpublished" dropdown
    // lifecycle header-dropdowns.cms.spec.ts checks — the HTTP assertions
    // above are the whole proof.
    { skipBrowserCheck: true },
  );

  /*
   * ANOTHER RECURRING INCIDENT, REPRODUCED SAFELY.
   *
   * Renan published five gallery photographs on the Drainage service —
   * Studio showed all five — and the live page rendered three. Separately,
   * Mastic & Sealant's four rendered three too. ServiceBody.tsx required
   * an exact gallery[1]+gallery[2] pair for "the rest of the gallery" and
   * silently dropped gallery[3] onward — and, the same bug from the other
   * side, a service with exactly TWO gallery photographs lost the second
   * one (no gallery[2] to pair it with).
   *
   * Fixed by rendering everything after the lead photograph in a grid
   * sized to however many there are, instead of a fixed two-slot shape.
   * This fixture proves it holds at both ends: five photographs all
   * render (not three), and removing one actually drops the count to
   * four rather than leaving a stale five or resurrecting a local one.
   */
  await run(
    "scripts/fixtures/service-gallery-five.json",
    "Service gallery renders every published photograph",
    async () => {
      const page = await get("/services/gutter-cleaning");
      check("the contract URL still serves", page.status, 200);

      const photographs = (
        page.body.match(
          /aria-label="View larger image for Gutter Cleaning, photograph \d"/g,
        ) ?? []
      ).length;
      check("all four non-lead photographs render, not two", photographs, 4);

      check(
        "the fourth non-lead photograph (the fifth overall) is present",
        page.body.includes(
          'aria-label="View larger image for Gutter Cleaning, photograph 4"',
        ),
        true,
      );
      check(
        "the lead \"access and delivery\" photograph still renders too",
        page.body.includes(
          'aria-label="View larger image for Gutter Cleaning, access and delivery"',
        ),
        true,
      );
    },
    { skipBrowserCheck: true },
  );

  await run(
    "scripts/fixtures/service-gallery-four.json",
    "Removing a gallery photograph reduces the rendered count",
    async () => {
      const page = await get("/services/gutter-cleaning");
      check("the contract URL still serves", page.status, 200);

      const photographs = (
        page.body.match(
          /aria-label="View larger image for Gutter Cleaning, photograph \d"/g,
        ) ?? []
      ).length;
      check(
        "only three non-lead photographs render now — the count tracks the CMS",
        photographs,
        3,
      );
      check(
        "the removed fifth photograph's slot is gone, not just relabelled",
        page.body.includes(
          'aria-label="View larger image for Gutter Cleaning, photograph 4"',
        ),
        false,
      );
      check(
        "no local fallback image fills the gap",
        // "A gloved hand holding a plant..." is the real local Gutter
        // Cleaning gallery's own alt text (src/lib/content/services.ts) —
        // its appearance here would mean the missing fourth slot got
        // padded from local content instead of just rendering three.
        page.body.includes("A gloved hand holding a plant"),
        false,
      );
    },
    { skipBrowserCheck: true },
  );
} finally {
  for (const child of children) child.kill();
}

console.log(
  failures === 0
    ? "\nCMS navigation lifecycle verified.\n"
    : `\n${failures} check(s) FAILED.\n`,
);
process.exit(failures === 0 ? 0 : 1);
