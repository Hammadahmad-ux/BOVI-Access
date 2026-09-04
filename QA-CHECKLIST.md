# BOVI ACCESS — QA Checklist

Hard completion criteria. The site does not launch until every item passes.

```bash
npm run check      # lint + typecheck + production build
npm run test:e2e   # Playwright across all seven viewports (build first)
```

`e2e/foundation.spec.ts` encodes many of these as executable guards, so
they cannot silently regress. **Add every new route to its `ROUTES`
array.**

Legend: **Automated** = enforced by a test · **Manual** = human check.

---

## 1. The twenty hard checks

| # | Requirement | Enforcement | Phase 1 |
| --- | --- | --- | --- |
| 1 | Zero accidental horizontal scrolling | Automated — `scrollWidth - clientWidth <= 1` on every route × 7 viewports | **Pass** |
| 2 | No broken links | Automated (no `#`/empty hrefs) + `typedRoutes` compile check | **Pass** |
| 3 | Functional mobile menu | Automated — opens, lists all 6 pages, Escape closes, navigates, releases scroll lock | **Pass** |
| 4 | Proper favicon | `src/app/icon.png` (512) + `apple-icon.png` (180), from the real BOVI mark | **Pass** |
| 5 | Correct page titles | Automated — every route matches `/BOVI Access/` | **Pass** |
| 6 | Meaningful meta descriptions | Automated — present and > 50 chars on every route | **Pass** |
| 7 | Correct footer links | Generated from `footerNav` + `services`; `typedRoutes` verifies | **Pass** |
| 8 | Useful custom 404 | Automated — returns 404, renders H1, lists all pages and services | **Pass** |
| 9 | Dynamic copyright year | `new Date().getFullYear()` in `Footer.tsx` | **Pass** |
| 10 | Compressed / optimised images | `next/image` + AVIF/WebP; derivatives via `npm run assets:images` | **Pass** (revisit per-image in Phase 5) |
| 11 | No broken buttons or CTAs | `Button` requires a `Route`; broken CTA = compile error | **Pass** |
| 12 | Form success messages | — | **Phase 4** |
| 13 | Form error messages | — | **Phase 4** |
| 14 | Zero visible placeholder text | Manual + `CONTENT-RULES.md` §3 | **Pass** |
| 15 | Zero unused / dead nav items | Every `primaryNav` entry resolves; `typedRoutes` enforces | **Pass** |
| 16 | No mobile overflow | Automated — same guard as #1 at 430/390/375 | **Pass** |
| 17 | Logo clickable, links to `/` | Automated — `href="/"`, plus a no-clipping height assertion | **Pass** |
| 18 | Phone clickable — `tel:+447990377780` | Automated | **Pass** |
| 19 | Email clickable — `mailto:info@boviaccess.co.uk` | Automated | **Pass** |
| 20 | Full mobile optimisation | Manual, ongoing | **Phase 5** |

---

## 2. Additional hard QA

| Requirement | Enforcement | Phase 1 |
| --- | --- | --- |
| No console errors | Automated — console + `pageerror` on every route | **Pass** |
| No hydration errors | Covered by the console guard | **Pass** |
| No TypeScript errors | `npm run typecheck` | **Pass** |
| No lint failures | `npm run lint` | **Pass** |
| No dead `#` links | Automated | **Pass** |
| Exactly one `<h1>` per page | Automated | **Pass** |
| Meaningful heading hierarchy | Manual — no skipped levels | **Pass** |
| Keyboard focus states | Global `:focus-visible`, ground-aware | **Pass** |
| Sufficient contrast | Measured — `DESIGN.md` §1 | **Pass** |
| Alt text on images | Required at component and schema level | **Pass** |
| Reduced motion respected | Global `@media` block | **Pass** |
| Touch targets ≥ 44px | `min-h-11` on buttons; 44px icon buttons | **Pass** |
| Form labels | — | **Phase 4** |
| Image aspect-ratio stability | Explicit `width`/`height` or `fill` everywhere | **Pass** |
| No dead components | Manual | **Pass** |
| No obvious a11y violations | Manual + axe pass in Phase 5 | Phase 5 |

---

## 3. Responsive viewports — mandatory

Every one must be clean. All seven are Playwright projects.

`1440` · `1280` · `1024` · `768` · `430` · `390` · `375`

Mobile is designed intentionally, not shrunk from desktop:

- 20px side gutters (`--spacing-gutter`), 40px from `md` up
- Clean type at every step — no one-letter-per-line heading wrapping
- Proper section spacing, logical stacking
- Usable controls, no hover-dependent UI
- Appropriate media crops for **portrait-source** photography

---

## 4. Accessibility

- [x] Semantic HTML and landmarks
- [x] Skip link to `#main`
- [x] Visible focus on every interactive element
- [x] Correct button-vs-link semantics
- [x] Decorative numerals/icons `aria-hidden` (link names stay clean)
- [x] Mobile menu: `role="dialog"`, `aria-modal`, focus trap, Escape, scroll lock, focus returns to trigger
- [x] `aria-expanded` / `aria-controls` on the menu trigger
- [x] `aria-current="page"` on active nav
- [x] `lang="en-GB"`
- [ ] Full axe/Lighthouse a11y sweep — **Phase 5**
- [ ] Screen-reader pass on the enquiry form — **Phase 4**

---

## 5. SEO

Per page: title · meta description · canonical · Open Graph ·
Twitter card · one logical `<h1>` · heading hierarchy · internal links ·
image alt text.

- [x] `sitemap.xml` — explicit route list, service URLs generated
- [x] `robots.txt` — `/studio` disallowed
- [x] Organization JSON-LD (no fake ratings, reviews or awards)
- [x] Service JSON-LD on service pages
- [x] BreadcrumbList on service pages
- [ ] FAQPage — only when genuine visible FAQs exist
- [ ] Legacy URL audit complete — **`ROUTES.md` §3**

Natural topic areas: commercial rope access · rope access London ·
commercial building maintenance · external building maintenance ·
commercial window cleaning · repointing · gutter cleaning · external pipe
repairs · DOFF cleaning · commercial property maintenance.
**Do not keyword-stuff.**

---

## 6. Performance targets

| Metric | Target |
| --- | --- |
| Lighthouse Performance | 90+ realistically |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 95+ |
| LCP | ≤ 2.5s |
| CLS | ≤ 0.1 |
| INP | ≤ 200ms |

Do not sacrifice real visual UX chasing synthetic 100s.

Image rules: correct dimensions · responsive `sizes` · lazy-load below the
fold · `priority` **only** on the hero still · no layout shift. Hero video
never blocks LCP — the still is the LCP element, video layers over it once
playable, and is suppressed below 768px and for reduced-motion users.

- [ ] Lighthouse run on the production deployment — **Phase 5**

---

## 7. Forms — Phase 4

- [ ] Fields: Name · Company · Email · Phone · Project Location · Service Required · Project Details · Preferred Contact Method · Photo/File Upload
- [ ] React Hook Form + Zod (`src/lib/forms/quote-schema.ts` — already written)
- [ ] Client-side validation
- [ ] Server-side validation against the **same** schema
- [ ] Loading state
- [ ] Success message
- [ ] Error message
- [ ] Honeypot (`website` field — already in the schema)
- [ ] Rate limiting / spam protection
- [ ] MIME validation (`validateUpload` — already written)
- [ ] File-size validation (8MB per file, max 5)
- [ ] Accessible labels, focus and error handling
- [ ] Real delivery via Resend — **no fake submission**

---

## 8. Pre-launch — client actions outstanding

1. **Confirm trust claims in writing** — IRATA Level 3, Fully Insured, 18+ Years at Height, RAMS-led. Then set `verified: true`, or remove.
2. **Complete the legacy URL audit** — `ROUTES.md` §3.
3. **Supply the hero video URL** — or confirm the photograph ships.
4. **Create the Sanity project** — `CMS-SCHEMA.md` §1.
5. **Supply company registration details** — footer and privacy policy.
6. **Legal review of `/privacy`.**
7. **Supply verified project content** — 3–6 projects minimum.
8. **Clarify the Liverpool photography** against the stated coverage.
9. Configure `RESEND_API_KEY` and verify the sending domain.
10. Set `NEXT_PUBLIC_SITE_URL` per environment on Vercel.
11. Keep Wix live until DNS propagates; monitor Search Console for 404 spikes.

---

## 9. Phase results

### Phase 1 (foundation)

```
Lint PASS · Typecheck PASS · Build PASS (21 pages) · E2E 271 passed
```

Two defects were caught by these gates: the homepage shipped without the
brand in its `<title>` (Next's `title.template` does not apply to the root
`page.tsx`), and the stacked logo was clipped by the 64px mobile header.

### Phase 2 (homepage)

```
Lint PASS · Typecheck PASS · Build PASS (21 pages)
E2E 327 passed, 0 failed, 16 skipped (viewport-gated by design)
Visual review at 1440 / 1280 / 1024 / 768 / 390
```

A six-dimension review (design, accessibility, responsive, content, code,
performance) produced 71 findings; each was independently re-verified by an
adversarial pass that rejected roughly half. **35 were confirmed.** Fixed in
this phase:

| Severity | Defect | Fix |
| --- | --- | --- |
| High | `font-600` / `font-700` / `font-800` are not real Tailwind v4 utilities — they emit **no CSS**, so 7 display headings silently rendered at weight 400 | Replaced with `font-semibold` / `font-bold` / `font-extrabold` |
| High | Motion server-renders entrance states as inline `opacity:0`, so with JS disabled the page shipped visually blank | Every animated element carries `data-reveal`; a `<noscript>` rule restores it |
| High | Hero eyebrow and body text failed AA over the photograph (4.08:1) — the measured 8.5:1 assumed flat ink, not a scrimmed image | Hero now uses the `strong` scrim |
| High | Desktop header broke between 1024–1077px: nav labels split mid-word and the CTA wrapped | Desktop nav moved to `xl`; the full-screen menu now serves up to 1280 |
| High | Mobile menu's scroll lock outlived the panel if the viewport crossed the breakpoint while open, leaving the page unscrollable | Panel closes on the media-query change; lock lifetime tied to the panel |
| Medium | Project card link names were polluted by image alt text | Card images are `alt=""`; the link's category label carries the name |
| Medium | "Photos can be attached to your enquiry" promised a capability the site does not yet have | Replaced until the Phase 4 form accepts uploads |
| Medium | `Logo` hardcoded `priority`, so the footer logo preloaded ahead of the hero LCP image | `priority` is now opt-in; only the header sets it |
| Medium | Section eyebrows announced as "01 BOVI Access" | Numeral group is `aria-hidden` |
| Medium | Footer links were 18px tap targets | `min-h-11` |
| Medium | `quality={72}` was silently discarded — Next 16 validates against `images.qualities` | Declared in `next.config.ts` |
| Medium | Introduction left a ~500px void between heading and link | Link moved under the heading |

**Deferred, tracked, not lost** (low severity or Phase 3+ scope): heading-case
consistency across sections; `AudienceSection` column dead space and baseline
drift below 1440; footer single-column range at 640–1023; mobile-menu gutter
at 768–1023; skip-link focus-ring clipping and `<main>` not being focusable;
hero CTA widths at 390; "EAST" orphaning onto its own line at 390; the unused
`gsap` / `lenis` dependencies.

### Phase 3 (secondary site)

```
Lint PASS · Typecheck PASS · Build PASS (21 static pages + 8 service pages)
E2E 524 passed, 0 failed, 22 skipped (viewport-gated)
Internal link crawl: 15 routes reached, 0 broken links, 0 redirect loops
Visual review: About, Services, 3 service pages, Projects, Contact @ 1440/768/390
```

**The five deferred Homepage issues are closed:**

| Issue | Root cause | Fix |
| --- | --- | --- |
| Heading case | No stated rule, so sections drifted | UPPERCASE reserved for the three display statements (hero, coverage, closing CTA); everything else sentence case. Rule written into DESIGN.md §2 and the Services heading corrected. |
| AudienceSection baseline drift | A two-line title pushed its column off the shared baseline | Two lines reserved on the `h3` from `sm` up |
| Footer single column 640–1023 | Grid went straight from 1 to 3 columns at `lg` | `sm:grid-cols-2` added |
| Skip-link focus ring clipped | `margin:0` on focus put it flush in the viewport corner | Offset by `0.75rem`; `<main>` also given `tabIndex={-1}` so the skip link actually moves focus |
| "EAST" orphaning at 390px | 14 characters cannot fit one line at the `h1` step on a 390px screen | Coverage statement steps down to `h2` below `sm` |

Also fixed while in the same code: `Route` without a type parameter silently
excludes dynamic routes, so `ArrowLink` was rejecting every
`/services/<slug>` link — it is now generic over the route, as `next/link`
is, and service slugs stay literal via `satisfies`.

Phase 3 additions to the QA suite: all eight service routes are in the
sweep (including the two longest titles, which is where responsive
typography breaks first), plus a bounded internal-link crawl.

**Playwright worker count is capped at 3.** Seven viewport projects at full
parallelism saturate `next start`'s single-process image optimiser, which
then returns 5xx and trips the console-error guard — a harness artefact,
not a site defect. Capping keeps the suite deterministic without weakening
any assertion.

### Phase 4 (CMS, forms, SEO)

```
Lint PASS · Typecheck PASS · Build PASS (23 routes)
E2E 567 passed, 0 failed, 70 skipped (viewport-gated)
Link crawl: 0 broken links, 0 redirect loops
npm audit: 9 transitive, all via the Sanity CLI toolchain — see below
```

**Items 12 and 13 are now genuinely functional.** The form posts to
`/api/quote`, which validates server-side against the same Zod schema,
checks attachments, and delivers via Resend. The success state appears
**only** when the provider confirms delivery. With no credentials the
endpoint returns 503 and the form says the enquiry was not sent and gives
the phone number — verified by test and by a live request against the
built server.

| Check | How |
| --- | --- |
| Server rejects invalid payloads | Automated — 422 with per-field errors |
| Honeypot | Automated — 200, nothing sent |
| Refuses honestly without credentials | Automated + verified live (503) |
| File type / size / count | Server-enforced; `accept` excludes executables |
| Robots excludes `/studio` | Automated |
| Sitemap lists public pages only | Automated |
| Studio is noindex | Automated |
| Canonical + Open Graph on every page | Automated |
| Organization schema has no fabricated fields | Automated — asserts no address, rating, review or award |

**Not verified, and cannot be until credentials exist:** actual email
delivery, attachment arrival, Sanity reads, Studio editing, publish
webhook. Mocking the provider and calling it verified would be worse than
saying this plainly.

**npm audit — 9 advisories, 0 in the request path.** All are transitive
through `sanity` → `@sanity/cli` → `@sanity/runtime-cli` (`adm-zip`,
`js-yaml`, `uuid`, `@vercel/frameworks`). That chain is build/dev
tooling; none of it executes when a visitor loads a page.
`npm audit fix --force` proposes sanity@5.14.1 — a **downgrade** from
5.31.2 — so it was not applied. Re-check when Sanity ships a CLI update.

### Phase 4.1 (production Sanity connected)

```
Lint PASS · Typecheck PASS · Build PASS (23 routes)
E2E 567 passed, 0 failed, 70 skipped (viewport-gated)
CMS: project 4x76hdgl / production, 8 service documents, verified once each
```

**Verified against the real dataset:**

| Check | Result |
| --- | --- |
| Frontend queries project `4x76hdgl` | Yes — service overview and delivery copy render from Sanity |
| `pt::text()` Portable Text extraction | Correct — 2 overview paragraphs, 3 delivery items |
| Related-service references resolve | `["gutter-cleaning","mastic-sealant","roof-roofline-repairs"]` |
| Empty CMS field falls back to local | Yes — `heroMedia` is unset in Sanity and the local image still renders |
| Empty Homepage singleton | All fields null; page unchanged |
| Migration idempotent | Second run: 0 created, 8 already present |
| No fake projects seeded | `count(*[_type == "project"])` = 0 |
| Visual regression | Service page renders at 1440×5206 — identical to the Phase 3 measurement |
| `.env.local` git-ignored | Yes (`.gitignore:34`) |
| Secrets committed | None |

**Not verified:** Studio's document-list UI. The Studio boots, loads the
BOVI workspace and renders its login screen with CORS working, but reading
the four content groups requires logging in as the project owner — not
something to automate with someone else's account.

**Route-group experiment, reverted.** Moving the site chrome into a
`(site)` group so `/studio` could render full-screen was tried and undone:
the measurement that prompted it was taken against a stale server process
still holding port 3000. The Studio is instead wrapped in a fixed
top-layer container, which achieves the same result with no routing
change. The custom 404 is confirmed working (`Page not found`, HTTP 404,
with site chrome).

**npm audit unchanged: 9 advisories, 0 in the request path.** All
transitive through the Sanity CLI toolchain. `npm audit fix` (without
`--force`) resolves none of them; `--force` proposes downgrading sanity
5.31.2 → 5.14.1, so neither was applied.

### Phase 4.2 (Resend verified in development)

```
Lint PASS · Typecheck PASS · Build PASS (23 routes)
E2E 568 passed, 0 failed, 76 skipped (viewport-gated)
```

Tested against the **live Resend API** with a development sender and the
`delivered@resend.dev` sink. Every result below is from a real request.

| # | Test | Result |
| --- | --- | --- |
| 1 | Valid submission | 200, genuine Resend message ID returned |
| 2 | Invalid data | 422 with six per-field messages |
| 3 | Honeypot | 200, nothing sent (no message ID logged) |
| 4 | Valid image attachment | 200, delivered with the file |
| 5 | Executable rejected | 422 |
| 5b | **Executable with spoofed `image/jpeg` type** | **Was 502 — passed our MIME check and was stopped only by Resend. Fixed: now 422.** |
| 6 | Oversized single file (9MB) | 422 |
| 7 | Total size (3 × 6MB = 18MB) | 422 |
| 8 | Multiple valid files | 200, delivered |
| 9 | Rate limit | attempts 1-5 → 200, 6 and 7 → 429 |
| 10 | Provider unconfigured | 503, honest refusal naming the phone number |
| 11 | Full browser submission with attachment | Success UI shown only after confirmation; focus moved to the status region; form and file input cleared |
| 12 | File persistence | None. No upload directory; nothing in `.next` or OS temp |

**Items 12 and 13 of the twenty hard checks are now genuinely satisfied**
with real provider responses, not mocks.

**One real defect was found and fixed by this testing.** The upload guard
trusted the client-declared `Content-Type`, so an executable renamed with
an image MIME type reached the mail provider. It is now rejected by the
extension check as well, before it leaves the server. A regression test
covers it.

**Production email is NOT verified.** Delivery went to Resend's test sink,
never to `info@boviaccess.co.uk`. The `boviaccess.co.uk` domain is
unverified — its DNS sits with Wix and Resend reported an MX/subdomain
limitation. See DEPLOYMENT.md §5. **Do not describe enquiries as working
until a real message arrives in the BOVI inbox.**
