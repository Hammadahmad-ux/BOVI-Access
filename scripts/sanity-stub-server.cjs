/**
 * Test-only stand-in for the Sanity Content Lake API.
 *
 * Run it, point SANITY_API_HOST at it, and the site reads its CMS content
 * from a JSON fixture instead of the client's real dataset:
 *
 *   node scripts/sanity-stub-server.cjs scripts/fixtures/new-service.json 3999
 *   SANITY_API_HOST=http://localhost:3999 npx next start
 *
 * WHY THIS EXISTS
 *
 * The point of this revision is that Renan can publish a NEW service in
 * Studio and get a working page without a developer. Proving that needs a
 * service document the codebase has never seen.
 *
 * Creating one in the real `production` dataset would mean writing fake
 * content into the business's live CMS and trusting a cleanup step to
 * remove it again. This is strictly safer: the real dataset is never read
 * from or written to, and the proof is repeatable in CI rather than a
 * one-off manual document someone has to remember to delete.
 *
 * Nothing here ships to production.
 */
const http = require("node:http");
const { readFileSync } = require("node:fs");

const [, , fixturePath, portArg] = process.argv;
if (!fixturePath) {
  console.error("usage: node scripts/sanity-stub-server.cjs <fixture> [port]");
  process.exit(1);
}
const port = Number(portArg ?? 3999);

/** { services: [...], projects: [...], homepage: {...}|null } */
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

/**
 * The provider issues one query per document type. Matching the type
 * literal in the GROQ text is enough to route them, and saves the stub
 * from having to understand GROQ.
 */
function resultFor(query) {
  if (query.includes('_type == "service"')) return fixture.services ?? [];
  if (query.includes('_type == "project"')) return fixture.projects ?? [];
  if (query.includes('_type == "homepage"')) return fixture.homepage ?? null;
  if (query.includes('_type == "siteSettings"')) {
    return fixture.siteSettings ?? null;
  }
  return null;
}

http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const url = new URL(req.url, `http://localhost:${port}`);
      let query = url.searchParams.get("query") ?? "";
      if (!query && body) {
        try {
          query = JSON.parse(body).query ?? "";
        } catch {
          /* leave empty; resultFor returns null */
        }
      }
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ms: 0, query, result: resultFor(query) }));
    });
  })
  .listen(port, () => {
    console.log(`[sanity-stub] ${fixturePath} on http://localhost:${port}`);
  });
