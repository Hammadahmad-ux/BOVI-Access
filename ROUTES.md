# BOVI ACCESS — Routes & URL Migration

The URL contract for the new site, and how the legacy Wix URLs map onto it.

SEO equity preservation matters here: the Wix site is currently ranking,
and a bad migration loses that.

---

## 1. Core routes

| Route | Purpose | Status |
| --- | --- | --- |
| `/` | Homepage | **Complete** |
| `/about` | About / Safety | **Complete** |
| `/services` | Services overview | **Complete** — alternating editorial directory |
| `/services/[slug]` | Individual service pages (×8) | **Complete** — one reusable template, data-driven |
| `/portfolio` | Projects index | **Complete** — category-led, six verified images, no filters |
| `/projects/[slug]` | Project detail | **Built, generates 0 pages** — no project has a verified name, so none has a URL. Template waits for Sanity. |
| `/service-areas` | Coverage | **Complete** |
| `/contact` | Request a Quote | **Complete front end** — submission wired in Phase 4 |
| `/privacy` | Privacy Policy | Live — needs legal review |
| `/sitemap.xml` | Generated | Live |
| `/robots.txt` | Generated | Live |
| `/studio` | Sanity Studio | **Not mounted** — Phase 4, blocked on Sanity project |
| *(404)* | `not-found.tsx` | Live |

Navigation and route definitions come from `primaryNav` in
`src/lib/config/site.ts`. `typedRoutes` is enabled, so a nav entry pointing
at a non-existent page is a **compile error**.

---

## 2. Service routes

| # | Service | New route |
| --- | --- | --- |
| 01 | Commercial Window Cleaning | `/services/commercial-window-cleaning` |
| 02 | Brickwork & Repointing | `/services/brickwork-repointing` |
| 03 | Gutter Cleaning | `/services/gutter-cleaning` |
| 04 | Drainage & External Pipe Repairs | `/services/drainage-external-pipe-repairs` |
| 05 | Mastic & Sealant | `/services/mastic-sealant` |
| 06 | Pressure Washing / DOFF Cleaning | `/services/pressure-washing-doff-cleaning` |
| 07 | Roof & Roofline Repairs | `/services/roof-roofline-repairs` |
| 08 | Lightning Protection | `/services/lightning-protection` |

Slugs are lowercase, hyphenated, ampersand-free. **These eight are a
contract** — changing one breaks the redirect map and loses rankings, so
they live in `src/lib/config/site.ts` where no CMS edit can reach them,
and Studio hides the Delete action on their documents.

### New services are added from Sanity, not from code

`/services/[slug]` resolves against the CONTENT PROVIDER, not the local
list. `generateStaticParams` pre-renders every service the provider knows
about, and `dynamicParams` stays on, so a service published after the last
build renders on demand and is cached from then on. Renan does not need a
developer, a commit or a redeploy to add one.

| Behaviour | Result |
| --- | --- |
| Sanity service published with a new slug | Page renders at `/services/<slug>`, joins `/services` and the sitemap |
| Slug matches no service | Real 404 |
| Sanity service unpublished | Page 404s, drops out of `/services` and the sitemap |
| One of the eight | Unchanged — local copy is the baseline, CMS merges over it field by field |

New services are numbered from 09 upward and are never inserted into the
fixed 01-08 sequence, and they never join the curated Homepage service
index. Both are design decisions, not limitations of the data.

Proven end to end by `npm run verify:cms`, which builds the site twice
against a fixture Sanity API — once with a service the codebase has never
seen, once without it — and never touches the real dataset.

---

## 3. Legacy URL map

### Confirmed legacy URLs

| Legacy Wix URL | New route | Decision | Status |
| --- | --- | --- | --- |
| `/CommercialWindowCleaning-FacadeCleaning/` | `/services/commercial-window-cleaning` | Redirect | **308 — implemented** |
| `/PressureWashingandDOFFcleaning/` | `/services/pressure-washing-doff-cleaning` | Redirect | **308 — implemented** |

Both are registered **with and without** the trailing slash, because the
Wix URLs were published with one.

### Convenience redirect

| From | To | Status |
| --- | --- | --- |
| `/projects` | `/portfolio` | 308 — implemented |

`/projects` is the URL people guess. Redirecting it avoids a 404 and keeps
`/portfolio` canonical.

### Outstanding — legacy audit not complete

The two URLs above are the only ones confirmed. The live Wix site almost
certainly has more.

**Required before launch:**

1. Export the full URL list from the live site — Google Search Console
   *Pages* report, an `site:boviaccess.co.uk` crawl, or the Wix site map.
2. Record every legacy URL below with a decision.
3. Add each to `legacyUrl` on the matching service in
   `src/lib/config/site.ts` — redirects generate from that field, so they
   cannot drift.
4. Verify each redirect in `e2e/foundation.spec.ts`.

| Legacy URL | New route | Decision | Status |
| --- | --- | --- | --- |
| *(to be audited)* | | | |

Likely candidates to look for: an about page, a contact page, a gallery
page, and pages for Gutter Cleaning, Mastic & Sealant, Roof & Roofline
Repairs and Lightning Protection.

---

## 4. Redirect rules

- **Preserve where sensible, redirect otherwise.** A legacy URL with
  rankings should redirect to its closest real equivalent, not to `/`.
- **308 permanent**, so link equity passes.
- **No redirect chains.** Every legacy URL points *directly* at its final
  destination. If a slug changes, update the legacy mapping — never add a
  second hop.
- **No redirect loops.** A destination must never itself redirect.
- Legacy paths that have no sensible equivalent are left to the custom 404,
  which lists every page and service so the visitor can self-route.

Redirects are generated in `next.config.ts` from `legacyUrl` in the service
config. Do not hand-write redirect entries.

---

## 5. Canonical URLs

- Every page emits `<link rel="canonical">` via `buildMetadata()`.
- Origin comes from `NEXT_PUBLIC_SITE_URL`, defaulting to
  `https://www.boviaccess.co.uk`.
- Set this per-environment on Vercel so preview deployments do not emit
  production canonicals.
- The `www` host is canonical, matching the current live site. Do not
  switch to apex without a deliberate decision — it changes every canonical
  and every backlink target.

---

## 6. Sitemap

`src/app/sitemap.ts` lists static routes **explicitly** rather than
crawling, so a route that is not ready to be indexed cannot leak in by
accident. Service URLs are generated from the service config. Project URLs
join in Phase 4 from Sanity.

`/studio` is disallowed in `robots.ts` and excluded from the sitemap.

---

## 7. Launch cutover checklist

1. Complete the legacy URL audit (§3).
2. Implement and test every redirect.
3. Confirm no chains: each legacy URL → 308 → 200, one hop.
4. Verify canonicals point at the production origin.
5. Submit the new sitemap in Google Search Console.
6. Keep the Wix site live until DNS has fully propagated.
7. Monitor Search Console *Coverage* and *Pages* for two to four weeks.
8. Watch for 404 spikes — each is a legacy URL missed in the audit.
