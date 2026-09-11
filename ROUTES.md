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
| `/portfolio` | Projects index | **Complete** — completed-work gallery: one card per job, each linking to its own project page. No filters. |
| `/projects/[slug]` | Project detail | **Live — 6 pages, served from Sanity.** One per completed job, each with its own photographs. Titles are service-led and verified against the photography; no client, address or date is published. Renan edits and deletes these in Studio; a deleted project 404s here and drops from `/portfolio` and the sitemap. |
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
| 02 | Drainage & External Pipe Repairs | `/services/drainage-external-pipe-repairs` |
| 03 | Gutter Cleaning | `/services/gutter-cleaning` |
| 04 | Brickwork & Repointing | `/services/brickwork-repointing` |
| 05 | Mastic & Sealant | `/services/mastic-sealant` |
| 06 | Pressure Washing / DOFF Cleaning | `/services/pressure-washing-doff-cleaning` |
| 07 | Roof & Roofline Repairs | `/services/roof-roofline-repairs` |
| 08 | Lightning Protection | `/services/lightning-protection` |

Drainage and Brickwork swapped positions at the client's request. The
NUMBER is presentation and lives in `src/lib/config/site.ts`; the SLUG is
the contract and did not move, so no URL, redirect or sitemap entry
changed.

Slugs are lowercase, hyphenated, ampersand-free. **These eight are a
contract** — changing one breaks the redirect map and loses rankings, so
they live in `src/lib/config/site.ts` where no CMS edit can reach them,
Studio hides the Delete action on their documents, and the slug FIELD on
each is `readOnly` in Studio. That readOnly is a UI affordance, not the
real guarantee: the provider matches each of the eight documents to its
route by stable document id (`service-<slug>`), never by the slug or name
field, so even a slug that drifted outside Studio's own protection (it has
happened — see `CMS-AUDIT-2026-09.md` §1–2) cannot change the route or
mint a duplicate.

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
| `/roof-rooflineworks` | `/services/roof-roofline-repairs` | Redirect | **308 — implemented** (found in the Search Console *Pages* report, 404 on the new site until 2026-09-09) |

Each is registered **with and without** the trailing slash. `next.config.ts`
sets `skipTrailingSlashRedirect` so the trailing-slash form reaches its
destination in **one** 308 hop rather than being stripped to the no-slash
form by Next's built-in redirect first; a catch-all `/:path+/ → /:path+`
rule in `redirects()` keeps every other URL slash-less.

### Convenience redirect

| From | To | Status |
| --- | --- | --- |
| `/projects` | `/portfolio` | 308 — implemented |

`/projects` is the URL people guess. Redirecting it avoids a 404 and keeps
`/portfolio` canonical.

### Outstanding — legacy audit

Search Console's *Pages* report (checked 2026-09-09) shows Google holding
only **one** un-redirected legacy URL, `/roof-rooflineworks`, now fixed
above. The other "not indexed" entries are the apex / `http://` domain
variants, which correctly 308 to the `https://www.boviaccess.co.uk`
canonical — expected, not URLs to redirect.

If more legacy URLs surface later (a `site:boviaccess.co.uk` crawl, an old
backlink, a new 404 in Search Console):

1. Confirm the URL is real — it must appear in Search Console or an
   external link, never be guessed.
2. Add it to `legacyUrl` on the matching service in
   `src/lib/config/site.ts` — redirects generate from that field.
3. Add the redirect to `e2e/seo-metadata.spec.ts`.

| Legacy URL | New route | Decision | Status |
| --- | --- | --- | --- |
| *(none outstanding)* | | | |

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
accident. Service URLs come from the content provider (local + CMS).
Project URLs come from the provider too — the six seeded Sanity projects
today, and anything Renan publishes or removes from Studio.

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
